# CAD House Plan Manager - Complete Setup Guide

This guide will help you set up and run the complete CAD House Plan Management system with both backend and frontend.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Docker & Docker Compose**: For running databases
- **Git**: For version control

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  React + TypeScript + Tailwind + Zustand                │
│  Port: 3000                                             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                    Backend (NestJS)                     │
│  TypeScript + TypeORM + Mongoose + Bull                │
│  Port: 3001                                             │
└─────────┬──────────────────────┬────────────────────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐    ┌──────────────────┐
│   PostgreSQL     │    │     MongoDB      │
│   Port: 5432     │    │    Port: 27017   │
│  (Relational DB) │    │  (Document Store)│
└──────────────────┘    └──────────────────┘
          │                      │
          ▼                      │
┌──────────────────┐            │
│      Redis       │            │
│   Port: 6379     │            │
│  (Job Queue)     │            │
└──────────────────┘            │
                                │
                                ▼
                       ┌──────────────────┐
                       │      MinIO       │
                       │    Port: 9000    │
                       │  (File Storage)  │
                       └──────────────────┘
```

## Quick Start (5 minutes)

### Step 1: Start Docker Services

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- MinIO (port 9000, 9001)

**Verify services are running:**
```bash
docker-compose ps
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Run database migrations
npm run migration:run

# Seed initial data (creates admin user, rules, categories)
npm run seed

# Start backend development server
npm run start:dev
```

Backend will be available at: **http://localhost:3001**

API documentation: **http://localhost:3001/api-docs** (Swagger)

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start frontend development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign In" or "Get Started"
3. Login with demo credentials:
   - **Admin**: admin@cad.com / admin123
   - **Architect**: architect@cad.com / architect123
4. Explore the dashboard and features

## Detailed Setup

### Backend Configuration

**Environment Variables** (backend/.env):
```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=caduser
POSTGRES_PASSWORD=cadpassword
POSTGRES_DB=cad_management

# Database - MongoDB
MONGODB_URI=mongodb://localhost:27017/cad_management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO (S3-compatible storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=cad-drawings

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# File Upload
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_PATH=./uploads
```

### Frontend Configuration

**Environment Variables** (frontend/.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Running in Production

### Backend Production Build

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend Production Build

```bash
cd frontend
npm run build
npm start
```

**Note**: For production deployment, you'll need to:
1. Use proper environment variables
2. Configure HTTPS
3. Set up proper CORS policies
4. Use production-grade databases (not Docker)
5. Set up file storage (AWS S3 or similar)
6. Configure proper logging and monitoring

## Database Migrations

### Create a new migration:
```bash
cd backend
npm run migration:create src/database/migrations/YourMigrationName
```

### Run migrations:
```bash
npm run migration:run
```

### Revert last migration:
```bash
npm run migration:revert
```

## Common Issues & Solutions

### Issue 1: Docker containers won't start

**Solution:**
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### Issue 2: Backend says "Cannot connect to database"

**Checklist:**
- Ensure Docker containers are running: `docker-compose ps`
- Check PostgreSQL is accessible: `psql -h localhost -U caduser -d cad_management`
- Verify .env file has correct credentials

### Issue 3: Frontend can't connect to backend

**Solution:**
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check .env.local has correct NEXT_PUBLIC_API_URL
- Check browser console for CORS errors
- Ensure backend CORS is configured to allow localhost:3000

### Issue 4: "bcrypt is not defined" error in backend

**Solution:** This was already fixed by disabling webpack in nest-cli.json

### Issue 5: Frontend build fails with font errors

**Solution:** Google Fonts have been removed; app uses system fonts now

## Testing the Features

### 1. Test Authentication
- Register a new user
- Login with existing credentials
- Logout and verify redirect to login page

### 2. Test Drawing Upload
- Navigate to Dashboard → Upload
- Drag and drop a DXF file (or click to browse)
- Fill in drawing details
- Submit and verify it appears in drawings list

### 3. Test Search & Match
- Navigate to Dashboard → Search & Match
- Enter plot parameters (size, bedrooms, bathrooms)
- Click "Search for Matches"
- View match results with scores

### 4. Test AI Suggestions
- Navigate to Dashboard → AI Suggestions
- Enter plot parameters
- Click "Get AI Suggestions"
- View layout recommendations

### 5. Test Drawing Management
- Navigate to Dashboard → Drawings
- Switch between grid and list views
- Search for specific drawings
- Click on a drawing to view details
- Check validation results and parameters

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login-direct` - Login with email/password
- `GET /api/auth/me` - Get current user

### Drawings
- `GET /api/drawings` - List all drawings
- `GET /api/drawings/:id` - Get drawing details
- `POST /api/drawings/upload` - Upload new drawing
- `DELETE /api/drawings/:id` - Delete drawing
- `GET /api/drawings/categories` - Get categories

### Matching
- `GET /api/matching/find/:id` - Find similar drawings
- `POST /api/matching/find-by-params` - Search by parameters

### AI
- `POST /api/ai/suggest-layouts` - Get layout suggestions
- `POST /api/ai/suggest-room-placement` - Get room placement advice
- `POST /api/ai/optimize/:id` - Optimize drawing layout

### Rules
- `GET /api/rules` - List validation rules
- `POST /api/rules/validate/:id` - Validate drawing against rules

### Admin
- `GET /api/admin/statistics` - System statistics
- `GET /api/admin/parameters` - Parameter definitions
- `POST /api/admin/parameters` - Create new parameter

## Development Workflow

### Backend Development
```bash
cd backend
npm run start:dev  # Watch mode with hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Running Both Simultaneously

**Terminal 1** (Backend):
```bash
cd backend && npm run start:dev
```

**Terminal 2** (Frontend):
```bash
cd frontend && npm run dev
```

**Terminal 3** (Docker):
```bash
cd backend && docker-compose up
```

## Project Structure

```
aicadhouseplanv2/
├── backend/                   # NestJS backend
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── drawings/    # Drawing management
│   │   │   ├── cad/         # CAD parsing
│   │   │   ├── matching/    # Similarity matching
│   │   │   ├── ai/          # AI suggestions
│   │   │   ├── rules/       # Validation rules
│   │   │   └── admin/       # Admin functions
│   │   ├── database/
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── schemas/     # Mongoose schemas
│   │   │   └── migrations/  # Database migrations
│   │   └── config/          # Configuration
│   ├── docker-compose.yml   # Docker services
│   └── package.json
│
└── frontend/                 # Next.js frontend
    ├── src/
    │   ├── app/             # Pages (App Router)
    │   ├── components/      # React components
    │   ├── stores/          # Zustand stores
    │   ├── services/        # API service
    │   └── types/           # TypeScript types
    └── package.json
```

## Next Steps

After successful setup:

1. **Customize Rules**: Add region/state-specific building codes in the admin panel
2. **Upload Standard Drawings**: Add your library of approved drawings
3. **Configure OpenAI**: Add your API key for AI features
4. **Test Matching**: Upload test drawings and verify matching accuracy
5. **Customize UI**: Modify theme colors in globals.css
6. **Add Users**: Create user accounts for your team

## Support & Documentation

- **Backend API Docs**: http://localhost:3001/api-docs
- **Frontend README**: ./frontend/README.md
- **Backend README**: ./backend/README.md

## Security Notes

For production deployment:

1. Change all default passwords
2. Use strong JWT_SECRET
3. Enable HTTPS
4. Configure proper CORS policies
5. Set up rate limiting
6. Enable request validation
7. Use environment-specific configs
8. Set up monitoring and logging
9. Regular security audits
10. Keep dependencies updated

## Performance Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Use Redis for caching frequently accessed data
3. **File Storage**: Use CDN for serving static assets
4. **Load Balancing**: Use PM2 or similar for Node.js clustering
5. **Compression**: Enable gzip compression for API responses

## Monitoring

Recommended tools for production:
- **Application**: PM2, New Relic, Datadog
- **Logs**: ELK Stack, Loggly
- **Database**: pgAdmin (PostgreSQL), MongoDB Compass
- **Errors**: Sentry
- **Uptime**: UptimeRobot, Pingdom

---

**Questions or Issues?** Check the README files in backend/ and frontend/ directories for more detailed information.
