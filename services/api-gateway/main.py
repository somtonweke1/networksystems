"""
NetworkOracle Pro - API Gateway
Central entry point for all microservices
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import httpx
import logging
import time
from typing import Dict, Any
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.rate_limiter import rate_limiter
from app.core.monitoring import metrics_collector
from app.middleware.auth import AuthMiddleware
from app.middleware.logging import LoggingMiddleware
from app.routers import centrality, analysis, visualization, auth, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting NetworkOracle API Gateway...")
    
    # Initialize HTTP client for service communication
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    
    logger.info("✅ API Gateway ready!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down API Gateway...")
    await app.state.http_client.aclose()

# Create FastAPI application
app = FastAPI(
    title="NetworkOracle Pro - API Gateway",
    description="Central API Gateway for NetworkOracle Pro Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# Add rate limiting
app.state.limiter = rate_limiter

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
app.include_router(centrality.router, prefix="/api/v1", tags=["centrality"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
app.include_router(visualization.router, prefix="/api/v1", tags=["visualization"])

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": time.time()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": time.time()
        }
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NetworkOracle Pro - API Gateway",
        "version": "1.0.0",
        "status": "operational",
        "services": {
            "centrality": f"{settings.CENTRALITY_SERVICE_URL}/api/v1",
            "analysis": f"{settings.ANALYSIS_SERVICE_URL}/api/v1",
            "visualization": f"{settings.VISUALIZATION_SERVICE_URL}/api/v1",
            "auth": f"{settings.AUTH_SERVICE_URL}/api/v1"
        },
        "documentation": "/docs"
    }

@app.get("/api/v1/services/status")
async def services_status():
    """Check status of all microservices"""
    
    services = {
        "centrality": settings.CENTRALITY_SERVICE_URL,
        "analysis": settings.ANALYSIS_SERVICE_URL,
        "visualization": settings.VISUALIZATION_SERVICE_URL,
        "auth": settings.AUTH_SERVICE_URL
    }
    
    status = {}
    http_client = app.state.http_client
    
    for service_name, service_url in services.items():
        try:
            response = await http_client.get(f"{service_url}/api/v1/health", timeout=5.0)
            status[service_name] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time": response.headers.get("X-Process-Time", "unknown"),
                "url": service_url
            }
        except Exception as e:
            status[service_name] = {
                "status": "unreachable",
                "error": str(e),
                "url": service_url
            }
    
    return {
        "timestamp": time.time(),
        "services": status,
        "overall_status": "healthy" if all(s["status"] == "healthy" for s in status.values()) else "degraded"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
