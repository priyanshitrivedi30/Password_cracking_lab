from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/")
def get_tools_overview(current_user=Depends(get_current_user)):
    """
    Optional learning page before starting lab
    Explains concepts, tools, attacks, difficulty modes, scoring, and safety
    """

    return {
        # --------------------------------------------------
        # PURPOSE
        # --------------------------------------------------
        "purpose": (
            "This platform is designed to teach password cracking concepts in a legal, "
            "ethical, and isolated lab environment. All activities are strictly for "
            "educational and defensive security learning only. The goal is to understand "
            "how weak passwords are broken so systems can be better protected."
        ),

        # --------------------------------------------------
        # LEARNING OUTCOMES
        # --------------------------------------------------
        "learning_outcomes": [
            "Understand how password hashing works",
            "Identify weak password patterns",
            "Choose correct password attack strategies",
            "Use industry-standard tools responsibly",
            "Understand real-world defensive implications"
        ],

        # --------------------------------------------------
        # HOW PASSWORD CRACKING WORKS
        # --------------------------------------------------
        "how_password_cracking_works": [
            {
                "step": 1,
                "title": "Password Hashing",
                "description": (
                    "When users create passwords, systems do not store the plain password. "
                    "Instead, they store a cryptographic hash generated using algorithms "
                    "such as MD5, SHA1, SHA256, or bcrypt. Hashing is a one-way transformation."
                )
            },
            {
                "step": 2,
                "title": "Hash Exposure",
                "description": (
                    "In real-world breaches, attackers often gain access to databases "
                    "containing password hashes rather than plain-text passwords."
                )
            },
            {
                "step": 3,
                "title": "Guessing and Hashing",
                "description": (
                    "The attacker guesses potential passwords, hashes each guess using "
                    "the same algorithm, and compares the result to the stolen hash."
                )
            },
            {
                "step": 4,
                "title": "Match Found",
                "description": (
                    "If a guessed hash matches the target hash, the original password "
                    "has been successfully recovered."
                )
            }
        ],

        # --------------------------------------------------
        # HASH TYPES
        # --------------------------------------------------
        "hash_types": [
            {
                "name": "MD5",
                "strength": "Weak",
                "reason": "Very fast and unsalted, easy to brute force"
            },
            {
                "name": "SHA1",
                "strength": "Weak",
                "reason": "Deprecated and computationally fast"
            },
            {
                "name": "SHA256",
                "strength": "Moderate",
                "reason": "Strong algorithm but still fast without salting"
            },
            {
                "name": "bcrypt",
                "strength": "Strong",
                "reason": "Slow, salted, and resistant to brute-force attacks"
            }
        ],

        # --------------------------------------------------
        # ATTACK TYPES
        # --------------------------------------------------
        "attack_types": [
            {
                "name": "Dictionary Attack",
                "description": "Uses a predefined list of commonly used passwords",
                "how_it_works": "Hashes each word from a wordlist and compares it to the target hash",
                "used_when": "Passwords are common, reused, or leaked previously"
            },
            {
                "name": "Brute Force Attack",
                "description": "Tries every possible character combination",
                "how_it_works": "Generates all combinations based on character sets",
                "used_when": "Password length is short"
            },
            {
                "name": "Hybrid Attack",
                "description": "Combines wordlists with patterns (e.g., Password123)",
                "how_it_works": "Appends masks or rules to dictionary words",
                "used_when": "Users slightly modify common passwords"
            }
        ],

        # --------------------------------------------------
        # TOOLS
        # --------------------------------------------------
        "tools": [
            {
                "name": "Hashcat",
                "type": "Advanced Password Cracking Tool",
                "description": (
                    "Hashcat is a high-performance password recovery tool that "
                    "uses CPU and GPU acceleration."
                ),
                "how_it_works": (
                    "Hashcat generates password guesses, hashes them using the selected "
                    "algorithm, and compares the result to the target hash at high speed."
                ),
                "used_in_levels": ["Beginner", "Intermediate", "Advanced"],
                "features": [
                    "GPU acceleration",
                    "Multiple attack modes",
                    "Highly configurable"
                ],
                "common_commands": [
                    "hashcat -m <hash_type> -a 0 hash.txt wordlist.txt",
                    "hashcat -m <hash_type> -a 3 hash.txt ?a?a?a?a"
                ],
                "attack_modes": {
                    "0": "Straight (Wordlist)",
                    "3": "Brute Force",
                    "6": "Hybrid Wordlist + Mask",
                    "7": "Hybrid Mask + Wordlist"
                }
            },
            {
                "name": "John the Ripper",
                "type": "Password Cracking Tool",
                "description": (
                    "John the Ripper is a fast and flexible password cracking tool "
                    "with a powerful rule engine."
                ),
                "how_it_works": (
                    "John automatically detects hash types and applies rules "
                    "to mutate password guesses."
                ),
                "used_in_levels": ["Intermediate", "Advanced"],
                "features": [
                    "Automatic hash detection",
                    "Rule-based mutations",
                    "Quick testing"
                ],
                "common_commands": [
                    "john hashes.txt",
                    "john --wordlist=wordlist.txt hashes.txt"
                ]
            }
        ],

        # --------------------------------------------------
        # DIFFICULTY MODES
        # --------------------------------------------------
        "difficulty_modes": {
            "beginner": {
                "mode": "Guided",
                "description": (
                    "Step-by-step hints, command explanations, and limited allowed commands. "
                    "Designed for first-time learners."
                ),
                "recommended_for": "Beginners",
                "score_multiplier": 1.0
            },
            "intermediate": {
                "mode": "Semi-Guided",
                "description": (
                    "Limited hints with increased freedom. Requires understanding of tools."
                ),
                "recommended_for": "Intermediate users",
                "score_multiplier": 1.5
            },
            "advanced": {
                "mode": "Free",
                "description": (
                    "No hints. Full terminal freedom. Real-world simulation environment."
                ),
                "recommended_for": "Advanced users",
                "score_multiplier": 2.0
            }
        },

        # --------------------------------------------------
        # SCORING
        # --------------------------------------------------
        "scoring_factors": [
            "Time taken to crack the password",
            "Number of attempts",
            "Difficulty level",
            "Mode (guided vs free)"
        ],

        # --------------------------------------------------
        # COMMON MISTAKES
        # --------------------------------------------------
        "common_mistakes": [
            "Using brute force on long passwords",
            "Ignoring wordlists",
            "Selecting the wrong hash mode",
            "Not analyzing target information"
        ],

        # --------------------------------------------------
        # SAFETY
        # --------------------------------------------------
        "safety": {
            "environment": "Isolated Docker container with restricted permissions",
            "blocked_actions": [
                "rm -rf",
                "shutdown",
                "network scanning",
                "external internet access"
            ],
            "allowed_actions": [
                "password cracking tools",
                "reading provided files",
                "running approved commands"
            ]
        },

        # --------------------------------------------------
        # LEGAL
        # --------------------------------------------------
        "legal_notice": (
            "This lab is for educational purposes only. "
            "Attacking real systems without authorization is illegal."
        )
    }