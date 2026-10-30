# Marmelab en Voyage

A Nuxt 4 web application for Marmelab team trips. Each trip gets a public page with a countdown to the rendez-vous, a beer-progress bar, and an animated transport vehicle showing participant speech bubbles. An admin CMS at `/admin` lets the team manage events and participants.

- Home page at `/`: the published events
- Public event pages at `/<slug>`: countdown, beer-progress bar, transport vehicle with participant speech bubbles
- Link previews: saving an event in the admin draws its 1200×630 preview image (title, rendez-vous date, road and bus), shown when the link is shared
- Admin at `/admin` — protected by GitHub OAuth

## Stack

- **Nuxt 4** — SSR, file-based routing, H3 server routes
- **Vue 3** — Composition API (`<script setup>`)
- **TypeScript** — strict
- **yarn** — package manager
- **nuxt-auth-utils** — GitHub OAuth session management
- **@vercel/blob**: storage for Vercel deployments (private store for JSON data, public store for images)
- **satori** + **@resvg/resvg-js**: link-preview images
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
BLOB_READ_WRITE_TOKEN=        # public Blob store (images), required when STORAGE_DRIVER=vercel-blob
BLOB_DATA_READ_WRITE_TOKEN=   # private Blob store (JSON data), required when STORAGE_DRIVER=vercel-blob
```

The GitHub OAuth callback URL to register: `https://<your-domain>/auth/github`

In development, `STORAGE_DRIVER=local` keeps data on disk (`content/`, `public/`), so the Blob tokens are not needed.

## Commands

```bash
make start        # start dev server on http://localhost:4567 (alias: make dev)
make build        # build for production
make preview      # preview production build
make lint         # ESLint
make typecheck    # TypeScript type checking
make knip         # unused files, exports and dependencies
make check        # lint + typecheck + knip + unit tests + build (no e2e)
make test         # unit + e2e tests
make test-unit    # unit tests only
make test-watch   # unit tests in watch mode
make test-e2e     # end-to-end tests
make test-e2e-ui  # end-to-end tests with Playwright UI
```
