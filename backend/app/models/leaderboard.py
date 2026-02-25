from sqlalchemy import Column, Integer
from app.core.database import Base

class Leaderboard(Base):
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    score = Column(Integer, default=0)
