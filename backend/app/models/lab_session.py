from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class LabSession(Base):
    __tablename__ = "lab_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)

    difficulty = Column(String, nullable=False)          # beginner | intermediate | advanced

    # ✅ Updated comment: guided | hints | free
    mode = Column(String, nullable=False)                # guided | hints | free

    # ✅ Added: needed by submission.py response, session.py response, terminal.py
    algorithm = Column(String, nullable=False)           # md5 | sha256 | bcrypt

    target_hash = Column(String, nullable=False)
    correct_password = Column(String, nullable=False)

    status = Column(String, default="running")           # running | completed | expired

    attempts = Column(Integer, default=0)

    # ✅ Added: timer expiry — used by lab.py, session.py, terminal.py for countdown
    expires_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    score = Column(Integer, nullable=True)

    container_id = Column(String, nullable=True)
    container_port = Column(Integer, nullable=True)

    current_step = Column(Integer, default=1)            # Beginner guided step tracking
    hints_used = Column(Integer, default=0)              # Intermediate hint tracking

    # ✅ Added: consent must be given before lab starts (PDF requirement)
    # Enforced in lab.py /start endpoint
    consent_given = Column(Boolean, default=False, nullable=False)
