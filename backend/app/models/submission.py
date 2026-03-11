from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, nullable=False, index=True)

    submitted_password = Column(String, nullable=False)

    # ✅ Fixed: was String — must be Boolean for correct comparisons
    # submission.py api does: if is_correct → crashes or always True if stored as string "True"
    is_correct = Column(Boolean, nullable=False, default=False)

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
