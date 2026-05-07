# FastAPI Migration Guide

This document outlines the migration of the API Gateway and Cryptocurrency services from Node.js/Express to FastAPI.

## Overview

The following services have been migrated to FastAPI:
- **API Gateway** (Port 3000 → 3001)
- **Cryptocurrency Service** (Port 3005)

## Architecture Changes

### API Gateway (FastAPI)

**Key Features:**
- **Async/Await Support**: Full asynchronous request handling
- **Automatic API Documentation**: OpenAPI/Swagger at `/docs`
- **Type Safety**: Pydantic models for request/response validation
- **Enhanced Security**: Built-in CORS, rate limiting with SlowAPI
- **Better Error Handling**: Structured error responses
- **JWT Authentication**: Secure token-based authentication
- **Service Proxy**: Intelligent routing to microservices

**New Endpoints:**
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET|POST|PUT|DELETE /api/{service}/*` - Proxy to microservices

### Cryptocurrency Service (FastAPI)

**Key Features:**
- **Real-time Price Data**: Integration with CoinGecko and CoinMarketCap APIs
- **Portfolio Management**: Complete portfolio CRUD operations
- **Performance Analytics**: Profit/loss calculations and metrics
- **Caching**: In-memory price caching (Redis in production)
- **Mock Data Fallback**: Graceful degradation when APIs are unavailable

**New Endpoints:**
- `GET /health` - Health check
- `GET /api/prices` - Get cryptocurrency prices
- `GET /api/prices/{symbol}` - Get single cryptocurrency price
- `GET /api/supported-symbols` - List supported cryptocurrencies
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/holdings` - Add holding
- `PUT /api/portfolio/holdings/{symbol}` - Update holding
- `DELETE /api/portfolio/holdings/{symbol}` - Remove holding
- `GET /api/portfolio/performance` - Portfolio performance metrics

## Deployment

### Using Docker Compose

The new FastAPI services can be deployed using the provided `docker-compose.fastapi.yml`:

```bash
# Start FastAPI services
docker-compose -f docker-compose.fastapi.yml up -d

# View logs
docker-compose -f docker-compose.fastapi.yml logs -f

# Stop services
docker-compose -f docker-compose.fastapi.yml down
```

### Environment Configuration

#### API Gateway
Copy `services/api-gateway/.env.example` to `services/api-gateway/.env` and configure:
- Database URL
- Redis URL
- JWT Secret Key
- Microservice URLs
- CORS origins

#### Cryptocurrency Service
Copy `services/cryptocurrency/.env.example` to `services/cryptocurrency/.env` and configure:
- CoinMarketCap API Key (optional)
- CoinGecko API URL
- Cache TTL
- Rate limiting

## Development

### Local Development

#### API Gateway
```bash
cd services/api-gateway
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```

#### Cryptocurrency Service
```bash
cd services/cryptocurrency
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 3005
```

### API Documentation

Once running, access the interactive API documentation:
- API Gateway: http://localhost:3000/docs
- Cryptocurrency Service: http://localhost:3005/docs

## Benefits of FastAPI Migration

### Performance
- **Higher Throughput**: FastAPI can handle 2-3x more requests per second
- **Lower Latency**: Async operations reduce response times
- **Better Memory Usage**: Efficient async/await patterns

### Developer Experience
- **Type Hints**: Better IDE support and catch errors at development time
- **Auto Documentation**: Always up-to-date API docs
- **Validation**: Automatic request/response validation
- **Testing**: Built-in testing support with TestClient

### Production Readiness
- **Security**: Built-in security features
- **Monitoring**: Better logging and error handling
- **Scalability**: Async architecture scales better
- **Standards**: OpenAPI compliance for tooling integration

## Migration Notes

### Breaking Changes
- API Gateway port changed from 3001 to 3000 (internal Docker port)
- Request/response formats may have slight changes due to Pydantic validation
- Error response format is now standardized

### Compatibility
- Frontend integration remains unchanged
- Database schema is compatible
- Other microservices continue to work as before

### Monitoring
- Health checks available at `/health` endpoint
- Structured logging for better observability
- Error tracking with detailed error responses

## Next Steps

1. **Testing**: Thoroughly test all endpoints and integrations
2. **Monitoring**: Set up proper monitoring and alerting
3. **Caching**: Implement Redis for price caching in production
4. **Security**: Review and harden security configurations
5. **Documentation**: Update API documentation for consumers
6. **Performance**: Load testing and optimization

## Troubleshooting

### Common Issues

**Service won't start:**
- Check Python version (requires 3.11+)
- Verify all dependencies are installed
- Check environment variables

**API calls failing:**
- Verify service URLs in configuration
- Check network connectivity between services
- Review error logs for specific issues

**Database connection issues:**
- Verify database URL format
- Check if database is running
- Review database credentials

### Logs

View logs for each service:
```bash
# API Gateway
docker-compose -f docker-compose.fastapi.yml logs api-gateway

# Cryptocurrency Service
docker-compose -f docker-compose.fastapi.yml logs crypto-service
```
