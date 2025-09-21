"""
API v1 router configuration
"""

from fastapi import APIRouter
from app.api.v1.endpoints import centrality

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    centrality.router,
    prefix="/centrality",
    tags=["centrality"]
)
