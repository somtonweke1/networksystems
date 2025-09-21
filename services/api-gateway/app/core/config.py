"""
Configuration settings for NetworkOracle API Gateway
"""

from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "NetworkOracle Pro - API Gateway"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app",
        "https://*.vercel.app"
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Microservices URLs
    CENTRALITY_SERVICE_URL: str = "http://localhost:8001"
    ANALYSIS_SERVICE_URL: str = "http://localhost:8002"
    VISUALIZATION_SERVICE_URL: str = "http://localhost:8003"
    AUTH_SERVICE_URL: str = "http://localhost:8004"
    STORAGE_SERVICE_URL: str = "http://localhost:8005"
    AI_SERVICE_URL: str = "http://localhost:8006"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_BURST: int = 200
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
