from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False)
    submitted_password = Column(String, nullable=False)
    is_correct = Column(String, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
