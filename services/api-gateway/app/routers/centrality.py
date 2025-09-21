"""
Centrality API Router - Proxies requests to centrality service
"""

from fastapi import APIRouter, Request, HTTPException, Depends
import httpx
import logging
from typing import Any, Dict

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/centrality/calculate")
async def calculate_centrality(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Calculate centrality - proxy to centrality service"""
    
    try:
        # Get request body
        body = await request.json()
        
        # Forward to centrality service
        response = await http_client.post(
            f"{settings.CENTRALITY_SERVICE_URL}/api/v1/calculate",
            json=body,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Centrality service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Centrality service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying centrality request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/centrality/calculate/batch")
async def calculate_batch_centrality(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Calculate batch centrality - proxy to centrality service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.CENTRALITY_SERVICE_URL}/api/v1/calculate/batch",
            json=body,
            timeout=60.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Centrality service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Centrality service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying batch centrality request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.get("/centrality/algorithms")
async def get_available_algorithms(
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Get available algorithms - proxy to centrality service"""
    
    try:
        response = await http_client.get(
            f"{settings.CENTRALITY_SERVICE_URL}/api/v1/algorithms",
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Centrality service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Centrality service timeout"
        )
    except Exception as e:
        logger.error(f"Error getting algorithms: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.get("/centrality/task/{task_id}/status")
async def get_task_status(
    task_id: str,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Get task status - proxy to centrality service"""
    
    try:
        response = await http_client.get(
            f"{settings.CENTRALITY_SERVICE_URL}/api/v1/task/{task_id}/status",
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Centrality service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Centrality service timeout"
        )
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )
