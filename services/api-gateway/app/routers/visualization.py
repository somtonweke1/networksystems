"""
Visualization API Router - Proxies requests to visualization service
"""

from fastapi import APIRouter, Request, HTTPException, Depends
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/visualization/layout")
async def generate_layout(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Generate network layout - proxy to visualization service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.VISUALIZATION_SERVICE_URL}/api/v1/layout",
            json=body,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Visualization service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Visualization service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying layout request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/visualization/export")
async def export_visualization(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Export visualization - proxy to visualization service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.VISUALIZATION_SERVICE_URL}/api/v1/export",
            json=body,
            timeout=60.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Visualization service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Visualization service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying export request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.get("/visualization/formats")
async def get_export_formats(
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Get available export formats - proxy to visualization service"""
    
    try:
        response = await http_client.get(
            f"{settings.VISUALIZATION_SERVICE_URL}/api/v1/formats",
            timeout=10.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Visualization service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Visualization service timeout"
        )
    except Exception as e:
        logger.error(f"Error getting export formats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )
