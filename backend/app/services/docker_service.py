import docker
import random
from docker.errors import DockerException, NotFound

# Initialize Docker client
client = docker.from_env()

# Allowed port range for lab containers
PORT_RANGE_START = 20000
PORT_RANGE_END = 30000


def create_lab_container():
    """
    Creates an isolated lab container for a user session.
    Returns container_id and exposed SSH port.
    """
    try:
        port = random.randint(PORT_RANGE_START, PORT_RANGE_END)

        container = client.containers.run(
            image="cybercare-lab",
            command="sleep infinity",
            detach=True,
            tty=True,
            stdin_open=True,
            ports={"22/tcp": port},
            name=f"lab_session_{port}",
            mem_limit="512m",
            cpu_quota=50000,  # limit CPU usage
            network_mode="none",
            security_opt=["no-new-privileges"],
        )

        return container.id, port

    except DockerException as e:
        raise RuntimeError(f"Failed to create lab container: {str(e)}")


def exec_command(container_id: str, command: str):
    """
    Executes a command inside a running container.
    """
    try:
        container = client.containers.get(container_id)

        result = container.exec_run(
            cmd=["sh","-c",command],
            tty=True,
            stdin=False
        )

        return result.output.decode(errors="ignore")

    except NotFound:
        return "Container not found"
    except DockerException as e:
        return f"Execution error: {str(e)}"


def stop_lab_container(container_id: str):
    """
    Stops and removes a lab container safely.
    """
    try:
        container = client.containers.get(container_id)
        container.stop(timeout=5)
        container.remove()

    except NotFound:
        print("Container already removed")
    except DockerException as e:
        print(f"Failed to clean up container: {str(e)}")