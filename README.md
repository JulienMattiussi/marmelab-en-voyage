# Marmelab en Voyage

A Nuxt 4 web application for Marmelab team trips. Each trip gets a public page with a countdown to departure, a beer-progress bar, and an animated transport vehicle showing participant speech bubbles. An admin CMS at `/admin` lets the team manage events and participants.

- Public event pages at `/<slug>` — countdown, beer-progress bar, transport vehicle with participant speech bubbles
- Admin at `/admin` — protected by GitHub OAuth

## Stack

- **Nuxt 4** — SSR, file-based routing, H3 server routes
- **Vue 3** — Composition API (`<script setup>`)
- **TypeScript** — strict
- **yarn** — package manager
- **nuxt-auth-utils** — GitHub OAuth session management
- **@vercel/blob** — asset and JSON storage for Vercel deployments
- **Vitest** — unit tests
- **Playwright** — E2E tests

## Setup

```bash
make install
```

Copy `.env.example` to `.env` and fill in the required values:

```
NUXT_SESSION_PASSWORD=        # random 32-char secret — generate with: openssl rand -base64 32
NUXT_OAUTH_GITHUB_CLIENT_ID=  # from your GitHub OAuth App
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
GITHUB_ALLOWED_LOGIN=         # exact GitHub username allowed to access /admin
STORAGE_DRIVER=local          # or 'vercel-blob' for Vercel deployments
BLOB_READ_WRITE_TOKEN=        # required when STORAGE_DRIVER=vercel-blob
```

The GitHub OAuth callback URL to register: `https://<your-domain>/auth/github`

## Commands

```bash
make dev          # start dev server on http://localhost:4567
make build        # build for production
make preview      # preview production build
make lint         # ESLint
make typecheck    # TypeScript type checking
make test         # unit + e2e tests
make test-unit    # unit tests only
make test-watch   # unit tests in watch mode
make test-e2e     # end-to-end tests
make test-e2e-ui  # end-to-end tests with Playwright UI
```
