"""App configuration — all env-driven settings live here (no hardcoded secrets)."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Loaded from backend/.env (see .env.example). Defaults are localhost-demo safe.
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- security / JWT ---
    SECRET_KEY: str = "dev-globetrotter-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7
    RESET_TOKEN_MINUTES: int = 60  # password-reset link validity
    ADMIN_EMAIL: str = ""  # email granted the admin panel (blank = no admin)

    # --- database ---
    DATABASE_URL: str = "sqlite:///globetrotter.db"

    # --- frontend / CORS ---
    FRONTEND_URL: str = "http://localhost:3000"
    # comma-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- storage ---
    # Object Storage (S3 / MinIO / Cloudflare R2)
    STORAGE_PROVIDER: str = "minio"
    STORAGE_BUCKET: str = "globe-trotter"
    STORAGE_REGION: str = "ap-south-1"
    STORAGE_ENDPOINT_URL: str | None = "http://localhost:9000"
    STORAGE_ACCESS_KEY: str = "minioadmin"
    STORAGE_SECRET_KEY: str = "minioadmin"

    # --- email ---
    EMAIL_PROVIDER: str = "console"  # console | smtp
    EMAIL_FROM_ADDRESS: str = "no-reply@globetrotter.local"
    EMAIL_HOST: str = "localhost"
    EMAIL_PORT: int = 587
    EMAIL_USE_TLS: bool = True
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
