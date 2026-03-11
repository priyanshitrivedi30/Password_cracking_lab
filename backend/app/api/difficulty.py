from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user

router = APIRouter(prefix="/difficulty", tags=["Difficulty"])

# ─────────────────────────────────────────────────────────────
# Single source of truth for all difficulty config.
# Kept in sync with difficulty_service.py values.
# ─────────────────────────────────────────────────────────────
DIFFICULTY_LEVELS = [
    {
        "id": "beginner",
        "title": "Beginner",

        # ✅ Mode matches PDF: fully guided
        "mode": "guided",
        "mode_label": "Fully Guided",
        "description": "Step-by-step guidance. Learn basic password cracking concepts. "
                       "Each step unlocks only after the previous one is completed.",

        # Lab config (matches difficulty_service.py)
        "hash_algorithm": "md5",
        "points": 50,
        "timer_seconds": 600,           # 10 minutes

        # Hint/step config (per PDF)
        "hints_allowed": True,
        "max_hints": None,              # unlimited hints for beginner
        "steps_locked": True,           # steps unlock one at a time
        "hint_score_penalty": 0,        # no penalty for beginner

        # Tool config (matches generator.py)
        "expected_tool": "john",
        "expected_attack": "dictionary",
        "allowed_tools": ["john", "ls", "cat", "hashcat"],

        # Terminal rules (per PDF)
        "terminal_rules": {
            "allowed_commands": ["john", "ls", "cat", "hashcat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],
            "attempts_logged": True,
        },

        "score_multiplier": 1.0,
        "wordlist": "small.txt",
        "password_length": 6,
    },
    {
        "id": "intermediate",
        "title": "Intermediate",

        # ✅ Mode fixed: was "free" — must be "hints-based" per PDF
        "mode": "hints",
        "mode_label": "Hints-Based",
        "description": "High-level hints only — no exact commands shown. "
                       "You decide the approach. Limited hints available.",

        # Lab config (matches difficulty_service.py)
        "hash_algorithm": "sha256",
        "points": 100,
        "timer_seconds": 600,           # 10 minutes

        # Hint/step config (per PDF: 5 hints, score -5 after 3rd hint)
        "hints_allowed": True,
        "max_hints": 5,
        "steps_locked": False,          # no step locking for intermediate
        "hint_score_penalty": 5,        # -5 points per hint after 3rd

        # Tool config (matches generator.py)
        "expected_tool": "hashcat",
        "expected_attack": "hybrid",
        "allowed_tools": ["hashcat", "john", "ls", "cat"],

        # Terminal rules (per PDF)
        "terminal_rules": {
            "allowed_commands": ["hashcat", "john", "ls", "cat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],
            "attempts_logged": True,
        },

        "score_multiplier": 1.5,
        "wordlist": "medium.txt",
        "password_length": 8,
        "max_attempts": 10,
    },
    {
        "id": "advanced",
        "title": "Advanced",

        # ✅ Free mode — no hints, no steps
        "mode": "free",
        "mode_label": "Free Mode",
        "description": "No hints. No steps. Only rules and hash info. "
                       "Highest scoring difficulty. Strict environment.",

        # Lab config (matches difficulty_service.py)
        "hash_algorithm": "bcrypt",
        "points": 200,
        "timer_seconds": 600,           # 10 minutes

        # Hint/step config (per PDF: no hints)
        "hints_allowed": False,
        "max_hints": 0,
        "steps_locked": False,
        "hint_score_penalty": 0,

        # Tool config (matches generator.py)
        "expected_tool": None,          # user decides
        "expected_attack": "mask_or_bruteforce",
        "allowed_tools": ["hashcat", "john", "ls", "cat"],

        # Terminal rules (per PDF: strict environment)
        "terminal_rules": {
            "allowed_commands": ["hashcat", "john", "ls", "cat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],
            "attempts_logged": True,
        },

        "score_multiplier": 2.0,
        "wordlist": "large.txt",
        "password_length": 10,
        "max_attempts": 5,
    }
]


@router.get("/")
def get_difficulty_levels(
    current_user=Depends(get_current_user)
):
    """
    Returns all difficulty levels.
    Used on Consent Form / Difficulty Selection page (step 2 of side panel).
    Frontend displays these as selectable cards before starting the lab.
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
    Returns full config for a single difficulty.
    Used on Lab Page to configure:
    - Instruction panel (steps vs hints)
    - Timer duration
    - Terminal rules
    - Scorecard display
    """
    for level in DIFFICULTY_LEVELS:
        if level["id"] == difficulty_id:
            return level

    raise HTTPException(
        status_code=404,
        detail=f"Invalid difficulty level: '{difficulty_id}'. Must be beginner, intermediate, or advanced."
    )
