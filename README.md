# AI CAD House Plan Management System

A comprehensive CAD drawing management application for architects with AI-powered matching, rule validation, and intelligent suggestions.

## Features

### 1. Standard Drawing Management
- Upload and categorize CAD drawings (residential, commercial, etc.)
- Auto-extract parameters from CAD files (DXF/DWG formats)
- Store drawings with metadata in database
- Generate drawings from parameters (plot size, rooms, etc.)
- Configurable parameter system

### 2. Intelligent Matching System
- Match uploaded drawings against standard library
- Percentage-based similarity scoring
- Multi-parameter comparison algorithm
- Detailed match reporting

### 3. Rule Engine & Validation
- State/region-specific building rules (India)
- Admin-configurable rule sets
- Automated validation against regulations
- Detailed validation reports with pass/fail metrics

### 4. AI-Assisted Design
- Smart wall placement based on dimensions
- Auto room configuration
- Popular layout suggestions
- Compliance recommendations

### 5. Search & Discovery
- Advanced search across standard drawings
- Filter by category, parameters, region
- Match percentage ranking

### 6. CAD Integration
- Generate drawings using CAD API
- Real-time preview in browser
- Export to standard CAD formats (DXF/DWG)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Drawing Viewer  - Upload Interface  - Admin Dashboard   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ CAD Processing │  │  Rule Engine    │  │ Matching Engine │
│   Module       │  │    Module       │  │     Module      │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   PostgreSQL   │  │    MongoDB      │  │   File Storage  │
│  (Structured)  │  │ (CAD Metadata)  │  │   (S3/Local)    │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Databases**: PostgreSQL + MongoDB
- **CAD Processing**: dxf-parser, dxf (v4.5.0)
- **Rule Engine**: Custom JSON-based rule engine
- **AI/ML**: OpenAI API for suggestions

### Frontend
- **Framework**: Next.js 14 (React)
- **UI Library**: shadcn/ui + Tailwind CSS
- **CAD Viewer**: Three.js + dxf-viewer
- **State Management**: Zustand

## Project Structure

```
aicadhouseplanv2/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── cad/           # CAD processing
│   │   │   ├── drawings/      # Drawing management
│   │   │   ├── rules/         # Rule engine
│   │   │   ├── matching/      # Matching algorithm
│   │   │   ├── ai/            # AI suggestions
│   │   │   ├── auth/          # Authentication
│   │   │   └── admin/         # Admin panel
│   │   ├── common/            # Shared utilities
│   │   └── config/            # Configuration
│   ├── test/
│   └── package.json
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # App router
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities
│   │   └── hooks/             # Custom hooks
│   └── package.json
├── shared/                     # Shared types/interfaces
└── docker-compose.yml         # Development environment
```

## Database Schema

### PostgreSQL (Relational Data)

#### Users Table
- id, email, password_hash, role (admin/architect/user)
- created_at, updated_at

#### Drawing Categories Table
- id, name, description, parent_id

#### Standard Drawings Table
- id, category_id, uploader_id, name, description
- file_path, thumbnail_path
- validation_score (% match with rules)
- created_at, updated_at

#### Rules Table
- id, name, description, region, state
- rule_type, rule_config (JSON)
- priority, active
- created_at, updated_at

#### Drawing Parameters Table
- drawing_id, parameter_name, parameter_value, unit
- data_type (numeric/text/boolean)

### MongoDB (Document Store)

#### CAD Metadata Collection
```json
{
  "drawing_id": "uuid",
  "extracted_data": {
    "entities": [...],
    "layers": [...],
    "blocks": [...]
  },
  "parameters": {
    "plot_length": 50,
    "plot_width": 30,
    "total_area": 1500,
    "num_bedrooms": 3,
    "num_bathrooms": 2,
    "num_floors": 2,
    "setback_front": 3,
    "setback_rear": 3,
    "setback_sides": 1.5,
    "open_space_percentage": 40,
    "built_up_area": 900,
    "road_width": 12,
    "staircase_type": "dog-legged"
  },
  "computed_features": {
    "room_count": 8,
    "wall_total_length": 200,
    "door_count": 6,
    "window_count": 10
  }
}
```

## API Endpoints

### Drawings
- `POST /api/drawings/upload` - Upload CAD file
- `GET /api/drawings/:id` - Get drawing details
- `POST /api/drawings/generate` - Generate from parameters
- `POST /api/drawings/match` - Find matching drawings
- `GET /api/drawings/search` - Search drawings

### Rules
- `GET /api/rules` - List all rules
- `POST /api/rules` - Create rule (admin)
- `PUT /api/rules/:id` - Update rule (admin)
- `POST /api/rules/validate` - Validate drawing

### AI Suggestions
- `POST /api/ai/suggest-layouts` - Get layout suggestions
- `POST /api/ai/optimize` - Optimize design

### Admin
- `GET /api/admin/parameters` - List parameters
- `POST /api/admin/parameters` - Add parameter
- `GET /api/admin/statistics` - System statistics

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd aicadhouseplanv2
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

5. Start databases (using Docker)
```bash
docker-compose up -d
```

6. Run migrations
```bash
cd backend
npm run migration:run
```

7. Start development servers
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Key Algorithms

### 1. Parameter Extraction Algorithm
- Parse DXF/DWG files
- Extract geometric entities (lines, arcs, polylines)
- Identify rooms by boundary detection
- Calculate dimensions and areas
- Detect standard elements (doors, windows, stairs)

### 2. Matching Algorithm
```
Similarity Score = Weighted Average of:
  - Geometric similarity (30%)
  - Parameter similarity (40%)
  - Layout similarity (20%)
  - Rule compliance similarity (10%)
```

### 3. Validation Algorithm
- Load applicable rules for region/state
- Check each rule against drawing parameters
- Calculate compliance percentage
- Generate detailed report

## Rule Configuration Format

```json
{
  "rule_id": "india_maharashtra_setback_residential",
  "name": "Maharashtra Residential Setback Rules",
  "region": "India",
  "state": "Maharashtra",
  "type": "setback",
  "conditions": [
    {
      "parameter": "plot_width",
      "operator": ">=",
      "value": 6,
      "message": "Plot width must be at least 6m"
    },
    {
      "parameter": "setback_front",
      "operator": ">=",
      "value": 3,
      "message": "Front setback must be at least 3m"
    }
  ],
  "formula": {
    "open_space_percentage": "plot_width < 10 ? 0 : (plot_width * plot_length - built_up_area) / (plot_width * plot_length) * 100",
    "min_value": 25
  }
}
```

## Contributing
See CONTRIBUTING.md

## License
MIT License
