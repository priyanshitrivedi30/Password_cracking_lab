import random
import string
from app.services.hash_service import HashService
from app.services.difficulty_service import DifficultyService


class PasswordLabGenerator:

    @staticmethod
    def _pick_from_wordlist(path: str):
        with open(path, "r", encoding="latin-1", errors="ignore") as f:
            words = f.read().splitlines()
        return random.choice(words).strip()

    @staticmethod
    def generate_lab(difficulty: str):

        config = DifficultyService.get_config(difficulty)
        algorithm = config["algorithm"]
        points = config["points"]

        expected_tool = None
        expected_attack = None

        # 🟢 BEGINNER — Dictionary + John
        if difficulty == "beginner":

            wordlist_path = "intermediate.txt"
            plain_password = PasswordLabGenerator._pick_from_wordlist(wordlist_path)

            expected_tool = "john"
            expected_attack = "dictionary"

        # 🟡 INTERMEDIATE — Hybrid + Hashcat
        elif difficulty == "intermediate":

            wordlist_path = "intermediate.txt"
            base_word = PasswordLabGenerator._pick_from_wordlist(wordlist_path)

            # Add 2 random digits
            plain_password = base_word + str(random.randint(10, 99))

            expected_tool = "hashcat"
            expected_attack = "hybrid"

        # 🔴 ADVANCED — Mask/Brute (Tool Undefined)
        else:

            # 5 lowercase letters
            plain_password = ''.join(
                random.choices(string.ascii_lowercase, k=5)
            )

            expected_tool = None  # user decides
            expected_attack = "mask_or_bruteforce"

        # 🔐 Hash password
        hashed_password = HashService.hash_password(
            plain_password,
            algorithm
        )

        return {
            "difficulty": difficulty,
            "algorithm": algorithm,
            "hash": hashed_password,
            "points": points,

            # Backend validation only
            "plain_password": plain_password,

            # NEW FIELDS (IMPORTANT)
            "expected_tool": expected_tool,
            "expected_attack": expected_attack,
        }