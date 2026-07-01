# ─── SENTINEL Backend Configuration ──────────────────────────────────────────
# Pydantic Settings automatically reads from environment variables and .env file.
# Every setting has a sensible default for development.
# In production, override via environment variables — never edit this file.

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All values can be overridden via .env file or system environment.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str         = "SENTINEL"
    APP_VERSION: str      = "1.0.0"
    ENVIRONMENT: str      = "development"
    DEBUG: bool           = True

    # ── Security ─────────────────────────────────────────────────────────────
    # IMPORTANT: Change SECRET_KEY before any production deployment!
    SECRET_KEY: str       = "sentinel-dev-secret-change-in-production-min-32-chars"
    ALGORITHM: str        = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480   # 8 hours

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str     = "sqlite:///./database/sentinel.db"

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    CORS_ORIGINS: str     = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # ── ML Models ─────────────────────────────────────────────────────────────
    FRAUD_MODEL_PATH: str      = "../ml/saved_models/fraud_model.pkl"
    INTRUSION_MODEL_PATH: str  = "../ml/saved_models/intrusion_model.pkl"

    # ── Risk Score Engine ─────────────────────────────────────────────────────
    USE_ML_MODEL: bool    = False   # Phase 6: set to True when models are ready


@lru_cache
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Use this as a FastAPI dependency: Depends(get_settings)
    The @lru_cache ensures settings are only loaded once per process.
    """
    return Settings()


# Module-level settings instance for direct imports
settings = get_settings()
