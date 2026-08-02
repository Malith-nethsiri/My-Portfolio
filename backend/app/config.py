from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@localhost:5432/myportfolio'
    JWT_SECRET_KEY: str = 'change-me-in-production'
    JWT_ALGORITHM: str = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    GOOGLE_CLIENT_ID: str = ''
    GOOGLE_CLIENT_SECRET: str = ''
    GOOGLE_REDIRECT_URI: str = 'http://localhost:8000/api/auth/google/callback'
    FRONTEND_URL: str = 'http://localhost:5173'
    APP_NAME: str = 'MyPortfolio'

settings = Settings()
