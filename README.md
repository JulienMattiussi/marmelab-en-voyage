# Marmelab en Voyage

A Nuxt 4 web application serving as a **public countdown page** for Marmelab team trips and an **admin CMS** to create and manage those events.

- Public event pages at `/<slug>` — countdown, beer-progress bar, transport vehicle with participant speech bubbles
- Admin at `/admin` — protected by GitHub OAuth

## Stack

- **Nuxt 4** — SSR, file-based routing, H3 server routes
- **Vue 3** — Composition API (`<script setup>`)
- **TypeScript** — strict
- **yarn** — package manager
- **Vitest** — unit tests
- **Playwright** — E2E tests

## Setup

```bash
make install
```

Copy `.env.example` to `.env` and fill in the required values:

```
NUXT_SESSION_PASSWORD=        # random 32-char secret
NUXT_OAUTH_GITHUB_CLIENT_ID=  # from your GitHub OAuth App
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
GITHUB_ALLOWED_LOGIN=         # exact GitHub username allowed to access /admin
```

## Commands

```bash
make dev          # start dev server on http://localhost:4567
make build        # production build
make preview      # preview production build
make lint         # ESLint
make typecheck    # TypeScript type checking
make test         # unit + e2e tests
make test-unit    # unit tests only
make test-watch   # unit tests in watch mode
make test-e2e     # end-to-end tests
make test-e2e-ui  # end-to-end tests with Playwright UI
```
