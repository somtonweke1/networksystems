"""
NetworkOracle Pro - Centrality Service
Advanced Network Analysis with 15+ Centrality Algorithms
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import asyncio
from typing import List, Dict, Any, Optional
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.endpoints import centrality, health
from app.core.database import init_db
from app.core.redis_client import init_redis
from app.core.celery_app import celery_app

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
    logger.info("🚀 Starting NetworkOracle Centrality Service...")
    await init_db()
    await init_redis()
    logger.info("✅ Centrality Service ready!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Centrality Service...")

# Create FastAPI application
app = FastAPI(
    title="NetworkOracle Pro - Centrality Service",
    description="Advanced Network Analysis with 15+ Centrality Algorithms",
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

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(centrality.router, prefix="/api/v1", tags=["centrality"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NetworkOracle Pro - Centrality Service",
        "version": "1.0.0",
        "status": "operational",
        "algorithms": [
            "Degree Centrality",
            "Betweenness Centrality", 
            "Closeness Centrality",
            "Eigenvector Centrality",
            "Katz Centrality",
            "PageRank",
            "Bonacich Power Centrality",
            "HITS (Hubs & Authorities)",
            "Leverage Centrality",
            "Load Centrality",
            "Harmonic Centrality",
            "Subgraph Centrality",
            "Katz Status Index",
            "Alpha Centrality",
            "Communicability Betweenness"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        log_level="info"
    )