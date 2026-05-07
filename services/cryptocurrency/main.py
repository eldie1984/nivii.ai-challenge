from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import prices, portfolio
from app.middleware.error_handler import setup_error_handlers
from app.metrics import MetricsMiddleware, metrics_endpoint

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Cryptocurrency service starting up...")
    yield
    # Shutdown
    print("Cryptocurrency service shutting down...")

app = FastAPI(
    title="Cryptocurrency Service",
    description="Microservice for cryptocurrency data and portfolio management",
    version="2.0.0",
    lifespan=lifespan
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup error handlers
setup_error_handlers(app)

# Add metrics middleware
app.add_middleware(MetricsMiddleware)

# Health check
@app.get("/health", tags=["Health"])
@limiter.limit("60/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "service": "cryptocurrency",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    return await metrics_endpoint()

# Include routers
app.include_router(prices.router, prefix="/api", tags=["Prices"])
app.include_router(portfolio.router, prefix="/api", tags=["Portfolio"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
