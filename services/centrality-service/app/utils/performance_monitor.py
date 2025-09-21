"""
Performance monitoring utilities for centrality service
"""

import time
import logging
from typing import Dict, Any, List, Optional
from collections import defaultdict, deque
import threading
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class OperationMetrics:
    """Metrics for a single operation"""
    operation_name: str
    execution_time: float
    timestamp: datetime
    metadata: Dict[str, Any]
    success: bool = True


class PerformanceMonitor:
    """Monitor and track performance metrics"""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.operation_history: deque = deque(maxlen=max_history)
        self.operation_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            'count': 0,
            'total_time': 0.0,
            'min_time': float('inf'),
            'max_time': 0.0,
            'avg_time': 0.0,
            'success_count': 0,
            'error_count': 0,
            'last_execution': None
        })
        self.lock = threading.Lock()
        self.logger = logging.getLogger(__name__)
    
    def record_operation(self, operation_name: str, execution_time: float, 
                        metadata: Optional[Dict[str, Any]] = None, success: bool = True):
        """
        Record an operation's performance metrics
        
        Args:
            operation_name: Name of the operation
            execution_time: Execution time in seconds
            metadata: Additional metadata about the operation
            success: Whether the operation was successful
        """
        if metadata is None:
            metadata = {}
        
        timestamp = datetime.now()
        metrics = OperationMetrics(
            operation_name=operation_name,
            execution_time=execution_time,
            timestamp=timestamp,
            metadata=metadata,
            success=success
        )
        
        with self.lock:
            # Add to history
            self.operation_history.append(metrics)
            
            # Update statistics
            stats = self.operation_stats[operation_name]
            stats['count'] += 1
            stats['total_time'] += execution_time
            stats['min_time'] = min(stats['min_time'], execution_time)
            stats['max_time'] = max(stats['max_time'], execution_time)
            stats['avg_time'] = stats['total_time'] / stats['count']
            stats['last_execution'] = timestamp
            
            if success:
                stats['success_count'] += 1
            else:
                stats['error_count'] += 1
        
        self.logger.debug(f"Recorded operation {operation_name}: {execution_time:.3f}s")
    
    def get_operation_stats(self, operation_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get performance statistics for operations
        
        Args:
            operation_name: Specific operation name, or None for all operations
            
        Returns:
            Dictionary with performance statistics
        """
        with self.lock:
            if operation_name:
                return dict(self.operation_stats.get(operation_name, {}))
            else:
                return dict(self.operation_stats)
    
    def get_recent_operations(self, minutes: int = 60) -> List[OperationMetrics]:
        """
        Get operations from the last N minutes
        
        Args:
            minutes: Number of minutes to look back
            
        Returns:
            List of recent operation metrics
        """
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        
        with self.lock:
            return [op for op in self.operation_history if op.timestamp >= cutoff_time]
    
    def get_operation_summary(self) -> Dict[str, Any]:
        """
        Get a summary of all operations
        
        Returns:
            Dictionary with operation summary
        """
        with self.lock:
            total_operations = len(self.operation_history)
            total_time = sum(op.execution_time for op in self.operation_history)
            success_count = sum(1 for op in self.operation_history if op.success)
            
            return {
                'total_operations': total_operations,
                'total_execution_time': total_time,
                'average_execution_time': total_time / total_operations if total_operations > 0 else 0,
                'success_rate': success_count / total_operations if total_operations > 0 else 0,
                'operations_by_type': dict(self.operation_stats),
                'last_updated': datetime.now().isoformat()
            }
    
    def get_slow_operations(self, threshold: float = 1.0) -> List[OperationMetrics]:
        """
        Get operations that took longer than the threshold
        
        Args:
            threshold: Time threshold in seconds
            
        Returns:
            List of slow operations
        """
        with self.lock:
            return [op for op in self.operation_history if op.execution_time > threshold]
    
    def clear_history(self):
        """Clear operation history"""
        with self.lock:
            self.operation_history.clear()
            self.operation_stats.clear()
    
    def export_metrics(self) -> Dict[str, Any]:
        """
        Export all metrics in a structured format
        
        Returns:
            Dictionary with all metrics
        """
        with self.lock:
            return {
                'summary': self.get_operation_summary(),
                'operation_stats': dict(self.operation_stats),
                'recent_operations': [
                    {
                        'operation_name': op.operation_name,
                        'execution_time': op.execution_time,
                        'timestamp': op.timestamp.isoformat(),
                        'success': op.success,
                        'metadata': op.metadata
                    }
                    for op in list(self.operation_history)[-100:]  # Last 100 operations
                ]
            }


class PerformanceTimer:
    """Context manager for timing operations"""
    
    def __init__(self, monitor: PerformanceMonitor, operation_name: str, 
                 metadata: Optional[Dict[str, Any]] = None):
        self.monitor = monitor
        self.operation_name = operation_name
        self.metadata = metadata or {}
        self.start_time = None
        self.success = True
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time is not None:
            execution_time = time.time() - self.start_time
            self.success = exc_type is None
            
            self.monitor.record_operation(
                operation_name=self.operation_name,
                execution_time=execution_time,
                metadata=self.metadata,
                success=self.success
            )
    
    def add_metadata(self, key: str, value: Any):
        """Add metadata to the operation"""
        self.metadata[key] = value


# Global performance monitor instance
performance_monitor = PerformanceMonitor()
