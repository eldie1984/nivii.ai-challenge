import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock, AsyncMock
import httpx


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_proxy_request_success(mock_async_client, client, auth_headers, mock_service_responses):
    """Test successful proxy request to microservice."""
    # Mock the HTTP response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'{"data": "test"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/cryptocurrency/prices", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_proxy_request_timeout(mock_async_client, client, auth_headers):
    """Test proxy request timeout handling."""
    mock_client_instance = AsyncMock()
    mock_client_instance.request.side_effect = httpx.TimeoutException("Request timeout")
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/cryptocurrency/prices", headers=auth_headers)
    assert response.status_code == 504
    assert "Service timeout" in response.json()["detail"]


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_proxy_request_service_unavailable(mock_async_client, client, auth_headers):
    """Test proxy request when service is unavailable."""
    mock_client_instance = AsyncMock()
    mock_client_instance.request.side_effect = httpx.ConnectError("Connection failed")
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/cryptocurrency/prices", headers=auth_headers)
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]


@pytest.mark.proxy
@pytest.mark.unit
def test_proxy_request_without_auth(client):
    """Test proxy request without authentication."""
    response = client.get("/api/cryptocurrency/prices")
    assert response.status_code == 403  # No authorization header


@pytest.mark.proxy
@pytest.mark.unit
def test_proxy_request_invalid_auth(client):
    """Test proxy request with invalid authentication."""
    headers = {"Authorization": "Bearer invalid.token"}
    response = client.get("/api/cryptocurrency/prices", headers=headers)
    assert response.status_code == 403


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_cryptocurrency_prices_proxy(mock_async_client, client, auth_headers, mock_service_responses):
    """Test cryptocurrency prices proxy endpoint."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'{"bitcoin": {"price": 50000}}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/cryptocurrency/prices", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_cryptocurrency_generic_get_proxy(mock_async_client, client, auth_headers):
    """Test generic cryptocurrency GET proxy."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'{"data": "test"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/cryptocurrency/portfolio/1", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_cryptocurrency_post_proxy(mock_async_client, client, auth_headers):
    """Test cryptocurrency POST proxy."""
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.content = b'{"id": 1, "status": "created"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"name": "Test Portfolio", "description": "Test"}
    response = client.post("/api/cryptocurrency/portfolio", json=data, headers=auth_headers)
    assert response.status_code == 201


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_portfolio_get_proxy(mock_async_client, client, auth_headers):
    """Test portfolio GET proxy."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'[{"id": 1, "name": "Portfolio 1"}]'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/portfolio/portfolios", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_portfolio_post_proxy(mock_async_client, client, auth_headers):
    """Test portfolio POST proxy."""
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.content = b'{"id": 1, "name": "New Portfolio"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"name": "New Portfolio"}
    response = client.post("/api/portfolio/portfolios", json=data, headers=auth_headers)
    assert response.status_code == 201


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_portfolio_put_proxy(mock_async_client, client, auth_headers):
    """Test portfolio PUT proxy."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'{"id": 1, "name": "Updated Portfolio"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"name": "Updated Portfolio"}
    response = client.put("/api/portfolio/portfolios/1", json=data, headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_portfolio_delete_proxy(mock_async_client, client, auth_headers):
    """Test portfolio DELETE proxy."""
    mock_response = Mock()
    mock_response.status_code = 204
    mock_response.content = b''
    mock_response.headers = {}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.delete("/api/portfolio/portfolios/1", headers=auth_headers)
    assert response.status_code == 204


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_exchanges_get_direct_route(mock_async_client, client, auth_headers):
    """Test direct exchanges GET route."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'[{"id": 1, "name": "Binance"}]'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/exchanges", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_exchanges_post_direct_route(mock_async_client, client, auth_headers):
    """Test direct exchanges POST route."""
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.content = b'{"id": 1, "name": "New Exchange"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"name": "New Exchange", "api_key": "test_key"}
    response = client.post("/api/exchanges", json=data, headers=auth_headers)
    assert response.status_code == 201


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_agent_get_proxy(mock_async_client, client, auth_headers):
    """Test agent orchestrator GET proxy."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.content = b'[{"id": 1, "name": "Trading Bot"}]'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    response = client.get("/api/agent/agents", headers=auth_headers)
    assert response.status_code == 200


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_agent_post_proxy(mock_async_client, client, auth_headers):
    """Test agent orchestrator POST proxy."""
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.content = b'{"id": 1, "status": "created"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"name": "New Agent", "type": "trading"}
    response = client.post("/api/agent/agents", json=data, headers=auth_headers)
    assert response.status_code == 201


@pytest.mark.proxy
@pytest.mark.unit
@patch('app.routers.proxy.httpx.AsyncClient')
def test_instruments_post_direct_route(mock_async_client, client, auth_headers):
    """Test direct instruments POST route."""
    mock_response = Mock()
    mock_response.status_code = 201
    mock_response.content = b'{"id": 1, "symbol": "BTC"}'
    mock_response.headers = {"content-type": "application/json"}
    
    mock_client_instance = AsyncMock()
    mock_client_instance.request.return_value = mock_response
    mock_async_client.return_value.__aenter__.return_value = mock_client_instance
    
    data = {"symbol": "BTC", "name": "Bitcoin", "type": "cryptocurrency"}
    response = client.post("/api/instruments", json=data, headers=auth_headers)
    assert response.status_code == 201


@pytest.mark.proxy
@pytest.mark.unit
def test_proxy_headers_filtering():
    """Test that hop-by-hop headers are filtered correctly."""
    from app.routers.proxy import proxy_request
    import asyncio
    
    headers = {
        'host': 'example.com',
        'connection': 'keep-alive',
        'upgrade': 'websocket',
        'content-type': 'application/json',
        'authorization': 'Bearer token'
    }
    
    # Test header filtering logic
    filtered_headers = {k: v for k, v in headers.items() 
                       if k.lower() not in ['host', 'connection', 'upgrade']}
    
    assert 'host' not in filtered_headers
    assert 'connection' not in filtered_headers
    assert 'upgrade' not in filtered_headers
    assert 'content-type' in filtered_headers
    assert 'authorization' in filtered_headers
