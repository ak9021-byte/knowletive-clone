from pydantic import BaseModel

class FacultyCreate(BaseModel):
    name: str
    username: str
    email: str
    password: str

class FacultyLogin(BaseModel):
    username: str
    password: str

class FacultyOut(BaseModel):
    id: int
    name: str
    username: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    faculty: FacultyOut