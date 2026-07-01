# ─── SENTINEL Report Model ────────────────────────────────────────────────────
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.config.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Report(Base):
    """Metadata for generated security reports (PDF/CSV)."""
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title:           Mapped[str]       = mapped_column(String(255), nullable=False)
    type:            Mapped[str]       = mapped_column(String(20),  nullable=False)
    # Values: "daily" | "weekly" | "monthly" | "custom"
    date_from:       Mapped[str]       = mapped_column(String(20),  nullable=False)
    date_to:         Mapped[str]       = mapped_column(String(20),  nullable=False)
    generated_at:    Mapped[datetime]  = mapped_column(DateTime(timezone=True), default=_now)
    generated_by:    Mapped[str]       = mapped_column(String(36),  ForeignKey("users.id"))
    format:          Mapped[str]       = mapped_column(String(10),  default="csv")
    total_alerts:    Mapped[int]       = mapped_column(Integer, default=0)
    critical_alerts: Mapped[int]       = mapped_column(Integer, default=0)
    summary:         Mapped[str | None] = mapped_column(Text)

    def __repr__(self) -> str:
        return f"<Report id={self.id!r} type={self.type!r}>"
