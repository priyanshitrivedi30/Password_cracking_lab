# app/services/difficulty_service.py


class DifficultyService:
    """
    ✅ Single source of truth for ALL difficulty configuration.

    Both api/difficulty.py and api/lab.py should call this
    instead of maintaining their own separate config dicts.
    This ensures zero config drift between files.
    """

    DIFFICULTY_CONFIG = {
        "beginner": {
            # Core
            "algorithm": "md5",
            "password_length": 6,
            "wordlist": "small.txt",
            "points": 50,
            "timer_seconds": 600,           # 10 minutes

            # Mode (matches PDF exactly)
            "mode": "guided",
            "mode_label": "Fully Guided",

            # Hints / Steps
            "hints_enabled": True,          # beginner gets unlimited hints via steps
            "max_hints": None,              # unlimited
            "hint_score_penalty": 0,        # no penalty for beginner
            "steps_locked": True,           # steps unlock one at a time (PDF requirement)
            "max_steps": 4,

            # Tool / Attack (matches generator.py)
            "expected_tool": "john",
            "expected_attack": "dictionary",
            "allowed_commands": ["john", "ls", "cat", "hashcat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],

            # Attempts
            "max_attempts": None,           # unlimited for beginner
        },

        "intermediate": {
            # Core
            "algorithm": "sha256",
            "password_length": 8,
            "wordlist": "medium.txt",
            "points": 100,
            "timer_seconds": 600,           # 10 minutes

            # Mode (matches PDF exactly)
            "mode": "hints",
            "mode_label": "Hints-Based",

            # ✅ Fixed: was False — intermediate DOES have hints (PDF requirement)
            "hints_enabled": True,
            "max_hints": 5,                 # 5 hints max (PDF requirement)
            "hint_score_penalty": 5,        # -5 points per hint after 3rd (PDF requirement)
            "steps_locked": False,          # no step locking for intermediate
            "max_steps": None,

            # Tool / Attack (matches generator.py)
            "expected_tool": "hashcat",
            "expected_attack": "hybrid",
            "allowed_commands": ["hashcat", "john", "ls", "cat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],

            # Attempts
            "max_attempts": 10,
        },

        "advanced": {
            # Core
            "algorithm": "bcrypt",
            "password_length": 10,
            "wordlist": "large.txt",
            "points": 200,
            "timer_seconds": 600,           # 10 minutes

            # Mode (matches PDF exactly)
            "mode": "free",
            "mode_label": "Free Mode",

            # No hints in advanced (PDF requirement)
            "hints_enabled": False,
            "max_hints": 0,
            "hint_score_penalty": 0,
            "steps_locked": False,
            "max_steps": None,

            # Tool / Attack (matches generator.py)
            "expected_tool": None,          # user decides
            "expected_attack": "mask_or_bruteforce",
            "allowed_commands": ["hashcat", "john", "ls", "cat"],
            "blocked_commands": ["rm", "wget", "curl", "chmod", "sudo", "nc", "python", "bash"],

            # Attempts
            "max_attempts": 5,
        }
    }

    # ─────────────────────────────────────────────
    # Core getter
    # ─────────────────────────────────────────────

    @classmethod
    def get_config(cls, difficulty: str) -> dict:
        """Returns full configuration dict for a difficulty level."""
        config = cls.DIFFICULTY_CONFIG.get(difficulty)
        if not config:
            raise ValueError(
                f"Invalid difficulty level: '{difficulty}'. "
                "Must be one of: beginner, intermediate, advanced"
            )
        return config

    # ─────────────────────────────────────────────
    # Individual getters — used across api/ and services/
    # ─────────────────────────────────────────────

    @classmethod
    def get_algorithm(cls, difficulty: str) -> str:
        return cls.get_config(difficulty)["algorithm"]

    @classmethod
    def get_wordlist(cls, difficulty: str) -> str:
        return cls.get_config(difficulty)["wordlist"]

    @classmethod
    def get_points(cls, difficulty: str) -> int:
        return cls.get_config(difficulty)["points"]

    @classmethod
    def hints_allowed(cls, difficulty: str) -> bool:
        return cls.get_config(difficulty)["hints_enabled"]

    @classmethod
    def get_max_attempts(cls, difficulty: str):
        return cls.get_config(difficulty)["max_attempts"]

    # ✅ New helpers — used by lab.py, terminal.py, difficulty.py api
    @classmethod
    def get_mode(cls, difficulty: str) -> str:
        """Returns mode string: guided | hints | free"""
        return cls.get_config(difficulty)["mode"]

    @classmethod
    def get_timer_seconds(cls, difficulty: str) -> int:
        """Returns lab timer in seconds (600 = 10 minutes)."""
        return cls.get_config(difficulty)["timer_seconds"]

    @classmethod
    def get_max_hints(cls, difficulty: str):
        """Returns max hints allowed. None = unlimited, 0 = none."""
        return cls.get_config(difficulty)["max_hints"]

    @classmethod
    def get_hint_penalty(cls, difficulty: str) -> int:
        """Returns points deducted per hint after the 3rd (intermediate only)."""
        return cls.get_config(difficulty)["hint_score_penalty"]

    @classmethod
    def get_expected_tool(cls, difficulty: str):
        """Returns expected cracking tool: john | hashcat | None (user decides)."""
        return cls.get_config(difficulty)["expected_tool"]

    @classmethod
    def get_expected_attack(cls, difficulty: str) -> str:
        """Returns expected attack type: dictionary | hybrid | mask_or_bruteforce."""
        return cls.get_config(difficulty)["expected_attack"]

    @classmethod
    def get_allowed_commands(cls, difficulty: str) -> list:
        """Returns list of allowed terminal commands for this difficulty."""
        return cls.get_config(difficulty)["allowed_commands"]

    @classmethod
    def is_steps_locked(cls, difficulty: str) -> bool:
        """Returns True if steps must be completed in order (beginner only)."""
        return cls.get_config(difficulty)["steps_locked"]

    @classmethod
    def get_all_difficulties(cls) -> list:
        """
        Returns all difficulty configs as a list.
        ✅ Used by api/difficulty.py so it doesn't need its own separate config.
        """
        result = []
        for difficulty_id, config in cls.DIFFICULTY_CONFIG.items():
            result.append({
                "id": difficulty_id,
                **config
            })
        return result