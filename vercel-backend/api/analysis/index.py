"""
NetworkOracle Pro - Analysis API for Vercel
"""

from http.server import BaseHTTPRequestHandler
import json
import networkx as nx
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    
    def do_POST(self):
        """Handle POST requests for network analysis"""
        
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            network_data = request_data.get("network", {})
            analysis_type = request_data.get("type", "metrics")
            
            # Convert to NetworkX graph
            G = nx.Graph()
            
            # Add nodes
            for node in network_data.get("nodes", []):
                G.add_node(node["id"], **node.get("attributes", {}))
            
            # Add edges
            for edge in network_data.get("edges", []):
                G.add_edge(
                    edge["source"], 
                    edge["target"], 
                    weight=edge.get("weight", 1.0)
                )
            
            if analysis_type == "metrics":
                # Calculate network metrics
                metrics = {
                    "basic_metrics": {
                        "nodes": G.number_of_nodes(),
                        "edges": G.number_of_edges(),
                        "density": nx.density(G),
                        "is_connected": nx.is_connected(G)
                    },
                    "degree_metrics": {
                        "average_degree": sum(dict(G.degree()).values()) / G.number_of_nodes() if G.number_of_nodes() > 0 else 0,
                        "degree_centralization": dict(nx.degree_centrality(G))
                    },
                    "clustering_metrics": {
                        "average_clustering": nx.average_clustering(G),
                        "transitivity": nx.transitivity(G)
                    }
                }
                
                # Add path metrics if connected
                if nx.is_connected(G):
                    metrics["path_metrics"] = {
                        "average_path_length": nx.average_shortest_path_length(G),
                        "diameter": nx.diameter(G),
                        "radius": nx.radius(G)
                    }
                
                response = {
                    "status": "success",
                    "analysis_type": "metrics",
                    "results": metrics,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
            elif analysis_type == "communities":
                # Simple community detection using connected components
                communities = list(nx.connected_components(G))
                
                community_results = []
                for i, community in enumerate(communities):
                    community_results.append({
                        "id": i + 1,
                        "nodes": list(community),
                        "size": len(community)
                    })
                
                response = {
                    "status": "success",
                    "analysis_type": "communities",
                    "results": {
                        "algorithm": "connected_components",
                        "communities": community_results,
                        "community_count": len(communities),
                        "modularity": 0.5  # Placeholder
                    },
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            else:
                raise ValueError(f"Unknown analysis type: {analysis_type}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            error_response = {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
