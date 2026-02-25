import hashlib
import bcrypt
import secrets
import string


class HashService:
    """
    Responsible for:
    - Generating random passwords
    - Hashing passwords based on difficulty
    - Verifying cracked passwords
    """

    @staticmethod
    def generate_random_password(length: int = 8) -> str:
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    @staticmethod
    def hash_password(password: str, algorithm: str) -> str:
        if algorithm == "md5":
            return hashlib.md5(password.encode()).hexdigest()

        elif algorithm == "sha256":
            return hashlib.sha256(password.encode()).hexdigest()

        elif algorithm == "bcrypt":
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode(), salt)
            return hashed.decode()

        else:
            raise ValueError("Unsupported hashing algorithm")

    @staticmethod
    def verify_password(
        plain_password: str,
        hashed_password: str,
        algorithm: str
    ) -> bool:
        """
        Used for:
        - Guided mode explanations
        - Validation logic (future-proof)
        """

        if algorithm == "md5":
            return hashlib.md5(plain_password.encode()).hexdigest() == hashed_password

        elif algorithm == "sha256":
            return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

        elif algorithm == "bcrypt":
            return bcrypt.checkpw(
                plain_password.encode(),
                hashed_password.encode()
            )

        else:
            raise ValueError("Unsupported hashing algorithm")