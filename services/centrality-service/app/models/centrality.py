"""
Centrality Analysis Models
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from datetime import datetime

class CentralityType(str, Enum):
    """Available centrality algorithms"""
    DEGREE = "degree"
    BETWEENNESS = "betweenness"
    CLOSENESS = "closeness"
    EIGENVECTOR = "eigenvector"
    KATZ = "katz"
    PAGERANK = "pagerank"
    BONACICH_POWER = "bonacich_power"
    HITS_HUBS = "hits_hubs"
    HITS_AUTHORITIES = "hits_authorities"
    LEVERAGE = "leverage"
    LOAD = "load"
    HARMONIC = "harmonic"
    SUBGRAPH = "subgraph"
    ALPHA = "alpha"
    COMMUNICABILITY_BETWEENNESS = "communicability_betweenness"

class NetworkNode(BaseModel):
    """Network node representation"""
    id: str
    label: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)
    position: Optional[Dict[str, float]] = None

class NetworkEdge(BaseModel):
    """Network edge representation"""
    source: str
    target: str
    weight: Optional[float] = 1.0
    attributes: Dict[str, Any] = Field(default_factory=dict)

class NetworkData(BaseModel):
    """Network data structure"""
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    directed: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CentralityParameters(BaseModel):
    """Parameters for centrality calculations"""
    algorithm: CentralityType
    normalized: bool = True
    weight: Optional[str] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    max_iter: int = 100
    tolerance: float = 1e-6
    custom_params: Dict[str, Any] = Field(default_factory=dict)

class CentralityResult(BaseModel):
    """Single centrality result"""
    node_id: str
    centrality_score: float
    rank: Optional[int] = None
    percentile: Optional[float] = None

class CentralityAnalysis(BaseModel):
    """Complete centrality analysis result"""
    algorithm: CentralityType
    results: List[CentralityResult]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    network_stats: Dict[str, Any] = Field(default_factory=dict)

class BatchCentralityRequest(BaseModel):
    """Request for batch centrality calculations"""
    network: NetworkData
    algorithms: List[CentralityType]
    parameters: Dict[CentralityType, CentralityParameters] = Field(default_factory=dict)
    priority: int = 1  # 1=high, 2=medium, 3=low

class BatchCentralityResponse(BaseModel):
    """Response for batch centrality calculations"""
    task_id: str
    status: str
    estimated_completion: Optional[datetime] = None
    message: str

class PerformanceMetrics(BaseModel):
    """Performance metrics for algorithm execution"""
    execution_time: float
    memory_usage: float
    algorithm_complexity: str
    scalability: str
    node_count: int
    edge_count: int

class AlgorithmInfo(BaseModel):
    """Information about an algorithm"""
    name: CentralityType
    description: str
    complexity: str
    use_cases: List[str]
    parameters: Dict[str, Any]
    limitations: List[str]
    references: List[str]
