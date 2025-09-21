"""
Advanced Centrality Algorithms Implementation
Academic-grade implementations with proper normalization and optimization
"""

import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Optional, Union
from numba import jit
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache

logger = logging.getLogger(__name__)


class CentralityAlgorithms:
    """
    Comprehensive centrality algorithms implementation with academic precision
    """
    
    def __init__(self):
        self.cache = {}
        self.max_cache_size = 1000
    
    def compute_all_centralities(self, graph: nx.Graph, normalize: bool = True) -> Dict[str, Dict[str, float]]:
        """
        Compute all available centrality measures for a graph
        
        Args:
            graph: NetworkX graph object
            normalize: Whether to normalize results
            
        Returns:
            Dictionary mapping centrality types to node centrality values
        """
        start_time = time.time()
        results = {}
        
        try:
            # Basic centralities
            results['degree'] = self.degree_centrality(graph, normalize)
            results['betweenness'] = self.betweenness_centrality(graph, normalize)
            results['closeness'] = self.closeness_centrality(graph, normalize)
            results['eigenvector'] = self.eigenvector_centrality(graph, normalize)
            
            # Advanced centralities
            results['katz'] = self.katz_centrality(graph, normalize)
            results['pagerank'] = self.pagerank_centrality(graph, normalize)
            results['harmonic'] = self.harmonic_centrality(graph, normalize)
            results['load'] = self.load_centrality(graph, normalize)
            
            # Power and influence measures
            results['bonacich_power'] = self.bonacich_power_centrality(graph, normalize)
            results['hits_hubs'] = self.hits_centrality(graph, 'hubs')
            results['hits_authorities'] = self.hits_centrality(graph, 'authorities')
            
            # Specialized measures
            results['leverage'] = self.leverage_centrality(graph, normalize)
            results['subgraph'] = self.subgraph_centrality(graph, normalize)
            results['alpha'] = self.alpha_centrality(graph, normalize)
            results['communicability_betweenness'] = self.communicability_betweenness_centrality(graph, normalize)
            
            execution_time = time.time() - start_time
            logger.info(f"Computed all centralities in {execution_time:.3f} seconds")
            
            return results
            
        except Exception as e:
            logger.error(f"Error computing centralities: {str(e)}")
            raise
    
    def degree_centrality(self, graph: nx.Graph, normalize: bool = True) -> Dict[str, float]:
        """
        Compute degree centrality for all nodes
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize by (n-1)
            
        Returns:
            Dictionary mapping node IDs to degree centrality values
        """
        try:
            if graph.is_directed():
                centrality = nx.degree_centrality(graph)
            else:
                centrality = nx.degree_centrality(graph)
            
            if not normalize:
                n = graph.number_of_nodes()
                centrality = {node: val * (n - 1) for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing degree centrality: {str(e)}")
            raise
    
    def betweenness_centrality(self, graph: nx.Graph, normalize: bool = True, 
                             k: Optional[int] = None, weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute betweenness centrality using Brandes algorithm
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize by (n-1)(n-2)/2 for directed, (n-1)(n-2) for undirected
            k: Number of nodes to sample (for approximation)
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to betweenness centrality values
        """
        try:
            if k is not None:
                centrality = nx.betweenness_centrality(graph, k=k, weight=weight, normalized=normalize)
            else:
                centrality = nx.betweenness_centrality(graph, weight=weight, normalized=normalize)
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing betweenness centrality: {str(e)}")
            raise
    
    def closeness_centrality(self, graph: nx.Graph, normalize: bool = True,
                           distance: Optional[str] = None, wf_improved: bool = True) -> Dict[str, float]:
        """
        Compute closeness centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize by (n-1)
            distance: Edge attribute to use as distance
            wf_improved: Whether to use Wasserman and Faust improved formula
            
        Returns:
            Dictionary mapping node IDs to closeness centrality values
        """
        try:
            centrality = nx.closeness_centrality(
                graph, 
                distance=distance, 
                wf_improved=wf_improved
            )
            
            if not normalize:
                n = graph.number_of_nodes()
                centrality = {node: val * (n - 1) for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing closeness centrality: {str(e)}")
            raise
    
    def eigenvector_centrality(self, graph: nx.Graph, normalize: bool = True,
                             max_iter: int = 100, tol: float = 1e-06,
                             weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute eigenvector centrality using power iteration
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to eigenvector centrality values
        """
        try:
            centrality = nx.eigenvector_centrality(
                graph,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if normalize:
                # Normalize by maximum value
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing eigenvector centrality: {str(e)}")
            raise
    
    def katz_centrality(self, graph: nx.Graph, normalize: bool = True,
                       alpha: float = 0.1, beta: float = 1.0,
                       max_iter: int = 1000, tol: float = 1e-06,
                       weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute Katz centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            alpha: Attenuation factor
            beta: Initial centrality values
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to Katz centrality values
        """
        try:
            centrality = nx.katz_centrality(
                graph,
                alpha=alpha,
                beta=beta,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing Katz centrality: {str(e)}")
            raise
    
    def pagerank_centrality(self, graph: nx.Graph, normalize: bool = True,
                          alpha: float = 0.85, personalization: Optional[Dict] = None,
                          max_iter: int = 100, tol: float = 1e-06,
                          weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute PageRank centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            alpha: Damping parameter
            personalization: Personalization vector
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to PageRank centrality values
        """
        try:
            centrality = nx.pagerank(
                graph,
                alpha=alpha,
                personalization=personalization,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing PageRank centrality: {str(e)}")
            raise
    
    def harmonic_centrality(self, graph: nx.Graph, normalize: bool = True,
                          distance: Optional[str] = None) -> Dict[str, float]:
        """
        Compute harmonic centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize by (n-1)
            distance: Edge attribute to use as distance
            
        Returns:
            Dictionary mapping node IDs to harmonic centrality values
        """
        try:
            centrality = nx.harmonic_centrality(graph, distance=distance)
            
            if normalize:
                n = graph.number_of_nodes()
                if n > 1:
                    centrality = {node: val / (n - 1) for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing harmonic centrality: {str(e)}")
            raise
    
    def load_centrality(self, graph: nx.Graph, normalize: bool = True,
                       weight: Optional[str] = None, cutoff: Optional[int] = None) -> Dict[str, float]:
        """
        Compute load centrality (stress centrality variant)
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            weight: Edge attribute to use as weight
            cutoff: Maximum distance to consider
            
        Returns:
            Dictionary mapping node IDs to load centrality values
        """
        try:
            centrality = nx.load_centrality(graph, weight=weight, cutoff=cutoff)
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing load centrality: {str(e)}")
            raise
    
    def bonacich_power_centrality(self, graph: nx.Graph, normalize: bool = True,
                                 alpha: float = 0.1, beta: float = 1.0,
                                 max_iter: int = 1000, tol: float = 1e-06,
                                 weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute Bonacich power centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            alpha: Attenuation factor
            beta: Initial centrality values
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to Bonacich power centrality values
        """
        try:
            centrality = nx.bonacich_power_centrality(
                graph,
                alpha=alpha,
                beta=beta,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing Bonacich power centrality: {str(e)}")
            raise
    
    def hits_centrality(self, graph: nx.Graph, mode: str = 'both',
                       max_iter: int = 100, tol: float = 1e-06,
                       weight: Optional[str] = None) -> Union[Dict[str, float], Tuple[Dict[str, float], Dict[str, float]]]:
        """
        Compute HITS (Hubs and Authorities) centrality
        
        Args:
            graph: NetworkX graph (should be directed)
            mode: 'hubs', 'authorities', or 'both'
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary or tuple of dictionaries with HITS centrality values
        """
        try:
            if not graph.is_directed():
                # Convert to directed graph for HITS algorithm
                graph = graph.to_directed()
            
            hubs, authorities = nx.hits(
                graph,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if mode == 'hubs':
                return hubs
            elif mode == 'authorities':
                return authorities
            else:
                return hubs, authorities
                
        except Exception as e:
            logger.error(f"Error computing HITS centrality: {str(e)}")
            raise
    
    def leverage_centrality(self, graph: nx.Graph, normalize: bool = True) -> Dict[str, float]:
        """
        Compute leverage centrality (neighborhood importance measure)
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            
        Returns:
            Dictionary mapping node IDs to leverage centrality values
        """
        try:
            centrality = {}
            degrees = dict(graph.degree())
            
            for node in graph.nodes():
                neighbors = list(graph.neighbors(node))
                if len(neighbors) <= 1:
                    centrality[node] = 0.0
                    continue
                
                neighbor_degrees = [degrees[neighbor] for neighbor in neighbors]
                avg_neighbor_degree = np.mean(neighbor_degrees)
                node_degree = degrees[node]
                
                # Leverage centrality: (k_i - k_avg_neighbors) / (k_i + k_avg_neighbors)
                leverage = (node_degree - avg_neighbor_degree) / (node_degree + avg_neighbor_degree)
                centrality[node] = leverage
            
            if normalize:
                # Normalize to [0, 1] range
                min_val = min(centrality.values())
                max_val = max(centrality.values())
                if max_val > min_val:
                    centrality = {
                        node: (val - min_val) / (max_val - min_val) 
                        for node, val in centrality.items()
                    }
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing leverage centrality: {str(e)}")
            raise
    
    def subgraph_centrality(self, graph: nx.Graph, normalize: bool = True) -> Dict[str, float]:
        """
        Compute subgraph centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            
        Returns:
            Dictionary mapping node IDs to subgraph centrality values
        """
        try:
            centrality = nx.subgraph_centrality(graph)
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing subgraph centrality: {str(e)}")
            raise
    
    def alpha_centrality(self, graph: nx.Graph, normalize: bool = True,
                        alpha: float = 0.85, beta: float = 1.0,
                        max_iter: int = 1000, tol: float = 1e-06,
                        weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute alpha centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            alpha: Damping factor
            beta: Initial centrality values
            max_iter: Maximum number of iterations
            tol: Tolerance for convergence
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to alpha centrality values
        """
        try:
            centrality = nx.alpha_centrality(
                graph,
                alpha=alpha,
                beta=beta,
                max_iter=max_iter,
                tol=tol,
                weight=weight
            )
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing alpha centrality: {str(e)}")
            raise
    
    def communicability_betweenness_centrality(self, graph: nx.Graph, normalize: bool = True,
                                             weight: Optional[str] = None) -> Dict[str, float]:
        """
        Compute communicability betweenness centrality
        
        Args:
            graph: NetworkX graph
            normalize: Whether to normalize the result
            weight: Edge attribute to use as weight
            
        Returns:
            Dictionary mapping node IDs to communicability betweenness centrality values
        """
        try:
            centrality = nx.communicability_betweenness_centrality(graph, weight=weight)
            
            if normalize:
                max_val = max(centrality.values()) if centrality else 1
                if max_val > 0:
                    centrality = {node: val / max_val for node, val in centrality.items()}
            
            return centrality
            
        except Exception as e:
            logger.error(f"Error computing communicability betweenness centrality: {str(e)}")
            raise


# Create global instance
centrality_algorithms = CentralityAlgorithms()
