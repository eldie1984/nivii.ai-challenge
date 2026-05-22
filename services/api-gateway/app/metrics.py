from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response, Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

# --- Metrics Declarations (Keep these exactly as you had them) ---
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status_code'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration in seconds', ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')
PROXY_REQUEST_COUNT = Counter('proxy_requests_total', 'Total proxy requests to microservices', ['service', 'method', 'status_code'])
PROXY_REQUEST_DURATION = Histogram('proxy_request_duration_seconds', 'Proxy request duration in seconds', ['service', 'method'])
AUTH_REQUESTS = Counter('auth_requests_total', 'Total authentication requests', ['method', 'status'])
DATABASE_CONNECTIONS = Gauge('database_connections', 'Number of active database connections')


#  FIX 1: Use BaseHTTPMiddleware to safely manage streaming & headers
class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude metrics endpoint from tracking its own stats to avoid infinite loops/bloat
        if request.url.path == "/metrics":
            return await call_next(request)

        start_time = time.time()
        ACTIVE_CONNECTIONS.inc()
        
        try:
            response = await call_next(request)
            
            # Record metrics after the request finishes successfully
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code
            ).inc()
            
            duration = time.time() - start_time
            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
            
            return response
            
        except Exception as e:
            # If the endpoint crashes entirely, track the 500 error before re-raising
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=500
            ).inc()
            raise e
        finally:
            ACTIVE_CONNECTIONS.dec()


#  FIX 2: Return raw data here so the router can deliver it cleanly
def get_raw_metrics():
    """Generates the latest text data from prometheus registry"""
    try:
        return generate_latest()
    except Exception as e:
        logger.error(f"Error generating metrics: {e}")
        raise e

# --- Keep your helper functions as they were ---
def record_proxy_request(service: str, method: str, status_code: int, duration: float):
    PROXY_REQUEST_COUNT.labels(service=service, method=method, status_code=status_code).inc()
    PROXY_REQUEST_DURATION.labels(service=service, method=method).observe(duration)

def record_auth_request(method: str, status: str):
    AUTH_REQUESTS.labels(method=method, status=status).inc()

def update_database_connections(count: int):
    DATABASE_CONNECTIONS.set(count)