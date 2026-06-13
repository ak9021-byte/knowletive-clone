from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceBulkCreate, AttendanceOut
from typing import List
from datetime import date

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ── 1. Bulk save attendance for a date ──────────────────────────────────────
@router.post("/", response_model=List[AttendanceOut])
def save_attendance(data: AttendanceBulkCreate, faculty_id: int, db: Session = Depends(get_db)):
    # Delete existing records for this date + faculty (allow re-marking)
    db.query(Attendance).filter(
        Attendance.faculty_id == faculty_id,
        Attendance.date == data.date
    ).delete()
    db.commit()

    records = []
    for entry in data.entries:
        rec = Attendance(
            student_id=entry.student_id,
            faculty_id=faculty_id,
            date=data.date,
            status=entry.status,
        )
        db.add(rec)
        records.append(rec)

    db.commit()
    for r in records:
        db.refresh(r)
    return records


# ── 2. Get attendance for a specific date ───────────────────────────────────
@router.get("/date/{att_date}", response_model=List[AttendanceOut])
def get_attendance_by_date(att_date: date, faculty_id: int, db: Session = Depends(get_db)):
    return db.query(Attendance).filter(
        Attendance.faculty_id == faculty_id,
        Attendance.date == att_date
    ).all()


# ── 3. Get attendance for a student ─────────────────────────────────────────
@router.get("/student/{student_id}", response_model=List[AttendanceOut])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    return db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).order_by(Attendance.date.desc()).all()


# ── 4. Summary — per-student stats ──────────────────────────────────────────
@router.get("/summary")
def get_summary(faculty_id: int, db: Session = Depends(get_db)):
    students = db.query(Student).filter(Student.faculty_id == faculty_id).all()

    # Total unique days marked by this faculty
    days_marked = db.query(func.count(func.distinct(Attendance.date))).filter(
        Attendance.faculty_id == faculty_id
    ).scalar() or 0

    result = []
    total_pct = 0

    for s in students:
        records = db.query(Attendance).filter(
            Attendance.student_id == s.id,
            Attendance.faculty_id == faculty_id
        ).order_by(Attendance.date.asc()).all()

        p  = sum(1 for r in records if r.status == "P")
        hd = sum(1 for r in records if r.status == "HD")
        a  = sum(1 for r in records if r.status == "A")
        h  = sum(1 for r in records if r.status == "H")

        total_days = len(records)
        # HD counts as 0.5
        attended = p + (hd * 0.5)
        workdays = total_days - h          # holidays don't count
        pct = round((attended / workdays) * 100) if workdays > 0 else 0
        total_pct += pct

        result.append({
            "student_id":   s.id,
            "student_name": s.name,
            "photo_url":    s.photo_url,
            "P":  p,
            "HD": hd,
            "A":  a,
            "H":  h,
            "total_days":   total_days,
            "percentage":   pct,
            "records": [{"date": str(r.date), "status": r.status} for r in records],
        })

    avg_attendance = round(total_pct / len(students)) if students else 0

    return {
        "total_students":  len(students),
        "days_marked":     days_marked,
        "avg_attendance":  avg_attendance,
        "students":        result,
    }