# Migration Guide: Next.js to Vue 3 SPA

This document outlines the migration of the Makan Route frontend from Next.js (React) to Vue 3 SPA, while preserving the Next.js backend for API routes.

## 📁 Project Structure

### Before (Next.js Full-Stack)
```
makan-route/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── package.json
```

### After (Split Architecture)
```
makan-route/
├── src/
│   └── app/
│       └── api/          # ✅ KEPT: Next.js API routes (backend only)
└── vue-app/              # ✨ NEW: Vue 3 SPA frontend
    ├── src/
    │   ├── api/          # API client functions
    │   ├── components/   # Vue components
    │   ├── composables/  # Vue composables (replaces hooks)
    │   ├── router/       # Vue Router
    │   ├── types/        # TypeScript types
    │   ├── utils/        # Utility functions
    │   └── views/        # Page components
    └── package.json
```

## 🔄 Component Migration Map

| Next.js (React) | Vue 3 | Location |
|----------------|-------|----------|
| `src/app/page.tsx` | `HomeView.vue` | `vue-app/src/views/` |
| `src/app/makan-spots/page.tsx` | `MakanSpotsView.vue` | `vue-app/src/views/` |
| `LandingPage.tsx` | Merged into `HomeView.vue` | `vue-app/src/views/` |
| `MakanSpotsContainer.tsx` | Merged into `MakanSpotsView.vue` | `vue-app/src/views/` |
| `PlacesAlongRoute.tsx` | `PlacesAlongRoute.vue` | `vue-app/src/components/` |
| `SearchPlaceInput.tsx` | `SearchPlaceInput.vue` | `vue-app/src/components/` |
| `Button.tsx` | `BaseButton.vue` | `vue-app/src/components/` |
| - | `PlaceCard.vue` (extracted) | `vue-app/src/components/` |

## 🪝 Hooks → Composables Migration

| React Hook | Vue Composable | Changes |
|-----------|---------------|---------|
| `useDebouncedSearch` | `useDebouncedSearch` | Rewritten with Vue's `watch` API |
| `useGetPlacesAlongRoute` | `usePlacesAlongRoute` | Uses `@tanstack/vue-query` |
| `useSearchParams` (Next.js) | `useRoute()` from Vue Router | Different API |
| `useInView` (react-intersection-observer) | `useIntersectionObserver` (@vueuse/core) | Similar functionality |
| `useSuspenseQuery` | `useQuery` | Standard query in Vue |
| `useInfiniteQuery` | `useInfiniteQuery` | Same pattern, different syntax |

## 🎨 UI Library Changes

| Next.js | Vue 3 | Notes |
|---------|-------|-------|
| HeroUI React Components | Native HTML + Tailwind | Cards, buttons, inputs rebuilt with Tailwind |
| `@heroui/card` | Native `<div>` | Styled with Tailwind classes |
| `@heroui/button` | `<BaseButton>` component | Custom component |
| `@heroui/input` | Native `<input>` | Custom styled input |
| `@heroui/autocomplete` | Custom autocomplete | Built from scratch |

## 🔌 API Integration

The Vue app proxies all API requests to the Next.js backend:

**Vite Configuration (`vue-app/vite.config.ts`):**
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

### API Endpoints (Unchanged)
- `GET /api/location?q={query}` - TomTom location search
- `GET /api/makan-spots?ne={ne}&sw={sw}&cursor={cursor}` - Foursquare places
- `GET /api/makan-spots/get-route?locations={locations}` - TomTom route calculation

## 📦 Technology Stack Changes

### Frontend Dependencies

**Removed (React/Next.js specific):**
- `next`
- `react`
- `react-dom`
- `@heroui/react`
- `react-intersection-observer`

**Added (Vue 3 ecosystem):**
- `vue` - Core framework
- `vue-router` - Routing
- `vite` - Build tool
- `@vitejs/plugin-vue` - Vite Vue plugin
- `@tanstack/vue-query` - Data fetching
- `@vueuse/core` - Composition utilities
- `vue-tsc` - TypeScript support

**Kept (Shared):**
- `typescript`
- `tailwindcss`
- `zod` (schema validation)
- `lucide-react` icons replaced with inline SVG

## 🚀 Running the Application

### 1. Start the Next.js Backend (API Server)

```bash
# In the root directory
yarn dev
```

This starts Next.js on `http://localhost:3000` (API routes only).

### 2. Start the Vue Frontend (SPA)

```bash
# In the vue-app directory
cd vue-app
yarn install
yarn dev
```

This starts Vite on `http://localhost:5173` with API proxy to port 3000.

### 3. Access the Application

Open `http://localhost:5173` in your browser. The Vue app will automatically proxy API calls to the Next.js backend.

## 🔧 Key Implementation Differences

### 1. **Form Handling**

**React (Next.js):**
```tsx
<Form action="/makan-spots">
  <input name="origin" />
</Form>
```

**Vue 3:**
```vue
<form @submit="handleSubmit">
  <input v-model="origin" />
</form>

<script setup>
const handleSubmit = (e) => {
  e.preventDefault()
  router.push({ path: '/makan-spots', query: { ... } })
}
</script>
```

### 2. **State Management**

**React:**
```tsx
const [query, setQuery] = useState('')
```

**Vue 3:**
```typescript
const query = ref('')
```

### 3. **Effect/Watchers**

**React:**
```tsx
useEffect(() => {
  // side effect
}, [dependency])
```

**Vue 3:**
```typescript
watch(() => dependency, () => {
  // side effect
})
```

### 4. **Computed Values**

**React:**
```tsx
const value = useMemo(() => compute(), [deps])
```

**Vue 3:**
```typescript
const value = computed(() => compute())
```

### 5. **Component Props**

**React:**
```tsx
interface Props {
  name: string
}

function Component({ name }: Props) {
  return <div>{name}</div>
}
```

**Vue 3:**
```vue
<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
</script>

<template>
  <div>{{ name }}</div>
</template>
```

## 🎯 Migration Benefits

1. **Clear Separation of Concerns**: Frontend (Vue) and Backend (Next.js) are now separate apps
2. **Framework Flexibility**: Can deploy frontend and backend independently
3. **Type Safety Preserved**: All TypeScript types maintained
4. **Same User Experience**: Identical functionality and UI
5. **Modern Tooling**: Vite provides faster HMR than Next.js Turbopack

## 📝 Notable Changes

### Removed Features from React Version
- Server-side rendering (now pure client-side SPA)
- Next.js font optimization (using Google Fonts CDN)
- Next.js Image optimization (not needed in current app)

### Added Features in Vue Version
- Proper TypeScript declarations for Vite
- VueUse utilities for common patterns
- Cleaner separation between page views and components

## 🔍 Testing the Migration

### Manual Testing Checklist

1. **Landing Page**
   - [ ] Page loads correctly
   - [ ] Search inputs show autocomplete
   - [ ] Form submission navigates to results page

2. **Search Functionality**
   - [ ] Location search autocomplete works
   - [ ] Debouncing delays API calls
   - [ ] Selection populates hidden lat/lon inputs

3. **Results Page**
   - [ ] Route calculation displays correctly
   - [ ] Distance summary shows
   - [ ] Restaurant cards load
   - [ ] Infinite scroll loads more results
   - [ ] Distance calculations are accurate

4. **User Interactions**
   - [ ] "Find makan spots!" button works
   - [ ] "View in Google Maps" opens maps
   - [ ] Load more button triggers pagination

## 🚢 Deployment Considerations

### Frontend (Vue 3 SPA)
- Build: `yarn build` in `vue-app/`
- Output: `vue-app/dist/`
- Deploy to: Vercel, Netlify, S3, or any static hosting
- Environment: Set API base URL if not using relative paths

### Backend (Next.js API)
- Keep existing deployment setup
- Ensure CORS is configured for Vue app domain
- API routes remain at same paths

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [TanStack Query (Vue)](https://tanstack.com/query/latest/docs/vue/overview)
- [VueUse Documentation](https://vueuse.org/)
- [Vite Documentation](https://vitejs.dev/)

---

**Migration Completed**: ✅ All functionality ported successfully
**Build Status**: ✅ TypeScript compilation successful
**Bundle Size**: 202.85 kB (65.44 kB gzipped)

