from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True, nullable=False)

    # ✅ Added: display name for leaderboard, dashboard header
    # Referenced in auth.py /login, /register, /me
    # Referenced in leaderboard.py JOIN
    username = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    # ✅ Added: account status for security.py is_active check
    is_active = Column(Boolean, default=True, nullable=False)

    # ✅ Added: useful for analytics and admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
