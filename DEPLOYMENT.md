# Deployment Guide - Ola Y Lagona

This guide covers different deployment options for the Ola Y Lagona kite sports booking application.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Database (SQLite for simple deployments, PostgreSQL for production)
- Domain name and SSL certificate (for production)

## Environment Setup

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

### 2. Required Environment Variables

Update `.env.local` with your production values:

```env
# Database Configuration
DATABASE_URL="file:./prisma/production.db"

# JWT Secret for authentication (MUST BE CHANGED!)
JWT_SECRET="your-production-jwt-secret-key-here"

# OpenWeatherMap API Key for live weather data
OPENWEATHER_API_KEY="your-openweathermap-api-key-here"

# Next.js specific
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

**⚠️ Important Security Notes:**
- Change the `JWT_SECRET` to a strong, random string
- Never commit `.env.local` to version control
- Use different secrets for different environments

## Deployment Options

### Option 1: Traditional Server Deployment

#### Using the deployment script:

```bash
# On Linux/Mac
./deploy.sh

# On Windows
deploy.bat
```

#### Manual deployment steps:

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Build the application:**
   ```bash
   npm run build
   ```

5. **Start the application:**
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

#### Prerequisites:
- Docker installed
- Docker Compose installed

#### Using the Docker deployment script:

```bash
# On Linux/Mac
./deploy-docker.sh

# On Windows
deploy-docker.bat
```

#### Manual Docker deployment:

1. **Build the Docker image:**
   ```bash
   docker build -t ola-y-lagona .
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Platform Deployment

#### Vercel (Recommended for Next.js)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL`: Your database connection string
   - `JWT_SECRET`: Your production JWT secret
   - `OPENWEATHER_API_KEY`: Your weather API key
   - `NEXT_PUBLIC_APP_URL`: Your domain URL

3. **Deploy automatically on push to main branch**

#### Railway

1. **Connect your GitHub repository**
2. **Add environment variables**
3. **Deploy automatically**

#### DigitalOcean App Platform

1. **Create a new app from GitHub**
2. **Configure environment variables**
3. **Set build command:** `npm run deploy:build`
4. **Set start command:** `npm run deploy:start`

## Database Setup

### SQLite (Default)

The application uses SQLite by default, which is perfect for:
- Small to medium applications
- Development and testing
- Simple deployments

### PostgreSQL (Production Recommended)

For production deployments, consider using PostgreSQL:

1. **Update Prisma schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update environment variable:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ola_y_lagona"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## Production Checklist

### Security
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Configure security headers
- [ ] Use environment variables for all secrets

### Performance
- [ ] Enable Next.js optimizations
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor application performance

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure application monitoring
- [ ] Set up database monitoring
- [ ] Configure uptime monitoring

### Backup
- [ ] Set up database backups
- [ ] Configure file upload backups
- [ ] Test restore procedures

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check DATABASE_URL format
   - Ensure database server is running
   - Verify credentials

2. **Build failures:**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Authentication issues:**
   - Verify JWT_SECRET is set correctly
   - Check token expiration settings
   - Ensure cookies are configured properly

### Logs

Check application logs for errors:
```bash
# Docker logs
docker-compose logs -f app

# PM2 logs (if using PM2)
pm2 logs ola-y-lagona
```

## Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Review the troubleshooting section above

## Maintenance

### Regular Tasks

1. **Update dependencies:**
   ```bash
   npm update
   ```

2. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Monitor application performance**
4. **Backup database regularly**
5. **Update SSL certificates**

### Scaling

For high-traffic applications:
- Use a load balancer
- Implement database connection pooling
- Consider microservices architecture
- Use CDN for static assets
