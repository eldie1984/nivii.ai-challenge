# API Gateway Testing

This document provides comprehensive testing guidelines for the API Gateway service.

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures and utilities
├── test_main.py            # Main application tests
├── test_auth.py            # Authentication endpoint tests
├── test_proxy.py           # Proxy functionality tests
└── test_integration.py     # Integration tests
```

## Running Tests

### Prerequisites
- Python 3.11+
- PostgreSQL (for integration tests)
- Redis (for integration tests)

### Installation
```bash
make install-dev
```

### Running All Tests
```bash
make test
# or
pytest
```

### Running Specific Test Categories
```bash
# Unit tests only
make test-unit
# or
pytest -m unit

# Integration tests only
make test-integration
# or
pytest -m integration

# Authentication tests
pytest -m auth

# Proxy tests
pytest -m proxy
```

### With Coverage
```bash
make test-all
# or
pytest --cov=app --cov-report=html --cov-report=term-missing
```

## Test Categories

### Unit Tests (`@pytest.mark.unit`)
- Test individual functions and methods
- Mock external dependencies
- Fast and isolated
- No external services required

### Integration Tests (`@pytest.mark.integration`)
- Test complete workflows
- Real database connections
- External API mocking
- Slower but more realistic

### Specialized Markers
- `@pytest.mark.auth` - Authentication related tests
- `@pytest.mark.proxy` - Proxy functionality tests
- `@pytest.mark.slow` - Tests that take longer to run

## Key Test Areas

### Authentication Tests (`test_auth.py`)
- User registration
- Login/logout
- JWT token validation
- Password hashing
- Token expiration

### Proxy Tests (`test_proxy.py`)
- Request routing to microservices
- Header filtering and forwarding
- Error handling and propagation
- Service discovery
- Timeout handling

### Integration Tests (`test_integration.py`)
- Complete authentication flows
- End-to-end proxy requests
- Middleware functionality
- Error propagation across services

## Mocking Strategy

### External APIs
- Use `unittest.mock` for HTTP clients
- Mock responses for cryptocurrency APIs
- Simulate various error conditions

### Database
- Use async mocks for database connections
- Test query building and error handling
- Mock connection pools

### Configuration
- Override settings for testing
- Use test-specific API keys and URLs
- Mock environment variables

## Coverage Requirements

- Minimum 80% code coverage
- Focus on critical paths:
  - Authentication logic
  - Proxy routing
  - Error handling
  - Security middleware

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main` and `develop` branches
- Pushes to `main` and `develop` branches

### GitHub Actions Workflow
- Sets up PostgreSQL and Redis services
- Installs dependencies
- Runs tests with coverage
- Uploads coverage to Codecov

## Best Practices

### Test Organization
- One test class per feature
- Descriptive test method names
- Arrange-Act-Assert pattern
- Independent tests (no shared state)

### Fixtures
- Use fixtures for common setup
- Scope fixtures appropriately (function, session)
- Clean up resources in teardown

### Assertions
- Be specific with assertions
- Test both success and failure cases
- Verify error messages and status codes
- Check response structure

### Mocking
- Mock only what's necessary
- Verify mock calls
- Use realistic mock data
- Test error scenarios

## Debugging Tests

### Running Individual Tests
```bash
pytest tests/test_auth.py::test_login_success -v
```

### Debugging with pdb
```bash
pytest --pdb tests/test_auth.py::test_login_success
```

### Verbose Output
```bash
pytest -v -s tests/test_auth.py
```

### Show Local Variables
```bash
pytest -l tests/test_auth.py
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Ensure PostgreSQL is running
2. **Redis connection errors**: Check Redis service status
3. **Import errors**: Verify dependencies are installed
4. **Timeout errors**: Increase timeout values in tests

### Test Performance
- Use `@pytest.mark.slow` for time-consuming tests
- Run slow tests separately
- Consider using test databases in memory

## Contributing

When adding new features:
1. Write tests before or alongside code
2. Ensure coverage remains above 80%
3. Add appropriate test markers
4. Update this documentation if needed
5. Run full test suite before submitting PR
