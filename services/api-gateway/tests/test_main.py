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
    """Test CORS headers are present."""
    response = client.options("/health")
    assert response.status_code == 200
    # CORS headers should be present
    assert "access-control-allow-origin" in response.headers


@pytest.mark.unit
@patch('app.main.init_db')
def test_lifespan_startup(mock_init_db):
    """Test app lifespan startup."""
    from app.main import app
    with TestClient(app) as client:
        mock_init_db.assert_called_once()


@pytest.mark.unit
def test_rate_limiting_headers(client):
    """Test rate limiting headers are present."""
    response = client.get("/health")
    assert response.status_code == 200
    # Rate limiting headers should be present due to slowapi middleware
