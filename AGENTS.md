# AGENTS.md — Project guide for AI agents

## What this project is

A Nuxt 4 web application that serves as both a **public countdown page** for Marmelab team trips and an **admin CMS** to create and manage those events. Each event has a dedicated page at `/<slug>` showing a countdown, a beer-progress bar, a transport vehicle with participant speech bubbles, and visual assets. The admin lives at `/admin` and is protected by GitHub OAuth.

## Stack

- **Nuxt 4** — SSR, file-based routing, auto-imports, H3 server routes
- **Vue 3** — Composition API only (`<script setup>`)
- **TypeScript** — strict, no implicit `any`, `noUncheckedIndexedAccess` enabled (from `.nuxt/tsconfig.json`)
- **yarn** — package manager (not npm)
- **Vitest** + `@vue/test-utils` + `happy-dom` — unit tests
- **Playwright** — E2E tests
- **nuxt-auth-utils** — GitHub OAuth session management

## Data storage

There is **no database**. All data is stored as JSON files in `content/`:

- `content/participants.json` — global list of all participants (`GlobalParticipant[]`)
- `content/events/<slug>.json` — one file per event (`TripEvent`)

Images are stored in `public/events/<slug>/` (event visuals) and `public/avatars/` (participant avatars).

## Core types (`types/event.ts`)

```ts
GlobalParticipant = { id, name, avatar, quote, active }
TripEvent = { slug, name, published, title, start, deadline, visuals: { background, goal }, participants: string[] }
TransportParticipant = { id, avatar, quote }  // derived at render time, never stored
```

Key naming rules:
- `TripEvent` (not `Event`) — avoids collision with the DOM `Event` type
- `TransportParticipant` (not `BusParticipant`) — generic transport naming
- Component `TransportVehicle` (not `BusImage`), `BeerProgress` (not `BeerImage`), `EventCountdown` (not `CountDown`)

## Business rules

- **Event limit**: maximum 5 events at a time (`EVENT_LIMIT` in `utils/constants.ts`). To create a new one, an old one must be deleted.
- **Participant quotes** are stored globally on `GlobalParticipant.quote`, never per-event.
- **Disabled participants** (`active: false`) are excluded from event pages and participant counts in the admin list, even if they are listed in an event's `participants` array.
- **Default visuals**: if an event has no background image set, `public/assets/back.png` is used; if no goal image, `public/assets/goal.png` is used.
- **Legacy data normalization**: `server/utils/events.ts` normalizes participants that were stored as `{ id, quote }` objects (old format) into plain string IDs on read.

## Authentication

Admin routes (`/admin/*`) are protected by GitHub OAuth via `nuxt-auth-utils`:

- Only the GitHub account matching `GITHUB_ALLOWED_LOGIN` env var is allowed.
- If the env var is unset, **access is denied** — there is no hardcoded fallback.
- The OAuth callback is at `/auth/github` (handled by `server/routes/auth/github.get.ts`).
- The route middleware (`middleware/admin.global.ts`) is **global** (`.global.ts` suffix) so Nuxt runs it on every navigation — named middlewares are not automatic and would require `definePageMeta` on every page.
- Env vars live in `.env` (not `.env.local` — Nuxt does not load `.env.local`).

**API protection** (`server/middleware/auth.ts`):
- `GET /api/events/[slug]` and `GET /api/participants` are **public** — used by the event display page.
- `GET /api/events` (list) and all POST/PUT/DELETE routes are **protected** — admin only.
- Uses `requireUserSession` (not `getUserSession`) to throw a proper 401.

Required env vars (see `.env`):
```
NUXT_SESSION_PASSWORD=        # random 32-char secret for session encryption
NUXT_OAUTH_GITHUB_CLIENT_ID=  # from the GitHub OAuth App
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
GITHUB_ALLOWED_LOGIN=         # exact GitHub username, case-sensitive (e.g. JulienMattiussi)
```

## Project structure

```
assets/css/theme.css      # CSS custom properties: colors, fonts, radii, shadows, spacing
assets/css/admin.css      # shared admin component styles (imported globally in nuxt.config.ts)
components/
  AppToast.vue            # global toast notifications (bottom-center, auto-dismiss)
  BeerProgress.vue        # beer progress bar
  EventCountdown.vue      # full countdown section, uses useCountdown composable
  EventPage.vue           # public event page wrapper
  TransportVehicle.vue    # animated transport with speech bubbles
composables/
  useAppToast.ts          # toast composable: toast.success(msg) / toast.error(msg)
  useCountdown.ts         # Vue composable wrapping countdown math
middleware/
  admin.global.ts         # global middleware — redirects unauthenticated users to /login for all /admin/* routes
pages/
  [slug].vue              # public event page
  login.vue               # GitHub OAuth login page
  admin/
    index.vue             # events list with delete + limit enforcement
    [slug].vue            # event editor (also handles /admin/new)
    participants.vue      # participant management (add, enable/disable, avatar upload)
server/
  api/events/             # GET list, POST create, PUT update, DELETE (also removes public/events/<slug>/), POST assets upload
  api/participants/       # GET list, POST create, PUT update, POST avatar upload
  routes/auth/github.get.ts  # OAuth callback
  middleware/auth.ts      # server middleware — enforces auth on protected API routes
  utils/events.ts         # read/write/list/normalize events and participants
  utils/fs.ts             # thin re-export of node:fs (allows mocking in tests)
tests/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright E2E tests
utils/
  constants.ts            # EVENT_LIMIT = 5
  countdownMath.ts        # pure math: computeProgress, splitDuration, beerCount, padTime
  error.ts                # extractErrorMessage(e, fallback) — shared error extraction for $fetch catch blocks
  slugify.ts              # shared slug/ID generation
```

## Coding rules

- **No type collisions**: always check for name conflicts with DOM/global types before naming a type.
- **No duplicated code**: shared logic lives in `utils/`, shared styles in `assets/css/admin.css`, shared constants in `utils/constants.ts`.
- **Theme variables**: all colors, fonts, radii, shadows and spacing live in `assets/css/theme.css` as CSS custom properties. Never hardcode these values in component styles — always reference a variable. This includes countdown-specific colors (`--color-countdown-numbers`, `--color-countdown-days`, `--color-countdown-reached`).
- **`node:fs` via wrapper**: never import `node:fs` directly in server code — use `~/server/utils/fs` so tests can mock it cleanly.
- **Nuxt auto-imports**: `utils/` and `composables/` are auto-imported by Nuxt; no explicit import needed in `.vue` files or server routes.
- **No speculative abstractions**: don't add helpers, fallbacks, or features that aren't required.
- **`vue-tsc --noEmit`** for typechecking (not `nuxt typecheck`).
- **Toasts**: use `useAppToast()` composable (`toast.success` / `toast.error`) — do not use any external toast composable.
- **`<UApp>`** is not used — `app.vue` wraps content in a plain `<div>` with `<AppToast />` for notifications.
- **Error extraction**: use `extractErrorMessage(e, fallback?)` from `~/utils/error` in all `catch` blocks that read `$fetch` error messages — do not repeat the `(e as { data?: { message?: string } }).data?.message` cast inline.
- **`noUncheckedIndexedAccess`**: Nuxt 4 enables this in `.nuxt/tsconfig.json`. Array and Record index access returns `T | undefined` — use `arr[i]!` when you know the element exists, or add a guard.

## Dependency notes

- **yarn resolutions** in `package.json` force `@vue/compiler-*` packages and `entities` to consistent versions — this is required to avoid a yarn 1 flat-hoisting conflict that breaks `vue-tsc`. Do not remove these resolutions.
- `@nuxt/ui`, `@nuxt/icon`, `@nuxt/fonts` are **not** used and should not be added back without a specific need.

## Commands

```bash
make install       # yarn install + playwright browsers
make dev           # start dev server on http://localhost:4567
make build         # production build
make lint          # ESLint
make typecheck     # vue-tsc --noEmit
make test-unit     # vitest run
make test-watch    # vitest (watch)
make test-e2e      # playwright test
make test          # unit + e2e
```

## Testing conventions

- Unit tests live in `tests/unit/`, E2E in `tests/e2e/`.
- To mock `node:fs` in unit tests, mock `~/server/utils/fs` (not `fs` or `node:fs` directly).
- Vue composables (`ref`, `computed`, etc.) and Nuxt globals (`useFetch`, `useRoute`, etc.) are stubbed globally in `tests/setup.ts`.
- Use `as never` instead of `as unknown as Buffer` for mock return value casts.
- **E2E auth**: all admin E2E tests use the authenticated fixture from `tests/e2e/fixtures.ts`, which calls `POST /api/__test-login` to create a session before each test. That endpoint is disabled in production (`NODE_ENV === 'production'`).
- **Playwright hydration timing**: in headless mode, clicks can fire before Vue has attached event listeners. Use `await page.waitForLoadState('networkidle')` after navigation on **any page with interactive UI** (buttons, forms) before attempting to click. This applies to all admin pages, not just `/admin/new`.
- **E2E seed data**: `content/events/belmont-2025.json` is the seed event required by E2E tests — it is the only event file tracked in git (all others are gitignored).

## What is and isn't versioned

- `content/events/*.json` — **not versioned** (runtime data), except `belmont-2025.json` which is the E2E seed.
- `content/participants.json` — versioned (seed participant list).
- `public/avatars/` — **versioned** (global participant avatars, shared across all events).
- `public/events/` — **not versioned** (per-event uploaded assets).
- `test-results/` and `playwright-report/` — **not versioned** (generated by Playwright).
