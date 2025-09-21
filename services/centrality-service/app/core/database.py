"""
Database configuration and connection management
"""

import asyncpg
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global database connection pool
_pool: Optional[asyncpg.Pool] = None

async def init_db():
    """Initialize database connection pool"""
    global _pool
    
    try:
        _pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        logger.info("Database connection pool initialized")
        
        # Create tables if they don't exist
        await create_tables()
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

async def create_tables():
    """Create database tables"""
    
    async with _pool.acquire() as conn:
        # Create centrality_results table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS centrality_results (
                id SERIAL PRIMARY KEY,
                task_id VARCHAR(255) UNIQUE NOT NULL,
                algorithm VARCHAR(100) NOT NULL,
                network_hash VARCHAR(255) NOT NULL,
                results JSONB NOT NULL,
                execution_time FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
            );
        """)
        
        # Create performance_metrics table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS performance_metrics (
                id SERIAL PRIMARY KEY,
                algorithm VARCHAR(100) NOT NULL,
                node_count INTEGER NOT NULL,
                edge_count INTEGER NOT NULL,
                execution_time FLOAT NOT NULL,
                memory_usage FLOAT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_centrality_results_task_id 
            ON centrality_results(task_id);
        """)
        
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_centrality_results_algorithm 
            ON centrality_results(algorithm);
        """)
        
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_centrality_results_expires_at 
            ON centrality_results(expires_at);
        """)
        
        logger.info("Database tables created successfully")

async def get_pool() -> asyncpg.Pool:
    """Get database connection pool"""
    if _pool is None:
        await init_db()
    return _pool

async def close_db():
    """Close database connection pool"""
    global _pool
    
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database connection pool closed")

async def execute_query(query: str, *args):
    """Execute a database query"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)

async def fetch_one(query: str, *args):
    """Fetch one row from database"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def fetch_all(query: str, *args):
    """Fetch all rows from database"""
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)