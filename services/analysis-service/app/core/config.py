"""
Configuration settings for NetworkOracle Analysis Service
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "NetworkOracle Pro - Analysis Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app",
        "https://*.vercel.app"
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/networkoracle"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
