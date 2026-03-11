import hashlib
import bcrypt
import secrets
import string


class HashService:
    """
    Responsible for:
    - Generating random passwords
    - Hashing passwords based on algorithm
    - Verifying submitted passwords (handles bcrypt correctly)
    """

    # ✅ Hashcat -m flag values per algorithm
    # Used by lab instructions and overview cards
    HASHCAT_MODES = {
        "md5":    0,      # hashcat -m 0
        "sha256": 1400,   # hashcat -m 1400
        "bcrypt": 3200,   # hashcat -m 3200
    }

    @staticmethod
    def generate_random_password(length: int = 8) -> str:
        """Generates a cryptographically secure random password."""
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    @staticmethod
    def hash_password(password: str, algorithm: str) -> str:
        """
        Hashes a password using the specified algorithm.

        Args:
            password: Plain text password
            algorithm: md5 | sha256 | bcrypt

        Returns:
            Hex digest string (md5/sha256) or bcrypt hash string
        """
        if algorithm == "md5":
            return hashlib.md5(password.encode()).hexdigest()

        elif algorithm == "sha256":
            return hashlib.sha256(password.encode()).hexdigest()

        elif algorithm == "bcrypt":
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode(), salt)
            return hashed.decode()

        else:
            raise ValueError(f"Unsupported hashing algorithm: '{algorithm}'")

    @staticmethod
    def verify_password(
        plain_password: str,
        hashed_password: str,
        algorithm: str
    ) -> bool:
        """
        ✅ Verifies a submitted password against a stored hash.

        IMPORTANT: submission.py must use this method instead of plain == comparison.
        Plain == comparison ALWAYS fails for bcrypt because bcrypt hashes are salted
        and each hash of the same password produces a different output.

        Args:
            plain_password: The password submitted by the user
            hashed_password: The stored hash from lab_session.correct_password
            algorithm: md5 | sha256 | bcrypt

        Returns:
            True if password matches hash, False otherwise
        """
        try:
            if algorithm == "md5":
                return hashlib.md5(plain_password.encode()).hexdigest() == hashed_password

            elif algorithm == "sha256":
                return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

            elif algorithm == "bcrypt":
                # ✅ bcrypt.checkpw handles salted comparison correctly
                return bcrypt.checkpw(
                    plain_password.encode(),
                    hashed_password.encode()
                )

            else:
                raise ValueError(f"Unsupported hashing algorithm: '{algorithm}'")

        except Exception:
            # Never crash on verification — just return False
            return False

    @classmethod
    def get_hashcat_mode(cls, algorithm: str) -> int:
        """
        ✅ Returns the Hashcat -m flag value for an algorithm.

        Used by:
        - Lab instruction panels (show correct hashcat command)
        - Overview cards
        - Beginner step hints

        Example: get_hashcat_mode("sha256") → 1400
        Command: hashcat -m 1400 hash.txt wordlist.txt
        """
        mode = cls.HASHCAT_MODES.get(algorithm)
        if mode is None:
            raise ValueError(f"No Hashcat mode defined for algorithm: '{algorithm}'")
        return mode