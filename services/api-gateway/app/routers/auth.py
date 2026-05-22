from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import asyncpg

from app.config import settings
from app.database.connection import Database

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str  # Changed from username to email
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # In a real implementation, you'd fetch user from database
    # For now, return demo user UUID from database
    return {"id": "550e8400-e29b-41d4-a716-446655440000", "username": email, "email": email}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    # In a real implementation, check if user exists and create in database
    hashed_password = get_password_hash(user.password)
    
    # Mock user creation
    return UserResponse(
        id=1,
        username=user.username,
        email=user.email,
        created_at=datetime.utcnow()
    )

@router.post("/login", response_model=dict)
async def login(user: UserLogin):
    """Authenticate user and return JWT token"""
    # In a real implementation, verify user credentials against database
    # For now, accept any credentials and use email as username for JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Return response format expected by frontend
    return {
        "success": True,
        "data": {
            "user": {
                "id": "1",
                "email": user.email,
                "firstName": "Demo",
                "lastName": "User"
            },
            "token": access_token
        }
    }

@router.get("/validate")
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user info"""
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return {"valid": False}
        
        return {
            "valid": True,
            "user": {
                "id": "1",
                "email": email,
                "firstName": "Demo",
                "lastName": "User"
            }
        }
    except JWTError:
        return {"valid": False}

@router.get("/me", response_model=UserResponse)
async def read_users_me():
    """Get current user info (simplified for demo)"""
    return UserResponse(
        id="1",
        username="demo",
        email="demo@example.com",
        created_at=datetime.utcnow()
    )
