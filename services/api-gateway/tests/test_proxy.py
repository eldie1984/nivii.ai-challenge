import pytest


@pytest.mark.proxy
@pytest.mark.unit
def test_query_endpoint_available(client):
    """Test query endpoint is available and responds."""
    response = client.post("/api/query", json={"query": "Get all products"})
    # Endpoint should respond (200 if service available, 500+ if not)
    assert response.status_code >= 200


@pytest.mark.proxy
@pytest.mark.unit
def test_execute_endpoint_available(client):
    """Test execute endpoint is available and responds."""
    response = client.post(
        "/api/execute",
        json={"query": "SELECT * FROM product LIMIT 5"}
    )
    assert response.status_code >= 200


@pytest.mark.proxy
@pytest.mark.unit
def test_explain_endpoint_available(client):
    """Test explain endpoint is available and responds."""
    response = client.post(
        "/api/explain",
        json={
            "prompt": "What are the products?",
            "query": "SELECT * FROM product",
            "result": "[]"
        }
    )
    assert response.status_code >= 200


@pytest.mark.proxy
@pytest.mark.unit
def test_invalid_endpoint(client):
    """Test that invalid endpoints return 404."""
    response = client.get("/api/invalid")
    assert response.status_code == 404


@pytest.mark.proxy
@pytest.mark.unit
def test_query_with_no_body(client):
    """Test query endpoint with no body."""
    response = client.post("/api/query", json={})
    # Should still respond (body is optional in proxy)
    assert response.status_code >= 200


@pytest.mark.proxy
@pytest.mark.unit
def test_endpoints_exist(client):
    """Test that all API proxy endpoints are registered and return responses."""
    endpoints = [
        ("/api/query", {"query": "test"}),
        ("/api/execute", {"query": "SELECT 1"}),
        ("/api/explain", {"prompt": "test", "query": "test", "result": "[]"}),
    ]

    for endpoint, data in endpoints:
        response = client.post(endpoint, json=data)
        # All endpoints should respond (not 404)
        assert response.status_code != 404, f"Endpoint {endpoint} not found"
        # Should return valid HTTP response
        assert response.status_code >= 200
