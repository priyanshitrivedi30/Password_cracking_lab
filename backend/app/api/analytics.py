from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.analytics import Analytics
from app.models.lab_session import LabSession
from app.core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me")
def get_user_analytics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analytics = db.query(Analytics).filter(
        Analytics.user_id == current_user.id
    ).first()

    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="No analytics found for this user"
        )

    # All completed sessions
    completed_sessions = db.query(LabSession).filter(
        LabSession.user_id == current_user.id,
        LabSession.status == "completed"
    ).all()

    completed_labs = len(completed_sessions)
    avg_time = (analytics.total_time / completed_labs) if completed_labs > 0 else 0

    # ✅ Per-difficulty breakdown for leaderboard filtering
    difficulty_breakdown = {}
    for diff in ["beginner", "intermediate", "advanced"]:
        diff_sessions = [s for s in completed_sessions if s.difficulty == diff]
        difficulty_breakdown[diff] = {
            "completed": len(diff_sessions),
            "total_score": sum(s.score or 0 for s in diff_sessions),
            "total_time_seconds": sum(
                (s.completed_at - s.created_at).total_seconds()
                for s in diff_sessions if s.completed_at and s.created_at
            ),
            "total_attempts": sum(s.attempts or 0 for s in diff_sessions),
        }

    # ✅ Recent lab history for result page
    recent_labs = [
        {
            "session_id": s.id,
            "difficulty": s.difficulty,
            "score": s.score,
            "attempts": s.attempts,
            "time_seconds": (
                (s.completed_at - s.created_at).total_seconds()
                if s.completed_at and s.created_at else None
            ),
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        }
        for s in sorted(completed_sessions, key=lambda x: x.completed_at, reverse=True)[:10]
    ]

    return {
        "user_id": current_user.id,
        "total_score": analytics.total_score,
        "total_time_seconds": analytics.total_time,
        "completed_labs": completed_labs,
        "average_time_per_lab": round(avg_time, 2),
        "difficulty_breakdown": difficulty_breakdown,   # ✅ for leaderboard filter
        "recent_labs": recent_labs,                     # ✅ for result page
    }