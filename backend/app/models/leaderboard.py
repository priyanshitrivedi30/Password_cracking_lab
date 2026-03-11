from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)

    # ✅ Added ForeignKey: leaderboard.py api does JOIN with User table
    # Without FK the JOIN works in SQLAlchemy but DB has no referential integrity
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    score = Column(Integer, default=0)

    # ✅ Added: track when score was last updated
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ✅ Relationship: allows leaderboard.user.username without extra queries
    user = relationship("User", backref="leaderboard")
