from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import SessionLocal
from app.models.lab_session import LabSession
from app.models.submission import Submission
from app.models.leaderboard import Leaderboard
from app.models.analytics import Analytics
from app.services.docker_service import on_password_cracked
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/submission", tags=["Submission"])


class SubmitRequest(BaseModel):
    session_id: int
    submitted_password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submit")
def submit_password(
    payload: SubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(LabSession)
        .filter(
            LabSession.id == payload.session_id,
            LabSession.user_id == current_user.id
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Lab already completed")

    if session.status == "expired":
        raise HTTPException(status_code=400, detail="Lab session has expired — time ran out")

    if session.status != "running":
        raise HTTPException(status_code=400, detail="Session is not active")

    is_correct = payload.submitted_password.strip() == session.correct_password.strip()

    session.attempts = (session.attempts or 0) + 1

    submission = Submission(
        session_id=session.id,
        submitted_password=payload.submitted_password,
        is_correct=is_correct
    )
    db.add(submission)

    time_taken = None

    print("Submitted:", repr(payload.submitted_password))
    print("Correct:", repr(session.correct_password))
    if is_correct:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        # ✅ Ensure both timestamps are timezone aware
        created_at = session.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        time_taken = round(
            (session.completed_at - created_at).total_seconds()
        )

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

        # ❌ Attempt penalty (non-beginner only)
        if session.difficulty != "beginner":
            score -= (session.attempts - 1) * 5

        # 💡 Hint penalty carry-over
        if session.hints_used and session.hints_used > 3:
            score -= (session.hints_used - 3) * 5

        session.score = max(score, 10)

        # 🧹 DELETE CONTAINER SAFELY
        if session.container_id:
            container_id = session.container_id
            try:
                on_password_cracked(container_id)
            except Exception as e:
                print(f"Docker cleanup error: {e}")

            # Clear container fields AFTER cleanup attempt
            session.container_id = None
            session.container_port = None

        # 🏆 Leaderboard
        leaderboard = db.query(Leaderboard).filter(
            Leaderboard.user_id == session.user_id
        ).first()

        if leaderboard:
            leaderboard.score += session.score
        else:
            db.add(
                Leaderboard(
                    user_id=session.user_id,
                    score=session.score
                )
            )

        # 📊 Analytics
        analytics = db.query(Analytics).filter(
            Analytics.user_id == session.user_id
        ).first()

        if analytics:
            analytics.total_score += session.score
            analytics.total_time += time_taken
        else:
            db.add(
                Analytics(
                    user_id=session.user_id,
                    total_score=session.score,
                    total_time=time_taken
                )
            )

    db.commit()

    return {
        "success": is_correct,
        "session_id": session.id,
        "session_status": session.status,
        "difficulty": session.difficulty,
        "mode": session.mode,
        "algorithm": session.algorithm,
        "attempts": session.attempts,
        "hints_used": session.hints_used,
        "time_taken_seconds": time_taken,
        "score": session.score if is_correct else None,
        "max_score": {"beginner": 50, "intermediate": 100, "advanced": 200}.get(session.difficulty),
        "message": (
            "Password cracked! Well done."
            if is_correct else
            "Incorrect password. Try again."
        ),
    }