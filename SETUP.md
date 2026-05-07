# Portfolio Tracker Setup Guide

## Overview
A comprehensive microservices-based portfolio management system with AI agent orchestration for intelligent investment decisions.

## Architecture
- **API Gateway** (Port 3001): Authentication, routing, rate limiting
- **Portfolio Service** (Port 3002): Portfolio and holdings management
- **Transaction Service** (Port 3003): Buy/sell operations with commissions
- **Agent Orchestrator** (Port 3004): AI-powered investment recommendations
- **Cryptocurrency Service** (Port 3005): Crypto broker integrations
- **Frontend** (Port 3000): React dashboard
- **PostgreSQL** (Port 5432): Database with separate schemas
- **Redis** (Port 6379): Message queuing and caching

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Quick Start with Docker

1. **Clone and navigate to project:**
```bash
cd portfolio-tracker
```

2. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services:**
```bash
docker-compose up -d
```

4. **Access the application:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- Grafana (monitoring): http://localhost:3006

5. **Log in with the demo account:**
- Email: `demo@example.com`
- Password: `demo123`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio_tracker
REDIS_URL=redis://localhost:6379

# API Gateway
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000

# Service URLs
PORTFOLIO_SERVICE_URL=http://localhost:3002
TRANSACTION_SERVICE_URL=http://localhost:3003
AGENT_SERVICE_URL=http://localhost:3004
CRYPTO_SERVICE_URL=http://localhost:3005

# AI Integration
OPENAI_API_KEY=your-openai-api-key

# Crypto Exchanges
BINANCE_API_KEY=your-binance-api-key
COINBASE_API_KEY=your-coinbase-api-key
```

## Local Development Setup

### 1. Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up postgres redis -d

# Run database initialization
psql -h localhost -U postgres -d portfolio_tracker -f database/init.sql
```

### 2. Install Dependencies
```bash
# Install dependencies for all services
npm run install:all

# Or install individually
cd services/api-gateway && npm install
cd ../portfolio && npm install
cd ../transaction && npm install
cd ../agent-orchestrator && npm install
cd ../cryptocurrency && npm install
cd ../../frontend && npm install
```

### 3. Start Services
```bash
# Terminal 1 - API Gateway
cd services/api-gateway && npm run dev

# Terminal 2 - Portfolio Service
cd services/portfolio && npm run dev

# Terminal 3 - Transaction Service
cd services/transaction && npm run dev

# Terminal 4 - Agent Orchestrator
cd services/agent-orchestrator && npm run dev

# Terminal 5 - Cryptocurrency Service
cd services/cryptocurrency && npm run dev

# Terminal 6 - Frontend
cd frontend && npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Portfolios
- `GET /api/portfolios` - List user portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/:id` - Get portfolio details
- `GET /api/portfolios/:id/performance` - Portfolio performance

### Transactions
- `GET /api/transactions/portfolio/:portfolioId` - List transactions
- `POST /api/transactions` - Create transaction (with commissions)

### Instruments
- `GET /api/instruments` - List available instruments
- `POST /api/instruments` - Create new instrument

### AI Recommendations
- `POST /api/recommendations/generate/:portfolioId` - Generate AI recommendations
- `GET /api/recommendations/portfolio/:portfolioId` - Get recommendations

## Dashboard

The main dashboard provides a tabbed interface with the following views:

- **Overview** — portfolio summary and key metrics
- **APEX Portfolio** — advanced portfolio analytics (embedded from `apex-portfolio.html`)
- **APEX Terminal** — trading terminal interface (embedded from `apex-terminal.html`)

## Supported Instruments

### Traditional Securities
- **Stocks**: Common and preferred stocks
- **Options**: Calls and puts with strike/expiry tracking
- **Corporate Bonds**: Fixed income securities
- **ETFs**: Exchange-traded funds
- **Securities-Guaranteed Loans**: Margin lending products
- **Blocks of Shares**: Large position trading

### Cryptocurrencies
- Integration with major exchanges (Binance, Coinbase)
- Real-time price tracking
- Wallet management
- Trading capabilities

## Transaction Features

### Commission Management
- **Broker Commission**: Per-trade broker fees
- **Exchange Commission**: Exchange trading fees
- **Transaction Tariffs**: Regulatory or platform fees
- **Total Cost Calculation**: Automatic fee aggregation

### Transaction Types
- **Buy**: Add to position with average cost calculation
- **Sell**: Reduce position with P&L tracking
- **Fee Tracking**: Detailed fee breakdown per transaction

## AI Agent Integration

### Available Agents
- **Portfolio Optimizer**: Asset allocation recommendations
- **Risk Analyzer**: Risk assessment and mitigation
- **Market Analyzer**: Market trend analysis

### Recommendation Features
- **Confidence Scoring**: 0.0000 to 1.0000 confidence levels
- **Target Prices**: Suggested entry/exit points
- **Time Horizons**: Short/medium/long-term recommendations
- **Reasoning**: Detailed explanation for each recommendation

## Monitoring & Logging

### Health Checks
All services expose `/health` endpoint for monitoring

### Metrics
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Visualization dashboard (Port 3006)
- **Application Logs**: Structured logging with Morgan

## Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Rate limiting on API Gateway

### Data Protection
- Input validation with Joi
- SQL injection prevention
- CORS configuration
- Helmet.js security headers

## Development Notes

### Code Structure
```
portfolio-tracker/
├── services/
│   ├── api-gateway/          # Authentication & routing
│   ├── portfolio/             # Portfolio management
│   ├── transaction/           # Trading & fees
│   ├── agent-orchestrator/   # AI recommendations
│   └── cryptocurrency/       # Crypto integrations
├── frontend/
│   ├── src/
│   │   ├── pages/            # React page components (Dashboard, Login, etc.)
│   │   └── components/       # Shared UI components (Layout, ProtectedRoute)
│   └── public/
│       ├── apex-portfolio.html   # Advanced portfolio analytics page
│       └── apex-terminal.html    # Trading terminal page
├── database/                 # Schema definitions & seed data
├── monitoring/               # Prometheus/Grafana configs
└── docker-compose.yml        # Container orchestration
```

### Database Schema
Separate schemas for each microservice:
- `portfolio_service`: Portfolios, holdings, instruments
- `transaction_service`: Transactions and fees
- `agent_service`: AI agents and recommendations
- `crypto_service`: Crypto holdings and exchanges

## Testing

### Unit Tests
```bash
# Run tests for all services
npm run test:all

# Run tests for specific service
cd services/portfolio && npm test
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

## Deployment

### Production Deployment
1. Update environment variables for production
2. Build Docker images:
```bash
docker-compose -f docker-compose.prod.yml build
```
3. Deploy to your container orchestration platform
4. Configure SSL/TLS termination
5. Set up monitoring and alerting

### Scaling
- **Horizontal Scaling**: Multiple instances per service
- **Database Scaling**: Read replicas for read-heavy operations
- **Load Balancing**: Configure for API Gateway
- **Caching**: Redis for frequent queries

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and PostgreSQL status
2. **Port Conflicts**: Ensure ports 3000-3006 are available
3. **Memory Issues**: Increase Docker memory limits
4. **API Errors**: Check service logs with `docker-compose logs [service]`
5. **Login fails (401)**: The demo user is seeded by `database/init.sql`. If you recreated the database without re-running the seed, run `docker-compose down -v && docker-compose up -d` to reinitialize.
6. **APEX pages return 403**: Rebuild the frontend image — the Dockerfile applies `chmod 644` to all HTML files in the nginx root, which is required for nginx to serve them.

### Health Monitoring
```bash
# Check all service health
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3002/health  # Portfolio Service
curl http://localhost:3003/health  # Transaction Service
curl http://localhost:3004/health  # Agent Service
curl http://localhost:3005/health  # Crypto Service
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use conventional commit messages
5. Ensure all services pass health checks

## License

MIT License - see LICENSE file for details.
