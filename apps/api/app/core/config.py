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

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PULSEBOARD_")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
