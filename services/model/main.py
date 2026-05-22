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
import logging
from app.config import settings
from app.database import init_db
from app.routers import model
from app.middleware.error_handler import setup_error_handlers
from app.metrics import MetricsMiddleware, metrics_endpoint

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    # Carga del esquema de la base de datos en memoria (Migrado aquí)
    schema_path = os.getenv("SCHEMA_FILE_PATH", "/app/schema/schema.sql")
    try:
        if os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as file:
                # Guardamos el esquema en el objeto global settings
                settings.DB_SCHEMA = file.read()
            logger.info(f"✅ Esquema de la base de datos precargado exitosamente ({len(settings.DB_SCHEMA)} bytes).")
        else:
            logger.error(f"❌ No se encontró el archivo de esquema en: {schema_path}")
            settings.DB_SCHEMA = ""
    except Exception as e:
        logger.error(f"❌ Error crítico leyendo el esquema en el arranque: {e}")
        settings.DB_SCHEMA = ""

    yield
    # ---- SHUTDOWN ----
    pass

app = FastAPI(
    title="Portfolio Management Service",
    description="FastAPI service for portfolio management",
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
    allow_origins=["*"],  # Configure based on your environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup error handlers
setup_error_handlers(app)


# Health check
@app.get("/health", tags=["Health"])
@limiter.limit("60/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "service": "portfolio-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }


# Include routers
app.include_router(model.router, prefix="/api", tags=["model"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
