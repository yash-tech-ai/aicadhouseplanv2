# Development Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Docker (optional, recommended)

### 2. Setup

#### Option A: Using Docker (Recommended)
```bash
# Start all services (PostgreSQL, MongoDB, Redis, MinIO)
docker-compose up -d

# Install dependencies
npm run install:all

# Setup environment
cp backend/.env.example backend/.env

# Run database migrations and seeds
cd backend
npm run migration:run
npm run seed

# Start development servers
cd ..
npm run dev
```

#### Option B: Manual Setup
```bash
# Install PostgreSQL and MongoDB locally

# Install dependencies
npm run install:all

# Configure .env file with your database credentials
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Run migrations and seeds
cd backend
npm run migration:run
npm run seed

# Start development
cd ..
npm run dev
```

### 3. Access the Application

- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api/docs
- Frontend: http://localhost:3000 (when implemented)

## Project Structure

```
aicadhouseplanv2/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── cad/           # CAD processing
│   │   │   ├── drawings/      # Drawing management
│   │   │   ├── rules/         # Rule engine
│   │   │   ├── matching/      # Matching algorithm
│   │   │   ├── ai/            # AI suggestions
│   │   │   └── admin/         # Admin panel
│   │   ├── database/          # Database entities & schemas
│   │   ├── common/            # Shared utilities
│   │   └── config/            # Configuration
│   └── package.json
├── frontend/                   # Next.js Frontend (to be implemented)
└── docker-compose.yml         # Docker services
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Drawings
- `POST /api/drawings/upload` - Upload CAD file
- `GET /api/drawings` - List all drawings
- `GET /api/drawings/:id` - Get drawing details
- `GET /api/drawings/search` - Search by parameters
- `GET /api/drawings/categories` - Get categories

### CAD Processing
- `GET /api/cad/metadata/:drawingId` - Get CAD metadata
- `GET /api/cad/parameters/:drawingId` - Get extracted parameters

### Rules
- `GET /api/rules` - List all rules
- `POST /api/rules` - Create rule (admin)
- `POST /api/rules/validate/:drawingId` - Validate drawing
- `GET /api/rules/applicable/:region/:state` - Get applicable rules

### Matching
- `GET /api/matching/find/:drawingId` - Find matching drawings

### AI
- `POST /api/ai/suggest-layouts` - Get layout suggestions
- `POST /api/ai/optimize/:drawingId` - Get optimization suggestions
- `POST /api/ai/suggest-room-placement` - Get room placement suggestions

### Admin
- `GET /api/admin/statistics` - System statistics
- `GET /api/admin/parameters` - Parameter definitions
- `POST /api/admin/parameters` - Create parameter
- `GET /api/admin/users` - User management

## Testing

### Test User Credentials

**Admin Account:**
- Email: admin@cad.com
- Password: admin123

**Head Architect Account:**
- Email: architect@cad.com
- Password: architect123

### Running Tests
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

## Development Workflow

### 1. Adding a New Parameter

```bash
# 1. Use admin API to create parameter definition
curl -X POST http://localhost:3001/api/admin/parameters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "parking_spaces",
    "displayName": "Parking Spaces",
    "dataType": "numeric",
    "isRequired": false
  }'
```

### 2. Creating a New Rule

```bash
# Use rules API
curl -X POST http://localhost:3001/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parking Requirement",
    "region": "India",
    "state": "Maharashtra",
    "ruleType": "parking",
    "ruleConfig": {
      "conditions": [{
        "parameter": "parking_spaces",
        "operator": ">=",
        "value": 2,
        "message": "Minimum 2 parking spaces required"
      }]
    }
  }'
```

### 3. Uploading a Drawing

```bash
# Upload CAD file
curl -X POST http://localhost:3001/api/drawings/upload \
  -F "file=@path/to/drawing.dxf" \
  -F "name=Sample House Plan" \
  -F "categoryId=<category-id>" \
  -F "uploaderId=<user-id>" \
  -F "region=India" \
  -F "state=Maharashtra"
```

## Background Jobs

The application uses BullMQ for background processing:

- CAD file processing
- Parameter extraction
- Validation checks

Monitor jobs through Redis CLI:
```bash
redis-cli
> KEYS bull:*
```

## Database Migrations

```bash
cd backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database connection error**
   - Check Docker containers: `docker-compose ps`
   - Verify .env database credentials
   - Check database is running: `docker-compose logs postgres`

3. **CAD parsing errors**
   - Ensure DXF file is valid
   - Check file size (max 50MB)
   - Verify file format (.dxf or .dwg)

## Next Steps

1. Implement frontend with Next.js
2. Add real-time CAD viewer
3. Implement drawing generation from parameters
4. Add more India-specific building rules
5. Enhance AI suggestions with more training data

## Contributing

1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request

## Support

For issues and questions:
- Check API documentation: http://localhost:3001/api/docs
- Review logs: `docker-compose logs -f backend`
