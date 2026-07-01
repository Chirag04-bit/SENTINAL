# ─── SENTINEL User Model ──────────────────────────────────────────────────────
# Represents the 'users' table in the database.
# Never write raw SQL — all queries go through SQLAlchemy ORM methods.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.config.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """
    Stores all SENTINEL user accounts.
    
    Relationships:
        - One user has many Alert records (backref: 'user')
        - One user has many Event records (backref: 'user')
    """
    __tablename__ = "users"

    # ── Primary Key ──────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    name:     Mapped[str] = mapped_column(String(100), nullable=False)
    email:    Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    role:     Mapped[str] = mapped_column(String(20),  nullable=False, default="user")
    # Values: "user" | "admin" | "analyst"

    # ── Authentication ────────────────────────────────────────────────────────
    # NEVER store plain-text passwords — only bcrypt hashes
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── Status ────────────────────────────────────────────────────────────────
    is_active:  Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Risk Profile ──────────────────────────────────────────────────────────
    risk_score: Mapped[int]   = mapped_column(Integer, default=0)    # 0–100
    risk_level: Mapped[str]   = mapped_column(String(20), default="low")

    # ── Device & Location ─────────────────────────────────────────────────────
    location:   Mapped[str | None] = mapped_column(String(100))
    device:     Mapped[str | None] = mapped_column(String(150))
    ip_address: Mapped[str | None] = mapped_column(String(50))

    # ── Statistics ────────────────────────────────────────────────────────────
    total_alerts: Mapped[int] = mapped_column(Integer, default=0)
    open_alerts:  Mapped[int] = mapped_column(Integer, default=0)

    # ── Timestamps ────────────────────────────────────────────────────────────
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    joined_at:  Mapped[datetime]        = mapped_column(DateTime(timezone=True), default=_now)

    # ── Relationships ─────────────────────────────────────────────────────────
    alerts: Mapped[list["Alert"]] = relationship(  # type: ignore[name-defined]
        "Alert", back_populates="user", cascade="all, delete-orphan"
    )
    events: Mapped[list["Event"]] = relationship(  # type: ignore[name-defined]
        "Event", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id!r} email={self.email!r} role={self.role!r}>"
