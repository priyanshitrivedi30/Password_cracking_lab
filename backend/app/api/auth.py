from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- LOGIN ----------
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"user_id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ---------- REGISTER ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=payload.email,
        hashed_password=pwd_context.hash(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User registered successfully"}