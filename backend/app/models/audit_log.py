# ─── SENTINEL Audit Log Model ──────────────────────────────────────────────────
# Tracks exactly when and why the system accessed user data sources.
# Provides 100% transparency for privacy assurance.

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.config.database import Base

def _now() -> datetime:
    return datetime.now(timezone.utc)

class AuditLog(Base):
    """
    Stores logs of data access audits.
    """
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id:   Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    action:    Mapped[str] = mapped_column(String(100), nullable=False)
    source:    Mapped[str] = mapped_column(String(100), nullable=False)
    purpose:   Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    def __repr__(self) -> str:
        return f"<AuditLog user_id={self.user_id!r} action={self.action!r} source={self.source!r}>"
