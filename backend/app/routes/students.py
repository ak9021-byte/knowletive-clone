from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentOut, StudentUpdate
from typing import List

router = APIRouter(prefix="/students", tags=["Students"])

@router.post("/", response_model=StudentOut)
def add_student(data: StudentCreate, faculty_id: int, db: Session = Depends(get_db)):
    student = Student(**data.dict(), faculty_id=faculty_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/", response_model=List[StudentOut])
def get_students(faculty_id: int, db: Session = Depends(get_db)):
    return db.query(Student).filter(Student.faculty_id == faculty_id).all()

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}

@router.get("/by-email", response_model=StudentOut)
def get_student_by_email(email: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.email == email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# ✅ NEW — Edit student name, email, photo_url
@router.patch("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student