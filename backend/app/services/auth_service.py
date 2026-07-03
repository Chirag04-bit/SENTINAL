# ─── SENTINEL Auth Service ────────────────────────────────────────────────────
# Handles: password hashing, JWT creation, token verification.
# Routers call these functions — they never touch crypto directly.

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.config.settings import settings
from app.models.user import User
from app.schemas.auth import UserInToken

# ─── Password Hashing ─────────────────────────────────────────────────────────
# bcrypt with cost factor 12 — secure and industry-standard


def hash_password(plain: str) -> str:
    """Convert a plain-text password to a bcrypt hash."""
    pwd_bytes = plain.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Check if a plain password matches a stored hash. Returns bool."""
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


# ─── JWT ──────────────────────────────────────────────────────────────────────

def create_access_token(user: User) -> str:
    """
    Issue a signed JWT for an authenticated user.
    
    Payload contains:
        sub   — user ID (standard JWT claim)
        email — for display purposes
        role  — for role-based access control
        name  — for welcome messages
        exp   — expiry timestamp
    """
    payload = {
        "sub":   user.id,
        "email": user.email,
        "role":  user.role,
        "name":  user.name,
        "exp":   datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> UserInToken:
    """
    Decode and validate a JWT.
    Raises HTTP 401 if the token is invalid, expired, or tampered with.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
        return UserInToken(
            id=user_id,
            email=payload.get("email", ""),
            role=payload.get("role", "user"),
            name=payload.get("name", ""),
        )
    except JWTError:
        raise credentials_exception


# ─── DB Helpers ───────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user by email. Returns None if not found."""
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Fetch a user by ID. Returns None if not found."""
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> User:
    """
    Authenticate credentials.
    Returns the User object if valid, raises HTTP 401 otherwise.
    Security note: We use the same error for 'user not found' and 'wrong password'
    to prevent user enumeration attacks.
    """
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )
    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    return user


def create_user(db: Session, name: str, email: str, password: str, role: str = "user") -> User:
    """
    Register a new user account.
    Raises HTTP 409 if the email is already registered.
    """
    existing = get_user_by_email(db, email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = User(
        name=name,
        email=email.lower().strip(),
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
