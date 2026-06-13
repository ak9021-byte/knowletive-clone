from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.faculty import Faculty
from app.schemas.faculty import FacultyCreate, FacultyLogin, Token, FacultyOut
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=FacultyOut)
def register(data: FacultyCreate, db: Session = Depends(get_db)):
    existing = db.query(Faculty).filter(Faculty.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    faculty = Faculty(
        name=data.name,
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty

@router.post("/login", response_model=Token)
def login(data: FacultyLogin, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.username == data.username).first()
    if not faculty or not verify_password(data.password, faculty.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(faculty.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "faculty": faculty
    }