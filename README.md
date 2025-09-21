# NetworkOracle Pro 🚀

**Advanced Network Intelligence Platform** - Transform complex network data into actionable business insights with cutting-edge analysis tools and visualization capabilities.

## 🌟 Features

### 🔍 Advanced Network Analysis
- **15+ Centrality Algorithms**: Degree, Betweenness, Closeness, Eigenvector, Katz, PageRank, and more
- **Community Detection**: Identify clusters and communities in your networks
- **Path Analysis**: Shortest path calculations and network topology analysis
- **Real-time Processing**: Sub-second analysis for networks up to 10,000 nodes

### 📊 Interactive Visualizations
- **Force-directed Layouts**: Beautiful, interactive network visualizations
- **Multiple Layout Algorithms**: Hierarchical, circular, and geospatial layouts
- **Export Capabilities**: PNG, SVG, PDF, and interactive HTML exports
- **Customizable Styling**: Colors, sizes, and visual properties

### 🔧 Enterprise Features
- **Multi-tenant Architecture**: Secure, isolated workspaces
- **Role-based Access Control**: Granular permissions and security
- **API Management**: RESTful APIs with rate limiting and monitoring
- **Audit Logging**: Complete activity tracking and compliance

### 🚀 Performance & Scale
- **Microservices Architecture**: Scalable, containerized services
- **Real-time Collaboration**: Multiple users working simultaneously
- **Caching & Optimization**: Redis-powered performance optimization
- **Cloud-ready**: Deploy anywhere with Docker and Kubernetes

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (FastAPI)     │
│   Vercel        │    │   Port 8000     │    │   Ports 8001+   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Databases     │
                       │   PostgreSQL    │
                       │   Redis         │
                       └─────────────────┘
```

### 🎯 Services

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 8000 | Central entry point, routing, and authentication |
| **Centrality Service** | 8001 | 15+ centrality algorithms and calculations |
| **Analysis Service** | 8002 | Network metrics and community detection |
| **Visualization Service** | 8003 | Layout generation and export capabilities |
| **Auth Service** | 8004 | User authentication and authorization |
| **Storage Service** | 8005 | Data persistence and file management |
| **AI Service** | 8006 | Machine learning and predictive analytics |

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Setup
```bash
git clone https://github.com/somtonweke1/networksystems.git
cd networksystems
cp env.example .env
# Edit .env with your configuration
```

### 2. Deploy with Docker
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy all services
./deploy.sh
```

### 3. Access the Platform
- **🌐 Frontend**: [https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app](https://networkoracle-github-fof5v77vo-somtonweke1s-projects.vercel.app)
- **📚 API Docs**: http://localhost:8000/docs
- **🔍 Centrality API**: http://localhost:8001/docs
- **📊 Analysis API**: http://localhost:8002/docs

## 🛠️ Development

### Local Development Setup
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Backend Development
```bash
# Start individual services
cd services/centrality-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Run tests
pytest tests/

# Start all services with Docker
docker-compose up --build
```

## 📊 API Usage

### Calculate Centrality
```bash
curl -X POST "http://localhost:8001/api/v1/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "network": {
      "nodes": [{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}],
      "edges": [{"source": "1", "target": "2", "weight": 1.0}],
      "directed": false
    },
    "algorithm": "degree",
    "params": {"normalized": true}
  }'
```

### Batch Processing
```bash
curl -X POST "http://localhost:8001/api/v1/calculate/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "network": {...},
    "algorithms": ["degree", "betweenness", "closeness"],
    "priority": 1
  }'
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/networkoracle
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Performance
MAX_NODES=10000
MAX_EDGES=100000
TIMEOUT_SECONDS=300
```

### Docker Compose Services
```yaml
services:
  api-gateway:
    ports: ["8000:8000"]
  centrality-service:
    ports: ["8001:8001"]
  postgres:
    ports: ["5432:5432"]
  redis:
    ports: ["6379:6379"]
```

## 📈 Monitoring

### Health Checks
```bash
# Check all services
curl http://localhost:8000/api/v1/services/status

# Individual service health
curl http://localhost:8001/api/v1/health
curl http://localhost:8002/api/v1/health
```

### Metrics
- **Prometheus Metrics**: http://localhost:8000/metrics
- **Service Status**: Real-time health monitoring
- **Performance Metrics**: Response times and throughput

## 🚀 Deployment

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Deploy to cloud
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale centrality-service=3
```

### Cloud Platforms
- **Vercel**: Frontend deployment
- **Railway/Render**: Backend services
- **Supabase/Neon**: PostgreSQL database
- **Upstash**: Redis cache
- **AWS/GCP/Azure**: Full infrastructure

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
pnpm test

# Backend tests
cd services/centrality-service
pytest tests/ -v

# Integration tests
docker-compose exec api-gateway python -m pytest tests/integration/
```

### Test Coverage
```bash
# Generate coverage report
pytest --cov=app tests/
coverage html
```

## 📚 Documentation

- **API Documentation**: http://localhost:8000/docs
- **Algorithm Reference**: [docs/algorithms.md](docs/algorithms.md)
- **Deployment Guide**: [docs/deployment.md](docs/deployment.md)
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/somtonweke1/networksystems/issues)
- **Discussions**: [GitHub Discussions](https://github.com/somtonweke1/networksystems/discussions)
- **Email**: support@networkoracle.com

## 🎯 Roadmap

- [ ] **Machine Learning**: AI-powered network insights
- [ ] **Real-time Streaming**: Live network analysis
- [ ] **Mobile App**: iOS and Android applications
- [ ] **Enterprise SSO**: SAML, OAuth, LDAP integration
- [ ] **Advanced Analytics**: Predictive modeling and forecasting

---

**Built with ❤️ by the NetworkOracle Team**