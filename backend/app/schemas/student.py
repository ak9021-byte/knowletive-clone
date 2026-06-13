from pydantic import BaseModel
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    email: str
    photo_url: Optional[str] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None

class StudentOut(StudentCreate):
    id: int
    faculty_id: int

    class Config:
        from_attributes = True