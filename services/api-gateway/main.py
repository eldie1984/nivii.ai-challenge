from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routers import auth, proxy
from app.middleware.error_handler import setup_error_handlers
from app.metrics import MetricsMiddleware, get_raw_metrics, CONTENT_TYPE_LATEST
from fastapi import Response

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="database API Gateway",
    description="API Gateway for database microservices",
    version="2.0.0",
    lifespan=lifespan
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # Configure based on your environment
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup error handlers
setup_error_handlers(app)

# Add metrics middleware
#app.add_middleware(MetricsMiddleware)
app.add_middleware(MetricsMiddleware)

@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    try:
        return Response(
            content=get_raw_metrics(), 
            media_type=CONTENT_TYPE_LATEST
        )
    except Exception:
        return Response(
            content="Error generating metrics", 
            status_code=500, 
            media_type="text/plain"
        )
# Health check
@app.get("/health", tags=["Health"])
@limiter.limit("60/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "service": "api-gateway",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    return await metrics_endpoint()

# Include routers
app.include_router(proxy.router, prefix="/api", tags=["Proxy"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
