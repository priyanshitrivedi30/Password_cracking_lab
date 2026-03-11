# app/services/scoring_service.py


class ScoringService:
    """
    ✅ Single source of truth for score calculation.

    submission.py must call ScoringService.calculate_score()
    instead of its own inline scoring logic to prevent drift.
    """

    BASE_POINTS = {
        "beginner":     50,
        "intermediate": 100,
        "advanced":     200,
    }

    # ✅ Fixed: added "hints" mode — intermediate was silently getting 1.0 multiplier
    MODE_MULTIPLIER = {
        "guided": 1.0,   # beginner
        "hints":  1.0,   # intermediate — multiplier is 1.0, points come from base
        "free":   1.0,   # advanced — higher base points already reward difficulty
    }
    # Note: score differentiation is handled by BASE_POINTS (50/100/200),
    # not multipliers. Multipliers kept at 1.0 to avoid scores exceeding stated max.

    @classmethod
    def calculate_score(
        cls,
        difficulty: str,
        mode: str,
        time_taken_seconds: float,
        attempts: int,
        hints_used: int = 0,        # ✅ added: intermediate hint penalty
    ) -> int:
        """
        Calculates final score for a completed lab session.

        Penalty rules (consistent with submission.py and PDF):
        - Time > 5 min (300s):  -10 points
        - Time > 10 min (600s): -20 points (cumulative with above = -30 total)
        - Wrong attempts (intermediate/advanced): -5 per attempt after 1st
        - Hints after 3rd (intermediate only): -5 per hint

        Args:
            difficulty: beginner | intermediate | advanced
            mode: guided | hints | free
            time_taken_seconds: How long the lab took
            attempts: Total submission attempts made
            hints_used: Number of hints used (intermediate only)

        Returns:
            Final score, minimum 10
        """
        base = cls.BASE_POINTS.get(difficulty, 50)
        score = float(base)

        # ⏱ Time penalties
        if time_taken_seconds > 300:
            score -= 10
        if time_taken_seconds > 600:
            score -= 20      # cumulative: >600s = -30 total

        # 🔁 Attempt penalties (intermediate + advanced only, not beginner)
        # ✅ Fixed: was (attempts - 3) in old version, now (attempts - 1)
        # Consistent with submission.py: every wrong attempt costs points
        if difficulty != "beginner" and attempts > 1:
            score -= (attempts - 1) * 5

        # 💡 Hint penalties (intermediate only, after 3rd hint)
        # ✅ Added: was missing entirely from old ScoringService
        if hints_used > 3:
            score -= (hints_used - 3) * 5

        # Floor: never go below 10
        return max(int(score), 10)

    @classmethod
    def get_max_score(cls, difficulty: str) -> int:
        """Returns the maximum possible score for a difficulty (no penalties)."""
        return cls.BASE_POINTS.get(difficulty, 50)

    @classmethod
    def get_score_breakdown(
        cls,
        difficulty: str,
        mode: str,
        time_taken_seconds: float,
        attempts: int,
        hints_used: int = 0,
    ) -> dict:
        """
        ✅ Returns detailed score breakdown for the Result page.
        Frontend displays each deduction line by line.

        Example return:
        {
            "base_score": 100,
            "time_penalty": -10,
            "attempt_penalty": -10,
            "hint_penalty": -5,
            "final_score": 75
        }
        """
        base = cls.BASE_POINTS.get(difficulty, 50)

        time_penalty = 0
        if time_taken_seconds > 300:
            time_penalty -= 10
        if time_taken_seconds > 600:
            time_penalty -= 20

        attempt_penalty = 0
        if difficulty != "beginner" and attempts > 1:
            attempt_penalty = -((attempts - 1) * 5)

        hint_penalty = 0
        if hints_used > 3:
            hint_penalty = -((hints_used - 3) * 5)

        final_score = max(base + time_penalty + attempt_penalty + hint_penalty, 10)

        return {
            "base_score": base,
            "time_penalty": time_penalty,
            "attempt_penalty": attempt_penalty,
            "hint_penalty": hint_penalty,
            "final_score": final_score,
        }