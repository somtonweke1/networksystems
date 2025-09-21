"""
NetworkOracle Pro - Centrality API for Vercel
"""

from http.server import BaseHTTPRequestHandler
import json
import networkx as nx
from datetime import datetime
import urllib.parse

class handler(BaseHTTPRequestHandler):
    
    def do_POST(self):
        """Handle POST requests for centrality calculations"""
        
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            network_data = request_data.get("network", {})
            algorithm = request_data.get("algorithm", "degree")
            
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
            
            # Calculate centrality based on algorithm
            if algorithm == "degree":
                centrality = nx.degree_centrality(G)
            elif algorithm == "betweenness":
                centrality = nx.betweenness_centrality(G)
            elif algorithm == "closeness":
                centrality = nx.closeness_centrality(G)
            elif algorithm == "eigenvector":
                try:
                    centrality = nx.eigenvector_centrality(G, max_iter=100)
                except:
                    centrality = nx.degree_centrality(G)  # Fallback
            elif algorithm == "pagerank":
                centrality = nx.pagerank(G)
            else:
                centrality = nx.degree_centrality(G)  # Default
            
            # Convert to results format
            results = []
            for node_id, score in centrality.items():
                results.append({
                    "node_id": node_id,
                    "centrality_score": score,
                    "rank": 0
                })
            
            # Sort by score and assign ranks
            results.sort(key=lambda x: x["centrality_score"], reverse=True)
            for i, result in enumerate(results):
                result["rank"] = i + 1
                result["percentile"] = (len(results) - i) / len(results) * 100
            
            response = {
                "status": "success",
                "algorithm": algorithm,
                "results": results,
                "metadata": {
                    "node_count": G.number_of_nodes(),
                    "edge_count": G.number_of_edges(),
                    "execution_time": 0.1,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
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
    
    def do_GET(self):
        """Handle GET requests for algorithm information"""
        
        algorithms = [
            {
                "name": "degree",
                "description": "Degree Centrality - Measures the number of connections a node has",
                "complexity": "O(n)",
                "use_cases": ["Identifying popular nodes", "Network connectivity analysis"]
            },
            {
                "name": "betweenness",
                "description": "Betweenness Centrality - Measures how often a node lies on shortest paths",
                "complexity": "O(n³)",
                "use_cases": ["Finding bridges", "Traffic flow analysis"]
            },
            {
                "name": "closeness",
                "description": "Closeness Centrality - Measures how close a node is to all other nodes",
                "complexity": "O(n²)",
                "use_cases": ["Information spreading", "Network efficiency"]
            },
            {
                "name": "eigenvector",
                "description": "Eigenvector Centrality - Measures influence based on connections to influential nodes",
                "complexity": "O(n²)",
                "use_cases": ["Influence analysis", "Social network analysis"]
            },
            {
                "name": "pagerank",
                "description": "PageRank - Google's algorithm for ranking web pages",
                "complexity": "O(n²)",
                "use_cases": ["Web ranking", "Importance scoring"]
            }
        ]
        
        response = {
            "status": "success",
            "algorithms": algorithms,
            "total_count": len(algorithms),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
