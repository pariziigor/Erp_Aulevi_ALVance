# backend/src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ERP Comercial"
    VERSION: str = "1.0.0"
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()