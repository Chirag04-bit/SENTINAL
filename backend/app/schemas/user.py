# ─── SENTINEL User Schemas ────────────────────────────────────────────────────
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    """Returned whenever a user object is included in a response."""
    id:           str
    name:         str
    email:        str
    role:         str
    is_active:    bool
    risk_score:   int
    risk_level:   str
    location:     Optional[str] = None
    device:       Optional[str] = None
    last_login:   Optional[datetime] = None
    joined_at:    datetime
    total_alerts: int
    open_alerts:  int

    model_config = {"from_attributes": True}  # Allow reading from ORM objects


class UserUpdate(BaseModel):
    """PATCH /users/me — Fields the user can update."""
    name:     Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, max_length=100)
    device:   Optional[str] = Field(None, max_length=150)


class UserListResponse(BaseModel):
    """GET /users — paginated user list."""
    data:  list[UserResponse]
    total: int
    page:  int
    pages: int
