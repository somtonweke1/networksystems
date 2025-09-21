"""
Celery configuration for background task processing
"""

from celery import Celery
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "networkoracle_centrality",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.centrality_tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=1800,  # 30 minutes
    task_soft_time_limit=1500,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hour
    task_acks_late=True,
    worker_disable_rate_limits=False,
    task_compression="gzip",
    result_compression="gzip",
)

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.centrality_tasks.calculate_batch_centrality": {"queue": "centrality"},
    "app.tasks.centrality_tasks.calculate_single_centrality": {"queue": "centrality"},
    "app.tasks.centrality_tasks.cleanup_expired_results": {"queue": "maintenance"},
}

@celery_app.task(bind=True)
def calculate_batch_centrality(
    self,
    task_id: str,
    network_data: dict,
    algorithms: list,
    parameters: dict,
    priority: int = 1
):
    """Calculate centrality for multiple algorithms"""
    
    try:
        # Update task progress
        self.update_state(
            state="PROGRESS",
            meta={"progress": 0, "status": "Starting batch calculation"}
        )
        
        from app.services.centrality_algorithms import CentralityEngine
        from app.models.centrality import NetworkData, CentralityType, CentralityParameters
        from app.core.database import execute_query
        import json
        
        # Initialize engine
        engine = CentralityEngine()
        
        # Convert network data
        network = NetworkData(**network_data)
        
        results = {}
        total_algorithms = len(algorithms)
        
        for i, algorithm_str in enumerate(algorithms):
            try:
                algorithm = CentralityType(algorithm_str)
                params = CentralityParameters(**parameters.get(algorithm_str, {}))
                
                # Calculate centrality
                centrality_results = engine.calculate_centrality(network, algorithm, params)
                
                results[algorithm_str] = {
                    "algorithm": algorithm_str,
                    "results": [result.dict() for result in centrality_results],
                    "execution_time": 0,  # Would be calculated in real implementation
                    "metadata": {
                        "parameters": params.dict(),
                        "network_size": len(network.nodes),
                        "edge_count": len(network.edges)
                    }
                }
                
                # Update progress
                progress = int((i + 1) / total_algorithms * 100)
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "progress": progress,
                        "status": f"Completed {algorithm_str}",
                        "completed": i + 1,
                        "total": total_algorithms
                    }
                )
                
                logger.info(f"Completed {algorithm_str} for task {task_id}")
                
            except Exception as e:
                logger.error(f"Error calculating {algorithm_str}: {str(e)}")
                results[algorithm_str] = {
                    "algorithm": algorithm_str,
                    "error": str(e),
                    "status": "failed"
                }
        
        # Store results in database
        try:
            await execute_query(
                """
                INSERT INTO centrality_results 
                (task_id, algorithm, network_hash, results, execution_time)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (task_id) DO UPDATE SET
                results = EXCLUDED.results,
                execution_time = EXCLUDED.execution_time
                """,
                task_id,
                "batch",
                hash(str(network_data)),
                json.dumps(results),
                0.0  # Total execution time
            )
        except Exception as e:
            logger.error(f"Failed to store results: {str(e)}")
        
        return {
            "task_id": task_id,
            "status": "completed",
            "results": results,
            "total_algorithms": total_algorithms,
            "successful": len([r for r in results.values() if "error" not in r])
        }
        
    except Exception as e:
        logger.error(f"Batch centrality calculation failed: {str(e)}")
        self.update_state(
            state="FAILURE",
            meta={"error": str(e), "status": "Task failed"}
        )
        raise

@celery_app.task
def cleanup_expired_results():
    """Clean up expired centrality results"""
    
    try:
        from app.core.database import execute_query
        
        # Delete expired results
        result = await execute_query(
            "DELETE FROM centrality_results WHERE expires_at < NOW()"
        )
        
        logger.info(f"Cleaned up expired centrality results")
        return {"deleted_count": result}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        raise

@celery_app.task
def calculate_single_centrality(
    network_data: dict,
    algorithm: str,
    parameters: dict = None
):
    """Calculate single centrality algorithm"""
    
    try:
        from app.services.centrality_algorithms import CentralityEngine
        from app.models.centrality import NetworkData, CentralityType, CentralityParameters
        
        # Initialize engine
        engine = CentralityEngine()
        
        # Convert data
        network = NetworkData(**network_data)
        algo_type = CentralityType(algorithm)
        params = CentralityParameters(**parameters) if parameters else CentralityParameters(algorithm=algo_type)
        
        # Calculate centrality
        results = engine.calculate_centrality(network, algo_type, params)
        
        return {
            "algorithm": algorithm,
            "results": [result.dict() for result in results],
            "status": "completed"
        }
        
    except Exception as e:
        logger.error(f"Single centrality calculation failed: {str(e)}")
        raise
