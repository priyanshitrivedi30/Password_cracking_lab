from sqlalchemy import Column, Integer, Float
from app.core.database import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    total_score = Column(Integer, default=0)
    total_time = Column(Float, default=0.0)
