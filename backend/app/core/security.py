from datetime import datetime, timedelta, timezone
import os
import logging

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# JWT CONFIG
# ─────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY")

# ✅ No weak fallback — app refuses to start without a real secret key
if not SECRET_KEY:
    raise RuntimeError(
        "❌ SECRET_KEY environment variable is not set. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\" "
        "and add it to your .env file."
    )

ALGORITHM = "HS256"

# ✅ 3 hours — covers full lab session + buffer, prevents mid-session 401 errors
# Lab timer is 10 mins, but user may have been logged in before starting
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "180"))


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ─────────────────────────────────────────────────────────────
# DB Dependency — defined ONCE here, imported everywhere
# Replace all get_db() definitions in api/*.py with:
#   from app.core.security import get_db
# ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────
# TOKEN CREATION
# ─────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_minutes: int = None) -> str:
    """
    Creates a signed JWT token with expiration.

    Args:
        data: Must contain 'user_id' key.
        expires_minutes: Optional override for token expiry duration.

    Returns:
        Signed JWT string.
    """
    if "user_id" not in data:
        raise ValueError("data dict must contain 'user_id'")

    expire_minutes = expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES

    # ✅ timezone-aware datetime (datetime.utcnow() is deprecated in Python 3.12)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    to_encode = {
        # ✅ 'sub' is the JWT standard claim for subject — store user_id here only
        "sub": str(data["user_id"]),
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # issued-at time
    }

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


# ─────────────────────────────────────────────────────────────
# AUTH GUARD — used as Depends() in all protected routes
# ─────────────────────────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decodes and validates JWT token.
    Returns the authenticated User object.
    Raises 401 if token is invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # ✅ Read from 'sub' only (single source of truth for user_id)
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise credentials_exception

    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise credentials_exception

    # Validate user_id is a valid integer
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    # Fetch user from DB
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception

    # ✅ Check user is active (ban/deactivate support)
    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact support.",
        )

    return user
