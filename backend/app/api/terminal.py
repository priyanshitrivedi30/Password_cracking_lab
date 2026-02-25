from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.docker_service import exec_command
from app.services.command_policy import CommandPolicy  # ✅ USE POLICY
from app.models.lab_session import LabSession
from app.models.command_log import CommandLog
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/terminal", tags=["Terminal"])


# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Execute Command ----------
@router.post("/exec")
def exec_terminal(
    session_id: int,
    command: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ CENTRALIZED COMMAND SAFETY
    if not CommandPolicy.is_command_allowed(command):
        raise HTTPException(
            status_code=403,
            detail="Command not allowed in this lab environment",
        )

    # ✅ Fetch only user's session
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

    if not session.container_id:
        raise HTTPException(
            status_code=400,
            detail="Lab container not running",
        )

    try:
        # 🔹 Execute inside container
        output = exec_command(session.container_id, command)

        # 🔹 Beginner step progression (NEW)
        if session.difficulty == "beginner":
            cmd = command.strip().lower()

            if session.current_step == 1 and cmd.startswith("ls"):
                session.current_step += 1

            elif session.current_step == 2 and "john" in cmd:
                session.current_step += 1
             # Step 3 → 4 (user identifies MD5 by running john with raw-md5)
            elif session.current_step == 3 and "--format=raw-md5" in cmd:
                  session.current_step += 1

              # Step 4 → 5 (john cracking run)
            elif session.current_step == 4 and "john" in cmd:
                 session.current_step += 1

             # Step 5 → 6 (john --show)
            elif session.current_step == 5 and "--show" in cmd:
                 session.current_step += 1
                 
        # 🔹 Log command (used for attempts & scoring)
        log = CommandLog(
            session_id=session.id,
            command=command,
        )
        db.add(log)
        db.commit()

        return {
            "output": output,
            "mode": "guided" if session.difficulty == "beginner" else "free",
            "current_step": session.current_step,  # ✅ frontend can read this
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))