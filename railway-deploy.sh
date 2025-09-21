#!/bin/bash

# NetworkOracle Pro - Railway Deployment Script
# Deploy backend services to Railway cloud platform

set -e

echo "🚀 Deploying NetworkOracle Pro to Railway..."

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

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_status "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
print_status "Logging into Railway..."
railway login

# Create new project
print_status "Creating Railway project..."
railway project create networkoracle-pro

# Deploy API Gateway
print_status "Deploying API Gateway..."
cd services/api-gateway
railway service create api-gateway
railway up --service api-gateway

# Deploy Centrality Service
print_status "Deploying Centrality Service..."
cd ../centrality-service
railway service create centrality-service
railway up --service centrality-service

# Deploy Analysis Service
print_status "Deploying Analysis Service..."
cd ../analysis-service
railway service create analysis-service
railway up --service analysis-service

print_success "🎉 All services deployed to Railway!"
print_status "Check your Railway dashboard for service URLs"
