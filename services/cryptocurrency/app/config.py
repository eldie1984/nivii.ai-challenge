from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Server
    PORT: int = 3005
    DEBUG: bool = False
    
    # External APIs
    COINGECKO_API_URL: str = "https://api.coingecko.com/api/v3"
    COINMARKETCAP_API_URL: str = "https://pro-api.coinmarketcap.com/v1"
    COINMARKETCAP_API_KEY: str = ""
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Cache
    CACHE_TTL_SECONDS: int = 60  # Cache price data for 1 minute
    
    class Config:
        env_file = ".env"

settings = Settings()
