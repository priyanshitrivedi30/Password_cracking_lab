import os
import random
import string
import logging

from app.services.hash_service import HashService
from app.services.difficulty_service import DifficultyService

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# Wordlist path — intermediate.txt lives in the backend/ folder
# Set WORDLIST_DIR env var to override, defaults to backend root
# ─────────────────────────────────────────────────────────────
WORDLIST_DIR = os.getenv("WORDLIST_DIR", os.path.dirname(os.path.dirname(__file__)))
WORDLIST_FILE = "intermediate.txt"


class PasswordLabGenerator:

    # Cache wordlist in memory after first load — avoids re-reading file on every lab start
    _wordlist_cache: list = []

    @classmethod
    def _get_wordlist(cls) -> list:
        """
        Loads intermediate.txt once and caches it in memory.
        Returns list of words.
        """
        if not cls._wordlist_cache:
            path = os.path.join(WORDLIST_DIR, WORDLIST_FILE)

            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Wordlist not found at: {path}\n"
                    f"Make sure intermediate.txt is in your backend/ folder.\n"
                    f"Or set WORDLIST_DIR env var to its location."
                )

            with open(path, "r", encoding="latin-1", errors="ignore") as f:
                words = [line.strip() for line in f if line.strip()]

            if not words:
                raise ValueError(f"Wordlist is empty: {path}")

            cls._wordlist_cache = words
            logger.info(f"✅ Wordlist loaded: {len(words)} words from {path}")

        return cls._wordlist_cache

    @classmethod
    def _pick_word(cls) -> str:
        """Picks a random word from intermediate.txt wordlist."""
        return random.choice(cls._get_wordlist())

    @staticmethod
    def generate_lab(difficulty: str) -> dict:
        """
        Generates a password lab challenge for the given difficulty.

        Password strategy per difficulty:
        - Beginner:     plain word from intermediate.txt → MD5
        - Intermediate: word from intermediate.txt + 2 random digits → SHA-256
        - Advanced:     5 random lowercase letters (no wordlist) → bcrypt

        Args:
            difficulty: beginner | intermediate | advanced

        Returns:
            {
                difficulty, algorithm, mode, hash, plain_password,
                points, hashcat_mode, expected_tool, expected_attack
            }
        """
        config = DifficultyService.get_config(difficulty)
        algorithm = config["algorithm"]
        points = config["points"]
        mode = config["mode"]
        expected_tool = config["expected_tool"]
        expected_attack = config["expected_attack"]

        # ─────────────────────────────────────────
        # 🟢 BEGINNER — Dictionary attack with John
        # Plain word from intermediate.txt → MD5
        # e.g. "sunshine"
        # ─────────────────────────────────────────
        if difficulty == "beginner":
            plain_password = PasswordLabGenerator._pick_word()

        # ─────────────────────────────────────────
        # 🟡 INTERMEDIATE — Hybrid attack with Hashcat
        # Word from intermediate.txt + 2 random digits → SHA-256
        # e.g. "sunshine47"
        # ─────────────────────────────────────────
        elif difficulty == "intermediate":
            base_word = PasswordLabGenerator._pick_word()
            plain_password = base_word + str(random.randint(10, 99))

        # ─────────────────────────────────────────
        # 🔴 ADVANCED — Mask/Brute force
        # ✅ No wordlist — pure random 5 lowercase letters → bcrypt
        # e.g. "xkqmv"
        # Kept exactly as original — user must figure out mask attack
        # ─────────────────────────────────────────
        else:
            plain_password = ''.join(
                random.choices(string.ascii_lowercase, k=5)
            )

        # Hash the password using the difficulty's algorithm
        hashed_password = HashService.hash_password(plain_password, algorithm)

        # Get hashcat -m flag for instruction panels
        try:
            hashcat_mode = HashService.get_hashcat_mode(algorithm)
        except ValueError:
            hashcat_mode = None

        logger.info(
            f"[LAB GENERATED] difficulty={difficulty} | algorithm={algorithm} | "
            f"attack={expected_attack} | tool={expected_tool} | "
            f"password_length={len(plain_password)}"
        )

        return {
            "difficulty": difficulty,
            "algorithm": algorithm,
            "mode": mode,                   # guided | hints | free
            "hash": hashed_password,
            "points": points,
            "hashcat_mode": hashcat_mode,   # 0 | 1400 | 3200
            "expected_tool": expected_tool,
            "expected_attack": expected_attack,

            # ⚠️ Backend validation only — NEVER expose to frontend
            "plain_password": plain_password,
        }