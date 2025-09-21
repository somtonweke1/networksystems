# 🚀 Quick Vercel Deployment Guide

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Deploy from Project Root
```bash
# Navigate to your project
cd /Users/somtonweke/NetworkPlatform

# Deploy to Vercel
vercel

# Follow the prompts:
# ✅ Set up and deploy? Y
# ✅ Which scope? (select your account)
# ✅ Link to existing project? N
# ✅ Project name? networkoracle-pro
# ✅ Directory? apps/web
# ✅ Override settings? N
```

## Step 4: Configure Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

### Required Environment Variables:
```bash
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
CENTRALITY_SERVICE_URL=https://your-backend-service.com
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.vercel.app
```

## Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 6: Test Your Deployment
Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ API health check: `https://your-project.vercel.app/api/health`
- ✅ Centrality API: `https://your-project.vercel.app/api/centrality`

## Backend Services Setup (Next Steps)

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy `services/centrality-service`
4. Set environment variables
5. Get service URL and update Vercel environment variables

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect repository: `services/centrality-service`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python main.py`

## Database Setup

### Option 1: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Run migrations (when backend is ready)

### Option 2: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Get connection string

## Quick Test Commands

```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Test centrality computation (when backend is ready)
curl -X POST https://your-project.vercel.app/api/centrality \
  -H "Content-Type: application/json" \
  -d '{"network":{"id":"test","name":"Test","type":"UNDIRECTED","nodes":[{"id":"1"},{"id":"2"}],"edges":[{"id":"1","source":"1","target":"2"}]},"centrality_types":["degree"]}'
```

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check that all dependencies are in package.json
2. **API Errors**: Verify environment variables are set
3. **CORS Issues**: Check CORS configuration in backend

### Debug:
```bash
# Check deployment logs
vercel logs

# Check build locally
cd apps/web && pnpm build
```

## Success! 🎉
Your NetworkOracle Pro frontend is now deployed on Vercel!

**Next Steps:**
1. Set up backend services
2. Configure database
3. Test full functionality
4. Add monitoring and analytics
