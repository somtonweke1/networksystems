"""
NetworkOracle Pro - Health Check API for Vercel
"""

from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        """Handle GET requests for health checks"""
        
        response = {
            "status": "healthy",
            "service": "NetworkOracle Pro - Vercel Backend",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": "production",
            "endpoints": {
                "centrality": "/api/centrality",
                "analysis": "/api/analysis",
                "health": "/api/health"
            },
            "features": [
                "Centrality Analysis",
                "Network Metrics",
                "Community Detection",
                "Path Analysis"
            ]
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
