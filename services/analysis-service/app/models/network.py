"""
Network Data Models
"""

from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class NetworkNode(BaseModel):
    """Network node representation"""
    id: str
    label: Optional[str] = None
    attributes: Dict[str, Any] = {}

class NetworkEdge(BaseModel):
    """Network edge representation"""
    source: str
    target: str
    weight: Optional[float] = 1.0
    attributes: Dict[str, Any] = {}

class NetworkData(BaseModel):
    """Network data structure"""
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    directed: bool = False
    metadata: Dict[str, Any] = {}
