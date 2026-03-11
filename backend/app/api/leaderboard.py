from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import SessionLocal
from app.models.leaderboard import Leaderboard
from app.models.lab_session import LabSession
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Top Leaderboard ----------
@router.get("/top")
def get_top_players(
    limit: int = 10,
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty: beginner | intermediate | advanced"
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    ✅ Leaderboard page — supports difficulty filter (PDF requirement).
    Returns score, time, mode, username, rank per entry.

    - No filter → overall leaderboard (best score across all difficulties)
    - difficulty=beginner/intermediate/advanced → filtered leaderboard
    """

    allowed_difficulties = ["beginner", "intermediate", "advanced"]

    if difficulty and difficulty not in allowed_difficulties:
        return {"error": f"Invalid difficulty. Must be one of: {allowed_difficulties}"}

    if difficulty:
        # Per-difficulty: best session per user (highest score, then fastest time)
        # First get all completed sessions for this difficulty
        sessions = (
            db.query(LabSession, User)
            .join(User, LabSession.user_id == User.id)
            .filter(
                LabSession.difficulty == difficulty,
                LabSession.status == "completed",
            )
            .order_by(LabSession.score.desc())
            .all()
        )

        # ✅ Deduplicate: keep only the BEST session per user
        # Best = highest score; if tied → fastest time
        seen_users = {}
        for session, user in sessions:
            time_taken = None
            if session.completed_at and session.created_at:
                time_taken = round((session.completed_at - session.created_at).total_seconds())

            if user.id not in seen_users:
                seen_users[user.id] = {"session": session, "user": user, "time_taken": time_taken}
            else:
                existing = seen_users[user.id]
                existing_score = existing["session"].score or 0
                new_score = session.score or 0
                existing_time = existing["time_taken"] or 9999
                new_time = time_taken or 9999

                # Replace if: higher score, OR same score but faster
                if new_score > existing_score or (new_score == existing_score and new_time < existing_time):
                    seen_users[user.id] = {"session": session, "user": user, "time_taken": time_taken}

        # ✅ Sort: highest score first, then lowest time
        sorted_entries = sorted(
            seen_users.values(),
            key=lambda x: (-( x["session"].score or 0), x["time_taken"] or 9999)
        )[:limit]

        leaderboard_data = []
        for rank, entry in enumerate(sorted_entries, start=1):
            session = entry["session"]
            user    = entry["user"]
            leaderboard_data.append({
                "rank":         rank,
                "user_id":      user.id,
                "username":     user.username,
                "score":        session.score,
                "time_seconds": entry["time_taken"],
                "mode":         session.mode,
                "difficulty":   session.difficulty,
            })

    else:
        # ✅ Overall leaderboard: best session per user across all difficulties
        all_sessions = (
            db.query(LabSession, User)
            .join(User, LabSession.user_id == User.id)
            .filter(LabSession.status == "completed")
            .order_by(LabSession.score.desc())
            .all()
        )

        # Deduplicate: one entry per user, best score then fastest time
        seen_users = {}
        for session, user in all_sessions:
            time_taken = None
            if session.completed_at and session.created_at:
                time_taken = round((session.completed_at - session.created_at).total_seconds())

            if user.id not in seen_users:
                seen_users[user.id] = {"session": session, "user": user, "time_taken": time_taken}
            else:
                existing = seen_users[user.id]
                existing_score = existing["session"].score or 0
                new_score = session.score or 0
                existing_time = existing["time_taken"] or 9999
                new_time = time_taken or 9999
                if new_score > existing_score or (new_score == existing_score and new_time < existing_time):
                    seen_users[user.id] = {"session": session, "user": user, "time_taken": time_taken}

        sorted_entries = sorted(
            seen_users.values(),
            key=lambda x: (-(x["session"].score or 0), x["time_taken"] or 9999)
        )[:limit]

        leaderboard_data = []
        for rank, entry in enumerate(sorted_entries, start=1):
            session = entry["session"]
            user    = entry["user"]
            leaderboard_data.append({
                "rank":       rank,
                "user_id":    user.id,
                "username":   user.username,
                "score":      session.score,
                "time_seconds": entry["time_taken"],
                "mode":       session.mode,
                "difficulty": session.difficulty,
            })

    return {
        "difficulty_filter": difficulty or "all",
        "total_shown": len(leaderboard_data),
        "leaderboard": leaderboard_data,
    }


# ---------- My Position ----------
@router.get("/my-position")
def get_my_position(
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty: beginner | intermediate | advanced"
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    ✅ Returns the current user's rank on the leaderboard.
    Frontend shows "You are ranked #5 overall" or "#2 in Beginner".
    """

    if difficulty:
        # All completed sessions for this difficulty ordered by score
        all_sessions = (
            db.query(LabSession)
            .filter(
                LabSession.difficulty == difficulty,
                LabSession.status == "completed",
            )
            .order_by(LabSession.score.desc())
            .all()
        )

        # Find current user's best session
        my_sessions = [s for s in all_sessions if s.user_id == current_user.id]
        my_best = my_sessions[0] if my_sessions else None

        if not my_best:
            return {
                "difficulty_filter": difficulty,
                "ranked": False,
                "message": f"You haven't completed a {difficulty} lab yet."
            }

        # Calculate rank (unique users ranked by their best score)
        seen_users = {}
        rank = 0
        my_rank = None
        for s in all_sessions:
            if s.user_id not in seen_users:
                seen_users[s.user_id] = s.score
                rank += 1
                if s.user_id == current_user.id:
                    my_rank = rank
                    break

        time_taken = None
        if my_best.completed_at and my_best.created_at:
            time_taken = round(
                (my_best.completed_at - my_best.created_at).total_seconds()
            )

        return {
            "difficulty_filter": difficulty,
            "ranked": True,
            "rank": my_rank,
            "score": my_best.score,
            "time_seconds": time_taken,
            "mode": my_best.mode,
            "attempts": my_best.attempts,
        }

    else:
        # Overall ranking by total score
        all_players = (
            db.query(Leaderboard)
            .order_by(Leaderboard.score.desc())
            .all()
        )

        my_rank = None
        my_score = None
        for rank, player in enumerate(all_players, start=1):
            if player.user_id == current_user.id:
                my_rank = rank
                my_score = player.score
                break

        if not my_rank:
            return {
                "difficulty_filter": "all",
                "ranked": False,
                "message": "You haven't completed any labs yet."
            }

        return {
            "difficulty_filter": "all",
            "ranked": True,
            "rank": my_rank,
            "total_score": my_score,
            "total_players": len(all_players),
        }