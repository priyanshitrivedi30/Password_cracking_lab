from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token, get_current_user

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
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,   # ✅ for dashboard/leaderboard display
        }
    }


# ---------- REGISTER ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str           # ✅ display name for leaderboard
    password: str

    # ✅ Password must be at least 8 characters
    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    # ✅ Username must be at least 3 characters
    @field_validator("username")
    @classmethod
    def username_min_length(cls, v):
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return v.strip()


@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Check duplicate email
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check duplicate username
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=pwd_context.hash(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ Return JWT immediately so frontend redirects to dashboard without re-login
    access_token = create_access_token({"user_id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }
    }


# ---------- GET CURRENT USER (/me) ----------
@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Returns the currently logged-in user's info.
    Frontend uses this to populate dashboard header, leaderboard name, etc.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
    }
