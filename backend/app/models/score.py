from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class DailyScore(Base):
    __tablename__ = "daily_scores"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    date = Column(Date, nullable=False)

    # Manoj Sir's criteria
    attendance = Column(String, nullable=True)        # P / A / Late
    topic_name = Column(String, nullable=True)        # Topic of the day

    # Marks /10 each
    personality          = Column(Integer, default=0)
    formals              = Column(Integer, default=0)
    cleanliness          = Column(Integer, default=0)
    socks                = Column(Integer, default=0)
    shoes                = Column(Integer, default=0)
    attentive            = Column(Integer, default=0)
    interactive          = Column(Integer, default=0)
    communication        = Column(Integer, default=0)
    confidence           = Column(Integer, default=0)
    technical_knowledge  = Column(Integer, default=0)

    total_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="scores")