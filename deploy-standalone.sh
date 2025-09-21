#!/bin/bash

# Create a standalone deployment package
echo "🚀 Creating standalone NetworkOracle Pro deployment package..."

# Create deployment directory
mkdir -p networkoracle-standalone
cd networkoracle-standalone

# Copy the web app
cp -r ../apps/web/* .

# Create a simple package.json with exact versions
cat > package.json << 'EOF'
{
  "name": "networkoracle-pro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.2.25",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.3",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38"
  }
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone'
}

module.exports = nextConfig
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "✅ Standalone package created in 'networkoracle-standalone' directory"
echo ""
echo "📋 Next steps:"
echo "1. cd networkoracle-standalone"
echo "2. npm install"
echo "3. npm run build"
echo "4. Deploy to Vercel via dashboard or CLI"
echo ""
echo "🌐 Or drag the 'networkoracle-standalone' folder to vercel.com"
