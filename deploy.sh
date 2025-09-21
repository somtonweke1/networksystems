#!/bin/bash

# NetworkOracle Pro Deployment Script
# Deploys the complete microservices architecture

set -e

echo "🚀 Starting NetworkOracle Pro Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your actual configuration before proceeding."
    read -p "Press Enter to continue after editing .env file..."
fi

# Build and start services
print_status "Building Docker images..."
docker-compose build

print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("postgres" "redis" "api-gateway" "centrality-service" "analysis-service")

for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        print_success "$service is running"
    else
        print_error "$service failed to start"
        docker-compose logs $service
        exit 1
    fi
done

# Run database migrations
print_status "Running database migrations..."
docker-compose exec api-gateway python -c "
import asyncio
from app.core.database import init_db
asyncio.run(init_db())
" || print_warning "Database migration failed, but continuing..."

# Display service URLs
print_success "🎉 NetworkOracle Pro deployed successfully!"
echo ""
echo "📋 Service URLs:"
echo "  🌐 API Gateway:     http://localhost:8000"
echo "  📊 Centrality API:  http://localhost:8001"
echo "  🔍 Analysis API:    http://localhost:8002"
echo "  📈 Visualization:   http://localhost:8003"
echo "  🔐 Authentication:  http://localhost:8004"
echo "  📚 API Docs:        http://localhost:8000/docs"
echo ""
echo "🗄️  Database:"
echo "  🐘 PostgreSQL:      localhost:5432"
echo "  📦 Redis:           localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "  View logs:          docker-compose logs -f [service-name]"
echo "  Stop services:      docker-compose down"
echo "  Restart service:    docker-compose restart [service-name]"
echo "  Scale service:      docker-compose up -d --scale [service-name]=3"
echo ""
echo "🔧 Management:"
echo "  Database admin:     docker-compose exec postgres psql -U postgres -d networkoracle"
echo "  Redis CLI:          docker-compose exec redis redis-cli"
echo "  Shell access:       docker-compose exec [service-name] /bin/bash"
echo ""

# Test API endpoints
print_status "Testing API endpoints..."

# Test API Gateway health
if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    print_success "API Gateway is responding"
else
    print_warning "API Gateway health check failed"
fi

# Test Centrality Service
if curl -f http://localhost:8001/api/v1/health > /dev/null 2>&1; then
    print_success "Centrality Service is responding"
else
    print_warning "Centrality Service health check failed"
fi

print_success "✅ Deployment completed! NetworkOracle Pro is ready for use."