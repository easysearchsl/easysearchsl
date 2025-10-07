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
# VITE_APP_NAME=EasySearch SL  # optional

# 3) Start the development server (with HMR)
npm run dev

# The app runs on http://localhost:8080
```

## Environment Variables

The app reads the following variables from `.env` (see `.env.example`):

- `VITE_SUPABASE_URL` – Your Supabase project URL (e.g. https://xyzcompany.supabase.co)
- `VITE_SUPABASE_ANON_KEY` – Supabase anon/public API key
- `VITE_APP_NAME` – Optional display name (defaults are used in UI if missing)

Keep real secrets out of git. `.gitignore` excludes common env files; commit only `.env.example`.

## Build and Preview

```bash
# Production build
npm run build

# Preview the production build locally
npm run preview
```

## Authentication & Password Reset

- Email/password sign-in and registration are enabled.
- Google OAuth is integrated via Supabase.
  - OAuth callback is handled by Supabase; the app uses `redirectTo` back to your origin.
  - Ensure Google provider is enabled in Supabase and URLs are configured in Project Settings.
- Password reset flow:
  - Request reset on `ForgotPassword` page (`/forgot-password`).
  - Supabase sends a link that redirects to `/reset-password` where user sets a new password.

## Seeding Demo Data (optional)

Two approaches:

- Dashboard-only:
  1. Create users in Supabase Auth > Users (email confirmed):
     - Super Admin: `easysearchsl@gmail.com` / `@password123`
     - Owners: `owner1@demo.local` … `owner5@demo.local` / `@password123`
  2. Run SQL in Supabase SQL Editor:
     - `supabase/multi_tenancy.sql`
     - `supabase/seed/setup_schema.sql`
     - Use the provided seed SQL (see previous instructions or scripts) to upsert profiles, create organizations, memberships, and published listings.

- Node seeder (requires Service Role key):
  - File: `supabase/seed/seed_demo.mjs`
  - Set env locally (do not commit):
    ```bash
    SUPABASE_URL=https://<your-ref>.supabase.co \
    SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
    node supabase/seed/seed_demo.mjs
    ```
  - This creates the super admin, 5 owner users, their organizations, memberships, and a published listing for each.
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
- Supabase client setup lives in `src/lib/supabase.ts` and uses smart storage to respect the chosen persistence mode.

## Contributing

1. Create a feature branch from `dev`.
2. Commit your changes with clear messages.
3. Push and open a Pull Request to `dev` using the provided template in `.github/pull_request_template.md`.

## License

This project is proprietary to EasySearch SL. If you plan to open-source it, add a LICENSE file and update this section.

## Links

- Repository: https://github.com/easysearchsl/easysearchsl
