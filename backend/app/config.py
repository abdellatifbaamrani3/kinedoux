from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

_PLACEHOLDER_MARKERS = ("YOUR_DEPLOYMENT_ID", "XXXX")


def normalize_database_url(raw: str) -> str:
    """Turn any EasyPanel / Heroku style Postgres URL into a SQLAlchemy 2.0 psycopg2 URL.

    * ``postgres://...``            -> ``postgresql+psycopg2://...``
    * ``postgresql://...``          -> ``postgresql+psycopg2://...``
    * ``postgresql+asyncpg://...``  -> ``postgresql+psycopg2://...`` (sync engine is used)
    * ``?sslmode=disable`` is kept as-is: libpq / psycopg2 understand it natively.
    """
    url = raw.strip().strip('"').strip("'")
    for prefix in ("postgres://", "postgresql://", "postgresql+asyncpg://", "postgresql+psycopg://"):
        if url.startswith(prefix):
            return "postgresql+psycopg2://" + url[len(prefix):]
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # 1. Server & environment
    APP_ENV: str = "production"
    PORT: int = 8000
    SITE_URL: str = "https://kinedoux.com"
    FRONTEND_URL: str = "https://kinedoux.com"
    CORS_ORIGINS: str = ""

    # 2. Database (EasyPanel internal URL; `postgres://` prefix and `sslmode=disable` are supported)
    DATABASE_URL: str = "postgres://kinedoux:kinedoux@kinedoux_database:5432/kinedoux?sslmode=disable"

    # 3. Google Sheets webhook + upsell safety net
    GOOGLE_SHEETS_WEBHOOK_URL: str = ""
    GOOGLE_SHEETS_WEBHOOK_SECRET: str = ""
    UPSELL_AUTO_FINALIZE_SECONDS: int = 20
    FORWARD_CONTACT_TO_SHEET: bool = False

    # 4. Phone validation: KSA | MA | BOTH (mirrors NEXT_PUBLIC_PHONE_VALIDATION_MODE)
    PHONE_VALIDATION_MODE: str = "MA"

    # 5. Meta Conversions API
    META_PIXEL_ID: str = ""
    META_CAPI_ACCESS_TOKEN: str = ""
    META_TEST_EVENT_CODE: str = ""

    # 6. TikTok Events API v1.3
    TIKTOK_PIXEL_ID: str = ""
    TIKTOK_ACCESS_TOKEN: str = ""
    TIKTOK_TEST_EVENT_CODE: str = ""

    # 7. Snapchat Conversions API v3
    SNAP_PIXEL_ID: str = ""
    SNAP_CAPI_ACCESS_TOKEN: str = ""

    @property
    def sqlalchemy_database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        defaults = [
            "https://kinedoux.com",
            "https://www.kinedoux.com",
            "https://api.kinedoux.com",
            "http://localhost:3000",
        ]
        extra = [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]
        origins = [self.FRONTEND_URL.rstrip("/"), *defaults, *extra]
        # preserve order, drop duplicates / empties
        return list(dict.fromkeys(o for o in origins if o))

    @property
    def sheets_enabled(self) -> bool:
        url = self.GOOGLE_SHEETS_WEBHOOK_URL.strip()
        return bool(url) and not any(marker in url for marker in _PLACEHOLDER_MARKERS)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
