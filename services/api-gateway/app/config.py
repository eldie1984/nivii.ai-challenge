from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Server
    PORT: int = 3000
    DEBUG: bool = False
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/portfolio_gateway"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Microservice URLs
    CRYPTOCURRENCY_SERVICE_URL: str = "http://cryptocurrency-service:3005"
    PORTFOLIO_SERVICE_URL: str = "http://portfolio-service:3002"
    AGENT_ORCHESTRATOR_URL: str = "http://agent-orchestrator:3003"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"

settings = Settings()
