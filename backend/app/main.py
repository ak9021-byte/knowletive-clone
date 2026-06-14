import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base

# ✅ Import ALL models
from app.models.score import DailyScore
from app.models.student import Student
from app.models.attendance import Attendance

# ✅ Import all routers
from app.routes import auth, students, scores, attendance
from app.routes import upload   # ✅ NEW

# ✅ Create all tables
Base.metadata.create_all(bind=engine)

# ✅ Ensure uploads folder exists
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Knowletive API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://knowletive-clone-o5cqizz99-akash-gaikwad-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve uploaded files as static — /uploads/filename.jpg
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(scores.router)
app.include_router(attendance.router)
app.include_router(upload.router)   # ✅ NEW

@app.get("/")
def root():
    return {"message": "Knowletive API is running!"}