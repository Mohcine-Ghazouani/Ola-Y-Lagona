# Database Setup for Production Deployment

## Overview

Your application uses Prisma with SQLite by default, but for production deployment, you have several database options. This guide covers the setup for different deployment scenarios.

## Database Options

### 1. SQLite (Simple Deployments)

**Best for:** Small to medium applications, development, testing

**Pros:**
- No external dependencies
- Easy to set up
- Good for single-instance deployments

**Cons:**
- Not suitable for multiple server instances
- Limited concurrent connections
- No built-in replication

**Setup:**
```env
DATABASE_URL="file:./prisma/production.db"
```

### 2. PostgreSQL (Recommended for Production)

**Best for:** Production applications, multiple instances, high concurrency

**Pros:**
- Excellent performance
- Supports multiple connections
- Built-in replication and backup
- ACID compliance
- Full-text search capabilities

**Cons:**
- Requires external database server
- More complex setup

**Setup:**
```env
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

### 3. MySQL/MariaDB

**Best for:** Traditional web applications

**Pros:**
- Widely supported
- Good performance
- Mature ecosystem

**Cons:**
- Requires external database server
- Some limitations compared to PostgreSQL

## Production Database Setup

### Option 1: SQLite for Simple Production

If you're deploying to a single server instance:

1. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set Environment Variable:**
   ```env
   DATABASE_URL="file:./prisma/production.db"
   ```

3. **Deploy with Database:**
   ```bash
   # The database file will be created automatically
   npm run db:migrate
   npm run db:seed
   ```

### Option 2: PostgreSQL for Production

#### Using a Cloud Database Service:

**Railway PostgreSQL:**
1. Create a PostgreSQL service on Railway
2. Copy the connection string
3. Set as `DATABASE_URL` in your environment

**Supabase:**
1. Create a project on Supabase
2. Get the connection string from Settings > Database
3. Set as `DATABASE_URL` in your environment

**PlanetScale:**
1. Create a database on PlanetScale
2. Get the connection string
3. Set as `DATABASE_URL` in your environment

#### Using Your Own PostgreSQL Server:

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql-server postgresql-contrib
   ```

2. **Create Database:**
   ```sql
   sudo -u postgres psql
   CREATE DATABASE ola_y_lagona;
   CREATE USER ola_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ola_y_lagona TO ola_user;
   ```

3. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Set Environment Variable:**
   ```env
   DATABASE_URL="postgresql://ola_user:your_password@localhost:5432/ola_y_lagona"
   ```

## Database Migration Strategy

### Development to Production Migration

1. **Create Migration Files:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Deploy Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Production Data:**
   ```bash
   npm run db:seed
   ```

### Backup Strategy

#### SQLite Backup:
```bash
# Simple file copy
cp prisma/production.db prisma/backup-$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DB_FILE="prisma/production.db"
cp "$DB_FILE" "$BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).db"
```

#### PostgreSQL Backup:
```bash
# Full database backup
pg_dump -h localhost -U ola_user ola_y_lagona > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U ola_user ola_y_lagona < backup_20240101.sql
```

## Environment-Specific Configuration

### Development
```env
DATABASE_URL="file:./prisma/kite-sports.db"
JWT_SECRET="dev-secret-key"
NODE_ENV="development"
```

### Staging
```env
DATABASE_URL="postgresql://staging_user:password@staging-db:5432/ola_y_lagona_staging"
JWT_SECRET="staging-secret-key"
NODE_ENV="production"
```

### Production
```env
DATABASE_URL="postgresql://prod_user:strong_password@prod-db:5432/ola_y_lagona"
JWT_SECRET="very-strong-production-secret"
NODE_ENV="production"
COOKIE_DOMAIN="yourdomain.com"
```

## Connection Pooling

For high-traffic applications, consider connection pooling:

### Using Prisma with Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling configuration
  __internal: {
    engine: {
      connectTimeout: 60000,
      queryTimeout: 60000,
    },
  },
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## Monitoring and Maintenance

### Database Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "healthy", database: "connected" })
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", database: "disconnected" }, { status: 500 })
  }
}
```

### Performance Monitoring

1. **Enable Query Logging:**
   ```typescript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   })
   ```

2. **Monitor Slow Queries:**
   ```typescript
   const prisma = new PrismaClient({
     log: [
       {
         emit: 'event',
         level: 'query',
       },
     ],
   })

   prisma.$on('query', (e) => {
     if (e.duration > 1000) {
       console.log('Slow query detected:', e.query, e.duration)
     }
   })
   ```

## Troubleshooting

### Common Issues

1. **Connection Timeout:**
   - Check database server status
   - Verify connection string format
   - Check firewall settings

2. **Migration Failures:**
   - Ensure database exists
   - Check user permissions
   - Verify schema compatibility

3. **Performance Issues:**
   - Monitor query performance
   - Add database indexes
   - Consider connection pooling

### Database Connection Testing

```typescript
// scripts/test-db-connection.ts
import { PrismaClient } from "@prisma/client"

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log("✅ Database connection successful")
    
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
  } catch (error) {
    console.error("❌ Database connection failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

## Security Considerations

1. **Use Environment Variables:** Never hardcode database credentials
2. **Limit Database Access:** Use least privilege principle
3. **Enable SSL:** Use encrypted connections in production
4. **Regular Backups:** Implement automated backup strategy
5. **Monitor Access:** Log and monitor database access

## Next Steps

1. Choose your database option based on your needs
2. Set up the database according to the chosen option
3. Update your environment variables
4. Run migrations and seed data
5. Test the connection
6. Set up monitoring and backups
