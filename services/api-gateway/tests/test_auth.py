import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from jose import jwt, JWTError
from datetime import datetime, timedelta


@pytest.mark.auth
@pytest.mark.unit
def test_register_user(client):
    """Test user registration endpoint."""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "id" in data
    assert "created_at" in data


@pytest.mark.auth
@pytest.mark.unit
def test_register_user_invalid_data(client):
    """Test user registration with invalid data."""
    invalid_data = {
        "username": "testuser",
        # Missing email and password
    }
    
    response = client.post("/api/auth/register", json=invalid_data)
    assert response.status_code == 422  # Validation error


@pytest.mark.auth
@pytest.mark.unit
def test_login_success(client, mock_settings):
    """Test successful user login."""
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "user" in data["data"]
    assert "token" in data["data"]
    assert data["data"]["user"]["email"] == login_data["email"]


@pytest.mark.auth
@pytest.mark.unit
def test_login_invalid_credentials(client):
    """Test login with invalid credentials (should still work in demo mode)."""
    login_data = {
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    # In demo mode, any credentials work
    assert response.status_code == 200
    assert "token" in response.json()["data"]


@pytest.mark.auth
@pytest.mark.unit
def test_validate_token_valid(client, valid_token):
    """Test token validation with valid token."""
    headers = {"Authorization": f"Bearer {valid_token}"}
    response = client.get("/api/auth/validate", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert "user" in data


@pytest.mark.auth
@pytest.mark.unit
def test_validate_token_invalid(client):
    """Test token validation with invalid token."""
    headers = {"Authorization": "Bearer invalid.token.here"}
    response = client.get("/api/auth/validate", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


@pytest.mark.auth
@pytest.mark.unit
def test_validate_token_no_token(client):
    """Test token validation without token."""
    response = client.get("/api/auth/validate")
    
    assert response.status_code == 403  # No authorization header


@pytest.mark.auth
@pytest.mark.unit
def test_validate_token_expired(client, expired_token):
    """Test token validation with expired token."""
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/auth/validate", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


@pytest.mark.auth
@pytest.mark.unit
def test_get_current_user(client):
    """Test getting current user info."""
    response = client.get("/api/auth/me")
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "username" in data
    assert "email" in data
    assert "created_at" in data


@pytest.mark.auth
@pytest.mark.unit
def test_token_creation(mock_settings):
    """Test JWT token creation."""
    from app.routers.auth import create_access_token
    
    test_data = {"sub": "test@example.com"}
    token = create_access_token(test_data)
    
    assert isinstance(token, str)
    
    # Verify token can be decoded
    payload = jwt.decode(token, mock_settings.SECRET_KEY, algorithms=[mock_settings.ALGORITHM])
    assert payload["sub"] == "test@example.com"
    assert "exp" in payload


@pytest.mark.auth
@pytest.mark.unit
def test_token_creation_with_expiry(mock_settings):
    """Test JWT token creation with custom expiry."""
    from app.routers.auth import create_access_token
    
    test_data = {"sub": "test@example.com"}
    expires_delta = timedelta(hours=1)
    token = create_access_token(test_data, expires_delta)
    
    payload = jwt.decode(token, mock_settings.SECRET_KEY, algorithms=[mock_settings.ALGORITHM])
    exp = datetime.fromtimestamp(payload["exp"])
    expected_exp = datetime.utcnow() + expires_delta
    
    # Allow for small time differences
    assert abs((exp - expected_exp).total_seconds()) < 60


@pytest.mark.auth
@pytest.mark.unit
def test_password_hashing():
    """Test password hashing and verification."""
    from app.routers.auth import get_password_hash, verify_password
    
    password = "test_password_123"
    hashed = get_password_hash(password)
    
    assert isinstance(hashed, str)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False
