from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time
import logging

logger = logging.getLogger(__name__)

# Metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

PROXY_REQUEST_COUNT = Counter(
    'proxy_requests_total',
    'Total proxy requests to microservices',
    ['service', 'method', 'status_code']
)

PROXY_REQUEST_DURATION = Histogram(
    'proxy_request_duration_seconds',
    'Proxy request duration in seconds',
    ['service', 'method']
)

AUTH_REQUESTS = Counter(
    'auth_requests_total',
    'Total authentication requests',
    ['method', 'status']
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections',
    'Number of active database connections'
)

class MetricsMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = time.time()
            
            # Increment active connections
            ACTIVE_CONNECTIONS.inc()
            
            # Store original send
            original_send = send
            
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    status_code = message["status"]
                    method = scope["method"]
                    endpoint = scope["path"]
                    
                    # Record metrics
                    REQUEST_COUNT.labels(
                        method=method,
                        endpoint=endpoint,
                        status_code=status_code
                    ).inc()
                    
                    # Record duration
                    duration = time.time() - start_time
                    REQUEST_DURATION.labels(
                        method=method,
                        endpoint=endpoint
                    ).observe(duration)
                
                await original_send(message)
            
            try:
                await self.app(scope, receive, send_wrapper)
            finally:
                # Decrement active connections
                ACTIVE_CONNECTIONS.dec()
        else:
            await self.app(scope, receive, send)

def record_proxy_request(service: str, method: str, status_code: int, duration: float):
    """Record proxy request metrics"""
    PROXY_REQUEST_COUNT.labels(
        service=service,
        method=method,
        status_code=status_code
    ).inc()
    
    PROXY_REQUEST_DURATION.labels(
        service=service,
        method=method
    ).observe(duration)

def record_auth_request(method: str, status: str):
    """Record authentication request metrics"""
    AUTH_REQUESTS.labels(method=method, status=status).inc()

def update_database_connections(count: int):
    """Update database connection count"""
    DATABASE_CONNECTIONS.set(count)

async def metrics_endpoint():
    """Prometheus metrics endpoint"""
    try:
        metrics_data = generate_latest()
        return Response(
            content=metrics_data,
            media_type=CONTENT_TYPE_LATEST
        )
    except Exception as e:
        logger.error(f"Error generating metrics: {e}")
        return Response(
            content="Error generating metrics",
            status_code=500
        )
