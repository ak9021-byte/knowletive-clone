from pydantic import BaseModel
from datetime import date
from typing import Optional

class ScoreCreate(BaseModel):
    student_id: int
    date: date
    attendance: str
    topic_name: Optional[str] = None
    personality: int = 0
    formals: int = 0
    cleanliness: int = 0
    socks: int = 0
    shoes: int = 0
    attentive: int = 0
    interactive: int = 0
    communication: int = 0
    confidence: int = 0
    technical_knowledge: int = 0

class ScoreOut(ScoreCreate):
    id: int
    total_score: int
    faculty_id: int

    class Config:
        from_attributes = True