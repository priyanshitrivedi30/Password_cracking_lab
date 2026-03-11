from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)

    # ✅ Added ForeignKey: analytics api does queries filtered by user_id
    # FK ensures referential integrity — no orphaned analytics rows
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    total_score = Column(Integer, default=0)
    total_time = Column(Float, default=0.0)       # total seconds across all sessions

    # ✅ Added: track when last updated
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ✅ Relationship: easy access to user info
    user = relationship("User", backref="analytics")
