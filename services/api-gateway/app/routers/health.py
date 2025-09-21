"""
Health Check Router
"""

from fastapi import APIRouter
from datetime import datetime
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "NetworkOracle Pro - API Gateway",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with service status"""
    
    try:
        import httpx
        
        services = {
            "centrality": settings.CENTRALITY_SERVICE_URL,
            "analysis": settings.ANALYSIS_SERVICE_URL,
            "visualization": settings.VISUALIZATION_SERVICE_URL,
            "auth": settings.AUTH_SERVICE_URL
        }
        
        service_status = {}
        
        async with httpx.AsyncClient() as client:
            for service_name, service_url in services.items():
                try:
                    response = await client.get(
                        f"{service_url}/api/v1/health",
                        timeout=5.0
                    )
                    service_status[service_name] = {
                        "status": "healthy" if response.status_code == 200 else "unhealthy",
                        "url": service_url,
                        "response_time_ms": float(response.headers.get("X-Process-Time", 0)) * 1000
                    }
                except Exception as e:
                    service_status[service_name] = {
                        "status": "unreachable",
                        "url": service_url,
                        "error": str(e)
                    }
        
        overall_status = "healthy" if all(
            s["status"] == "healthy" for s in service_status.values()
        ) else "degraded"
        
        return {
            "status": overall_status,
            "service": "NetworkOracle Pro - API Gateway",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": settings.ENVIRONMENT,
            "services": service_status,
            "gateway": {
                "status": "healthy",
                "rate_limiting": "enabled",
                "monitoring": "enabled" if settings.ENABLE_METRICS else "disabled"
            }
        }
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
