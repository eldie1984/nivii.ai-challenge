# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Project Architecture

**Nivi** is a full-stack microservices application for portfolio management and AI-driven trading signals.

### Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI
**Backend:** FastAPI (Python 3.11+)
**Database:** PostgreSQL
**Cache/Messaging:** Redis
**Reverse Proxy:** Nginx
**Orchestration:** Docker Compose

### Microservices

Three core services:

```
services/
├── api-gateway/        # Main API entry point, auth, routing, proxying
├── model/             # ML inference service for SQL generation
```

**Frontend** (port 3000 via Nginx on port 80):
- Next.js 16 SSR application
- Portfolio management UI
- Tailwind CSS + Radix UI components

**API Gateway** (port 3001):
- Authentication & authorization (JWT)
- Request validation & rate limiting (slowapi)
- Service proxying & routing to model service
- Prometheus metrics
- **Recent fix:** HTTP/1.1 with buffering disabled (resolves Content-Length proxy issues)

**Model Service** (port 3002):
- SQL query generation from natural language (via Ollama)
- Query execution against PostgreSQL
- Result explanation/summarization
- Uses shared schema from schema-generator utility

**Ollama** (port 11434, mapped to 11435 externally):
- LLM inference for SQL generation (SQLCoder model)
- Runs separately to enable model inference scaling

**Schema Generator** (utility):
- One-time utility that extracts PostgreSQL schema
- Writes `schema.sql` to shared volume for model service
- Ensures model service has current DB schema

### Data Flow

```
Frontend (3000)
    ↓ (via Nginx)
API Gateway (3001)
    ├→ Auth & validation
    ├→ PostgreSQL (direct for some queries)
    └→ Model Service (3002)
        ├→ Ollama (3002 sends requests to 11434)
        └→ PostgreSQL (query execution)
```

---

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis (or use Docker)

### Quick Start

**1. Start infrastructure:**
```bash
docker-compose up -d postgres redis
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**3. API Gateway:**
```bash
cd services/api-gateway
pip install -r requirements.txt
python main.py
# Runs on http://localhost:3001
```

**4. Full stack with Docker:**
```bash
docker-compose up
```

---

## Common Commands

### Frontend

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

### Backend (API Gateway)

```bash
cd services/api-gateway

# Setup
pip install -r requirements.txt
pip install -r requirements-test.txt

# Run
python main.py
# Runs on http://localhost:3001

# Testing
pytest                          # Run all tests
pytest --cov=app               # With coverage
pytest tests/test_auth.py       # Single file
pytest -k test_login            # Match pattern
pytest -v                       # Verbose
```

### Model Service

```bash
cd services/model

# Setup
pip install -r requirements.txt
pip install -r requirements-test.txt

# Run (requires Ollama and PostgreSQL)
python main.py
# Runs on http://localhost:3002

# Testing
pytest                          # Run all tests
pytest --cov=app               # With coverage
pytest tests/test_model.py      # Single file
pytest -v                       # Verbose
```

### Ollama

```bash
# Via Docker (recommended)
docker-compose up ollama

# Verify model is loaded
curl http://localhost:11434/api/tags

# Pull SQLCoder model (if not already downloaded)
docker-compose exec ollama ollama pull sqlcoder:7b
```

### Docker

```bash
docker-compose up                    # Start all
docker-compose down                  # Stop all
docker-compose restart api-gateway   # Restart service
docker-compose logs -f api-gateway   # View logs
```

---

## Testing

**Framework:** pytest with coverage requirement of 80%+
**Location:** Each service has `tests/` directory
**CI/CD:** `.github/workflows/test-api.yml` runs on push to main/develop

### Test Files

**API Gateway** (`services/api-gateway/tests/`):
- `test_auth.py` - Authentication & authorization
- `test_main.py` - Endpoint tests
- `test_proxy.py` - Request proxying
- `test_integration.py` - Integration tests
- `conftest.py` - Shared fixtures

### Running Tests

```bash
cd services/api-gateway

pytest                                   # All tests
pytest --cov=app --cov-report=html     # With coverage report
pytest tests/test_auth.py::test_login   # Specific test
```

---

## Core Features

**Nivi** is a portfolio management system with AI-driven SQL query generation.

### API Gateway Endpoints

- `GET /health` - Health check
- `POST /api/query` - Generate SQL from natural language (via model service)
- `POST /api/execute` - Execute SQL query
- `POST /api/explain` - Explain query results in natural language
- `GET /metrics` - Prometheus metrics

### User Flow

1. Frontend user types natural language query ("What is the most expensive product?")
2. API Gateway forwards to Model Service
3. Model Service sends query to Ollama for SQL generation
4. Ollama returns SQL query
5. Model Service executes SQL against PostgreSQL
6. Model Service sends results back to API Gateway
7. API Gateway may request explanation from Ollama
8. Frontend displays results

### Example Request

```bash
# Via API Gateway
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the most expensive product?"}'

# Response
{
  "sql": "SELECT product_name, MAX(unitary_price) FROM product;",
  "attempts": 1,
  "corrected": false
}
```

---

## Code Organization

### Frontend Structure

```
frontend/
├── app/              # Next.js app router
├── components/       # React components
├── hooks/           # Custom hooks
├── lib/             # Utils & API client
└── public/          # Static assets
```

Patterns: TypeScript interfaces for props, react-hook-form + Zod validation, Tailwind CSS

### Backend Structure

**API Gateway:**
```
services/api-gateway/
├── app/
│   ├── config.py       # Settings & environment
│   ├── metrics.py      # Prometheus metrics
│   ├── routers/        # API endpoints
│   ├── routers/proxy.py # Proxying to model service
│   ├── schemas/        # Pydantic models
│   └── utils/          # Helpers
├── main.py            # FastAPI app
├── tests/             # Pytest suite
└── requirements.txt
```

**Model Service:**
```
services/model/
├── app/
│   ├── config.py       # Settings & environment
│   ├── database/       # DB connection & schema
│   ├── routers/        # Model inference endpoints
│   ├── metrics.py      # Prometheus metrics
│   └── middleware/     # Error handling
├── main.py            # FastAPI app
├── tests/             # Pytest suite
└── requirements.txt
```

Patterns: Async/await for I/O, Pydantic for validation, FastAPI dependency injection

### Key Architectural Decisions

1. **Three-service separation:** Frontend, API Gateway, Model Service allow independent scaling and deployment
2. **Shared PostgreSQL schema:** Schema generator extracts DB schema once at startup for model service
3. **Nginx reverse proxy:** Handles frontend routing and can be extended for load balancing
4. **Ollama external service:** Runs separately to enable inference scaling independently from API logic

---

## Troubleshooting

### Port Conflicts

```bash
lsof -i :3000    # Frontend
lsof -i :3001    # API Gateway
lsof -i :3002    # Model Service
lsof -i :5432    # Postgres
lsof -i :11434   # Ollama
```

### Proxy Errors ("Too little data for declared Content-Length")

**Cause:** Nginx buffering or HTTP/1.0 mismatch between services

**Solution (already applied):**
- Nginx configured with `proxy_http_version 1.1`
- Buffering disabled: `proxy_buffering off`
- Check `frontend/nginx.conf` for current config

**If issue recurs:**
```bash
# Check Nginx config
docker-compose logs nginx

# Test API Gateway directly (bypass Nginx)
curl http://localhost:3001/health
```

### Database Issues

```bash
docker-compose ps postgres
docker-compose logs postgres

# Reset database (loses data)
docker-compose down -v
docker-compose up -d postgres
```

### Ollama Model Not Found

```bash
# Check if model is loaded
curl http://localhost:11434/api/tags

# Verify via Docker
docker-compose logs ollama

# Pull model if missing
docker-compose exec ollama ollama pull sqlcoder:7b
```

### Model Service Schema Not Found

The schema-generator utility runs on startup. If model service fails with schema not found:

```bash
# Trigger schema generation
docker-compose restart schema-generator

# Verify schema file exists
docker-compose exec model-service ls -la /app/schema/schema.sql

# Check logs
docker-compose logs schema-generator
```

### Fresh Python Environment

```bash
cd services/api-gateway  # or services/model
rm -rf venv __pycache__
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run build
```