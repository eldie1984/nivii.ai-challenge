from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
import httpx
from typing import Dict, Any
import logging

from app.config import settings
from app.routers.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Service URLs mapping
SERVICES = {
    "cryptocurrency": settings.CRYPTOCURRENCY_SERVICE_URL,
    "portfolio": settings.PORTFOLIO_SERVICE_URL,
    "agent": settings.AGENT_ORCHESTRATOR_URL,
}

async def proxy_request(
    service: str,
    path: str,
    method: str,
    headers: Dict[str, str] = None,
    params: Dict[str, Any] = None,
    json_data: Dict[str, Any] = None,
    current_user: dict = None
):
    """Proxy request to microservice"""
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service {service} not found")
    
    service_url = SERVICES[service]
    url = f"{service_url}{path}"
    
    # Prepare headers
    proxy_headers = {}
    if headers:
        # Filter out hop-by-hop headers
        proxy_headers = {k: v for k, v in headers.items() 
                        if k.lower() not in ['host', 'connection', 'upgrade']}
    
    # Add user info to headers if authenticated
    if current_user:
        proxy_headers['X-User-ID'] = str(current_user['id'])
        proxy_headers['X-User-Name'] = current_user['username']
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=url,
                headers=proxy_headers,
                params=params,
                json=json_data
            )
        
        # Create response with same status code and headers
        response_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ['content-encoding', 'content-length', 'transfer-encoding']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get('content-type')
        )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Service timeout")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Service {service} unavailable")
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Cryptocurrency service routes
@router.get("/cryptocurrency/prices")
async def get_crypto_prices(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get cryptocurrency prices"""
    return await proxy_request(
        service="cryptocurrency",
        path="/api/prices",
        method="GET",
        headers=dict(request.headers),
        params=dict(request.query_params),
        current_user=current_user
    )

@router.get("/cryptocurrency/{path:path}")
async def proxy_cryptocurrency_get(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy GET requests to cryptocurrency service"""
    return await proxy_request(
        service="cryptocurrency",
        path=f"/api/{path}",
        method="GET",
        headers=dict(request.headers),
        params=dict(request.query_params),
        current_user=current_user
    )

@router.post("/cryptocurrency/{path:path}")
async def proxy_cryptocurrency_post(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy POST requests to cryptocurrency service"""
    return await proxy_request(
        service="cryptocurrency",
        path=f"/api/{path}",
        method="POST",
        headers=dict(request.headers),
        json_data=await request.json(),
        current_user=current_user
    )

# Portfolio service routes
@router.get("/portfolio/{path:path}")
async def proxy_portfolio_get(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy GET requests to portfolio service"""
    return await proxy_request(
        service="portfolio",
        path=f"/api/{path}",
        method="GET",
        headers=dict(request.headers),
        params=dict(request.query_params),
        current_user=current_user
    )

@router.post("/portfolio/{path:path}")
async def proxy_portfolio_post(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy POST requests to portfolio service"""
    return await proxy_request(
        service="portfolio",
        path=f"/api/{path}",
        method="POST",
        headers=dict(request.headers),
        json_data=await request.json(),
        current_user=current_user
    )

@router.put("/portfolio/{path:path}")
async def proxy_portfolio_put(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy PUT requests to portfolio service"""
    return await proxy_request(
        service="portfolio",
        path=f"/api/{path}",
        method="PUT",
        headers=dict(request.headers),
        json_data=await request.json(),
        current_user=current_user
    )

@router.delete("/portfolio/{path:path}")
async def proxy_portfolio_delete(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy DELETE requests to portfolio service"""
    return await proxy_request(
        service="portfolio",
        path=f"/api/{path}",
        method="DELETE",
        headers=dict(request.headers),
        current_user=current_user
    )

# Agent orchestrator routes
@router.get("/agent/{path:path}")
async def proxy_agent_get(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy GET requests to agent orchestrator"""
    return await proxy_request(
        service="agent",
        path=f"/api/{path}",
        method="GET",
        headers=dict(request.headers),
        params=dict(request.query_params),
        current_user=current_user
    )

@router.post("/agent/{path:path}")
async def proxy_agent_post(
    path: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Proxy POST requests to agent orchestrator"""
    return await proxy_request(
        service="agent",
        path=f"/api/{path}",
        method="POST",
        headers=dict(request.headers),
        json_data=await request.json(),
        current_user=current_user
    )
