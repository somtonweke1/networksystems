"""
Centrality Analysis API Endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import uuid

from app.models.centrality import (
    NetworkData, CentralityType, CentralityParameters, 
    CentralityAnalysis, BatchCentralityRequest, BatchCentralityResponse,
    AlgorithmInfo, PerformanceMetrics
)
from app.services.centrality_algorithms import CentralityEngine
from app.core.cache import cache_manager
from app.core.celery_app import calculate_batch_centrality

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize centrality engine
centrality_engine = CentralityEngine()

@router.post("/calculate", response_model=CentralityAnalysis)
async def calculate_centrality(
    network: NetworkData,
    algorithm: CentralityType,
    params: Optional[CentralityParameters] = None,
    background_tasks: BackgroundTasks = None
):
    """Calculate centrality for a single algorithm"""
    
    try:
        # Validate network size
        if len(network.nodes) > 10000:
            raise HTTPException(
                status_code=400, 
                detail="Network too large. Maximum 10,000 nodes allowed for real-time processing."
            )
        
        # Set default parameters
        if params is None:
            params = CentralityParameters(algorithm=algorithm)
        
        # Check cache
        cache_key = f"centrality:{algorithm}:{hash(str(network.dict()))}"
        cached_result = await cache_manager.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached result for {algorithm}")
            return cached_result
        
        # Calculate centrality
        start_time = datetime.utcnow()
        results = centrality_engine.calculate_centrality(network, algorithm, params)
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Create analysis result
        analysis = CentralityAnalysis(
            algorithm=algorithm,
            results=results,
            metadata={
                "parameters": params.dict(),
                "network_size": len(network.nodes),
                "edge_count": len(network.edges),
                "directed": network.directed
            },
            execution_time=execution_time,
            network_stats={
                "nodes": len(network.nodes),
                "edges": len(network.edges),
                "density": len(network.edges) / (len(network.nodes) * (len(network.nodes) - 1) / 2) if network.nodes else 0
            }
        )
        
        # Cache result
        await cache_manager.set(cache_key, analysis, ttl=3600)
        
        logger.info(f"Calculated {algorithm} for {len(network.nodes)} nodes in {execution_time:.3f}s")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error calculating centrality: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate/batch", response_model=BatchCentralityResponse)
async def calculate_batch_centrality_endpoint(
    request: BatchCentralityRequest,
    background_tasks: BackgroundTasks
):
    """Calculate centrality for multiple algorithms (background task)"""
    
    try:
        # Validate network size
        if len(request.network.nodes) > 50000:
            raise HTTPException(
                status_code=400,
                detail="Network too large. Maximum 50,000 nodes allowed for batch processing."
            )
        
        # Generate task ID
        task_id = str(uuid.uuid4())
        
        # Queue background task
        task = calculate_batch_centrality.delay(
            task_id=task_id,
            network_data=request.network.dict(),
            algorithms=[algo.value for algo in request.algorithms],
            parameters={algo.value: params.dict() for algo, params in request.parameters.items()},
            priority=request.priority
        )
        
        logger.info(f"Queued batch centrality task {task_id} with {len(request.algorithms)} algorithms")
        
        return BatchCentralityResponse(
            task_id=task_id,
            status="queued",
            estimated_completion=datetime.utcnow(),
            message=f"Batch processing queued for {len(request.algorithms)} algorithms"
        )
        
    except Exception as e:
        logger.error(f"Error queuing batch centrality: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/algorithms", response_model=List[AlgorithmInfo])
async def get_available_algorithms():
    """Get list of available centrality algorithms"""
    
    algorithms = []
    for algo_type in CentralityType:
        info = centrality_engine.get_algorithm_info(algo_type)
        algorithms.append(AlgorithmInfo(
            name=algo_type,
            **info
        ))
    
    return algorithms

@router.get("/algorithms/{algorithm}", response_model=AlgorithmInfo)
async def get_algorithm_info(algorithm: CentralityType):
    """Get detailed information about a specific algorithm"""
    
    info = centrality_engine.get_algorithm_info(algorithm)
    return AlgorithmInfo(name=algorithm, **info)

@router.get("/task/{task_id}/status")
async def get_task_status(task_id: str):
    """Get status of a batch processing task"""
    
    try:
        from app.core.celery_app import celery_app
        task_result = celery_app.AsyncResult(task_id)
        
        return {
            "task_id": task_id,
            "status": task_result.status,
            "result": task_result.result if task_result.ready() else None,
            "progress": task_result.info.get("progress", 0) if task_result.info else 0
        }
        
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
async def compare_algorithms(
    network: NetworkData,
    algorithms: List[CentralityType],
    top_n: int = 10
):
    """Compare multiple centrality algorithms"""
    
    try:
        if len(algorithms) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 algorithms allowed for comparison"
            )
        
        results = {}
        
        for algorithm in algorithms:
            analysis = await calculate_centrality(network, algorithm)
            results[algorithm.value] = {
                "top_nodes": analysis.results[:top_n],
                "execution_time": analysis.execution_time,
                "metadata": analysis.metadata
            }
        
        return {
            "network_stats": {
                "nodes": len(network.nodes),
                "edges": len(network.edges),
                "algorithms_compared": len(algorithms)
            },
            "results": results,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error comparing algorithms: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/{algorithm}")
async def get_algorithm_performance(algorithm: CentralityType):
    """Get performance metrics for an algorithm"""
    
    # This would typically come from a metrics database
    # For now, return estimated performance data
    performance_data = {
        CentralityType.DEGREE: {"complexity": "O(n)", "typical_time_ms": 1},
        CentralityType.BETWEENNESS: {"complexity": "O(n³)", "typical_time_ms": 1000},
        CentralityType.CLOSENESS: {"complexity": "O(n²)", "typical_time_ms": 100},
        CentralityType.EIGENVECTOR: {"complexity": "O(n²)", "typical_time_ms": 500},
        CentralityType.PAGERANK: {"complexity": "O(n²)", "typical_time_ms": 300},
    }
    
    data = performance_data.get(algorithm, {
        "complexity": "O(n²)",
        "typical_time_ms": 500
    })
    
    return PerformanceMetrics(
        execution_time=data["typical_time_ms"] / 1000,
        memory_usage=100,  # MB
        algorithm_complexity=data["complexity"],
        scalability=data["complexity"],
        node_count=1000,
        edge_count=5000
    )