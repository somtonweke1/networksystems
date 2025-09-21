# 🚀 NetworkOracle Pro - Deployment Guide

## Vercel Deployment (Frontend)

### Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code
- Environment variables configured

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Root
```bash
# From the NetworkPlatform directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? networkoracle-pro
# - Directory? apps/web
# - Override settings? N
```

### Step 4: Configure Environment Variables
In the Vercel dashboard, go to your project settings and add:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
CENTRALITY_SERVICE_URL=https://your-backend-service.com
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-project.vercel.app
```

### Step 5: Redeploy
```bash
vercel --prod
```

## Backend Services Deployment

### Option 1: Railway (Recommended for Python services)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Centrality Service**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Deploy from centrality service directory
   cd services/centrality-service
   railway deploy
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set DATABASE_URL=your-postgres-url
   railway variables set REDIS_URL=your-redis-url
   railway variables set DEBUG=false
   railway variables set HOST=0.0.0.0
   railway variables set PORT=$PORT
   ```

### Option 2: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect GitHub account

2. **Create Web Service**
   - Connect your repository
   - Root Directory: `services/centrality-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
   - Environment: Python 3.11

3. **Configure Environment Variables**
   ```bash
   DATABASE_URL=your-postgres-url
   REDIS_URL=your-redis-url
   DEBUG=false
   HOST=0.0.0.0
   PORT=10000
   ```

## Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project

2. **Run Database Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

3. **Get Connection String**
   ```bash
   # From Supabase dashboard
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

### Option 2: Neon

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Create new project

2. **Connect and Migrate**
   ```bash
   # Install Neon CLI
   npm install -g neonctl
   
   # Login
   neonctl auth
   
   # Create database
   neonctl databases create networkoracle
   
   # Get connection string
   neonctl connection-string --database networkoracle
   ```

## Redis Setup

### Option 1: Redis Cloud
1. Go to [redis.com](https://redis.com)
2. Create free account
3. Create new database
4. Get connection string: `redis://:[password]@[host]:[port]`

### Option 2: Railway Redis
1. In Railway dashboard
2. Add Redis service
3. Connect to your app
4. Use provided connection string

## Complete Deployment Steps

### 1. Backend Services (Railway)
```bash
# Deploy centrality service
cd services/centrality-service
railway deploy

# Get the service URL
railway domain
```

### 2. Database (Supabase)
```bash
# Set up database
supabase db push

# Get connection string from dashboard
```

### 3. Frontend (Vercel)
```bash
# Deploy frontend
vercel --prod

# Configure environment variables in Vercel dashboard
```

### 4. Environment Variables Summary

#### Vercel (Frontend)
```bash
NEXT_PUBLIC_APP_URL=https://networkoracle-pro.vercel.app
CENTRALITY_SERVICE_URL=https://centrality-service.railway.app
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
REDIS_URL=redis://:[password]@[host]:[port]
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://networkoracle-pro.vercel.app
```

#### Railway (Backend)
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
REDIS_URL=redis://:[password]@[host]:[port]
DEBUG=false
HOST=0.0.0.0
PORT=$PORT
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://networkoracle-pro.vercel.app
```

## Testing Deployment

### 1. Check Health Endpoints
```bash
# Frontend health
curl https://your-project.vercel.app/api/health

# Backend health
curl https://your-centrality-service.railway.app/health
```

### 2. Test Centrality Computation
```bash
curl -X POST https://your-project.vercel.app/api/centrality \
  -H "Content-Type: application/json" \
  -d '{
    "network": {
      "id": "test",
      "name": "Test Network",
      "type": "UNDIRECTED",
      "nodes": [{"id": "1"}, {"id": "2"}],
      "edges": [{"id": "1", "source": "1", "target": "2"}]
    },
    "centrality_types": ["degree"],
    "parameters": {"normalize": true}
  }'
```

## Monitoring and Maintenance

### 1. Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and errors

### 2. Railway Metrics
- View logs and metrics in Railway dashboard
- Set up alerts for errors

### 3. Database Monitoring
- Supabase: Built-in monitoring dashboard
- Neon: Query performance insights

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   ```

2. **API Connection Issues**
   ```bash
   # Verify CORS settings
   # Check environment variables
   # Test backend health endpoint
   ```

3. **Database Connection**
   ```bash
   # Verify DATABASE_URL format
   # Check database is accessible
   # Run migrations if needed
   ```

### Debug Commands
```bash
# Check Vercel deployment logs
vercel logs

# Check Railway logs
railway logs

# Test local development
pnpm dev
```

## Production Optimizations

### 1. Performance
- Enable Vercel Edge Functions
- Use Redis for caching
- Optimize database queries

### 2. Security
- Use HTTPS everywhere
- Set strong NEXTAUTH_SECRET
- Enable CORS properly
- Use environment variables for secrets

### 3. Monitoring
- Set up error tracking (Sentry)
- Monitor API response times
- Track user analytics

## Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Railway**: $5/month credit, then pay-as-you-go
- **Supabase**: 500MB database, 2GB bandwidth
- **Redis Cloud**: 30MB storage

### Expected Monthly Cost
- **Development**: $0-10
- **Small Production**: $10-50
- **Medium Production**: $50-200

## Next Steps

1. **Set up CI/CD**
   - GitHub Actions for automated deployments
   - Automated testing before deployment

2. **Add Monitoring**
   - Sentry for error tracking
   - Analytics for user behavior

3. **Scale Services**
   - Multiple backend instances
   - Load balancing
   - CDN for static assets

4. **Security Hardening**
   - Rate limiting
   - Authentication
   - Data encryption

Your NetworkOracle Pro platform is now ready for production deployment! 🚀
