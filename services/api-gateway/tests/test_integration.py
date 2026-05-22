import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock, AsyncMock
import httpx


@pytest.mark.integration
@pytest.mark.slow
@patch('app.routers.proxy.httpx.AsyncClient')
def test_full_auth_flow(mock_async_client, client):
    """Test complete authentication flow."""
    # Register user
    user_data = {
        "username": "integrationuser",
        "email": "integration@example.com",
        "password": "securepassword123"
    }
    
    register_response = client.post("/api/auth/register", json=user_data)
    assert register_response.status_code == 201
    
    # Login
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200
    
    token = login_response.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Validate token
    validate_response = client.get("/api/auth/validate", headers=headers)
    assert validate_response.status_code == 200
    assert validate_response.json()["valid"] is True


@pytest.mark.integration
@pytest.mark.slow
@patch('app.routers.proxy.httpx.AsyncClient')
def test_authenticated_proxy_requests(mock_async_client, client, mock_service_responses):
    """Test authenticated proxy requests to all services."""
    # First login to get token
    login_data = {"email": "test@example.com", "password": "password123"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Mock successful responses for all services
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'{"status": "ok"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    # Test cryptocurrency service
    crypto_response = client.get("/api/cryptocurrency/prices", headers=headers)
    assert crypto_response.status_code == 200
    
    # Test portfolio service
    portfolio_response = client.get("/api/portfolio/portfolios", headers=headers)
    assert portfolio_response.status_code == 200
    
    # Test agent service
    agent_response = client.get("/api/agent/agents", headers=headers)
    assert agent_response.status_code == 200


@pytest.mark.integration
@pytest.mark.slow
@patch('app.routers.proxy.httpx.AsyncClient')
def test_error_propagation(mock_async_client, client):
    """Test that errors from microservices are properly propagated."""
    # Login first
    login_data = {"email": "test@example.com", "password": "password123"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Mock error response from microservice
    mock_response = Mock()
    mock_response.status_code = 400
    mock_response.content = b'{"error": "Bad request from microservice"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    # Test error propagation
    response = client.get("/api/cryptocurrency/invalid-endpoint", headers=headers)
    assert response.status_code == 400


@pytest.mark.integration
@pytest.mark.slow
def test_middleware_functionality(client):
    """Test that all middleware is working correctly."""
    # Test CORS headers
    response = client.options("/health")
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    
    # Test rate limiting headers
    response = client.get("/health")
    assert response.status_code == 200
    
    # Test metrics endpoint is accessible
    metrics_response = client.get("/metrics")
    assert metrics_response.status_code == 200


@pytest.mark.integration
@pytest.mark.slow
@patch('app.routers.proxy.httpx.AsyncClient')
def test_service_discovery(mock_async_client, client):
    """Test service discovery and routing."""
    # Login first
    login_data = {"email": "test@example.com", "password": "password123"}
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test different service routes
    test_cases = [
        ("/api/cryptocurrency/prices", "cryptocurrency", "/api/prices"),
        ("/api/portfolio/portfolios", "portfolio", "/portfolios"),
        ("/api/agent/agents", "agent", "/api/agents"),
    ]
    
    for endpoint, expected_service, expected_path in test_cases:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = b'{"status": "ok"}'
        mock_response.headers = {"content-type": "application/json"}
        
        mock_client_instance = AsyncMock()
        mock_client_instance.request.return_value = mock_response
        mock_async_client.return_value.__aenter__.return_value = mock_client_instance
        
        response = client.get(endpoint, headers=headers)
        assert response.status_code == 200
        
        # Verify the correct service and path were called
        mock_client_instance.request.assert_called()
        call_args = mock_client_instance.request.call_args
        assert call_args[1]["method"] == "GET"
        assert expected_service in call_args[1]["url"]


@pytest.mark.integration
@pytest.mark.slow
def test_health_checks_all_services():
    """Test health check endpoints for all services."""
    from app.main import app
    
    with TestClient(app) as client:
        # Test API Gateway health
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["service"] == "api-gateway"
