# Frontend Implementation Guide

## 🎯 Complete Application Structure

The frontend has been scaffolded with Next.js 14, TypeScript, and modern tooling. Here's what needs to be implemented:

### ✅ Already Created
- Next.js 14 configuration
- TypeScript setup
- Tailwind CSS with shadcn/ui theme
- Project structure

### 📋 Implementation Roadmap

## Phase 1: Core Frontend (Priority: HIGH)

### 1.1 Authentication & Layout
```
frontend/src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login page
│   ├── dashboard/          # Main dashboard
│   └── (authenticated)/    # Protected routes
│       ├── drawings/       # Drawing management
│       ├── upload/         # Upload new drawings
│       ├── viewer/[id]/    # CAD viewer
│       ├── matching/       # Find matches
│       ├── rules/          # Rule management (admin)
│       └── admin/          # Admin panel
```

### 1.2 Core Components
```
components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── table.tsx
├── cad-viewer/            # CAD viewing components
│   ├── cad-viewer-3d.tsx  # Three.js 3D viewer
│   ├── cad-viewer-2d.tsx  # 2D DXF viewer
│   ├── toolbar.tsx        # Viewer controls
│   └── layers-panel.tsx   # Layer management
├── drawing/               # Drawing components
│   ├── drawing-card.tsx
│   ├── drawing-grid.tsx
│   ├── upload-zone.tsx
│   └── parameter-form.tsx
├── matching/              # Matching components
│   ├── match-results.tsx
│   ├── similarity-chart.tsx
│   └── comparison-view.tsx
└── ai/                    # AI components
    ├── suggestion-panel.tsx
    ├── layout-recommender.tsx
    └── optimization-tips.tsx
```

### 1.3 Services & API
```
services/
├── api.ts                 # Axios instance
├── auth.service.ts        # Authentication
├── drawings.service.ts    # Drawing CRUD
├── cad.service.ts         # CAD processing
├── rules.service.ts       # Rules management
├── matching.service.ts    # Matching API
├── ai.service.ts          # AI suggestions
└── ml.service.ts          # ML predictions
```

### 1.4 State Management (Zustand)
```
stores/
├── auth.store.ts          # User authentication state
├── drawing.store.ts       # Drawing management state
├── viewer.store.ts        # CAD viewer state
└── ml.store.ts            # ML model state
```

## Phase 2: CAD Viewer (Priority: HIGH)

### 2.1 3D Viewer with Three.js
**File**: `components/cad-viewer/cad-viewer-3d.tsx`

Features:
- Load and render DXF files in 3D
- Pan, zoom, rotate controls
- Layer visibility toggle
- Measurement tools
- Export to PNG/PDF

**Technology**:
- @react-three/fiber for React integration
- @react-three/drei for helpers
- three.js for 3D rendering

### 2.2 2D Viewer
**File**: `components/cad-viewer/cad-viewer-2d.tsx`

Features:
- 2D plan view
- Dimension annotations
- Room labels
- Grid overlay

## Phase 3: Enhanced AI & ML (Priority: HIGH)

### 3.1 ML Model Integration

**File**: `lib/ml/models/parameter-predictor.ts`

```typescript
// TensorFlow.js model for predicting missing parameters
export class ParameterPredictor {
  private model: tf.LayersModel;

  // Train on existing drawings
  async train(drawings: DrawingData[]): Promise<void>

  // Predict missing parameters
  async predict(partialParams: Partial<DrawingParams>): Promise<DrawingParams>
}
```

**Features**:
- Predict num_bedrooms from plot_area
- Predict optimal setbacks
- Suggest built_up_area based on plot size
- Recommend floor count

### 3.2 Layout Similarity Model

**File**: `lib/ml/models/layout-similarity.ts`

```typescript
// CNN-based model for visual layout similarity
export class LayoutSimilarityModel {
  // Compare two drawings visually
  async calculateSimilarity(
    drawing1: ImageData,
    drawing2: ImageData
  ): Promise<number>
}
```

**Technology**:
- TensorFlow.js
- Pre-trained MobileNet for feature extraction
- Custom similarity layer

### 3.3 Room Placement AI

**File**: `lib/ai/room-placement-engine.ts`

```typescript
// AI-powered room placement suggestions
export class RoomPlacementEngine {
  // Generate optimal room layouts
  async generateLayout(params: PlotParams): Promise<RoomLayout>

  // Apply architectural best practices
  applyDesignRules(layout: RoomLayout): RoomLayout
}
```

**Rules**:
- Master bedroom in corner
- Kitchen near service entrance
- Living room near main entrance
- Bathrooms adjacent to bedrooms
- Ventilation requirements (cross-ventilation)

### 3.4 Compliance Predictor

**File**: `lib/ml/models/compliance-predictor.ts`

```typescript
// Predict rule compliance before validation
export class CompliancePredictor {
  async predictCompliance(
    params: DrawingParams,
    rules: Rule[]
  ): Promise<CompliancePrediction>
}
```

## Phase 4: CAD Generation (Priority: MEDIUM)

### 4.1 Parametric CAD Generator

**File**: `lib/cad-generation/generator.ts`

```typescript
export class CADGenerator {
  // Generate DXF from parameters
  async generateFromParameters(
    params: GenerationParams
  ): Promise<DXFFile>

  // Features:
  // - Auto-place walls based on dimensions
  // - Add doors and windows
  // - Create room labels
  // - Apply setbacks
  // - Generate floor plans for multiple floors
}
```

**Technology**:
- dxf-writer npm package
- Custom geometry algorithms
- Template-based generation

### 4.2 Generation Templates

```
lib/cad-generation/templates/
├── residential/
│   ├── 2bhk.template.ts
│   ├── 3bhk.template.ts
│   └── villa.template.ts
└── commercial/
    ├── office.template.ts
    └── retail.template.ts
```

Each template defines:
- Default room dimensions
- Door/window placements
- Circulation patterns
- Architectural standards

### 4.3 Interactive Designer

**File**: `components/designer/interactive-designer.tsx`

Features:
- Drag-and-drop room placement
- Real-time dimension editing
- Wall thickness adjustment
- Door/window addition
- Live DXF generation
- Export to CAD software

## Phase 5: Advanced Features (Priority: MEDIUM)

### 5.1 Real-time Collaboration
- WebSocket integration
- Multi-user editing
- Change tracking
- Comment system

### 5.2 3D Visualization
- Photo-realistic rendering
- Virtual walkthrough
- Sun path simulation
- Material selection

### 5.3 Cost Estimation
- Material quantity calculation
- Labor cost estimation
- Regional price database
- BOQ (Bill of Quantities) generation

### 5.4 Mobile App
- React Native version
- On-site AR viewer
- Photo documentation
- Offline mode

## Installation & Running

### Backend (Already Running)
```bash
cd backend
npm run start:dev
# Running on http://localhost:3001
```

### Frontend (To Be Started)
```bash
cd frontend
npm install
npm run dev
# Will run on http://localhost:3000
```

## Quick Implementation Priority

### Week 1: Core Frontend
1. ✅ Setup (Done)
2. Authentication pages
3. Dashboard layout
4. Drawing list/grid
5. Upload functionality

### Week 2: CAD Viewer
1. Basic 2D viewer
2. 3D viewer with Three.js
3. Layer management
4. Zoom/pan controls

### Week 3: AI/ML
1. Parameter prediction model
2. Layout suggestions
3. Compliance checking
4. Integration with backend

### Week 4: CAD Generation
1. Basic DXF generation
2. Template system
3. Interactive designer
4. Export functionality

## Key Technologies

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **3D**: Three.js + React Three Fiber
- **ML**: TensorFlow.js
- **CAD**: dxf-viewer, dxf-writer

### ML/AI Stack
- **TensorFlow.js**: Browser-based ML
- **Pre-trained Models**: MobileNet for feature extraction
- **Custom Models**: Parameter prediction, similarity
- **Training Data**: Existing drawings in database

## Environment Variables

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ML_MODEL_PATH=/models
```

## API Integration Examples

### 1. Upload Drawing
```typescript
const uploadDrawing = async (file: File, params: DrawingParams) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', params.name);
  formData.append('categoryId', params.categoryId);

  const response = await api.post('/drawings/upload', formData);
  return response.data;
};
```

### 2. Get AI Suggestions
```typescript
const getSuggestions = async (params: PlotParams) => {
  const response = await api.post('/ai/suggest-layouts', params);
  return response.data; // Returns top 3 matching layouts
};
```

### 3. Generate CAD
```typescript
const generateCAD = async (params: GenerationParams) => {
  const response = await api.post('/cad/generate', params);
  return response.data; // Returns DXF file URL
};
```

## Development Tips

1. **Start with Core Features**: Authentication, listing, upload
2. **Incremental Development**: Build one page at a time
3. **Test with Backend**: Use Swagger docs to test APIs
4. **ML Models**: Train offline first, then integrate
5. **CAD Generation**: Start with simple rectangles, add complexity

## Resources & Documentation

- **Next.js**: https://nextjs.org/docs
- **Three.js**: https://threejs.org/docs
- **TensorFlow.js**: https://www.tensorflow.org/js
- **DXF Format**: http://paulbourke.net/dataformats/dxf/
- **shadcn/ui**: https://ui.shadcn.com

## Next Steps

1. Install frontend dependencies: `cd frontend && npm install`
2. Create authentication pages
3. Build dashboard layout
4. Implement drawing list
5. Add CAD viewer component
6. Integrate ML models
7. Build CAD generation

This is a comprehensive roadmap. Let me know which phase you'd like to prioritize!
