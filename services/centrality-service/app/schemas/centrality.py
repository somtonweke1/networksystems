"""
Pydantic schemas for centrality service
"""

from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from enum import Enum


class CentralityType(str, Enum):
    """Centrality algorithm types"""
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


class NodeSchema(BaseModel):
    """Network node schema"""
    id: str = Field(..., description="Unique node identifier")
    label: Optional[str] = Field(None, description="Node label")
    properties: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Node properties")


class EdgeSchema(BaseModel):
    """Network edge schema"""
    id: str = Field(..., description="Unique edge identifier")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    weight: Optional[float] = Field(None, description="Edge weight")
    properties: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Edge properties")


class NetworkSchema(BaseModel):
    """Network schema"""
    id: str = Field(..., description="Network identifier")
    name: str = Field(..., description="Network name")
    description: Optional[str] = Field(None, description="Network description")
    type: str = Field(..., description="Network type (directed/undirected)")
    nodes: List[NodeSchema] = Field(..., description="Network nodes")
    edges: List[EdgeSchema] = Field(..., description="Network edges")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Network metadata")


class CentralityParameters(BaseModel):
    """Parameters for centrality computation"""
    normalize: bool = Field(True, description="Whether to normalize results")
    weight: Optional[str] = Field(None, description="Edge attribute to use as weight")
    max_iter: Optional[int] = Field(100, description="Maximum iterations for iterative algorithms")
    tol: Optional[float] = Field(1e-6, description="Tolerance for convergence")
    alpha: Optional[float] = Field(0.85, description="Damping/attenuation factor")
    beta: Optional[float] = Field(1.0, description="Initial centrality values")
    k: Optional[int] = Field(None, description="Number of nodes to sample (for approximation)")
    cutoff: Optional[int] = Field(None, description="Maximum distance to consider")


class CentralityResult(BaseModel):
    """Single centrality result"""
    node_id: str = Field(..., description="Node identifier")
    value: float = Field(..., description="Centrality value")
    rank: Optional[int] = Field(None, description="Node rank")
    normalized: bool = Field(True, description="Whether value is normalized")


class CentralityAnalysis(BaseModel):
    """Complete centrality analysis result"""
    centrality_type: CentralityType = Field(..., description="Type of centrality computed")
    results: List[CentralityResult] = Field(..., description="Centrality results for all nodes")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Analysis metadata")
    execution_time: float = Field(..., description="Execution time in seconds")
    algorithm_version: str = Field("1.0.0", description="Algorithm version")
    
    @validator('results')
    def validate_results(cls, v):
        if not v:
            raise ValueError("Results cannot be empty")
        return v


class CentralityRequest(BaseModel):
    """Request for centrality computation"""
    network: NetworkSchema = Field(..., description="Network to analyze")
    centrality_types: List[CentralityType] = Field(..., description="Types of centrality to compute")
    parameters: Optional[CentralityParameters] = Field(default_factory=CentralityParameters, description="Computation parameters")
    
    @validator('centrality_types')
    def validate_centrality_types(cls, v):
        if not v:
            raise ValueError("At least one centrality type must be specified")
        return v


class CentralityResponse(BaseModel):
    """Response containing centrality analysis results"""
    success: bool = Field(True, description="Whether computation was successful")
    analyses: List[CentralityAnalysis] = Field(..., description="Centrality analyses")
    total_execution_time: float = Field(..., description="Total execution time in seconds")
    network_metrics: Dict[str, Any] = Field(default_factory=dict, description="Basic network metrics")
    timestamp: str = Field(..., description="Computation timestamp")


class BatchCentralityRequest(BaseModel):
    """Request for batch centrality computation"""
    networks: List[NetworkSchema] = Field(..., description="Networks to analyze")
    centrality_types: List[CentralityType] = Field(..., description="Types of centrality to compute")
    parameters: Optional[CentralityParameters] = Field(default_factory=CentralityParameters, description="Computation parameters")
    
    @validator('networks')
    def validate_networks(cls, v):
        if not v:
            raise ValueError("At least one network must be specified")
        return v


class BatchCentralityResponse(BaseModel):
    """Response for batch centrality computation"""
    success: bool = Field(True, description="Whether computation was successful")
    results: List[CentralityResponse] = Field(..., description="Results for each network")
    total_execution_time: float = Field(..., description="Total execution time in seconds")
    timestamp: str = Field(..., description="Computation timestamp")


class CentralityComparisonRequest(BaseModel):
    """Request for centrality comparison"""
    networks: List[NetworkSchema] = Field(..., description="Networks to compare")
    centrality_type: CentralityType = Field(..., description="Type of centrality to compare")
    parameters: Optional[CentralityParameters] = Field(default_factory=CentralityParameters, description="Computation parameters")
    comparison_method: str = Field("correlation", description="Comparison method (correlation, ranking, distribution)")


class CentralityComparisonResponse(BaseModel):
    """Response for centrality comparison"""
    success: bool = Field(True, description="Whether comparison was successful")
    comparison_type: str = Field(..., description="Type of comparison performed")
    results: Dict[str, Any] = Field(..., description="Comparison results")
    execution_time: float = Field(..., description="Execution time in seconds")
    timestamp: str = Field(..., description="Comparison timestamp")


class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = Field(False, description="Whether operation was successful")
    error_code: str = Field(..., description="Error code")
    error_message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: str = Field(..., description="Error timestamp")


class HealthCheckResponse(BaseModel):
    """Health check response schema"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: float = Field(..., description="Timestamp")
    dependencies: Optional[Dict[str, str]] = Field(None, description="Dependency statuses")
