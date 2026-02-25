# app/services/scoring_service.py

class ScoringService:
    """
    Calculates score for completed labs
    """

    BASE_POINTS = {
        "beginner": 50,
        "intermediate": 100,
        "advanced": 200
    }

    MODE_MULTIPLIER = {
        "guided": 1.0,
        "free": 1.5
    }

    @classmethod
    def calculate_score(
        cls,
        difficulty: str,
        mode: str,
        time_taken_seconds: float,
        attempts: int
    ) -> int:
        """
        Calculate final score
        """

        base = cls.BASE_POINTS.get(difficulty, 50)
        multiplier = cls.MODE_MULTIPLIER.get(mode, 1.0)

        score = base * multiplier

        # ⏱️ Time penalties
        if time_taken_seconds > 300:
            score -= 10
        if time_taken_seconds > 600:
            score -= 20

        # 🔁 Attempt penalties
        if attempts > 3:
            score -= (attempts - 3) * 5

        # Minimum score protection
        return max(int(score), 10)