# ─── SENTINEL Auth Schemas ────────────────────────────────────────────────────
# Pydantic models that define what the API accepts and returns for auth.
# These validate input at the HTTP boundary — bad data is rejected before
# it reaches the service layer.

from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime


# ─── Requests (what the client sends) ────────────────────────────────────────

class LoginRequest(BaseModel):
    """POST /auth/login — Credentials from login form."""
    email:    EmailStr = Field(..., description="User's email address")
    password: str      = Field(..., min_length=1, description="User's password")

    model_config = {"json_schema_extra": {
        "example": {"email": "admin@sentinel.ai", "password": "Admin@1234"}
    }}


class RegisterRequest(BaseModel):
    """POST /auth/register — New account details."""
    name:     str      = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    password: str      = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Enforce minimum password strength."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

    model_config = {"json_schema_extra": {
        "example": {"name": "Aryan Sharma", "email": "aryan@example.com", "password": "Aryan@1234"}
    }}


# ─── Responses (what the API returns) ────────────────────────────────────────

class UserInToken(BaseModel):
    """Minimal user info embedded in JWT payload."""
    id:    str
    email: str
    role:  str
    name:  str


class TokenResponse(BaseModel):
    """Returned after successful login or registration."""
    access_token: str
    token_type:   str = "bearer"
    user:         "UserResponse"  # type: ignore[name-defined]


# ─── Import here to avoid circular imports ────────────────────────────────────
from app.schemas.user import UserResponse  # noqa: E402
TokenResponse.model_rebuild()
