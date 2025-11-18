# Vue 3 SPA Setup Guide

## Quick Start

### Prerequisites
1. Make sure Node.js (v20+) and Yarn are installed
2. Ensure the Next.js backend is running on port 3000

### Installation & Running

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
# Build the app
yarn build

# Preview production build
yarn preview
```

## Development Workflow

### Starting Both Apps

**Terminal 1 - Next.js Backend (API):**
```bash
cd /path/to/makan-route
yarn dev
```
This runs on `http://localhost:3000`

**Terminal 2 - Vue Frontend:**
```bash
cd /path/to/makan-route/vue-app
yarn dev
```
This runs on `http://localhost:5173`

### File Structure

```
vue-app/
├── src/
│   ├── api/                    # API client functions
│   │   ├── location.ts         # Location search API
│   │   ├── places.ts           # Places search API
│   │   └── route.ts            # Route calculation API
│   │
│   ├── components/             # Reusable Vue components
│   │   ├── BaseButton.vue      # Button component
│   │   ├── PlaceCard.vue       # Individual restaurant card
│   │   ├── PlacesAlongRoute.vue # Restaurant list with infinite scroll
│   │   └── SearchPlaceInput.vue # Autocomplete location search
│   │
│   ├── composables/            # Vue composition functions
│   │   ├── useDebouncedSearch.ts
│   │   ├── useLocationSearch.ts
│   │   ├── usePlacesAlongRoute.ts
│   │   └── useRouteData.ts
│   │
│   ├── router/                 # Vue Router configuration
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.ts              # API response types & Zod schemas
│   │   └── index.ts            # Global types
│   │
│   ├── utils/                  # Utility functions
│   │   ├── boundingBox.ts      # Bounding box calculations
│   │   └── haversine.ts        # Distance calculations
│   │
│   ├── views/                  # Page-level components
│   │   ├── HomeView.vue        # Landing page (/)
│   │   └── MakanSpotsView.vue  # Results page (/makan-spots)
│   │
│   ├── assets/
│   │   └── styles/
│   │       └── main.css        # Global styles + Tailwind
│   │
│   ├── App.vue                 # Root component
│   ├── main.ts                 # App entry point
│   └── vite-env.d.ts           # Vite type declarations
│
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config (includes API proxy)
├── tailwind.config.js          # Tailwind CSS config
└── postcss.config.js           # PostCSS config
```

## Key Features

### 1. Location Search Autocomplete
- Debounced search (300ms)
- Powered by TomTom API via Next.js backend
- Displays location name and address
- Stores lat/lon for route calculation

### 2. Route Calculation
- Uses TomTom Routing API
- Calculates optimal path between two points
- Displays total distance and travel time

### 3. Restaurant Discovery
- Foursquare API integration
- Shows restaurants within route bounding box
- Displays distance from origin and destination
- Categories/tags for each restaurant

### 4. Infinite Scroll
- Loads 10 restaurants at a time
- Auto-loads more as you scroll (intersection observer)
- Manual "Load More" button as fallback

## API Proxy Configuration

The Vite dev server proxies API calls to the Next.js backend:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

This means:
- Vue app calls `/api/location` → proxied to `http://localhost:3000/api/location`
- No CORS issues in development
- Production requires proper API URL configuration

## Component Communication

### Props Down
```vue
<PlaceCard
  :place="place"
  :origin-coordinates="originCoords"
  :destination-coordinates="destCoords"
/>
```

### Events Up (v-model)
```vue
<SearchPlaceInput
  v-model="origin"
  name="origin"
  label="Starting Point"
/>
```

## State Management

Currently using **local component state + composables**. No global store (Pinia) needed yet.

### Composables Pattern

```typescript
// composables/usePlacesAlongRoute.ts
export const usePlacesAlongRoute = (boundingBox) => {
  const query = useInfiniteQuery({
    queryKey: ['places-along-route', boundingBox],
    queryFn: fetchPlacesAlongRoute,
    // ... config
  })

  return {
    data: computed(() => query.data.value),
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  }
}
```

## Styling

### Tailwind CSS 4
- Uses the new `@import "tailwindcss"` syntax
- Custom CSS variables for theming
- Matches the original Next.js design

### Custom Theme
```css
:root {
  --secondary: rgb(254, 207, 8); /* Yellow accent */
  --foreground: rgb(14 25 34);   /* Dark blue */
  /* ... more variables */
}
```

## TypeScript

### Type Safety
- All components use `<script setup lang="ts">`
- API responses validated with Zod schemas
- Type inference from composables

### Common Types
```typescript
// types/index.ts
export type Coordinate = {
  lat: number
  lon: number
}

// types/api.ts
export type Place = z.infer<typeof placeSchema>
export type PlaceAlongRoute = z.infer<typeof placeAlongRouteSchema>
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use environment variable
VITE_PORT=5174 yarn dev
```

### API Calls Failing
1. Ensure Next.js backend is running on port 3000
2. Check proxy configuration in `vite.config.ts`
3. Verify API route paths match backend

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
yarn install
yarn build
```

## Performance

### Build Output
- Total bundle: ~203 KB
- Gzipped: ~65 KB
- Fast initial load with code splitting

### Optimizations
- Lazy loading of routes
- Debounced API calls
- TanStack Query caching
- Intersection observer for infinite scroll

## Next Steps

1. Add error boundaries
2. Implement retry logic for failed API calls
3. Add unit tests with Vitest + Vue Test Utils
4. Add E2E tests with Playwright
5. Implement analytics tracking
6. Add loading skeletons
7. Add PWA support

## Resources

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [TanStack Query Vue](https://tanstack.com/query/latest/docs/vue/overview)
- [VueUse](https://vueuse.org/)

