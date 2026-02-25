# app/services/difficulty_service.py

class DifficultyService:
    """
    Central place to manage difficulty-based lab configuration.
    Used by lab creation, scoring, and container setup.
    """

    DIFFICULTY_CONFIG = {
        "beginner": {
            "algorithm": "md5",
            "password_length": 6,
            "wordlist": "small.txt",
            "points": 50,
            "hints_enabled": True,
            "max_attempts": None
        },
        "intermediate": {
            "algorithm": "sha256",
            "password_length": 8,
            "wordlist": "medium.txt",
            "points": 100,
            "hints_enabled": False,
            "max_attempts": 10
        },
        "advanced": {
            "algorithm": "bcrypt",
            "password_length": 10,
            "wordlist": "large.txt",
            "points": 200,
            "hints_enabled": False,
            "max_attempts": 5
        }
    }

    @classmethod
    def get_config(cls, difficulty: str) -> dict:
        """
        Returns full configuration for a difficulty level.
        """
        config = cls.DIFFICULTY_CONFIG.get(difficulty)
        if not config:
            raise ValueError("Invalid difficulty level")
        return config

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