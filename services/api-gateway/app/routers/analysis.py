"""
Analysis API Router - Proxies requests to analysis service
"""

from fastapi import APIRouter, Request, HTTPException, Depends
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analysis/network-metrics")
async def calculate_network_metrics(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Calculate network metrics - proxy to analysis service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.ANALYSIS_SERVICE_URL}/api/v1/network-metrics",
            json=body,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Analysis service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Analysis service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying analysis request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/analysis/community-detection")
async def detect_communities(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Detect communities - proxy to analysis service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.ANALYSIS_SERVICE_URL}/api/v1/community-detection",
            json=body,
            timeout=60.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Analysis service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Analysis service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying community detection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )

@router.post("/analysis/path-analysis")
async def analyze_paths(
    request: Request,
    http_client: httpx.AsyncClient = Depends(lambda: httpx.AsyncClient())
):
    """Analyze shortest paths - proxy to analysis service"""
    
    try:
        body = await request.json()
        
        response = await http_client.post(
            f"{settings.ANALYSIS_SERVICE_URL}/api/v1/path-analysis",
            json=body,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Analysis service error: {response.text}"
            )
        
        return response.json()
        
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Analysis service timeout"
        )
    except Exception as e:
        logger.error(f"Error proxying path analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Gateway error: {str(e)}"
        )
