"""
Authentication middleware
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for API Gateway"""
    
    # Public endpoints that don't require authentication
    PUBLIC_ENDPOINTS = {
        "/",
        "/docs",
        "/redoc",
        "/api/v1/health",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/metrics"
    }
    
    async def dispatch(self, request: Request, call_next):
        """Process request through authentication middleware"""
        
        # Skip authentication for public endpoints
        if request.url.path in self.PUBLIC_ENDPOINTS:
            return await call_next(request)
        
        # Extract authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            raise HTTPException(
                status_code=401,
                detail="Authorization header required"
            )
        
        # Validate token format
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format"
            )
        
        # Extract token
        token = auth_header.split(" ")[1]
        
        # TODO: Validate token with auth service
        # For now, just pass through
        request.state.user_token = token
        
        return await call_next(request)
