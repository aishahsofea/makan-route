# Makan Route 🍜

An AI-powered food recommendation app that helps you discover local restaurants along your travel route.

## 🏗️ Architecture

This project demonstrates a modern split architecture:

- Frontend: Vue 3 SPA with TypeScript (vue-app/)
- Backend: Next.js API routes (src/app/api/)

> _Note_: This project was originally a full-stack Next.js app and has been migrated to separate the frontend (Vue 3) from the backend (Next.js API).
>
> See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

## 🚀 Quick Start

### Prerequisites

- Node.js (v20+)
- Yarn package manager
- TomTom API key ([sign up](https://developer.tomtom.com/))
- Foursquare API key ([sign up](https://foursquare.com/developers))
- Upstash Redis ([sign up](https://upstash.com/))

### Setup Environment Variables

```bash
cp env.example .env
```

Add your API keys:

- TOMTOM_API_KEY - TomTom API key
- FOURSQUARE_API_KEY - Foursquare API key
- UPSTASH_REDIS_REST_TOKEN - Upstash Redis token
- UPSTASH_REDIS_REST_URL - Upstash Redis URL (omit https://)

### Running the Application

_Terminal 1: Start the Backend (Next.js API)_

```bash
yarn dev
```

Runs on http://localhost:3000

_Terminal 2: Start the Frontend (Vue 3 SPA)_

```bash
cd vue-app
yarn install  # First time only
yarn dev
```

Runs on http://localhost:5173

Access the app: Open http://localhost:5173 in your browser
