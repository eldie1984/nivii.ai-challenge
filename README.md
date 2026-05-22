# Nivi -  AI-Driven Query Service

A full-stack microservices application with AI-powered SQL query generation using Ollama (SQLCoder model). The system allows natural language queries to be converted into SQL and executed against a PostgreSQL database.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│                     Port 3000 (Nginx)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│             API Gateway (FastAPI) Port 3001                  │
│   • Authentication & Authorization (JWT)                     │
│   • Request Validation & Rate Limiting (slowapi)             │
│   • Service Proxying & Routing                               │
│   • Prometheus Metrics                                       │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
    ┌────────▼───────────┐       ┌──────────▼────────────┐
    │  Model Service     │       │  PostgreSQL Database  │
    │  (FastAPI)         │       │   Port 5432           │
    │  Port 3002         │       │                       │
    │ • SQL Generation   │       │ • Product table       │
    │ • Query Execution  │       │ • Portfolio data      │
    │ • Result Explain   │       │ • User data           │
    └────────┬───────────┘       └──────────────────────┘
             │
    ┌────────▼───────────┐
    │  Ollama Service    │
    │  (SQLCoder: 7b)    │
    │  Port 11434        │
    │ • SQL Generation   │
    │ • Query Explanation│
    └────────────────────┘
```

## Prerequisites

### Required
- **Python 3.14+** (or 3.11+)
- **Node.js 20+**
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL 15** (included via Docker)
- **Redis** (optional, for caching - can be added)

### Optional
- **curl** or **Postman** (for API testing)
- **pgAdmin** (for database visualization)

## Quick Start

### Quick Script (Easiest)

Use the provided `nivi_sql.sh` script for quick environment management:

```bash
# Make script executable (first time only)
chmod +x nivi_sql.sh

# Start all services with Ollama model auto-pull
./nivi_sql.sh start

# Stop all services
./nivi_sql.sh stop

# Restart everything
./nivi_sql.sh restart

# Full rebuild and start (for production)
./nivi_sql.sh dev
```

The script automatically:
- Starts/stops Docker Compose containers
- Pulls the SQLCoder model for Ollama
- Shows live logs when using `dev` option

---

### Option 1: Docker Compose (Recommended)

#### 1. Start all services:
```bash
cd /path/to/nivi
docker-compose up --build
```

This starts:
- PostgreSQL database (port 5432)
- API Gateway (port 3001)
- Model Service (port 3002)
- Ollama with SQLCoder model (port 11434)
- Frontend (port 3000)
- Nginx reverse proxy (port 80)

#### 2. Download the ollama model:
```bash
docker-compose exec ollama ollama pull sqlcoder:7b
```

This starts:
- Pulls the model to be used in the application

#### 3. Verify services are running:
```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f api-gateway
docker-compose logs -f model-service
docker-compose logs -f frontend
```

#### 3. Access the application:
- **Frontend**: http://localhost:3000 or http://localhost (via Nginx)
- **API Gateway**: http://localhost:3001
- **Model Service**: http://localhost:3002
- **Ollama API**: http://localhost:11434
- **API Health Checks**:
  ```bash
  curl http://localhost:3001/health
  curl http://localhost:3002/health
  ```

---

### Option 2: Local Development

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

#### API Gateway Setup:
```bash
cd services/api-gateway

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
# Runs on http://localhost:3001
```

#### Model Service Setup:
```bash
cd services/model

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r pyproject.toml
# Or using Poetry:
poetry install

# Run the service
python main.py
# Runs on http://localhost:3002
```

#### Database Setup:
```bash
# Start PostgreSQL (Docker)
docker run -d \
  -e POSTGRES_DB=niivi_challenge \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Initialize schema
psql -h localhost -U postgres -d niivi_challenge -f database/init.sql
```

#### Ollama Setup:
```bash
# Install Ollama from https://ollama.ai
# Or run via Docker:
docker run -d -p 11434:11434 ollama/ollama

# Pull SQLCoder model (one-time setup):
ollama pull sqlcoder:7b
```

---

## API Endpoints

### Model Service (`/api/model`)

#### 1. Generate SQL Query
```bash
POST /api/query
Content-Type: application/json

{
  "query": "What is the most expensive product?"
}

Response:
{
  "sql": "SELECT product_name, MAX(unitary_price) FROM product;",
  "attempts": 1,
  "corrected": false
}
```

#### 2. Execute Query
```bash
POST /api/execute
Content-Type: application/json

{
  "query": "SELECT * FROM product LIMIT 5;"
}

Response:
{
  "response": [
    {
      "date": "2025-01-15T10:30:00",
      "product_name": "Widget",
      "quantity": 10,
      "unitary_price": 29.99,
      ...
    }
  ]
}
```

#### 3. Explain Results
```bash
POST /api/explain
Content-Type: application/json

{
  "prompt": "What is the most expensive product?",
  "query": "SELECT product_name, MAX(unitary_price) as max_price FROM product GROUP BY product_name ORDER BY max_price DESC LIMIT 1;",
  "result": "[{\"product_name\": \"Premium Widget\", \"max_price\": 199.99}]"
}

Response:
{
  "explanation": "The most expensive product in our database is 'Premium Widget' with a price of $199.99"
}
```

#### 4. Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "service": "model-service",
  "timestamp": "2025-01-15T10:30:00.123456",
  "version": "2.0.0"
}
```

---

## Project Structure

```
nivi/
├── frontend/                    # Next.js 16 React application
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & API client
│   ├── public/                 # Static assets
│   ├── nginx.conf              # Nginx reverse proxy config
│   └── Dockerfile              # Multi-stage Docker build
│
├── services/
│   ├── api-gateway/            # Main API entry point
│   │   ├── app/
│   │   │   ├── config.py       # Settings & environment
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── middleware/     # Error handling
│   │   │   └── utils/          # Helper functions
│   │   ├── main.py             # FastAPI application
│   │   ├── requirements.txt    # Python dependencies
│   │   ├── tests/              # Pytest suite
│   │   └── Dockerfile
│   │
│   └── model/                  # AI Model inference service
│       ├── app/
│       │   ├── config.py       # Service configuration
│       │   ├── database/       # Database connection & schema
│       │   ├── metrics.py      # Prometheus metrics
│       │   ├── middleware/     # Error handlers
│       │   └── routers/        # Model inference endpoints
│       ├── main.py             # FastAPI application
│       ├── pyproject.toml      # Poetry dependencies
│       ├── tests/              # Pytest suite
│       └── Dockerfile
│
├── database/
│   ├── init.sql                # Schema initialization
│   └── data.csv                # Sample data
│
├── docker-compose.yml          # Multi-container orchestration
├── README.md                   # This file
└── .env                        # Environment variables
```

---

## Environment Variables

### API Gateway (`.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/niivi_challenge
PORT=3001
DEBUG=False
RATE_LIMIT_PER_MINUTE=60
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Model Service
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/niivi_challenge
PORT=3002
DEBUG=False
OLLAMA_HOST=http://localhost:11434
SCHEMA_FILE_PATH=/app/schema/schema.sql
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=production
```

---

## Testing

### Run Tests Locally

#### API Gateway Tests:
```bash
cd services/api-gateway

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_auth.py -v
```

#### Model Service Tests:
```bash
cd services/model

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=term-missing
```

### Run Tests in Docker:
```bash
# API Gateway
docker-compose exec api-gateway pytest

# Model Service
docker-compose exec model-service pytest
```

---

## Troubleshooting

### Port Conflicts:
```bash
# Check which process uses a port
lsof -i :3000    # Frontend
lsof -i :3001    # API Gateway
lsof -i :3002    # Model Service
lsof -i :5432    # PostgreSQL
lsof -i :11434   # Ollama

# Kill process (use with caution)
kill -9 <PID>
```

### Database Issues:
```bash
# Check PostgreSQL container
docker-compose ps postgres
docker-compose logs postgres

# Reset database
docker-compose down -v  # Remove volumes
docker-compose up --build
```

### Ollama Model Not Found:
```bash
# Check if model is loaded
curl http://localhost:11434/api/tags

# Pull model explicitly
docker-compose exec ollama ollama pull sqlcoder:7b
```

### Service Won't Connect to Database:
```bash
# Check database connectivity
docker-compose exec model-service python -c "
import asyncpg
import asyncio
asyncio.run(asyncpg.create_pool('postgresql://postgres:password@postgres:5432/niivi_challenge'))
"
```

### Memory/Resource Issues:
```bash
# Monitor Docker resource usage
docker stats

# Increase Docker resources in settings if needed
# Docker Desktop → Preferences → Resources
```

---

# Scalability Architecture

As the application grows with more data and higher traffic, the current monolithic architecture will need strategic scaling. Here's how to scale each component:

## 1. Database Scalability (Large Tables & Complex Queries)

### Current State:
- Single PostgreSQL instance
- All data in one database
- Single connection pool

### Scaling Strategy:

#### A. **Partitioning & Sharding** (5M+ rows)
```sql
-- Time-based partitioning for product table
CREATE TABLE product_2025_q1 PARTITION OF product
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE product_2025_q2 PARTITION OF product
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
```

**Benefits:**
- Faster queries on large datasets
- Easier maintenance & backups
- Better cache utilization

#### B. **Horizontal Sharding** (Distributed across multiple databases)
```python
# services/model/app/database/sharding.py
class ShardRouter:
    def __init__(self, shard_count: int = 4):
        self.shard_count = shard_count
        self.pools = {}  # One pool per shard
    
    def get_shard_id(self, product_id: str) -> int:
        return hash(product_id) % self.shard_count
    
    async def query(self, product_id: str, sql: str):
        shard_id = self.get_shard_id(product_id)
        pool = self.pools[shard_id]
        return await pool.fetch(sql)
```

**Deployment:**
```yaml
# docker-compose-scaled.yml
services:
  postgres-shard-1:
    image: postgres:15
    environment:
      POSTGRES_DB: niivi_shard_1
    
  postgres-shard-2:
    image: postgres:15
    environment:
      POSTGRES_DB: niivi_shard_2
  
  # ... postgres-shard-3, postgres-shard-4
  
  # Sharding proxy (optional: use PgBouncer or Citus)
  pgbouncer:
    image: pgbouncer
    volumes:
      - ./pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini
    ports:
      - "6432:6432"
```

#### C. **Read Replicas & Caching**
```python
# services/api-gateway/app/database.py
class DatabasePool:
    def __init__(self):
        self.write_pool = None  # Primary (writes)
        self.read_pools = []    # Replicas (reads)
    
    async def query(self, sql: str, is_write: bool = False):
        if is_write:
            return await self.write_pool.fetch(sql)
        else:
            # Load-balance across replicas
            pool = random.choice(self.read_pools)
            return await pool.fetch(sql)
```

**Docker Compose Setup:**
```yaml
services:
  postgres-primary:
    image: postgres:15
    environment:
      POSTGRES_REPLICATION_MODE: master
    
  postgres-replica-1:
    image: postgres:15
    depends_on:
      - postgres-primary
    environment:
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_PRIMARY_HOST: postgres-primary
```

#### D. **Caching Layer (Redis)**
```python
# services/model/app/cache.py
import redis.asyncio as redis
import json

class QueryCache:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get_or_execute(self, query_hash: str, sql: str, db_pool):
        # Check cache first
        cached = await self.redis.get(f"query:{query_hash}")
        if cached:
            return json.loads(cached)
        
        # Execute query
        result = await db_pool.fetch(sql)
        
        # Cache for 5 minutes
        await self.redis.setex(
            f"query:{query_hash}",
            300,  # TTL in seconds
            json.dumps(result, default=str)
        )
        return result
```

**Docker addition:**
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
```

#### E. **Query Optimization**
```python
# Add indexes for frequent queries
CREATE INDEX idx_product_name ON product(product_name);
CREATE INDEX idx_product_date ON product(date);
CREATE INDEX idx_product_price ON product(unitary_price);

# Composite index for common queries
CREATE INDEX idx_product_date_price ON product(date, unitary_price);

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM product WHERE product_name = 'Widget';
```

---

## 2. Frontend Scalability (High Traffic)

### Current State:
- Single Next.js instance behind Nginx
- No load balancing or caching
- Static assets served from single node

### Scaling Strategy:

#### A. **Horizontal Scaling with Load Balancer**
```nginx
# frontend/nginx.conf - with load balancing
upstream frontend_servers {
    least_conn;  # Load balancing strategy
    server frontend-1:3000;
    server frontend-2:3000;
    server frontend-3:3000;
}

upstream api_servers {
    least_conn;
    server api-gateway-1:3001;
    server api-gateway-2:3001;
    server api-gateway-3:3001;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
    
    location /api {
        proxy_pass http://api_servers;
        proxy_buffering on;
        proxy_cache_valid 200 1h;
    }
}
```

**Docker Compose:**
```yaml
services:
  frontend-1:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://api-gateway:3001
  
  frontend-2:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://api-gateway:3001
  
  frontend-3:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://api-gateway:3001
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/nginx-scaled.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl  # For HTTPS
    depends_on:
      - frontend-1
      - frontend-2
      - frontend-3
```

#### B. **CDN for Static Assets**
```typescript
// frontend/next.config.js
module.exports = {
  images: {
    unoptimized: false,
    // Use CloudFront or similar CDN
    domains: ['cdn.example.com'],
  },
  // Enable ISR (Incremental Static Regeneration)
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};
```

#### C. **Caching Strategy**
```typescript
// frontend/lib/api.ts
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchWithCache(url: string) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, { data, time: Date.now() });
  return data;
}
```

#### D. **Server-Side Rendering Optimization**
```typescript
// frontend/app/layout.tsx
export const revalidate = 3600; // ISR - regenerate every hour

export default async function RootLayout({ children }) {
  // Pre-fetch data at build time
  const queries = await fetchQueries();
  
  return (
    <html>
      <body>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
```

#### E. **Client-Side Performance**
```typescript
// Code splitting & lazy loading
const ExpensiveComponent = dynamic(() => import('./ExpensiveComponent'), {
  loading: () => <Loading />,
  ssr: false,
});

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

// Pagination
const PAGE_SIZE = 50;
const [page, setPage] = useState(1);
```

---

## 3. API Gateway Scalability (High Traffic)

### Current State:
- Single FastAPI instance
- No horizontal scaling
- Single rate limiter

### Scaling Strategy:

#### A. **Horizontal Scaling**
```yaml
# docker-compose-scaled.yml
services:
  api-gateway-1:
    build: ./services/api-gateway
    environment:
      - PORT=3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  api-gateway-2:
    build: ./services/api-gateway
    environment:
      - PORT=3001
  
  api-gateway-3:
    build: ./services/api-gateway
    environment:
      - PORT=3001
  
  # Use HAProxy or similar for load balancing
  haproxy:
    image: haproxy:2.8-alpine
    ports:
      - "3001:3001"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
    depends_on:
      - api-gateway-1
      - api-gateway-2
      - api-gateway-3
```

#### B. **Global Rate Limiting (Redis)**
```python
# services/api-gateway/app/rate_limiting.py
from slowapi import Limiter
from slowapi.util import get_remote_address
import redis.asyncio as redis

class RedisRateLimiter:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def is_rate_limited(self, key: str, limit: int, window: int) -> bool:
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, window)
        return current > limit

# Apply globally
limiter = RedisRateLimiter("redis://localhost:6379")
```

#### C. **Distributed Caching**
```python
# services/api-gateway/app/cache.py
class DistributedCache:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str):
        value = await self.redis.get(key)
        return value.decode() if value else None
    
    async def set(self, key: str, value: str, ttl: int = 3600):
        await self.redis.setex(key, ttl, value)
```

#### D. **Circuit Breaker Pattern**
```python
# services/api-gateway/app/circuit_breaker.py
from pybreaker import CircuitBreaker

class ServiceCircuitBreaker:
    def __init__(self):
        self.db_breaker = CircuitBreaker(
            fail_max=5,
            reset_timeout=60,
            listeners=self._breaker_listeners
        )
    
    @self.db_breaker
    async def call_model_service(self, query: str):
        # If service fails 5 times, circuit opens for 60s
        return await self.model_service_client.query(query)
    
    def _breaker_listeners(self):
        def on_state_change(breaker, before, after):
            logger.warning(f"Circuit breaker state: {before} -> {after}")
        return [on_state_change]
```

---

## 4. Model Service Scalability (AI Inference)

### Current State:
- Single Ollama instance
- Sequential query processing
- No job queuing

### Scaling Strategy:

#### A. **Async Job Queue (Celery + Redis)**
```python
# services/model/app/tasks.py
from celery import Celery
from app.config import settings

celery_app = Celery(
    'model_service',
    broker=f'{settings.REDIS_URL}/0',
    backend=f'{settings.REDIS_URL}/1'
)

@celery_app.task(bind=True, max_retries=3)
def generate_sql_query(self, user_query: str):
    try:
        prompt = build_prompt(user_query)
        result = ask_ollama(prompt)
        return {"sql": result, "status": "success"}
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

@celery_app.task
def explain_results(prompt: str, query: str, result: str):
    explanation = ask_ollama(build_explain_prompt(prompt, query, result))
    return {"explanation": explanation}
```

**Route with Celery:**
```python
# services/model/app/routers/model.py
from app.tasks import generate_sql_query

@router.post("/query/async")
async def query_async(query: query):
    task = generate_sql_query.delay(query.query)
    return {
        "task_id": task.id,
        "status": "queued"
    }

@router.get("/query/status/{task_id}")
async def get_task_status(task_id: str):
    from celery.result import AsyncResult
    task = AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": task.status,
        "result": task.result if task.ready() else None
    }
```

#### B. **Model Inference Scaling**
```yaml
# Multiple Ollama instances with load balancing
services:
  ollama-1:
    image: ollama/ollama
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    volumes:
      - ollama-data-1:/root/.ollama
  
  ollama-2:
    image: ollama/ollama
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    volumes:
      - ollama-data-2:/root/.ollama
  
  ollama-3:
    image: ollama/ollama
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    volumes:
      - ollama-data-3:/root/.ollama
  
  ollama-lb:
    image: haproxy:2.8-alpine
    ports:
      - "11434:11434"
    volumes:
      - ./ollama-haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
```

#### C. **Query Result Caching**
```python
# Cache generated SQL to avoid re-generating
class SQLGenerationCache:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def get_or_generate(self, user_query: str):
        # Hash the user query
        query_hash = hashlib.md5(user_query.encode()).hexdigest()
        cache_key = f"sql:{query_hash}"
        
        # Check cache
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Generate new query
        result = await generate_sql_query(user_query)
        
        # Cache for 24 hours (frequently used queries)
        await self.redis.setex(cache_key, 86400, json.dumps(result))
        return result
```

---

## 5. Full Scaled Architecture (Production)

```
                         ┌──────────────────────────────────────┐
                         │     Cloudflare / CDN                  │
                         │   (Global Content Delivery)           │
                         └────────────────┬─────────────────────┘
                                          │
                      ┌───────────────────┴────────────────────┐
                      │                                        │
        ┌─────────────▼──────────────┐         ┌──────────────▼─────────┐
        │  AWS ALB / HAProxy         │         │  WAF / DDoS Protection  │
        │  (Load Balancer)           │         │  (AWS Shield)           │
        └─────────────┬──────────────┘         └────────────────────────┘
                      │
        ┌─────────────┴──────────────┬────────────────┬────────────────┐
        │                            │                │                │
    ┌───▼────┐              ┌────────▼────┐      ┌───▼────┐      ┌────▼────┐
    │Frontend│              │ API Gateway │      │ Model  │      │  Celery  │
    │Pod 1-N │◄─────────┐   │  Pod 1-3    │      │Service │      │ Workers  │
    └────────┘          │   └─────────────┘      │Pod 1-2 │      │(Job Q)   │
                        │                        └────────┘      └──────────┘
                        │                             │
                        └──────────────┬──────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
      ┌───▼────────┐          ┌────────▼────────┐        ┌─────────▼──────┐
      │   Redis    │          │  PostgreSQL     │        │   Ollama       │
      │  (Cache)   │          │  Primary+       │        │  Instances     │
      │            │          │  Read Replicas  │        │  (Sharded)     │
      └────────────┘          │  (Partitioned)  │        └────────────────┘
                              └─────────────────┘
                                       │
                         ┌─────────────┴──────────────┐
                         │                            │
                    ┌────▼─────┐            ┌─────────▼──┐
                    │  Shard 1  │            │  Shard 4   │
                    │  (S3 Bkp) │            │  (S3 Bkp)  │
                    └───────────┘            └────────────┘

Monitoring & Observability:
├── Prometheus (Metrics collection)
├── Grafana (Visualization)
├── ELK Stack (Logging)
└── Jaeger (Distributed tracing)
```

---

## 6. Deployment & Orchestration

### Kubernetes Deployment (Recommended for Production)

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: nivi-frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker images
      run: |
        docker-compose build
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker-compose push
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/frontend frontend=nivi-frontend:${{ github.sha }} --record
        kubectl rollout status deployment/frontend

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: password
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-python@v2
      with:
        python-version: '3.14'
    
    - name: Run tests
      run: |
        pip install -r services/model/requirements.txt
        pytest services/model --cov=app
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

---

## Performance Metrics & Monitoring

### Key Metrics to Track:

```python
# services/api-gateway/app/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Response time tracking
REQUEST_LATENCY = Histogram(
    'request_latency_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.1, 0.5, 1, 2, 5, 10]
)

# Throughput
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Database connections
DB_POOL_SIZE = Gauge(
    'db_pool_size',
    'Current database pool size'
)

# Cache hit rate
CACHE_HITS = Counter('cache_hits_total', 'Total cache hits')
CACHE_MISSES = Counter('cache_misses_total', 'Total cache misses')
```

### SLO Targets:

| Metric | Target | Notes |
|--------|--------|-------|
| Availability | 99.95% | Max 22 minutes downtime/month |
| P50 Latency | < 100ms | Median response time |
| P99 Latency | < 500ms | 99th percentile response time |
| Error Rate | < 0.1% | API errors / total requests |
| Cache Hit Rate | > 70% | Reduce DB load |

---

## Cost Optimization

### Infrastructure Optimization:
- Use Reserved Instances (30-40% savings)
- Implement auto-scaling (pay for what you use)
- Use spot instances for background jobs (70% savings)
- Cache aggressively (reduce DB costs)

### Database Optimization:
- Connection pooling (PgBouncer)
- Query optimization & indexing
- Archiving old data to cold storage (S3)
- Compression on large tables

### Frontend Optimization:
- Code splitting & lazy loading
- Image optimization (WebP, AVIF)
- Minification & compression
- CDN caching

---

## Security Considerations

1. **API Authentication**: JWT tokens with rotation
2. **Rate Limiting**: Global & per-user limits
3. **Database Encryption**: TLS in transit, encryption at rest
4. **Secrets Management**: HashiCorp Vault or AWS Secrets Manager
5. **CORS Configuration**: Restrict to allowed domains
6. **DDoS Protection**: CloudFlare or AWS Shield
7. **SQL Injection Prevention**: Parameterized queries (already in place)

---

## Summary

| Component | Current | Small Scale | Medium Scale | Enterprise |
|-----------|---------|------------|--------------|------------|
| Frontend | 1 Node | 2-3 Nodes | 5-10 Nodes | 20+ Nodes + CDN |
| API | 1 Node | 2-3 Nodes | 5-10 Nodes | 10-20 + LB |
| Model | 1 Ollama | 1-2 Ollama | 3-4 Ollama | 10+ Sharded |
| Database | 1 DB | 1 Primary + 1 Replica | Partitioned + Replicas | Multi-shard + Replicas |
| Cache | None | Redis | Redis Cluster | Redis Sentinel |
| Job Queue | Sync | Celery (single) | Celery + Queue | Celery + Distributed |
| Load Balancer | None | Nginx | HAProxy/ALB | AWS ALB + Route 53 |
| Containers | Docker Compose | Docker Swarm | Kubernetes | EKS/GKE |

---

## Contributing

1. Follow PEP 8 (Python) and ESLint (JavaScript)
2. Write tests for new features
3. Ensure 80%+ test coverage
4. Follow conventional commits
5. Create PRs with descriptive titles

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API logs for debugging
