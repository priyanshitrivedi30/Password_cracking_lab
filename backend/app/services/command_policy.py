# app/services/command_policy.py

import re

class CommandPolicy:
    """
    Enforces command restrictions inside lab containers
    """

    # ❌ Dangerous / forbidden patterns
    BLOCKED_PATTERNS = [
        r"rm\s+-rf",
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
        r"curl\s+http",
        r"wget\s+http",
        r"nc\s",
        r"netcat",
        r"scp",
        r"ssh\s"
    ]

    # ✅ Allowed base tools
    ALLOWED_TOOLS = [
        "hashcat",
        "john",
        "ls",
        "cat",
        "cd",
        "pwd",
        "echo",
        "clear",
        "whoami"
    ]

    @classmethod
    def is_command_allowed(cls, command: str) -> bool:
        """
        Returns True if command is safe to execute
        """
        command = command.strip().lower()

        # Block empty commands
        if not command:
            return False

        # Block dangerous patterns
        for pattern in cls.BLOCKED_PATTERNS:
            if re.search(pattern, command):
                return False

        # Allow only whitelisted tools
        base_command = command.split()[0]
        if base_command not in cls.ALLOWED_TOOLS:
            return False

        return True