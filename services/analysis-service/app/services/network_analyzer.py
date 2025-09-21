"""
Network Analysis Services
"""

import networkx as nx
from typing import Dict, Any
from app.models.network import NetworkData

class NetworkAnalyzer:
    """Network analysis service"""
    
    def _networkx_from_data(self, network: NetworkData) -> nx.Graph:
        """Convert NetworkData to NetworkX graph"""
        if network.directed:
            G = nx.DiGraph()
        else:
            G = nx.Graph()
        
        # Add nodes
        for node in network.nodes:
            G.add_node(node.id, **node.attributes)
        
        # Add edges
        for edge in network.edges:
            G.add_edge(
                edge.source, 
                edge.target, 
                weight=edge.weight,
                **edge.attributes
            )
        
        return G
