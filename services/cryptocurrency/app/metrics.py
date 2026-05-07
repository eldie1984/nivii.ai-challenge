from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time
import logging

logger = logging.getLogger(__name__)

# Metrics
REQUEST_COUNT = Counter(
    'crypto_http_requests_total',
    'Total HTTP requests for crypto service',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'crypto_http_request_duration_seconds',
    'HTTP request duration in seconds for crypto service',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'crypto_active_connections',
    'Number of active connections for crypto service'
)

PRICE_REQUESTS = Counter(
    'price_requests_total',
    'Total price requests',
    ['source', 'status']
)

PRICE_CACHE_HITS = Counter(
    'price_cache_hits_total',
    'Total price cache hits'
)

PRICE_CACHE_MISSES = Counter(
    'price_cache_misses_total',
    'Total price cache misses'
)

EXTERNAL_API_REQUESTS = Counter(
    'external_api_requests_total',
    'Total external API requests',
    ['api_name', 'status_code']
)

EXTERNAL_API_DURATION = Histogram(
    'external_api_request_duration_seconds',
    'External API request duration in seconds',
    ['api_name']
)

PORTFOLIO_OPERATIONS = Counter(
    'portfolio_operations_total',
    'Total portfolio operations',
    ['operation', 'status']
)

CRYPTO_PRICE_GAUGE = Gauge(
    'cryptocurrency_price_usd',
    'Current cryptocurrency price in USD',
    ['symbol']
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

def record_price_request(source: str, status: str):
    """Record price request metrics"""
    PRICE_REQUESTS.labels(source=source, status=status).inc()

def record_cache_hit():
    """Record cache hit"""
    PRICE_CACHE_HITS.inc()

def record_cache_miss():
    """Record cache miss"""
    PRICE_CACHE_MISSES.inc()

def record_external_api_request(api_name: str, status_code: int, duration: float):
    """Record external API request metrics"""
    EXTERNAL_API_REQUESTS.labels(
        api_name=api_name,
        status_code=status_code
    ).inc()
    
    EXTERNAL_API_DURATION.labels(api_name=api_name).observe(duration)

def record_portfolio_operation(operation: str, status: str):
    """Record portfolio operation metrics"""
    PORTFOLIO_OPERATIONS.labels(operation=operation, status=status).inc()

def update_crypto_price(symbol: str, price: float):
    """Update cryptocurrency price gauge"""
    CRYPTO_PRICE_GAUGE.labels(symbol=symbol).set(price)

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
