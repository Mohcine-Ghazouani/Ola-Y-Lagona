@echo off
REM Docker deployment script for Ola Y Lagona

echo 🐳 Starting Docker deployment...

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local file not found!
    echo Please create .env.local file with your production environment variables
    exit /b 1
)

REM Build Docker image
echo 🏗️ Building Docker image...
docker build -t ola-y-lagona .

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Start new containers
echo 🚀 Starting new containers...
docker-compose up -d

echo ✅ Deployment complete!
echo 🌐 Application is running at http://localhost:3000
