from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user

router = APIRouter(prefix="/difficulty", tags=["Difficulty"])

# Static difficulty config (safe + controlled)
DIFFICULTY_LEVELS = [
    {
        "id": "beginner",
        "title": "Beginner",
        "mode": "guided",
        "description": "Step-by-step guidance with hints. Learn basic password cracking concepts.",
        "allowed_tools": ["hashcat"],
        "score_multiplier": 1.0
    },
    {
        "id": "intermediate",
        "title": "Intermediate",
        "mode": "free",
        "description": "Limited hints. You must decide the approach yourself.",
        "allowed_tools": ["hashcat", "john"],
        "score_multiplier": 1.5
    },
    {
        "id": "advanced",
        "title": "Advanced",
        "mode": "free",
        "description": "No hints. Full freedom. Highest scoring difficulty.",
        "allowed_tools": ["hashcat", "john"],
        "score_multiplier": 2.0
    }
]

@router.get("/")
def get_difficulty_levels(
    current_user=Depends(get_current_user)
):
    """
    Used before starting lab
    Shows difficulty selection + description
    """
    return {
        "levels": DIFFICULTY_LEVELS
    }

@router.get("/{difficulty_id}")
def get_difficulty_detail(
    difficulty_id: str,
    current_user=Depends(get_current_user)
):
    """
    Used when user selects a difficulty
    """
    for level in DIFFICULTY_LEVELS:
        if level["id"] == difficulty_id:
            return level

    raise HTTPException(
        status_code=404,
        detail="Invalid difficulty level"
    )