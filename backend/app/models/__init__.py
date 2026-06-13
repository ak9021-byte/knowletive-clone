from app.database import Base
from app.models.score import DailyScore
from app.models.student import Student
from app.models.faculty import Faculty  # whatever your faculty model is called

__all__ = ["Base", "DailyScore", "Student", "Faculty"]