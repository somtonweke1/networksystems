#!/bin/bash

# NetworkOracle Pro - Local Python Development Setup
# Run backend services locally without Docker

set -e

echo "🐍 Starting NetworkOracle Pro Backend Locally..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check Python version
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
if [ "$(echo "$python_version < 3.11" | bc -l)" -eq 1 ]; then
    print_warning "Python 3.11+ recommended. Current: $python_version"
fi

# Create virtual environment
print_status "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
print_status "Installing dependencies..."
pip install --upgrade pip

# Install core dependencies
pip install fastapi uvicorn httpx pydantic python-dotenv

# Install NetworkX for centrality algorithms
pip install networkx numpy scipy

# Install database dependencies
pip install asyncpg redis

# Create environment file
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Local Development Configuration
DEBUG=true
ENVIRONMENT=development

# Database (SQLite for local development)
DATABASE_URL=sqlite:///./networkoracle.db

# Redis (optional for local development)
REDIS_URL=redis://localhost:6379

# API Configuration
SECRET_KEY=dev-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Service URLs
CENTRALITY_SERVICE_URL=http://localhost:8001
ANALYSIS_SERVICE_URL=http://localhost:8002
VISUALIZATION_SERVICE_URL=http://localhost:8003
AUTH_SERVICE_URL=http://localhost:8004
EOF
    print_success "Created .env file for local development"
fi

# Create simplified main.py for local development
print_status "Creating simplified local server..."
cat > local-server.py << 'EOF'
"""
NetworkOracle Pro - Local Development Server
Simplified single-server setup for local development
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import networkx as nx
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="NetworkOracle Pro - Local Development",
    description="Simplified local development server with all features",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for development
networks_db = {}
results_db = {}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NetworkOracle Pro - Local Development Server",
        "version": "1.0.0",
        "status": "operational",
        "features": [
            "Centrality Analysis",
            "Network Metrics",
            "Community Detection",
            "Path Analysis",
            "Visualization Support"
        ],
        "endpoints": {
            "centrality": "/api/v1/centrality",
            "analysis": "/api/v1/analysis",
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "NetworkOracle Pro - Local Development",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": "development"
    }

@app.post("/api/v1/centrality/calculate")
async def calculate_centrality(request: Dict[str, Any]):
    """Calculate centrality algorithms"""
    
    try:
        network_data = request.get("network", {})
        algorithm = request.get("algorithm", "degree")
        
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
            centrality = nx.eigenvector_centrality(G)
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
                "rank": 0  # Would be calculated in real implementation
            })
        
        # Sort by score
        results.sort(key=lambda x: x["centrality_score"], reverse=True)
        for i, result in enumerate(results):
            result["rank"] = i + 1
        
        return {
            "status": "success",
            "algorithm": algorithm,
            "results": results,
            "metadata": {
                "node_count": G.number_of_nodes(),
                "edge_count": G.number_of_edges(),
                "execution_time": 0.1  # Placeholder
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating centrality: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analysis/network-metrics")
async def calculate_network_metrics(request: Dict[str, Any]):
    """Calculate network metrics"""
    
    try:
        network_data = request.get("network", {})
        
        # Convert to NetworkX graph
        G = nx.Graph()
        
        # Add nodes and edges
        for node in network_data.get("nodes", []):
            G.add_node(node["id"], **node.get("attributes", {}))
        
        for edge in network_data.get("edges", []):
            G.add_edge(
                edge["source"], 
                edge["target"], 
                weight=edge.get("weight", 1.0)
            )
        
        # Calculate metrics
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
        
        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating network metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analysis/community-detection")
async def detect_communities(request: Dict[str, Any]):
    """Detect communities in the network"""
    
    try:
        network_data = request.get("network", {})
        
        # Convert to NetworkX graph
        G = nx.Graph()
        
        for node in network_data.get("nodes", []):
            G.add_node(node["id"], **node.get("attributes", {}))
        
        for edge in network_data.get("edges", []):
            G.add_edge(
                edge["source"], 
                edge["target"], 
                weight=edge.get("weight", 1.0)
            )
        
        # Simple community detection using connected components
        communities = list(nx.connected_components(G))
        
        community_results = []
        for i, community in enumerate(communities):
            community_results.append({
                "id": i + 1,
                "nodes": list(community),
                "size": len(community)
            })
        
        return {
            "status": "success",
            "results": {
                "algorithm": "connected_components",
                "communities": community_results,
                "community_count": len(communities),
                "modularity": 0.5  # Placeholder
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error detecting communities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/algorithms")
async def get_available_algorithms():
    """Get available centrality algorithms"""
    
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
    
    return {
        "status": "success",
        "algorithms": algorithms,
        "total_count": len(algorithms)
    }

if __name__ == "__main__":
    print("🚀 Starting NetworkOracle Pro Local Development Server...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/api/v1/health")
    print("🌐 Frontend: https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app")
    print("")
    
    uvicorn.run(
        "local-server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
EOF

print_success "Created local development server"

# Create start script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting NetworkOracle Pro Backend..."
source venv/bin/activate
python local-server.py
EOF

chmod +x start-backend.sh

print_success "✅ Local development setup complete!"
print_status ""
print_status "🎯 To start the backend:"
print_status "   ./start-backend.sh"
print_status ""
print_status "📋 Available endpoints:"
print_status "   🌐 API Server: http://localhost:8000"
print_status "   📚 Documentation: http://localhost:8000/docs"
print_status "   🔍 Health Check: http://localhost:8000/api/v1/health"
print_status "   🧮 Centrality API: http://localhost:8000/api/v1/centrality/calculate"
print_status "   📊 Analysis API: http://localhost:8000/api/v1/analysis/network-metrics"
print_status ""
print_status "🌐 Frontend: https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app"
print_status ""
print_status "💡 Test with curl:"
print_status '   curl -X POST "http://localhost:8000/api/v1/centrality/calculate" \'
print_status '     -H "Content-Type: application/json" \'
print_status '     -d '"'"'{"network":{"nodes":[{"id":"1"},{"id":"2"}],"edges":[{"source":"1","target":"2"}]},"algorithm":"degree"}'"'"
print_status ""
print_success "🎉 Ready to go! Run ./start-backend.sh to start the server"
