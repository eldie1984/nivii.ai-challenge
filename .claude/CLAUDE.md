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

```
services/
├── api-gateway/        # Main API entry point, auth, routing
├── model/             # ML model inference and predictions
└── (agent-orchestrator & cryptocurrency services referenced in CI/CD)
```

**API Gateway** (port 3001):
- Authentication & authorization
- Request validation & rate limiting (slowapi)
- Service proxying & routing
- Prometheus metrics
- JWT token management

**Frontend** (port 3000):
- Next.js SSR application
- Portfolio management UI
- Tailwind CSS + Radix UI components

### Data Flow

```
Frontend (3000) → Nginx → API Gateway (3001) → PostgreSQL / Redis / Model Service
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

# Testing
pytest                          # Run all tests
pytest --cov=app               # With coverage
pytest tests/test_auth.py       # Single file
pytest -k test_login            # Match pattern
pytest -v                       # Verbose
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

```
services/api-gateway/
├── app/
│   ├── config.py       # Settings & environment
│   ├── metrics.py      # Prometheus metrics
│   ├── routes/         # Endpoints
│   ├── schemas/        # Pydantic models
│   └── utils/          # Helpers
├── main.py            # FastAPI app
├── tests/             # Pytest suite
└── requirements.txt
```

Patterns: Async/await for I/O, Pydantic for validation, FastAPI dependency injection

---

## Troubleshooting

**Port conflicts:**
```bash
lsof -i :3000    # Frontend
lsof -i :3001    # API
lsof -i :5432    # Postgres
```

**Database issues:**
```bash
docker-compose ps postgres
docker-compose logs postgres
```

**Fresh Python environment:**
```bash
cd services/api-gateway
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend build issues:**
```bash
cd frontend
rm -rf node_modules .next
npm install && npm run build
```