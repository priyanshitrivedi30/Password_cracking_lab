import docker
import random
import threading
import logging
from datetime import datetime, timedelta
from docker.errors import DockerException, NotFound

logger = logging.getLogger(__name__)

# ✅ Lazy Docker client — initialized on first use.
# Uses explicit unix socket to avoid Docker Desktop context issues.
# Requires docker==6.1.3 (version 7.x has known unix socket bugs).
_client = None

def get_docker_client():
    global _client
    if _client is not None:
        return _client
    try:
        # Try explicit unix socket first (most reliable in Docker-in-Docker)
        import os
        sock = os.getenv("DOCKER_SOCK", "/var/run/docker.sock")
        _client = docker.DockerClient(base_url=f"unix://{sock}", timeout=10)
        _client.ping()
        logger.info(f"✅ Docker connected via unix://{sock}")
        return _client
    except Exception as e:
        raise RuntimeError(
            f"❌ Cannot connect to Docker. "
            f"Ensure /var/run/docker.sock is mounted in docker-compose.yml.\n"
            f"Error: {e}"
        )

# Allowed port range for lab containers
PORT_RANGE_START = 20000
PORT_RANGE_END = 30000

# Default session timeout (30 minutes)
DEFAULT_TIMEOUT_SECONDS = 1800

# Logger

# ─────────────────────────────────────────────
# In-memory session store
# { container_id: { "port": int, "timer": Timer, "expires_at": datetime, "cracked": bool } }
# Replace with Redis or DB for production multi-instance deployments.
# ─────────────────────────────────────────────
_active_sessions: dict = {}
_sessions_lock = threading.Lock()


# ─────────────────────────────────────────────
# Internal Helpers
# ─────────────────────────────────────────────

def _auto_cleanup(container_id: str):
    """
    Called automatically when the session timer expires.
    Logs the reason and delegates to stop_lab_container().
    """
    logger.info(f"[TIMER EXPIRED] Auto-cleaning container: {container_id}")
    _cleanup(container_id, reason="timer_expired")


def _cleanup(container_id: str, reason: str = "manual"):
    """
    Central cleanup function. Cancels any active timer,
    removes session tracking, and stops/removes the container.

    reason: "timer_expired" | "password_cracked" | "manual"
    """
    with _sessions_lock:
        session = _active_sessions.pop(container_id, None)

    if session:
        # Cancel the timer if cleanup is being triggered early (e.g. password cracked)
        timer: threading.Timer = session.get("timer")
        if timer and timer.is_alive():
            timer.cancel()
            logger.info(f"[CLEANUP] Timer cancelled for container: {container_id} (reason: {reason})")

    stop_lab_container(container_id)
    logger.info(f"[CLEANUP] Container {container_id} removed. Reason: {reason}")


# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

def create_lab_container(timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS):
    """
    Creates an isolated lab container for a user session.

    - Automatically cleans up the container after `timeout_seconds`.
    - Returns container_id, exposed SSH port, and session expiry time.

    Args:
        timeout_seconds: How long before the container is auto-destroyed (default 30 min).

    Returns:
        dict: { "container_id", "port", "expires_at" }
    """
    try:
        port = random.randint(PORT_RANGE_START, PORT_RANGE_END)

        container = get_docker_client().containers.run(
            image="lab-runtime:latest",
            command="sleep infinity",
            detach=True,
            tty=True,
            stdin_open=True,
            name=f"lab_session_{port}",  # port used as unique ID only
            mem_limit="512m",
            cpu_quota=50000,
            network_mode="none",
            security_opt=["no-new-privileges"],
        )

        container_id = container.id
        expires_at = datetime.utcnow() + timedelta(seconds=timeout_seconds)

        # Start the auto-cleanup countdown timer
        timer = threading.Timer(
            interval=timeout_seconds,
            function=_auto_cleanup,
            args=[container_id]
        )
        timer.daemon = True  # Don't block app shutdown
        timer.start()

        # Track the session
        with _sessions_lock:
            _active_sessions[container_id] = {
                "port": port,
                "timer": timer,
                "expires_at": expires_at,
                "cracked": False,
            }

        logger.info(
            f"[CREATED] Container {container_id} | Port: {port} | "
            f"Auto-cleanup in {timeout_seconds}s at {expires_at.isoformat()} UTC"
        )

        return {
            "container_id": container_id,
            "port": port,
            "expires_at": expires_at.isoformat() + "Z",
        }

    except DockerException as e:
        raise RuntimeError(f"Failed to create lab container: {str(e)}")


def on_password_cracked(container_id: str):
    """
    Call this when a user successfully cracks the password.
    Immediately cleans up the container and marks the session as solved.

    Args:
        container_id: The container to clean up.
    """
    with _sessions_lock:
        session = _active_sessions.get(container_id)
        if session:
            session["cracked"] = True

    logger.info(f"[CRACKED] Password cracked for container: {container_id}. Triggering cleanup.")
    _cleanup(container_id, reason="password_cracked")


def write_file_to_container(container_id: str, filepath: str, content: str):
    """
    Writes content directly to a file inside the container.
    Uses a separate exec_run bypassing the /tmp/cmd_out.txt wrapper.
    """
    try:
        container = get_docker_client().containers.get(container_id)
        # Use tee to write content — avoids shell redirect interference
        result = container.exec_run(
            cmd=["sh", "-c", f"printf '%s' '{content}' > {filepath} && echo OK"],
            tty=False,
            stdin=False,
            demux=False,
            stream=False,
        )
        output = result.output.decode(errors="ignore") if result.output else ""
        if "OK" not in output:
            logger.warning(f"[WRITE FILE] Unexpected output writing to {filepath}: {output!r}")
    except Exception as e:
        logger.error(f"[WRITE FILE] Failed to write {filepath} in {container_id}: {e}")


def exec_command(container_id: str, command: str):
    """
    Executes a shell command inside a running container.
    Returns combined stdout+stderr as a string.
    """
    try:
        container = get_docker_client().containers.get(container_id)

        result = container.exec_run(
            cmd=["sh", "-c", command],
            tty=False,
            stdin=False,
            demux=True,   # separate stdout and stderr
            stream=False,
        )

        stdout = result.output[0] or b""
        stderr = result.output[1] or b""
        combined = stdout + stderr

        if not combined:
            return "(no output)"
        return combined.decode(errors="ignore")

    except NotFound:
        return "Container not found"
    except DockerException as e:
        return f"Execution error: {str(e)}"


def stop_lab_container(container_id: str):
    """
    Stops and removes a lab container safely.
    Safe to call even if the container is already gone.

    Args:
        container_id: The container to stop and remove.
    """
    try:
        container = get_docker_client().containers.get(container_id)
        container.stop(timeout=5)
        container.remove()
        logger.info(f"[STOPPED] Container {container_id} stopped and removed.")

    except NotFound:
        logger.warning(f"[STOPPED] Container {container_id} already removed — skipping.")
    except DockerException as e:
        logger.error(f"[ERROR] Failed to clean up container {container_id}: {str(e)}")


def get_session_info(container_id: str):
    """
    Returns current session metadata for a container.

    Args:
        container_id: The container to look up.

    Returns:
        dict | None: Session info or None if not found.
    """
    with _sessions_lock:
        session = _active_sessions.get(container_id)
        if not session:
            return None
        return {
            "container_id": container_id,
            "port": session["port"],
            "expires_at": session["expires_at"].isoformat() + "Z",
            "cracked": session["cracked"],
            "time_remaining_seconds": max(
                0,
                int((session["expires_at"] - datetime.utcnow()).total_seconds())
            ),
        }


def list_active_sessions():
    """
    Returns a summary of all currently active lab sessions.
    Useful for admin dashboards or health checks.

    Returns:
        list[dict]: List of active session info dicts.
    """
    with _sessions_lock:
        return [
            {
                "container_id": cid,
                "port": s["port"],
                "expires_at": s["expires_at"].isoformat() + "Z",
                "cracked": s["cracked"],
                "time_remaining_seconds": max(
                    0,
                    int((s["expires_at"] - datetime.utcnow()).total_seconds())
                ),
            }
            for cid, s in _active_sessions.items()
        ]