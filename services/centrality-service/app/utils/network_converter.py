"""
Network conversion utilities for converting between different network formats
"""

import networkx as nx
from typing import Dict, Any, List, Optional
from app.schemas.centrality import NetworkSchema, NodeSchema, EdgeSchema


class NetworkConverter:
    """Convert between different network representations"""
    
    def to_networkx(self, network: NetworkSchema) -> nx.Graph:
        """
        Convert NetworkSchema to NetworkX graph
        
        Args:
            network: Network schema object
            
        Returns:
            NetworkX graph object
        """
        # Determine graph type
        if network.type.lower() in ['directed', 'digraph']:
            graph = nx.DiGraph()
        elif network.type.lower() in ['multigraph', 'multi']:
            graph = nx.MultiGraph()
        elif network.type.lower() in ['multidigraph', 'multi_directed']:
            graph = nx.MultiDiGraph()
        else:
            graph = nx.Graph()
        
        # Add nodes
        for node in network.nodes:
            node_attrs = node.properties or {}
            if node.label:
                node_attrs['label'] = node.label
            
            graph.add_node(node.id, **node_attrs)
        
        # Add edges
        for edge in network.edges:
            edge_attrs = edge.properties or {}
            if edge.weight is not None:
                edge_attrs['weight'] = edge.weight
            
            graph.add_edge(edge.source, edge.target, **edge_attrs)
        
        return graph
    
    def from_networkx(self, graph: nx.Graph, network_id: str, name: str, 
                     description: Optional[str] = None) -> NetworkSchema:
        """
        Convert NetworkX graph to NetworkSchema
        
        Args:
            graph: NetworkX graph object
            network_id: Network identifier
            name: Network name
            description: Network description
            
        Returns:
            Network schema object
        """
        # Determine graph type
        if isinstance(graph, nx.DiGraph):
            graph_type = 'directed'
        elif isinstance(graph, nx.MultiGraph):
            graph_type = 'multigraph'
        elif isinstance(graph, nx.MultiDiGraph):
            graph_type = 'multidigraph'
        else:
            graph_type = 'undirected'
        
        # Convert nodes
        nodes = []
        for node_id in graph.nodes():
            node_data = graph.nodes[node_id]
            label = node_data.get('label', node_id)
            properties = {k: v for k, v in node_data.items() if k != 'label'}
            
            nodes.append(NodeSchema(
                id=node_id,
                label=label,
                properties=properties
            ))
        
        # Convert edges
        edges = []
        for edge_id, (source, target) in enumerate(graph.edges()):
            edge_data = graph.edges[source, target]
            weight = edge_data.get('weight')
            properties = {k: v for k, v in edge_data.items() if k != 'weight'}
            
            edges.append(EdgeSchema(
                id=str(edge_id),
                source=source,
                target=target,
                weight=weight,
                properties=properties
            ))
        
        return NetworkSchema(
            id=network_id,
            name=name,
            description=description,
            type=graph_type,
            nodes=nodes,
            edges=edges
        )
    
    def validate_network(self, network: NetworkSchema) -> Dict[str, Any]:
        """
        Validate network structure and properties
        
        Args:
            network: Network schema object
            
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "metrics": {}
        }
        
        # Check for duplicate node IDs
        node_ids = [node.id for node in network.nodes]
        if len(node_ids) != len(set(node_ids)):
            validation_results["valid"] = False
            validation_results["errors"].append("Duplicate node IDs found")
        
        # Check for duplicate edge IDs
        edge_ids = [edge.id for edge in network.edges]
        if len(edge_ids) != len(set(edge_ids)):
            validation_results["valid"] = False
            validation_results["errors"].append("Duplicate edge IDs found")
        
        # Check for orphaned edges (edges referencing non-existent nodes)
        node_id_set = set(node_ids)
        for edge in network.edges:
            if edge.source not in node_id_set:
                validation_results["valid"] = False
                validation_results["errors"].append(f"Edge {edge.id} references non-existent source node {edge.source}")
            if edge.target not in node_id_set:
                validation_results["valid"] = False
                validation_results["errors"].append(f"Edge {edge.id} references non-existent target node {edge.target}")
        
        # Check for self-loops in undirected graphs
        if network.type.lower() in ['undirected', 'graph']:
            for edge in network.edges:
                if edge.source == edge.target:
                    validation_results["warnings"].append(f"Self-loop detected in undirected graph: edge {edge.id}")
        
        # Compute basic metrics
        validation_results["metrics"] = {
            "node_count": len(network.nodes),
            "edge_count": len(network.edges),
            "density": self._calculate_density(len(network.nodes), len(network.edges), network.type),
            "has_weights": any(edge.weight is not None for edge in network.edges),
            "has_labels": any(node.label for node in network.nodes)
        }
        
        return validation_results
    
    def _calculate_density(self, nodes: int, edges: int, graph_type: str) -> float:
        """Calculate network density"""
        if nodes <= 1:
            return 0.0
        
        if graph_type.lower() in ['directed', 'digraph']:
            max_edges = nodes * (nodes - 1)
        else:
            max_edges = nodes * (nodes - 1) / 2
        
        return edges / max_edges if max_edges > 0 else 0.0
    
    def convert_edge_list(self, edge_list: List[tuple], network_id: str, name: str,
                         directed: bool = False, weighted: bool = False) -> NetworkSchema:
        """
        Convert edge list to NetworkSchema
        
        Args:
            edge_list: List of edges as tuples (source, target) or (source, target, weight)
            network_id: Network identifier
            name: Network name
            directed: Whether the graph is directed
            weighted: Whether edges have weights
            
        Returns:
            Network schema object
        """
        # Extract unique nodes
        nodes = set()
        for edge in edge_list:
            nodes.add(edge[0])
            nodes.add(edge[1])
        
        # Create nodes
        node_schemas = [NodeSchema(id=node_id) for node_id in sorted(nodes)]
        
        # Create edges
        edge_schemas = []
        for i, edge in enumerate(edge_list):
            if weighted and len(edge) >= 3:
                edge_schema = EdgeSchema(
                    id=str(i),
                    source=edge[0],
                    target=edge[1],
                    weight=float(edge[2])
                )
            else:
                edge_schema = EdgeSchema(
                    id=str(i),
                    source=edge[0],
                    target=edge[1]
                )
            edge_schemas.append(edge_schema)
        
        return NetworkSchema(
            id=network_id,
            name=name,
            type='directed' if directed else 'undirected',
            nodes=node_schemas,
            edges=edge_schemas
        )
    
    def convert_adjacency_matrix(self, matrix: List[List[float]], node_labels: List[str],
                               network_id: str, name: str, directed: bool = False) -> NetworkSchema:
        """
        Convert adjacency matrix to NetworkSchema
        
        Args:
            matrix: Adjacency matrix as list of lists
            node_labels: Labels for nodes
            network_id: Network identifier
            name: Network name
            directed: Whether the graph is directed
            
        Returns:
            Network schema object
        """
        n = len(matrix)
        if len(node_labels) != n:
            raise ValueError("Number of node labels must match matrix size")
        
        # Create nodes
        nodes = [NodeSchema(id=label) for label in node_labels]
        
        # Create edges
        edges = []
        edge_id = 0
        for i in range(n):
            for j in range(n):
                weight = matrix[i][j]
                if weight != 0:  # Non-zero entry indicates an edge
                    edges.append(EdgeSchema(
                        id=str(edge_id),
                        source=node_labels[i],
                        target=node_labels[j],
                        weight=weight
                    ))
                    edge_id += 1
        
        return NetworkSchema(
            id=network_id,
            name=name,
            type='directed' if directed else 'undirected',
            nodes=nodes,
            edges=edges
        )
