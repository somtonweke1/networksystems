"""
Authentication API Router - Proxies requests to auth service
"""

from fastapi import APIRouter, Request, HTTPException, Depends
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/auth/login")
async def login(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """User login - proxy to auth service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.AUTH_SERVICE_URL}/api/v1/login",
            json=body,
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Authentication service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Authentication service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying login request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/auth/register")
async def register(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """User registration - proxy to auth service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.AUTH_SERVICE_URL}/api/v1/register",
            json=body,
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Authentication service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Authentication service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying registration request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/auth/refresh")
async def refresh_token(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Refresh access token - proxy to auth service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.AUTH_SERVICE_URL}/api/v1/refresh",
            json=body,
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Authentication service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Authentication service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying refresh request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/auth/logout")
async def logout(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """User logout - proxy to auth service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.AUTH_SERVICE_URL}/api/v1/logout",
            json=body,
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Authentication service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Authentication service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying logout request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )
