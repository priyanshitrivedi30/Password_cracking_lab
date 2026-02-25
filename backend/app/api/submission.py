from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.lab_session import LabSession
from app.models.submission import Submission
from app.models.leaderboard import Leaderboard
from app.models.analytics import Analytics
from app.services.docker_service import stop_lab_container
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/submission", tags=["Submission"])


# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Submit Password ----------
@router.post("/submit")
def submit_password(
    session_id: int,
    submitted_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ✅ AUTH
):
    # 🔐 Get session only for current user
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

    if session.status != "running":
        raise HTTPException(status_code=400, detail="Session already completed")

    # ✅ Check password
    is_correct = submitted_password == session.correct_password

    # 🔢 Track attempts
    session.attempts = (session.attempts or 0) + 1

    # 🧾 Log submission
    submission = Submission(
        session_id=session.id,
        submitted_password=submitted_password,
        is_correct=is_correct
    )
    db.add(submission)

    # ✅ If correct → finish lab
    if is_correct:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        time_taken = (session.completed_at - session.created_at).total_seconds()

        # 🎯 Base points per difficulty
        base_points = {
            "beginner": 50,
            "intermediate": 100,
            "advanced": 200
        }

        score = base_points.get(session.difficulty, 50)

        # ⏱ Time penalties
        if time_taken > 300:
            score -= 10
        if time_taken > 600:
            score -= 20

        # ❌ Attempt penalty (Free mode harder)
        if session.difficulty != "beginner":
            score -= (session.attempts - 1) * 5

        session.score = max(score, 10)

        # 🧹 Stop container
        if session.container_id:
            try:
                stop_lab_container(session.container_id)
                session.container_id = None
                session.container_port = None
            except Exception as e:
                print(f"Docker cleanup error: {e}")

        # 🏆 Leaderboard update
        leaderboard = db.query(Leaderboard).filter(
            Leaderboard.user_id == session.user_id
        ).first()

        if leaderboard:
            leaderboard.score += session.score
        else:
            leaderboard = Leaderboard(
                user_id=session.user_id,
                score=session.score
            )
            db.add(leaderboard)

        # 📊 Analytics update
        analytics = db.query(Analytics).filter(
            Analytics.user_id == session.user_id
        ).first()

        if analytics:
            analytics.total_score += session.score
            analytics.total_time += time_taken
        else:
            analytics = Analytics(
                user_id=session.user_id,
                total_score=session.score,
                total_time=time_taken
            )
            db.add(analytics)

    db.commit()

    return {
        "success": is_correct,
        "session_status": session.status,
        "attempts": session.attempts,
        "time_taken": time_taken if is_correct else None,
        "score": session.score if is_correct else None
    }