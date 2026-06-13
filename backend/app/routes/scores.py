from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.score import DailyScore
from app.schemas.score import ScoreCreate, ScoreOut
from typing import List
from datetime import date, date as date_type, timedelta

router = APIRouter(prefix="/scores", tags=["Scores"])

FIELDS = [
    "personality","formals","cleanliness","socks","shoes",
    "attentive","interactive","communication","confidence","technical_knowledge"
]

CATEGORIES = {
    "Personality":         ("personality",         10),
    "Formals":             ("formals",              10),
    "Cleanliness":         ("cleanliness",          10),
    "Socks":               ("socks",                10),
    "Shoes":               ("shoes",                10),
    "Attentive":           ("attentive",            10),
    "Interactive":         ("interactive",          10),
    "Communication":       ("communication",        10),
    "Confidence":          ("confidence",           10),
    "Technical Knowledge": ("technical_knowledge",  10),
}

@router.post("/", response_model=ScoreOut)
def submit_score(data: ScoreCreate, faculty_id: int, db: Session = Depends(get_db)):
    total = sum(getattr(data, f) for f in FIELDS)
    score = DailyScore(**data.dict(), faculty_id=faculty_id, total_score=total)
    db.add(score)
    db.commit()
    db.refresh(score)
    return score

@router.get("/stats/daily")
def get_daily_stats(faculty_id: int, date: date_type, db: Session = Depends(get_db)):
    from app.models.student import Student

    total_students = db.query(Student).filter(Student.faculty_id == faculty_id).count()
    scored_today   = db.query(DailyScore).filter(
        DailyScore.faculty_id == faculty_id,
        DailyScore.date == date
    ).count()
    avg_result = db.query(func.avg(DailyScore.total_score)).filter(
        DailyScore.faculty_id == faculty_id,
        DailyScore.date == date
    ).scalar()
    avg_score = round(float(avg_result), 1) if avg_result else 0

    top_performers = db.query(DailyScore).filter(
        DailyScore.faculty_id == faculty_id,
        DailyScore.date == date
    ).order_by(DailyScore.total_score.desc()).limit(5).all()

    top_with_names = []
    for score in top_performers:
        student = db.query(Student).filter(Student.id == score.student_id).first()
        top_with_names.append({
            "student_id":   score.student_id,
            "student_name": student.name if student else "Unknown",
            "total_score":  score.total_score,
            "attendance":   score.attendance,
            "topic_name":   score.topic_name,
        })

    return {
        "total_students": total_students,
        "scored_today":   scored_today,
        "average_score":  avg_score,
        "top_performers": top_with_names,
    }

@router.get("/analytics")
def get_analytics(faculty_id: int, days: int = 7, db: Session = Depends(get_db)):
    from app.models.student import Student

    since    = date_type.today() - timedelta(days=days)
    students = db.query(Student).filter(Student.faculty_id == faculty_id).all()

    total_students = len(students)
    student_data   = []
    class_totals   = []

    for s in students:
        scores = db.query(DailyScore).filter(
            DailyScore.student_id == s.id,
            DailyScore.faculty_id == faculty_id,
            DailyScore.date >= since,
        ).all()

        if not scores:
            continue

        sessions  = len(scores)
        avg_total = round(sum(sc.total_score for sc in scores) / sessions, 1)
        class_totals.append(avg_total)

        # ✅ FIXED: use tuple correctly (field_name, max_value)
        cat_breakdown = {}
        for cat_name, (field_name, cat_max) in CATEGORIES.items():
            avg_cat = sum(getattr(sc, field_name, 0) for sc in scores) / sessions
            avg_cat = round(avg_cat, 1)
            pct     = round((avg_cat / cat_max) * 100)
            cat_breakdown[cat_name] = {
                "avg": avg_cat,
                "max": cat_max,
                "pct": pct,
            }

        # Streak
        scored_dates = sorted({sc.date for sc in scores}, reverse=True)
        streak   = 0
        expected = date_type.today()
        for d in scored_dates:
            if d == expected:
                streak += 1
                expected -= timedelta(days=1)
            else:
                break

        level = "Pro" if avg_total >= 80 else "Learner" if avg_total >= 50 else "Beginner"

        student_data.append({
            "student_id":    s.id,
            "student_name":  s.name,
            "student_email": s.email,
            "photo_url":     s.photo_url,
            "avg_score":     avg_total,
            "sessions":      sessions,
            "streak":        streak,
            "level":         level,
            "categories":    cat_breakdown,
        })

    student_data.sort(key=lambda x: x["avg_score"], reverse=True)
    class_avg = round(sum(class_totals) / len(class_totals), 1) if class_totals else 0

    return {
        "total_students":  total_students,
        "active_students": len(student_data),
        "class_avg":       class_avg,
        "days":            days,
        "students":        student_data,
    }

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    results = db.query(
        DailyScore.student_id,
        func.sum(DailyScore.total_score).label("total")
    ).group_by(DailyScore.student_id)\
     .order_by(func.sum(DailyScore.total_score).desc()).all()
    return [{"student_id": r[0], "total_score": r[1]} for r in results]

@router.get("/student/{student_id}", response_model=List[ScoreOut])
def get_student_scores(student_id: int, db: Session = Depends(get_db)):
    return db.query(DailyScore).filter(
        DailyScore.student_id == student_id
    ).all()

@router.get("/daily/{score_date}", response_model=List[ScoreOut])
def get_daily_scores(score_date: date, db: Session = Depends(get_db)):
    return db.query(DailyScore).filter(
        DailyScore.date == score_date
    ).all()