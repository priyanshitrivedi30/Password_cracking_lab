from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import SessionLocal
from app.generator import PasswordLabGenerator
from app.models.lab_session import LabSession
from app.services.docker_service import create_lab_container,client
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/lab", tags=["Lab"])

# ---------- Request Model ----------
class LabStartRequest(BaseModel):
    difficulty: str  # beginner | intermediate | advanced

# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Start Lab ----------
@router.post("/start")
def start_lab(
    payload: LabStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_difficulties = ["beginner", "intermediate", "advanced"]

    if payload.difficulty not in allowed_difficulties:
        raise HTTPException(
            status_code=400,
            detail="Invalid difficulty level"
        )

    # 🔹 Guided vs Free mode
    if payload.difficulty == "beginner":
        mode = "guided"
        instructions_enabled = True
    else:
        mode = "free"
        instructions_enabled = False

    try:
        # Generate lab challenge (randomized)
        lab_data = PasswordLabGenerator.generate_lab(payload.difficulty)

        # Create docker container
        container_id, port = create_lab_container()

        container = client.containers.get(container_id)

        container.exec_run([
         "bash", "-c",
          f"printf '%s' '{lab_data['hash']}' > /home/labuser/hash.txt"
        ])

        # Create lab session
        new_session = LabSession(
            user_id=current_user.id,
            difficulty=lab_data["difficulty"],
            mode=mode,
            target_hash=lab_data["hash"],
            correct_password=lab_data["plain_password"],
            status="running",
            container_id=container_id,
            container_port=port,
            current_step=1,     # ✅ for Beginner
            hints_used=0 ,       # ✅ for Intermediate
            score=lab_data["points"] 
        )

        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        return {
            "session_id": new_session.id,
            "difficulty": lab_data["difficulty"],
            "mode": mode,  # guided / free
            "algorithm": lab_data["algorithm"],
            "target_hash": lab_data["hash"],
            "points": lab_data["points"],
            "max_score": lab_data["points"],
            "instructions_enabled": instructions_enabled,
            "terminal": {
                "type": "web",
                "host": "localhost",
                "port": port,
                "username": "labuser",
            },
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- Get Hint (Intermediate Only) ----------
@router.post("/hint")
def get_hint(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(LabSession)
        .filter(
            LabSession.id == session_id,
            LabSession.user_id == current_user.id
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.difficulty != "intermediate":
        raise HTTPException(status_code=403, detail="Hints not allowed in this mode")

    # Allow max 5 hints
    if session.hints_used >= 5:
        raise HTTPException(status_code=400, detail="Maximum hints reached")

    # Increase hint counter
    session.hints_used += 1

    # Apply penalty AFTER 3 hints
    if session.hints_used > 3:
        session.score = max(0, session.score - 5)

    db.commit()

    hints = {
        1: "Inspect the hash length to determine the algorithm.",
        2: "32 hexadecimal characters usually indicate MD5.",
        3: "The password may contain a common word.",
        4: "Try combining a dictionary word with numbers.",
        5: "Use Hashcat hybrid mode: hashcat -m 0 hash.txt rockyou.txt -a 6 ?d?d",
    }

    return {
        "hint_number": session.hints_used,
        "hint": hints.get(session.hints_used),
        "remaining_score": session.score
    }