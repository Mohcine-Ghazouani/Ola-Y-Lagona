# Prisma Database Migration Guide

This project has been successfully migrated from better-sqlite3 to Prisma ORM with SQLite.

## Database Setup

### First Time Setup
\`\`\`bash
# Install dependencies (if not already installed)
npm install

# Setup database and seed data
npm run db:setup
\`\`\`

### Available Database Commands

\`\`\`bash
# Setup database from scratch (generate client, push schema, seed data)
npm run db:setup

# Seed database with initial data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset
\`\`\`

## What Changed

### Database Layer
- ✅ Replaced `better-sqlite3` with `@prisma/client`
- ✅ Created comprehensive Prisma schema with all models
- ✅ Added proper relationships and constraints
- ✅ Implemented type-safe database operations

### API Routes Updated
- ✅ `/api/courses` - Course management
- ✅ `/api/activities` - Activity management  
- ✅ `/api/gallery` - Gallery management
- ✅ `/api/contact` - Contact form submissions
- ✅ `/api/admin/*` - All admin routes for CRUD operations
- ✅ `/api/auth/*` - Authentication system

### Benefits of Prisma
- **Type Safety**: Full TypeScript support with auto-generated types
- **Better Developer Experience**: IntelliSense and auto-completion
- **Query Builder**: Intuitive API for complex queries
- **Migrations**: Proper database versioning (when needed)
- **Prisma Studio**: Built-in database GUI for development

## Database Schema

The database includes the following models:
- **User** - Authentication and user management
- **Course** - Kitesurfing courses
- **Activity** - Various kite sports activities
- **Gallery** - Image gallery with categories
- **Contact** - Contact form submissions
- **Booking** - Future booking system (prepared)

## Environment Variables

Make sure you have the following in your environment:
\`\`\`env
DATABASE_URL="file:./kite-sports.db"
JWT_SECRET="your-secret-key-change-in-production"
\`\`\`

## Troubleshooting

### Database Issues
\`\`\`bash
# If you encounter database issues, reset everything:
npm run db:reset

# Or manually:
rm -f prisma/kite-sports.db
npx prisma db push
npm run db:seed
\`\`\`

### Prisma Client Issues
\`\`\`bash
# Regenerate Prisma client:
npx prisma generate
\`\`\`

## Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Push changes: `npx prisma db push`
3. Regenerate client: `npx prisma generate`
4. Update seed data if needed in `prisma/seed.ts`

The migration is complete and all functionality should work as before, but with better type safety and developer experience!
