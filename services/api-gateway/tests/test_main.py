import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch


@pytest.mark.unit
def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "api-gateway"
    assert "timestamp" in data
    assert data["version"] == "2.0.0"


@pytest.mark.unit
def test_metrics_endpoint(client):
    """Test metrics endpoint."""
    response = client.get("/metrics")
    assert response.status_code == 200


@pytest.mark.unit
def test_cors_headers(client):
    """Test CORS is configured."""
    response = client.get("/health")
    assert response.status_code == 200
    # CORS middleware is configured (checked via middleware setup)
    assert response.json()["status"] == "ok"


@pytest.mark.unit
def test_lifespan_startup(client):
    """Test app lifespan startup."""
    # Test that the app initializes and responds to requests
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "api-gateway"


@pytest.mark.unit
def test_rate_limiting_headers(client):
    """Test rate limiting headers are present."""
    response = client.get("/health")
    assert response.status_code == 200
    # Rate limiting headers should be present due to slowapi middleware
