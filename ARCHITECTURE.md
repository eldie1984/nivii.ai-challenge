# Portfolio Tracker Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PORTFOLIO TRACKER SYSTEM                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/HTTPS
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NGINX REVERSE PROXY                                │
│                           (Port 80 - Load Balancer)                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
                │                       │                       │
                ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│     FRONTEND APP        │ │      API GATEWAY        │ │      MONITORING         │
│   (Next.js Port 3000)   │ │     (Port 3001)         │ │                         │
│                         │ │                         │ │ ┌─────────────────────┐ │
│ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │ │ │   PROMETHEUS        │ │ │
│ │   React Components  │ │ │ │   Auth Service      │ │ │ │   (Port 9090)       │ │ │
│ │   - Login Screen    │ │ │ │   - JWT Tokens      │ │ │ └─────────────────────┘ │ │
│ │   - Portfolio UI    │ │ │ │   - Password Hash   │ │ │ ┌─────────────────────┐ │ │
│ │   - Terminal UI     │ │ │ │   - User Management │ │ │ │     GRAFANA         │ │ │
│ │   - Theme Toggle    │ │ │ │                     │ │ │ │   (Port 3006)       │ │ │
│ └─────────────────────┘ │ │ ┌─────────────────────┐ │ │ └─────────────────────┘ │ │
│                         │ │ │   Proxy Routes      │ │ │                         │ │
│ ┌─────────────────────┐ │ │ │   - /api/portfolio  │ │ │                         │ │
│ │   Authentication    │ │ │ │   - /api/crypto     │ │ │                         │ │
│ │   - JWT Storage     │ │ │ │   - /api/agent      │ │ │                         │ │
│ │   - Session Mgmt    │ │ │ │   - /api/transaction│ │ │                         │ │
│ └─────────────────────┘ │ │ │                     │ │ │                         │ │
│                         │ │ └─────────────────────┘ │ │                         │ │
│ ┌─────────────────────┐ │ │                         │ │                         │ │
│ │   State Management  │ │ │ ┌─────────────────────┐ │ │                         │ │
│ │   - React Context   │ │ │ │   Rate Limiting     │ │ │                         │ │
│ │   - Local Storage   │ │ │ │   - 100 req/15min   │ │ │                         │ │
│ │   - API Client      │ │ │ │   - CORS Headers    │ │ │                         │ │
│ └─────────────────────┘ │ │ └─────────────────────┘ │ │                         │ │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                │                       │                       │
                │                       │                       │
                │                       │                       │
                ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
                ▼                       ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│      POSTGRESQL         │ │         REDIS           │ │      MICROSERVICES       │
│    (Port 5432)          │ │      (Port 6379)        │ │                         │
│                         │ │                         │ │ ┌─────────────────────┐ │
│ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │ │ │  Portfolio Service  │ │ │
│ │   Users Table       │ │ │ │   Session Cache     │ │ │ │   (Port 3002)       │ │ │
│ │   - id (UUID)       │ │ │ │   - JWT Tokens      │ │ │ │                     │ │ │
│ │   - email           │ │ │ │   - User Sessions   │ │ │ │ ┌─────────────────┐ │ │ │
│ │   - password_hash   │ │ │ │   - Rate Limits     │ │ │ │ │ Portfolio CRUD  │ │ │ │
│ │   - first_name      │ │ │ │                     │ │ │ │ │ Holdings Mgmt   │ │ │ │
│ │   - last_name       │ │ │ └─────────────────────┘ │ │ │ │ Performance     │ │ │ │
│ │   - created_at      │ │ │                         │ │ │ │ Analytics       │ │ │ │
│ │   - updated_at      │ │ │ ┌─────────────────────┐ │ │ │ └─────────────────┘ │ │ │
│ └─────────────────────┘ │ │ │   Message Queue     │ │ │ └─────────────────────┘ │ │
│                         │ │ │   - Task Queuing    │ │ │                         │ │
│ ┌─────────────────────┐ │ │ │   - Event Streaming │ │ │ ┌─────────────────────┐ │ │
│ │   Portfolio Table   │ │ │ │   - Async Processing│ │ │ │ Transaction Service │ │ │
│ │   - id (UUID)       │ │ │ │                     │ │ │ │   (Port 3003)       │ │ │
│ │   - user_id (FK)    │ │ │ └─────────────────────┘ │ │ │                     │ │ │
│ │   - name            │ │ │                         │ │ │ ┌─────────────────┐ │ │ │
│ │   - total_value     │ │ │ ┌─────────────────────┐ │ │ │ │ Transaction CRUD│ │ │ │
│ │   - created_at      │ │ │ │   Cache Layer       │ │ │ │ │ Order Tracking  │ │ │ │
│ │   - updated_at      │ │ │ │   - API Responses   │ │ │ │ │ History Mgmt    │ │ │ │
│ └─────────────────────┘ │ │ │   - Computed Data   │ │ │ │ └─────────────────┘ │ │ │
│                         │ │ │                     │ │ │ └─────────────────────┘ │ │
│ ┌─────────────────────┐ │ │ └─────────────────────┘ │ │                         │ │
│ │   Holdings Table    │ │ │                         │ │ ┌─────────────────────┐ │ │
│ │   - id (UUID)       │ │ │                         │ │ │  Crypto Service     │ │ │
│ │   - portfolio_id FK │ │ │                         │ │ │   (Port 3005)       │ │ │
│ │   - symbol          │ │ │                         │ │ │                     │ │ │
│ │   - quantity        │ │ │                         │ │ │ ┌─────────────────┐ │ │ │
│ │   - avg_price       │ │ │                         │ │ │ │ Binance API     │ │ │ │
│ │   - current_price   │ │ │                         │ │ │ │ Coinbase API    │ │ │ │
│ │   - created_at      │ │ │                         │ │ │ │ Price Tracking  │ │ │ │
│ └─────────────────────┘ │ │                         │ │ │ └─────────────────┘ │ │ │
│                         │ │                         │ │ └─────────────────────┘ │ │
│ ┌─────────────────────┐ │ │                         │ │                         │ │
│ │   Transactions      │ │ │                         │ │ ┌─────────────────────┐ │ │
│ │   - id (UUID)       │ │ │                         │ │ │  Agent Orchestrator │ │ │
│ │   - portfolio_id FK │ │ │                         │ │ │   (Port 3004)       │ │ │
│ │   - type            │ │ │                         │ │ │                     │ │ │
│ │   - symbol          │ │ │                         │ │ │ ┌─────────────────┐ │ │ │
│ │   - quantity        │ │ │                         │ │ │ │ AI Trading Bot  │ │ │ │
│ │   - price           │ │ │                         │ │ │ │ Strategy Engine │ │ │ │
│ │   - timestamp       │ │ │                         │ │ │ │ Risk Management │ │ │ │
│ └─────────────────────┘ │ │                         │ │ │ └─────────────────┘ │ │ │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

## Authentication Flow

```
┌─────────────┐    1. Login Request    ┌─────────────┐    2. Validate Credentials    ┌─────────────┐
│   Frontend  │ ──────────────────────► │ API Gateway │ ──────────────────────────► │ PostgreSQL  │
│   (Next.js) │                       │             │                             │   Users     │
└─────────────┘                       └─────────────┘                             └─────────────┘
      ▲                                      │                                            ▲
      │ 6. JWT Token + User Data             │ 3. User Found + Password Hash              │
      │                                      │                                            │
      │                                      ▼                                            │ 4. Verify Password
      │                                 ┌─────────────┐                             ┌─────────────┐
      │                                 │    Redis    │                             │ PostgreSQL  │
      │                                 │   Cache     │                             │   Users     │
      │                                 │             │                             │             │
      │                                 └─────────────┘                             └─────────────┘
      │                                      │                                            │
      │                                      │ 5. Password Valid                           │
      │                                      ▼                                            │
┌─────────────┐    7. Store JWT Token    ┌─────────────┐    8. Generate JWT Token     ┌─────────────┐
│   Frontend  │ ◄──────────────────────  │ API Gateway │ ◄────────────────────────── │ PostgreSQL  │
│   (Next.js) │      Local Storage       │             │                             │   Users     │
└─────────────┘                          └─────────────┘                             └─────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

1. User Request → Nginx → Frontend (Port 3000)
2. API Request → Nginx → API Gateway (Port 3001)
3. Auth Request → API Gateway → PostgreSQL (Users)
4. Cache Request → API Gateway → Redis (Sessions/Rate Limits)
5. Service Request → API Gateway → Microservices (3002-3005)
6. External API → Crypto Service → Binance/Coinbase APIs

┌─────────────────────────────────────────────────────────────────────────────────┐
│                             RESPONSE FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

1. Database Response → PostgreSQL → API Gateway
2. Cache Response → Redis → API Gateway
3. Service Response → Microservices → API Gateway
4. API Response → API Gateway → Nginx → Frontend
5. External Data → Crypto APIs → Crypto Service → API Gateway
```

## Technology Stack

### Frontend Layer
- **Next.js 16.2.4** - React framework with SSR/SSG
- **React 19** - UI components
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Component library

### Backend Layer
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **TypeScript** - Type safety

### Database Layer
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and session storage
- **Docker** - Containerization

### Infrastructure Layer
- **Nginx** - Reverse proxy and load balancer
- **Docker Compose** - Service orchestration
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboard

### External Services
- **Binance API** - Cryptocurrency data
- **Coinbase API** - Cryptocurrency data
- **OpenAI API** - AI trading strategies

## Security Features

1. **Authentication**: JWT-based authentication with 24-hour expiration
2. **Password Security**: bcrypt hashing with 12 salt rounds
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **CORS**: Proper cross-origin resource sharing
5. **Security Headers**: Helmet.js for security headers
6. **Input Validation**: Request body validation and sanitization

## Scalability Considerations

1. **Horizontal Scaling**: Each service can be scaled independently
2. **Load Balancing**: Nginx distributes traffic across instances
3. **Caching**: Redis reduces database load for frequent queries
4. **Microservices**: Independent deployment and scaling
5. **Containerization**: Docker enables consistent deployment

## Monitoring & Observability

1. **Health Checks**: All services expose `/health` endpoints
2. **Metrics**: Prometheus collects application metrics
3. **Logging**: Structured logging with Morgan
4. **Dashboards**: Grafana visualizes system performance
5. **Error Tracking**: Centralized error handling and reporting
