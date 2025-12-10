# CAD House Plan Manager - Frontend

AI-Powered CAD Drawing Management and Validation System - React/Next.js Frontend

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Persistent sessions with localStorage
- Protected routes with automatic redirection

### 📊 Dashboard
- Real-time statistics (total drawings, validated, pending, rejected)
- Quick action buttons for common tasks
- Recent drawings overview
- User profile display

### 📁 Drawing Management
- **List View**: Grid and list layouts for browsing drawings
- **Upload**: Drag-and-drop interface for DXF/DWG files
- **Detail View**: Comprehensive drawing information with tabs
  - Overview with preview
  - Extracted parameters
  - Validation results
  - Similar drawings
- Search and filter functionality
- Delete drawings with confirmation

### 🔍 Search & Match
- Parameter-based search (plot size, bedrooms, bathrooms, floors, region, state)
- Match score breakdown (geometric, parameter, layout, compliance)
- Visual similarity indicators
- Detailed match results with reasons

### ✨ AI Suggestions
- Input plot parameters for intelligent recommendations
- Popular layout suggestions based on requirements
- AI-powered room placement recommendations
- Match scoring and popularity rankings
- Reason-based suggestions

### 👤 User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme Support**: CSS variables for theming
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Interactive Elements**: Toast notifications, modals, dropdowns
- **Navigation**: Sidebar with role-based menu items

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **3D Rendering**: Three.js + React Three Fiber (planned)
- **File Upload**: react-dropzone
- **Icons**: lucide-react
- **Charts**: recharts (for analytics)

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── dashboard/            # Protected dashboard routes
│   │   │   ├── drawings/         # Drawing management
│   │   │   │   └── [id]/         # Drawing detail page
│   │   │   ├── upload/           # Upload interface
│   │   │   ├── search/           # Search & match
│   │   │   ├── suggestions/      # AI suggestions
│   │   │   ├── validation/       # Validation UI (placeholder)
│   │   │   ├── admin/            # Admin panel (placeholder)
│   │   │   └── settings/         # User settings (placeholder)
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── layout/               # Layout components
│   │   │   ├── sidebar.tsx       # Navigation sidebar
│   │   │   └── header.tsx        # Dashboard header
│   │   └── ui/                   # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── label.tsx
│   │       ├── toast.tsx
│   │       ├── tabs.tsx
│   │       └── badge.tsx
│   ├── stores/                   # Zustand state stores
│   │   ├── auth.store.ts         # Authentication state
│   │   └── drawing.store.ts      # Drawing management state
│   ├── services/
│   │   └── api.ts                # API service with Axios
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── lib/
│       └── utils.ts              # Utility functions
├── .env.local                    # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment variables:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## API Integration

The frontend is fully integrated with the NestJS backend through the `api.ts` service:

### Available API Methods

**Authentication:**
- `login(email, password)`
- `register(data)`

**Drawings:**
- `getDrawings(params?)`
- `getDrawing(id)`
- `uploadDrawing(formData)`
- `deleteDrawing(id)`
- `searchDrawings(criteria)`

**Categories:**
- `getCategories()`

**CAD:**
- `getCADMetadata(drawingId)`
- `getCADParameters(drawingId)`

**Matching:**
- `findMatches(paramsOrDrawingId, options?)`

**AI:**
- `getLayoutSuggestions(params)`
- `getAiSuggestions(params)`
- `suggestRoomPlacement(params)`
- `optimizeLayout(drawingId, params)`

**Rules:**
- `getRules(params?)`
- `validateDrawing(drawingId)`

**Admin:**
- `getStatistics()`
- `getParameters()`
- `createParameter(data)`

## State Management

### Auth Store (`useAuthStore`)
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,

  login: (email, password) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => void,
  setUser: (user) => void,
  setToken: (token) => void,
  clearError: () => void
}
```

### Drawing Store (`useDrawingStore`)
```typescript
{
  drawings: Drawing[],
  categories: DrawingCategory[],
  currentDrawing: Drawing | null,
  isLoading: boolean,
  error: string | null,

  fetchDrawings: (params?) => Promise<void>,
  fetchCategories: () => Promise<void>,
  fetchDrawing: (id) => Promise<void>,
  uploadDrawing: (formData) => Promise<Drawing>,
  deleteDrawing: (id) => Promise<void>,
  setCurrentDrawing: (drawing) => void,
  clearError: () => void
}
```

## Demo Credentials

Use these credentials to test the application:

- **Admin**: admin@cad.com / admin123
- **Architect**: architect@cad.com / architect123

## Development Notes

### Build Issues
The production build may show errors related to static generation because pages use client-side state (localStorage, Zustand). These errors don't affect functionality in development mode. To fix for production:

1. Add `export const dynamic = 'force-dynamic'` to pages using client-side state
2. Or configure `next.config.js` to use `output: 'standalone'` for dynamic rendering

### Future Enhancements

1. **CAD Viewer Component**
   - 3D visualization with Three.js
   - 2D plan view with layer management
   - Zoom, pan, rotate controls
   - Measurement tools

2. **ML Models**
   - Parameter prediction with TensorFlow.js
   - Layout similarity detection
   - Room placement AI
   - Compliance predictor

3. **Advanced Features**
   - Real-time validation preview
   - Cost estimation
   - Collaborative editing
   - Export to various formats

4. **Admin Panel**
   - User management
   - Rule configuration
   - Parameter definitions
   - System statistics

5. **Validation UI**
   - Interactive rule editor
   - Visual violation indicators
   - Compliance reports
   - Rule testing interface

## Performance Optimizations

- Image optimization with Next.js Image component (ready to implement)
- Code splitting with dynamic imports
- API response caching
- Optimistic UI updates
- Debounced search inputs
- Lazy loading for large lists

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: API requests fail with CORS errors
**Solution**: Ensure backend CORS is configured to allow requests from http://localhost:3000

### Issue: Authentication redirects not working
**Solution**: Check that .env.local has correct NEXT_PUBLIC_API_URL

### Issue: Build fails with font errors
**Solution**: Google Fonts have been removed; app uses system fonts

## Contributing

When adding new features:

1. Create new pages in `src/app/`
2. Add reusable components to `src/components/ui/`
3. Update type definitions in `src/types/index.ts`
4. Add new API methods to `src/services/api.ts`
5. Create stores for complex state in `src/stores/`

## License

Copyright © 2024 CAD House Plan Manager
