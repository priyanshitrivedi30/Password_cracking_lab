from sqlalchemy import Column, Integer, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.sql import func
from app.core.database import Base

class Disclaimer(Base):
    __tablename__ = "disclaimers"

    __table_args__ = (
        UniqueConstraint("user_id", "version", name="unique_user_disclaimer_version"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False, index=True)

    accepted = Column(Boolean, default=False)

    version = Column(Integer, default=1)

    disclaimer_text = Column(Text, nullable=False)

    accepted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())