from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    # Now these will throw a clear setup error if your .env file goes missing
    DATABASE_URL: str = "postgresql+asyncpg://portfolio:password@localhost:5432/portfolio"
    JWT_SECRET_KEY: str = 'change-me-in-production'
    JWT_ALGORITHM: str = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = 'http://localhost:5173'
    APP_NAME: str = 'MyPortfolio'

settings = Settings()
