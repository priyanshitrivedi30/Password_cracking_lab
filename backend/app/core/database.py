import os
import time
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# Database URL — ALWAYS set via environment variable.
# ✅ No hardcoded credentials in source code.
#
# Set this in your .env file or docker-compose.yml:
#   DATABASE_URL=postgresql://lab1admin:yourpassword@db:5432/passwordlab
# ─────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL environment variable is not set. "
        "Add it to your .env file or docker-compose.yml"
    )

# ✅ echo=False by default — set DEBUG_SQL=true in env to enable SQL logging
SQL_ECHO = os.getenv("DEBUG_SQL", "false").lower() == "true"

# Retry settings (important for Docker startup order — DB may not be ready instantly)
MAX_RETRIES = 10
RETRY_DELAY = 2  # seconds between retries

# ─────────────────────────────────────────────────────────────
# Create engine with retry loop
# ─────────────────────────────────────────────────────────────
engine = None

for attempt in range(1, MAX_RETRIES + 1):
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,         # ✅ detects and drops stale connections
            pool_size=10,               # ✅ handles multiple concurrent lab sessions
            max_overflow=20,            # ✅ allows burst up to 30 total connections
            pool_timeout=30,            # wait up to 30s for a connection from pool
            pool_recycle=1800,          # recycle connections every 30 mins
            echo=SQL_ECHO,              # ✅ controlled by env, not hardcoded True
        )

        # Verify connection is actually working
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        logger.info("✅ Database connected successfully")
        break

    except OperationalError as e:
        logger.warning(f"⏳ Waiting for database... ({attempt}/{MAX_RETRIES}) — {e}")
        if attempt == MAX_RETRIES:
            raise RuntimeError(
                f"❌ Database not available after {MAX_RETRIES} retries. "
                "Check your DATABASE_URL and ensure the DB container is running."
            )
        time.sleep(RETRY_DELAY)

# ✅ Guard: engine must be set at this point
if engine is None:
    raise RuntimeError("❌ Database engine failed to initialize.")

# ─────────────────────────────────────────────────────────────
# Session factory
# ─────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ─────────────────────────────────────────────────────────────
# Base model — all SQLAlchemy models inherit from this
# ─────────────────────────────────────────────────────────────
Base = declarative_base()


def create_tables():
    """
    Creates all tables defined in SQLAlchemy models if they don't exist.

    Call this from main.py on startup:
        from app.core.database import create_tables
        create_tables()

    ✅ Safe to call multiple times — only creates missing tables.
    Note: For production, prefer Alembic migrations over this.
    """
    # Import all models here so Base knows about them before create_all
    from app.models import (   # noqa: F401
        user,
        lab_session,
        submission,
        leaderboard,
        analytics,
        command_log,
    )
    Base.metadata.create_all(bind=engine)
    logger.info("✅ All database tables verified/created")
