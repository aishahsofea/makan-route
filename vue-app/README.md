# Makan Route - Vue 3 Frontend

This is the Vue 3 SPA frontend for Makan Route, a food spot recommendation app that helps you discover local restaurants along your travel route.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Vue Router** - Client-side routing
- **TanStack Query (Vue Query)** - Data fetching and caching
- **VueUse** - Vue composition utilities
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zod** - Schema validation

## Project Structure

```
vue-app/
├── src/
│   ├── api/              # API client functions
│   ├── assets/           # Static assets and global styles
│   ├── components/       # Reusable Vue components
│   ├── composables/      # Vue 3 composition functions
│   ├── router/           # Vue Router configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── views/            # Page-level components
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── public/               # Public static assets
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## Prerequisites

- Node.js (v20.11.0 or higher recommended)
- Yarn package manager
- Next.js backend running on `http://localhost:3000` (from parent directory)

## Installation

```bash
# Install dependencies
yarn install
```

## Development

```bash
# Start the development server
yarn dev
```

The Vue app will be available at `http://localhost:5173`. The Vite dev server is configured to proxy API requests to the Next.js backend at `http://localhost:3000`.

## Building for Production

```bash
# Build the app for production
yarn build

# Preview the production build
yarn preview
```

## Backend Integration

This Vue app calls the following Next.js API routes:

- `GET /api/location?q={query}` - Search for locations
- `GET /api/makan-spots?ne={ne}&sw={sw}&cursor={cursor}` - Get restaurants along route
- `GET /api/makan-spots/get-route?locations={locations}` - Calculate route between points

Make sure the Next.js backend is running before starting the Vue development server.

## Key Features

- **Location Search**: Autocomplete search for origin and destination using TomTom API
- **Route Calculation**: Calculate optimal route between two points
- **Restaurant Discovery**: Find restaurants along the route using Foursquare API
- **Infinite Scroll**: Load more results as you scroll
- **Distance Calculations**: Show distances from origin and destination for each spot
- **Responsive Design**: Works on mobile, tablet, and desktop

## Component Overview

- **HomeView**: Landing page with search form
- **MakanSpotsView**: Results page showing restaurants along route
- **SearchPlaceInput**: Autocomplete location search input
- **PlacesAlongRoute**: List of restaurants with infinite scroll
- **PlaceCard**: Individual restaurant card with details
- **BaseButton**: Reusable button component

## Composables

- **useLocationSearch**: Handle location search with debouncing
- **useRouteData**: Fetch route data between two points
- **usePlacesAlongRoute**: Infinite query for places along route
- **useDebouncedSearch**: Debounce search input (legacy)

## Contributing

This is a port of the original Next.js frontend. The Next.js app in the parent directory now serves only as the API backend.

