from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("/")
def get_lab_overview(current_user=Depends(get_current_user)):
    """
    Lab Overview page — returns all 11 sections as a structured card array.
    Frontend loops over `cards` and renders each as a card component (PDF requirement).
    Each card has: id, icon, title, subtitle, and content.
    """

    return {
        "cards": [

            # ── 1. PURPOSE ──────────────────────────────────────────
            {
                "card_id": "purpose",
                "icon": "🎯",
                "title": "Purpose",
                "subtitle": "Why this lab exists",
                "content": {
                    "text": (
                        "This platform is designed to teach password cracking concepts in a "
                        "legal, ethical, and isolated lab environment. All activities are "
                        "strictly for educational and defensive security learning only. "
                        "The goal is to understand how weak passwords are broken so that "
                        "systems can be better protected."
                    )
                }
            },

            # ── 2. LEARNING OUTCOMES ────────────────────────────────
            {
                "card_id": "learning_outcomes",
                "icon": "📚",
                "title": "Learning Outcomes",
                "subtitle": "What you will learn",
                "content": {
                    "outcomes": [
                        "Understand how password hashing works",
                        "Identify weak password patterns",
                        "Choose correct password attack strategies",
                        "Use industry-standard tools responsibly",
                        "Understand real-world defensive implications"
                    ]
                }
            },

            # ── 3. HOW PASSWORD CRACKING WORKS ─────────────────────
            {
                "card_id": "how_it_works",
                "icon": "🔓",
                "title": "How Password Cracking Works",
                "subtitle": "Step-by-step process",
                "content": {
                    "steps": [
                        {
                            "step": 1,
                            "title": "Password Hashing",
                            "description": (
                                "When users create passwords, systems do not store the plain "
                                "password. Instead, they store a cryptographic hash using "
                                "algorithms such as MD5, SHA-256, or bcrypt. Hashing is a "
                                "one-way transformation — you cannot reverse it directly."
                            )
                        },
                        {
                            "step": 2,
                            "title": "Hash Exposure",
                            "description": (
                                "In real-world breaches, attackers gain access to databases "
                                "containing password hashes rather than plain-text passwords."
                            )
                        },
                        {
                            "step": 3,
                            "title": "Guessing and Hashing",
                            "description": (
                                "The attacker guesses potential passwords, hashes each guess "
                                "using the same algorithm, and compares the result to the "
                                "stolen hash."
                            )
                        },
                        {
                            "step": 4,
                            "title": "Match Found",
                            "description": (
                                "If a guessed hash matches the target hash, the original "
                                "password has been successfully recovered."
                            )
                        }
                    ]
                }
            },

            # ── 4. HASH TYPES ───────────────────────────────────────
            {
                "card_id": "hash_types",
                "icon": "🔐",
                "title": "Hash Types",
                "subtitle": "Algorithms used in this lab",
                "content": {
                    "hashes": [
                        {
                            "name": "MD5",
                            "length": "32 hex characters",
                            "strength": "Weak",
                            "used_in": "Beginner",
                            "reason": "Very fast and unsalted — easy to brute force"
                        },
                        {
                            "name": "SHA-256",
                            "length": "64 hex characters",
                            "strength": "Moderate",
                            "used_in": "Intermediate",
                            "reason": "Stronger algorithm but still fast without salting"
                        },
                        {
                            "name": "bcrypt",
                            "length": "60 characters",
                            "strength": "Strong",
                            "used_in": "Advanced",
                            "reason": "Slow, salted, and highly resistant to brute-force attacks"
                        }
                    ]
                }
            },

            # ── 5. ATTACK TYPES ─────────────────────────────────────
            {
                "card_id": "attack_types",
                "icon": "⚔️",
                "title": "Attack Types",
                "subtitle": "Methods used to crack passwords",
                "content": {
                    "attacks": [
                        {
                            "name": "Dictionary Attack",
                            "used_in": "Beginner",
                            "description": "Uses a predefined list of commonly used passwords",
                            "how_it_works": "Hashes each word from a wordlist and compares to the target hash",
                            "best_against": "Common, reused, or previously leaked passwords"
                        },
                        {
                            "name": "Hybrid Attack",
                            "used_in": "Intermediate",
                            "description": "Combines wordlists with patterns (e.g. password83)",
                            "how_it_works": "Appends masks or rules to dictionary words",
                            "best_against": "Passwords that are slightly modified common words"
                        },
                        {
                            "name": "Mask / Brute Force Attack",
                            "used_in": "Advanced",
                            "description": "Tries every possible character combination based on a mask",
                            "how_it_works": "Generates all combinations based on defined character sets",
                            "best_against": "Short passwords with unknown patterns"
                        }
                    ]
                }
            },

            # ── 6. TOOLS ────────────────────────────────────────────
            {
                "card_id": "tools",
                "icon": "🛠️",
                "title": "Tools",
                "subtitle": "What you will use in the lab",
                "content": {
                    "tools": [
                        {
                            "name": "John the Ripper",
                            "type": "Password Cracking Tool",
                            # ✅ Fixed: John is used in Beginner (dictionary attack)
                            "used_in_levels": ["Beginner"],
                            "description": (
                                "John the Ripper is a fast, flexible password cracking tool "
                                "with automatic hash detection."
                            ),
                            "common_commands": [
                                "john --wordlist=wordlist.txt hash.txt",
                                "john --show hash.txt"
                            ]
                        },
                        {
                            "name": "Hashcat",
                            "type": "Advanced Password Cracking Tool",
                            # ✅ Hashcat used in Intermediate + Advanced
                            "used_in_levels": ["Intermediate", "Advanced"],
                            "description": (
                                "Hashcat is a high-performance password recovery tool "
                                "that supports GPU acceleration and many attack modes."
                            ),
                            "attack_modes": {
                                "0": "Straight (Wordlist)",
                                "3": "Brute Force / Mask",
                                "6": "Hybrid Wordlist + Mask",
                                "7": "Hybrid Mask + Wordlist"
                            },
                            "common_commands": [
                                "hashcat -m 1400 -a 6 hash.txt wordlist.txt ?d?d",
                                "hashcat -m 3200 -a 3 hash.txt ?l?l?l?l?l"
                            ]
                        }
                    ]
                }
            },

            # ── 7. DIFFICULTY MODES ─────────────────────────────────
            {
                "card_id": "difficulty_modes",
                "icon": "🎮",
                "title": "Difficulty Modes",
                "subtitle": "Choose your challenge level",
                "content": {
                    "modes": [
                        {
                            "id": "beginner",
                            "label": "Beginner",
                            # ✅ Correct mode label
                            "mode": "Guided",
                            "hash": "MD5",
                            "tool": "John the Ripper",
                            "attack": "Dictionary",
                            "points": 50,
                            "timer": "10 minutes",
                            "description": (
                                "Step-by-step instructions with exact commands shown. "
                                "Each step unlocks only after the previous is completed. "
                                "Best for first-time learners."
                            )
                        },
                        {
                            "id": "intermediate",
                            "label": "Intermediate",
                            # ✅ Correct mode label (was Semi-Guided)
                            "mode": "Hints-Based",
                            "hash": "SHA-256",
                            "tool": "Hashcat",
                            "attack": "Hybrid",
                            "points": 100,
                            "timer": "10 minutes",
                            "max_hints": 5,
                            "hint_penalty": "-5 points per hint after 3rd",
                            "description": (
                                "High-level hints only — no exact commands shown. "
                                "You decide the approach. Up to 5 hints available."
                            )
                        },
                        {
                            "id": "advanced",
                            "label": "Advanced",
                            "mode": "Free Mode",
                            "hash": "bcrypt",
                            "tool": "Your choice",
                            "attack": "Mask or Brute Force",
                            "points": 200,
                            "timer": "10 minutes",
                            "description": (
                                "No hints. No steps. Only rules and hash info provided. "
                                "Strict environment. Highest scoring difficulty."
                            )
                        }
                    ]
                }
            },

            # ── 8. SCORING ──────────────────────────────────────────
            {
                "card_id": "scoring",
                "icon": "🏆",
                "title": "Scoring",
                "subtitle": "How your score is calculated",
                "content": {
                    "base_points": {
                        "beginner": 50,
                        "intermediate": 100,
                        "advanced": 200
                    },
                    "penalties": [
                        {
                            "condition": "Time taken > 5 minutes",
                            "penalty": "-10 points"
                        },
                        {
                            "condition": "Time taken > 10 minutes",
                            "penalty": "-20 points"
                        },
                        {
                            "condition": "Each wrong attempt (intermediate/advanced only)",
                            "penalty": "-5 points per attempt"
                        },
                        {
                            "condition": "Each hint used after 3rd (intermediate only)",
                            "penalty": "-5 points per hint"
                        }
                    ],
                    "minimum_score": 10,
                    "note": "Score never drops below 10 points for a completed lab."
                }
            },

            # ── 9. COMMON MISTAKES ──────────────────────────────────
            {
                "card_id": "common_mistakes",
                "icon": "⚠️",
                "title": "Common Mistakes",
                "subtitle": "What to avoid",
                "content": {
                    "mistakes": [
                        {
                            "mistake": "Using brute force on long passwords",
                            "why": "Brute force time grows exponentially — impractical on long passwords"
                        },
                        {
                            "mistake": "Ignoring wordlists",
                            "why": "Most real-world passwords are dictionary words with minor variations"
                        },
                        {
                            "mistake": "Selecting the wrong hash mode in Hashcat",
                            "why": "Wrong -m value means Hashcat compares hashes incorrectly and finds nothing"
                        },
                        {
                            "mistake": "Not reading the hash file first",
                            "why": "Hash length tells you the algorithm — always inspect it before attacking"
                        },
                        {
                            "mistake": "Running multiple tools simultaneously",
                            "why": "Wastes resources and confuses output — use one tool at a time"
                        }
                    ]
                }
            },

            # ── 10. SAFETY ──────────────────────────────────────────
            {
                "card_id": "safety",
                "icon": "🛡️",
                "title": "Safety",
                "subtitle": "How the lab environment is secured",
                "content": {
                    "environment": "Isolated Docker container with restricted permissions",
                    "network": "No external internet access (network_mode: none)",
                    "resource_limits": {
                        "memory": "512MB",
                        "cpu": "50% of one core"
                    },
                    "blocked_commands": [
                        "rm -rf", "shutdown", "wget", "curl",
                        "chmod", "sudo", "nc", "python", "bash"
                    ],
                    "allowed_commands": [
                        "hashcat", "john", "ls", "cat"
                    ],
                    "auto_cleanup": "Container is automatically destroyed after 10 minutes or when lab is completed"
                }
            },

            # ── 11. LEGAL ───────────────────────────────────────────
            {
                "card_id": "legal",
                "icon": "⚖️",
                "title": "Legal",
                "subtitle": "Terms of use and disclaimer",
                "content": {
                    "disclaimer": (
                        "This lab is strictly for educational and authorized security "
                        "research purposes only. All lab activities occur within an isolated "
                        "environment and do not interact with any real systems, networks, "
                        "or third-party infrastructure."
                    ),
                    "prohibited": [
                        "Using techniques learned here against real systems without explicit written authorization",
                        "Attempting to break out of the lab container",
                        "Sharing lab credentials or session access with others",
                        "Using the lab for any commercial, malicious, or unauthorized purpose"
                    ],
                    "user_responsibility": (
                        "By proceeding, you acknowledge that you are using this platform "
                        "solely for learning purposes and accept full responsibility for "
                        "your actions both inside and outside this lab environment."
                    ),
                    "legal_notice": (
                        "Unauthorized access to computer systems is a criminal offense "
                        "under laws including the Computer Fraud and Abuse Act (CFAA), "
                        "the UK Computer Misuse Act, and equivalent legislation worldwide. "
                        "Violation may result in civil or criminal penalties."
                    )
                }
            }

        ]
    }
