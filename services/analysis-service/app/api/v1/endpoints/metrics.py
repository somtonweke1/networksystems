"""
Network Metrics API Endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import networkx as nx
import logging

from app.models.network import NetworkData
from app.services.network_analyzer import NetworkAnalyzer

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize network analyzer
analyzer = NetworkAnalyzer()

@router.post("/network-metrics")
async def calculate_network_metrics(network: NetworkData) -> Dict[str, Any]:
    """Calculate comprehensive network metrics"""
    
    try:
        # Convert to NetworkX graph
        G = analyzer._networkx_from_data(network)
        
        # Calculate basic metrics
        metrics = {
            "basic_metrics": {
                "nodes": G.number_of_nodes(),
                "edges": G.number_of_edges(),
                "density": nx.density(G),
                "is_connected": nx.is_connected(G) if not G.is_directed() else nx.is_weakly_connected(G)
            },
            "degree_metrics": {
                "average_degree": sum(dict(G.degree()).values()) / G.number_of_nodes() if G.number_of_nodes() > 0 else 0,
                "degree_centralization": nx.degree_centrality(G),
                "degree_assortativity": nx.degree_assortativity_coefficient(G) if not G.is_directed() else None
            },
            "path_metrics": {
                "average_path_length": nx.average_shortest_path_length(G) if nx.is_connected(G) else None,
                "diameter": nx.diameter(G) if nx.is_connected(G) else None,
                "radius": nx.radius(G) if nx.is_connected(G) else None
            },
            "clustering_metrics": {
                "average_clustering": nx.average_clustering(G),
                "transitivity": nx.transitivity(G)
            }
        }
        
        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error calculating network metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
