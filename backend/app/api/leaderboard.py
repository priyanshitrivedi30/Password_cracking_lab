from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.leaderboard import Leaderboard
from app.core.security import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/top")
def get_top_players(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # ✅ AUTH REQUIRED
):
    """
    Leaderboard page
    Called after lab completion
    """
    top_players = (
        db.query(Leaderboard)
        .order_by(Leaderboard.score.desc())
        .limit(limit)
        .all()
    )

    return {
        "leaderboard": [
            {
                "user_id": player.user_id,
                "score": player.score
            }
            for player in top_players
        ]
    }