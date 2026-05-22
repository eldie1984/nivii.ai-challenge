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
    "model": settings.MODEL_SERVICE_URL,
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
            if key.lower() not in ['content-encoding', 'transfer-encoding']:
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


@router.post("/query")
async def get_query(
    request: Request
):
    """Get model_query"""
    try:
        body = await request.json()
    except:
        body = None

    return await proxy_request(
        service="model",
        path="/api/query",
        method="POST",
        headers=dict(request.headers),
        params=dict(request.query_params),
        json_data=body
    )

@router.post("/execute")
async def execute_query(
    request: Request
):
    """Execute model_query"""
    try:
        body = await request.json()
    except:
        body = None

    return await proxy_request(
        service="model",
        path="/api/execute",
        method="POST",
        headers=dict(request.headers),
        params=dict(request.query_params),
        json_data=body
    )

@router.post("/explain")
async def explain_query(
    request: Request
):
    """Explain model_query"""
    try:
        body = await request.json()
    except Exception: 
        body = None
        
    # 1. Clonamos los headers originales en un diccionario común
    clean_headers = dict(request.headers)
    
    # 2. Eliminamos CUALQUIER header de longitud para forzar a la librería proxy
    # a calcular el tamaño real del body saliente.
    clean_headers.pop("content-length", None)
    clean_headers.pop("Content-Length", None)
    
    # 3. Quitamos el host viejo para evitar bloqueos de ruteo de red en Docker
    clean_headers.pop("host", None)
    clean_headers.pop("Host", None)
        
    return await proxy_request(
        service="model",
        path="/api/explain",
        method="POST",
        headers=clean_headers,  # <--- Enviamos los headers limpios de peso
        params=dict(request.query_params),
        json_data=body
    )