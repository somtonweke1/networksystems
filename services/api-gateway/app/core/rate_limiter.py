"""
Rate limiting implementation using slowapi
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

# Rate limit exceeded handler
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler"""
    logger.warning(f"Rate limit exceeded for {get_remote_address(request)}")
    return {
        "error": "Rate limit exceeded",
        "detail": f"Rate limit of {exc.detail} exceeded",
        "retry_after": exc.retry_after
    }

# Set the handler
limiter._rate_limit_exceeded_handler = rate_limit_exceeded_handler
