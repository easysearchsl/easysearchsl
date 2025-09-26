# EasySearch SL Web App

## Tech Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Requirements

- Node.js 18+ and npm

## Getting Started

```bash
# 1) Install dependencies
npm install

# 2) Create environment file
cp .env.example .env
# Edit .env and set:
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_SUPPORT_USER_ID=

# 3) Start the development server (with HMR)
npm run dev

# The app runs on http://localhost:8080
```

## Build and Preview

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

## Lint

```bash
npm run lint
```

## Notes

- PostCSS (Tailwind + Autoprefixer) is configured inline in `vite.config.ts` to avoid OneDrive file locking issues.
- Vite dev server is configured to run on port `8080` in `vite.config.ts`.
