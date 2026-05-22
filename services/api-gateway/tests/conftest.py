import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import Mock, patch
import tempfile
import os
from datetime import datetime, timedelta

from app.main import app
from app.config import settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Create an async test client for the FastAPI app."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    with patch.object(settings, 'SECRET_KEY', 'test-secret-key'), \
         patch.object(settings, 'ALGORITHM', 'HS256'), \
         patch.object(settings, 'ACCESS_TOKEN_EXPIRE_MINUTES', 30), \
         patch.object(settings, 'ALLOWED_ORIGINS', ['http://localhost:3000']):
        yield settings


@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "testuser@example.com",
        "email": "testuser@example.com"
    }


@pytest.fixture
def valid_token(mock_settings):
    """Generate a valid JWT token for testing."""
    from jose import jwt
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"sub": "testuser@example.com", "exp": expire}
    return jwt.encode(to_encode, mock_settings.SECRET_KEY, algorithm=mock_settings.ALGORITHM)


@pytest.fixture
def expired_token(mock_settings):
    """Generate an expired JWT token for testing."""
    from jose import jwt
    expire = datetime.utcnow() - timedelta(minutes=30)
    to_encode = {"sub": "testuser@example.com", "exp": expire}
    return jwt.encode(to_encode, mock_settings.SECRET_KEY, algorithm=mock_settings.ALGORITHM)


@pytest.fixture
def mock_service_responses():
    """Mock responses for microservices."""
    return {
        "cryptocurrency": {
            "prices": {"bitcoin": {"price": 50000, "change": 2.5}},
            "portfolio": {"total_value": 100000, "change_24h": 5.2}
        },
        "portfolio": {
            "exchanges": [{"id": 1, "name": "Binance", "active": True}],
            "instruments": [{"id": 1, "symbol": "BTC", "name": "Bitcoin"}]
        },
        "agent": {
            "recommendations": [{"type": "buy", "confidence": 0.8}],
            "agents": [{"id": 1, "name": "Trading Bot", "status": "active"}]
        }
    }


@pytest.fixture
def mock_database():
    """Mock database connection and queries."""
    with patch('app.database.init_db') as mock_init:
        mock_init.return_value = None
        yield mock_init


@pytest.fixture
def auth_headers(valid_token):
    """Authorization headers with valid token."""
    return {"Authorization": f"Bearer {valid_token}"}


@pytest.fixture
def mock_redis():
    """Mock Redis connection."""
    with patch('redis.Redis') as mock_redis_class:
        mock_client = Mock()
        mock_redis_class.return_value = mock_client
        yield mock_client
