from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import SessionLocal
from app.models.lab_session import LabSession
from app.core.security import get_current_user
from app.models.user import User
from app.services.docker_service import stop_lab_container

router = APIRouter(prefix="/sessions", tags=["Sessions"])


# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Helper: format one session ----------
def _format_session(session: LabSession) -> dict:
    """Formats a LabSession into a clean response dict with all fields the frontend needs."""

    time_taken = None
    if session.completed_at and session.created_at:
        time_taken = round(
            (session.completed_at - session.created_at).total_seconds()
        )

    return {
        "session_id": session.id,
        "difficulty": session.difficulty,
        "mode": session.mode,                       # ✅ guided / hints / free
        "algorithm": session.algorithm,             # ✅ md5 / sha256 / bcrypt
        "status": session.status,                   # ✅ running / completed / expired
        "score": session.score,
        "attempts": session.attempts,               # ✅ result page needs this
        "hints_used": session.hints_used,           # ✅ intermediate tracking
        "current_step": session.current_step,       # ✅ beginner tracking
        "time_taken_seconds": time_taken,           # ✅ result page needs this
        "expires_at": session.expires_at.isoformat() if session.expires_at else None,
        "created_at": session.created_at.isoformat() if session.created_at else None,
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,  # ✅ ISO string
    }


# ---------- Get All My Sessions ----------
@router.get("/me")
def get_my_sessions(
    status: Optional[str] = Query(
        default=None,
        description="Filter by status: running | completed | expired"
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty: beginner | intermediate | advanced"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the current user's lab session history.

    Used for:
    - Lab Performance panel (side panel step 3)
    - Analytics page
    - Result history

    Supports optional filters:
    - ?status=completed   → only completed labs (Lab Performance panel)
    - ?difficulty=beginner → filter by difficulty
    """
    query = db.query(LabSession).filter(
        LabSession.user_id == current_user.id
    )

    # ✅ Status filter — Lab Performance panel needs completed sessions only
    if status:
        allowed_statuses = ["running", "completed", "expired"]
        if status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {allowed_statuses}"
            )
        query = query.filter(LabSession.status == status)

    # ✅ Difficulty filter
    if difficulty:
        allowed_difficulties = ["beginner", "intermediate", "advanced"]
        if difficulty not in allowed_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {allowed_difficulties}"
            )
        query = query.filter(LabSession.difficulty == difficulty)

    sessions = query.order_by(LabSession.created_at.desc()).all()

    return {
        "total": len(sessions),
        "sessions": [_format_session(s) for s in sessions]
    }


# ---------- Get Single Session ----------
@router.get("/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ✅ Returns full detail for one session.

    Used for:
    - Result page after lab completion (shows time, attempts, score, status)
    - Resuming a running lab
    """
    session = db.query(LabSession).filter(
        LabSession.id == session_id,
        LabSession.user_id == current_user.id     # ✅ users can only see their own sessions
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # ✅ Auto-mark expired if timer has passed
    if (
        session.status == "running"
        and session.expires_at
        and datetime.now(timezone.utc) > session.expires_at.replace(tzinfo=timezone.utc)
    ):
        session.status = "expired"
        db.commit()

    return _format_session(session)


# ---------- Retry Lab (Reset) ----------
@router.post("/retry")
def retry_lab(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ✅ Retry Lab — side panel option (PDF requirement).
    Cancels any currently running session and cleans up its container
    so the user can go back to Overview and start fresh.

    Frontend calls this when user clicks 'Retry Lab' in the side panel.
    After this, redirect user to step 1 (Overview).
    """
    # Find any active running session for this user
    running_session = db.query(LabSession).filter(
        LabSession.user_id == current_user.id,
        LabSession.status == "running"
    ).first()

    if running_session:
        # ✅ Stop and remove the Docker container
        if running_session.container_id:
            try:
                stop_lab_container(running_session.container_id)
            except Exception as e:
                print(f"[RETRY] Container cleanup warning: {e}")

        # Mark session as expired (not deleted — kept for analytics)
        running_session.status = "expired"
        running_session.container_id = None
        running_session.container_port = None
        db.commit()

    return {
        "success": True,
        "message": "Lab session reset. You can now start a new lab from the Overview.",
        "redirect_to": "overview"       # ✅ frontend uses this to navigate back to step 1
    }
