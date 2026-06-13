from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    photo_url = Column(String, nullable=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    scores = relationship("DailyScore", back_populates="student")
    faculty = relationship("Faculty")
    attendance = relationship("Attendance", back_populates="student")