# EasySearch SL Web App

EasySearch SL is a modern, TypeScript-first React application that provides a streamlined, fast search experience with a clean UI built on shadcn-ui and Tailwind CSS. This repository contains the client-side code, local development tooling, and configuration.

## Tech Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

- Fast local dev with Vite and HMR
- Type-safe codebase (TypeScript)
- Styled with Tailwind CSS and shadcn-ui components
- Environment-driven configuration via `.env` (see `.env.example`)
- Linting via ESLint and project scripts

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

## Links

- Repository: https://github.com/easysearchsl/easysearchsl
- Branches: `dev` (active development), `main` (stable)

## Contributing

Contributions are welcome! Please open an issue to discuss proposed changes or create a pull request from a feature branch targeting `dev`.

1. Fork the repo and create your branch from `dev`.
2. Make your changes and add tests where appropriate.
3. Run `npm run lint` and ensure there are no lint errors.
4. Open a PR using the provided template.

## License

Unless stated otherwise, this project is proprietary to EasySearch SL. If you plan to open-source it, add a license file (e.g., MIT) at the repository root and update this section accordingly.
