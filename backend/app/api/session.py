from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.lab_session import LabSession
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/sessions", tags=["Sessions"])

# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Get Current User Sessions ----------
@router.get("/me")
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Used for:
    - Result history
    - Analytics page
    - Profile progress
    """

    sessions = (
        db.query(LabSession)
        .filter(LabSession.user_id == current_user.id)
        .order_by(LabSession.created_at.desc())
        .all()
    )

    return [
        {
            "session_id": session.id,
            "difficulty": session.difficulty,
            "status": session.status,
            "score": session.score,
            "created_at": session.created_at,
            "completed_at": session.completed_at,
        }
        for session in sessions
    ]