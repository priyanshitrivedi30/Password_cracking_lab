import os
import time

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base

# Read DB URL from env (Docker-friendly)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://lab1admin:pvtp3003@db:5432/passwordlab"
)

# Retry DB connection (important for Docker startup order)
MAX_RETRIES = 10
RETRY_DELAY = 2  # seconds

engine = None

for attempt in range(MAX_RETRIES):
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,   # prevents stale connections
            echo=True             # set False in production
        )
        with engine.connect():
            print("✅ Database connected successfully")
        break
    except OperationalError:
        print(f"⏳ Waiting for database... ({attempt + 1}/{MAX_RETRIES})")
        time.sleep(RETRY_DELAY)
else:
    raise RuntimeError("❌ Database not available after multiple retries")

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model
Base = declarative_base()
