#!/bin/bash

# NetworkOracle Pro - Deploy Backend to Vercel
# Deploy backend APIs as Vercel serverless functions

set -e

echo "🚀 Deploying NetworkOracle Pro Backend to Vercel..."

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to vercel-backend directory
cd vercel-backend

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

print_success "🎉 Backend APIs deployed to Vercel!"
print_status ""
print_status "📋 Your backend APIs are now live at:"
print_status "   🔍 Centrality API: https://your-project.vercel.app/api/centrality"
print_status "   📊 Analysis API: https://your-project.vercel.app/api/analysis"
print_status "   🏥 Health Check: https://your-project.vercel.app/api/health"
print_status ""
print_status "💡 Test with curl:"
print_status '   curl -X POST "https://your-project.vercel.app/api/centrality" \'
print_status '     -H "Content-Type: application/json" \'
print_status '     -d '"'"'{"network":{"nodes":[{"id":"1"},{"id":"2"}],"edges":[{"source":"1","target":"2"}]},"algorithm":"degree"}'"'"
print_status ""
print_success "✅ Backend deployment complete!"
