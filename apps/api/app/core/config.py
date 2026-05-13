from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Pulseboard API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg://pulseboard:pulseboard@localhost:5432/pulseboard"
    )
    jwt_secret_key: str = "development-secret-key"
    jwt_access_token_ttl_minutes: int = 15
    jwt_refresh_token_ttl_days: int = 14
    email_token_ttl_hours: int = 24
    password_reset_token_ttl_minutes: int = 30
    app_base_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PULSEBOARD_")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
