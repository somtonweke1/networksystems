"""
NetworkOracle Pro - Analysis Service
Advanced Network Analysis and Metrics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.endpoints import health, metrics, community, paths

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
    logger.info("🚀 Starting NetworkOracle Analysis Service...")
    logger.info("✅ Analysis Service ready!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Analysis Service...")

# Create FastAPI application
app = FastAPI(
    title="NetworkOracle Pro - Analysis Service",
    description="Advanced Network Analysis and Metrics",
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

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(metrics.router, prefix="/api/v1", tags=["metrics"])
app.include_router(community.router, prefix="/api/v1", tags=["community"])
app.include_router(paths.router, prefix="/api/v1", tags=["paths"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NetworkOracle Pro - Analysis Service",
        "version": "1.0.0",
        "status": "operational",
        "features": [
            "Network Metrics Calculation",
            "Community Detection",
            "Path Analysis",
            "Clustering Analysis",
            "Network Topology Analysis"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=settings.DEBUG,
        log_level="info"
    )
