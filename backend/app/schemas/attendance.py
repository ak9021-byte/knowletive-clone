from pydantic import BaseModel
from datetime import date
from typing import List

class AttendanceEntry(BaseModel):
    student_id: int
    status: str          # "P" | "HD" | "A" | "H"

class AttendanceBulkCreate(BaseModel):
    date: date
    entries: List[AttendanceEntry]

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    faculty_id: int
    date: date
    status: str

    class Config:
        from_attributes = True