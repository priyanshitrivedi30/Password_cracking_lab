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
    # Fetch analytics for logged-in user
    analytics = db.query(Analytics).filter(
        Analytics.user_id == current_user.id
    ).first()

    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="No analytics found for this user"
        )

    # Count completed labs
    completed_labs = db.query(LabSession).filter(
        LabSession.user_id == current_user.id,
        LabSession.status == "completed"
    ).count()

    # Calculate average time safely
    avg_time = 0
    if completed_labs > 0:
        avg_time = analytics.total_time / completed_labs

    return {
        "user_id": current_user.id,
        "total_score": analytics.total_score,
        "total_time_seconds": analytics.total_time,
        "completed_labs": completed_labs,
        "average_time_per_lab": avg_time
    }