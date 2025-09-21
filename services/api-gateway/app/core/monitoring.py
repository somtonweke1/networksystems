"""
Monitoring and metrics collection
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'http_active_connections',
    'Number of active HTTP connections'
)

SERVICE_HEALTH = Gauge(
    'service_health_status',
    'Health status of microservices',
    ['service_name']
)

class MetricsCollector:
    """Metrics collection and monitoring"""
    
    def __init__(self):
        self.metrics_enabled = True
    
    def record_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Record HTTP request metrics"""
        if not self.metrics_enabled:
            return
        
        REQUEST_COUNT.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
    
    def set_service_health(self, service_name: str, status: int):
        """Set service health status (1=healthy, 0=unhealthy)"""
        if not self.metrics_enabled:
            return
        
        SERVICE_HEALTH.labels(service_name=service_name).set(status)
    
    def get_metrics(self) -> str:
        """Get Prometheus metrics"""
        return generate_latest().decode('utf-8')

# Global metrics collector
metrics_collector = MetricsCollector()
