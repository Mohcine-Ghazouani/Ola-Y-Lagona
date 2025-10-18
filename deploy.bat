@echo off
REM Deployment script for Ola Y Lagona
REM This script handles the deployment process

echo 🚀 Starting deployment process...

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local file not found!
    echo Please create .env.local file with your production environment variables
    echo You can use env.production as a template
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm ci

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
npx prisma generate

REM Run database migrations
echo 🔄 Running database migrations...
npx prisma migrate deploy

REM Build the application
echo 🏗️ Building application...
npm run build

REM Start the application
echo ✅ Starting application...
npm start
