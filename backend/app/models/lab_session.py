from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class LabSession(Base):
    __tablename__ = "lab_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    difficulty = Column(String, nullable=False)
    mode = Column(String, nullable=False)  # guided | free

    target_hash = Column(String, nullable=False)
    correct_password = Column(String, nullable=False)

    status = Column(String, default="running")
    attempts = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    score = Column(Integer, nullable=True)

    container_id = Column(String, nullable=True)
    container_port = Column(Integer, nullable=True)

    current_step = Column(Integer, default=1)   # Beginner guided steps
    hints_used = Column(Integer, default=0)    