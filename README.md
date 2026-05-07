# Portfolio Tracker & Orchestrator

A comprehensive microservices-based portfolio management system with AI agent orchestration for intelligent investment decisions.

## Architecture Overview

### Microservices
- **API Gateway**: Central routing, authentication, and rate limiting
- **Portfolio Service**: Manage stocks, options, bonds, and other securities
- **Transaction Service**: Handle buy/sell operations with commissions and tariffs
- **Agent Orchestrator**: AI-powered decision making and recommendations
- **Cryptocurrency Service**: Integration with crypto brokers
- **Database Layer**: PostgreSQL with separate schemas per service

### Supported Instruments
- Stocks and ETFs
- Options (calls/puts)
- Corporate Bonds
- Securities-guaranteed loans
- Blocks of shares
- Cryptocurrencies (via broker APIs)

### Features
- Real-time portfolio tracking
- Commission and tariff management
- AI agent integration for investment decisions
- Multi-broker support
- Scalable microservices architecture

## Technology Stack
- **Backend**: Node.js/Express, TypeScript
- **Database**: PostgreSQL
- **Message Queue**: Redis
- **Containerization**: Docker & Docker Compose
- **Frontend**: React with TypeScript
- **Monitoring**: Prometheus + Grafana

## Quick Start

```bash
# Clone and setup
git clone <repository>
cd portfolio-tracker

# Start all services
docker-compose up -d

# Access the application
Frontend: http://localhost:3000
API Gateway: http://localhost:3001
```

## Development

Each service can be developed and deployed independently. See individual service directories for specific setup instructions.
