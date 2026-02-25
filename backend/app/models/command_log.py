from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class CommandLog(Base):
    __tablename__ = "command_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False)
    command = Column(Text, nullable=False)
    output = Column(Text, nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())