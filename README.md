# EasySearch SL Web App
Search-friendly React web application for EasySearch SL, built with Vite, TypeScript, Tailwind and shadcn-ui. This repo contains the front-end codebase and local development tooling.
## Tech Stack

- Vite
- TypeScript
- React + React Router
- shadcn-ui (Radix + Tailwind components)
- Tailwind CSS
- TanStack Query (data fetching/cache)
- Supabase JS (auth/storage, optional)

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

## Environment Variables

The app reads the following variables from `.env` (see `.env.example`):

- `VITE_SUPABASE_URL` – Your Supabase project URL (e.g. https://xyzcompany.supabase.co)
- `VITE_SUPABASE_ANON_KEY` – Supabase anon/public API key
- `VITE_SUPPORT_USER_ID` – UUID for a support/admin user (if your app uses it)

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

## Available Scripts

- `npm run dev` – Start the Vite dev server with HMR
- `npm run build` – Build the app for production
- `npm run build:dev` – Development-mode build (useful for testing)
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint on the project

## Notes

- PostCSS (Tailwind + Autoprefixer) is configured inline in `vite.config.ts` to avoid OneDrive file locking issues.
- Vite dev server is configured to run on port `8080` in `vite.config.ts`.

## Contributing

1. Create a feature branch from `dev`.
2. Commit your changes with clear messages.
3. Push and open a Pull Request to `dev` using the provided template in `.github/pull_request_template.md`.

## License

This project is proprietary to EasySearch SL. If you plan to open-source it, add a LICENSE file and update this section.

## Links

- Repository: https://github.com/easysearchsl/easysearchsl
