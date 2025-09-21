"""
Redis client for caching and session management
"""

import redis.asyncio as redis
import json
import logging
from typing import Any, Optional, Union
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Redis client
_redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize Redis connection"""
    global _redis_client
    
    try:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Test connection
        await _redis_client.ping()
        logger.info("Redis connection initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Redis: {str(e)}")
        raise

async def get_redis() -> redis.Redis:
    """Get Redis client"""
    if _redis_client is None:
        await init_redis()
    return _redis_client

async def close_redis():
    """Close Redis connection"""
    global _redis_client
    
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")

class RedisCache:
    """Redis cache manager"""
    
    def __init__(self, key_prefix: str = "networkoracle:"):
        self.key_prefix = key_prefix
    
    def _make_key(self, key: str) -> str:
        """Create prefixed key"""
        return f"{self.key_prefix}{key}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            redis_client = await get_redis()
            value = await redis_client.get(self._make_key(key))
            
            if value is None:
                return None
            
            # Try to parse as JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
                
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache"""
        try:
            redis_client = await get_redis()
            
            # Serialize value
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            # Set with TTL
            if ttl:
                await redis_client.setex(self._make_key(key), ttl, value)
            else:
                await redis_client.set(self._make_key(key), value)
            
            return True
            
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            redis_client = await get_redis()
            result = await redis_client.delete(self._make_key(key))
            return result > 0
            
        except Exception as e:
            logger.error(f"Redis delete error: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            redis_client = await get_redis()
            result = await redis_client.exists(self._make_key(key))
            return result > 0
            
        except Exception as e:
            logger.error(f"Redis exists error: {str(e)}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment counter"""
        try:
            redis_client = await get_redis()
            return await redis_client.incrby(self._make_key(key), amount)
            
        except Exception as e:
            logger.error(f"Redis increment error: {str(e)}")
            return None
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for key"""
        try:
            redis_client = await get_redis()
            result = await redis_client.expire(self._make_key(key), ttl)
            return result
            
        except Exception as e:
            logger.error(f"Redis expire error: {str(e)}")
            return False

# Global cache manager instance
cache_manager = RedisCache()

# Specialized caches
centrality_cache = RedisCache("centrality:")
session_cache = RedisCache("session:")
metrics_cache = RedisCache("metrics:")
