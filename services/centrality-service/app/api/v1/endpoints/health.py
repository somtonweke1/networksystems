"""
Health Check API Endpoints
"""

from fastapi import APIRouter
from datetime import datetime
import psutil
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "NetworkOracle Pro - Centrality Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with system metrics"""
    
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Service status
        status = "healthy"
        if cpu_percent > 90:
            status = "warning"
        if memory.percent > 90:
            status = "warning"
        if disk.percent > 90:
            status = "warning"
        
        return {
            "status": status,
            "service": "NetworkOracle Pro - Centrality Service",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": settings.ENVIRONMENT,
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "disk_percent": disk.percent,
                "disk_free_gb": round(disk.free / (1024**3), 2)
            },
            "algorithms_available": 15,
            "max_nodes": settings.MAX_NODES,
            "max_edges": settings.MAX_EDGES
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/ready")
async def readiness_check():
    """Kubernetes readiness probe"""
    
    try:
        # Check if service is ready to accept requests
        # This could include database connectivity, cache connectivity, etc.
        
        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return {
            "status": "not_ready",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    
    try:
        # Simple check to see if the service is alive
        return {
            "status": "alive",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Liveness check failed: {str(e)}")
        return {
            "status": "dead",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
