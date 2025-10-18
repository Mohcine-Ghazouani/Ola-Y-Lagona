#!/bin/bash

# Docker deployment script for Ola Y Lagona

set -e

echo "🐳 Starting Docker deployment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file with your production environment variables"
    exit 1
fi

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t ola-y-lagona .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start new containers
echo "🚀 Starting new containers..."
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Application is running at http://localhost:3000"
