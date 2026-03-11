from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import asyncio
from functools import partial

from app.core.database import SessionLocal
from app.services.docker_service import exec_command
from app.services.command_policy import CommandPolicy
from app.models.lab_session import LabSession
from app.models.command_log import CommandLog
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/terminal", tags=["Terminal"])

# Beginner step definitions — must stay in sync with lab.py /step endpoint
# step 1 → ls,  step 2 → cat,  step 3 → john (crack),  step 4 → john --show
BEGINNER_STEP_TRIGGERS = {
    1: lambda cmd: cmd.startswith("ls"),
    2: lambda cmd: cmd.startswith("cat"),
    3: lambda cmd: "john" in cmd and "--show" not in cmd and "--wordlist" in cmd,
    4: lambda cmd: "john" in cmd and "--show" in cmd,
}


# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from pydantic import BaseModel

# ---------- Request Model ----------
class TerminalExecRequest(BaseModel):
    session_id: int
    command: str


# ---------- Execute Command ----------
@router.post("/exec")
async def exec_terminal(
    payload: TerminalExecRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session_id = payload.session_id
    command    = payload.command

    # ✅ Validate command against policy FIRST (before any DB query)
    if not CommandPolicy.is_command_allowed(command):
        return {
            "output": (
                "❌ Command not allowed in this lab environment.\n"
                "Allowed commands: hashcat, john, ls, cat"
            ),
            "blocked": True,
            "command": command,
        }

    # ✅ Fetch session — only the current user's session
    session = (
        db.query(LabSession)
        .filter(
            LabSession.id == session_id,
            LabSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # ✅ Check session is still running (expired sessions cannot run commands)
    if session.status == "expired":
        raise HTTPException(
            status_code=400,
            detail="Your lab session has expired. Start a new lab."
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Lab already completed. View your results."
        )

    if session.status != "running":
        raise HTTPException(status_code=400, detail="Session is not active")

    # ✅ Auto-mark expired if timer has passed
    if (
        session.expires_at
        and datetime.now(timezone.utc) > session.expires_at.replace(tzinfo=timezone.utc)
    ):
        session.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Your lab session has expired. Time ran out."
        )

    if not session.container_id:
        raise HTTPException(status_code=400, detail="Lab container not running")

    try:
        # ✅ Auto-append CPU flags to hashcat:
        # --force              : ignore warnings (no GPU)
        # --opencl-device-types 1 : explicitly use CPU OpenCL
        # --session=lab        : fixed session name so --show works, avoids "already running" on retry
        # Kill any stuck hashcat before running a fresh one
        exec_command_str = command
        if command.strip().lower().startswith("hashcat"):
            if "--force" not in command:
                exec_command_str += " --force"
            if "--opencl-device-types" not in command:
                exec_command_str += " --opencl-device-types 1"
            if "--session" not in command and "--show" not in command:
                exec_command_str += " --session=lab"
            # Kill any previous stuck hashcat instance before running
            kill_cmd = "pkill -f hashcat 2>/dev/null; sleep 0.5; " + exec_command_str
            exec_command_str = kill_cmd

        # Execute command in thread pool — prevents blocking uvicorn event loop
        # hashcat can take 5-30s on CPU; running in thread keeps the request alive
        loop = asyncio.get_event_loop()
        output = await loop.run_in_executor(
            None,
            partial(exec_command, session.container_id, exec_command_str)
        )

        cmd = command.strip().lower()

        # ✅ Beginner step progression — consistent 4 steps matching lab.py
        # Only advance if user is on the correct step for that trigger
        if session.mode == "guided":
            trigger = BEGINNER_STEP_TRIGGERS.get(session.current_step)
            if trigger and trigger(cmd):
                MAX_STEPS = 4
                if session.current_step < MAX_STEPS:
                    session.current_step += 1

        # ✅ Log command with timestamp for scoring/debugging
        log = CommandLog(
            session_id=session.id,
            command=command,
        )
        db.add(log)
        db.commit()

        # ✅ Build response with all fields frontend instruction panel needs
        response = {
            "output": output,
            "blocked": False,
            "command": command,
            # ✅ Correct mode for all three difficulties
            "mode": session.mode,       # guided / hints / free
            "session_status": session.status,
        }

        # ✅ Beginner: include step info
        if session.mode == "guided":
            response["current_step"] = session.current_step
            response["total_steps"] = 4

        # ✅ Intermediate: include hint info so instruction panel stays in sync
        if session.mode == "hints":
            response["hints_used"] = session.hints_used
            response["hints_remaining"] = max(0, 5 - (session.hints_used or 0))
            response["current_score"] = session.score

        return response

    except HTTPException:
        raise
    except Exception as e:
        import traceback, logging
        logging.getLogger(__name__).error(f"[TERMINAL ERROR] {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Terminal error: {str(e)}")