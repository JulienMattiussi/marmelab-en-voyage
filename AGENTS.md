# AGENTS.md — Project guide for AI agents

## What this project is

A Nuxt 3 web application that serves as both a **public countdown page** for Marmelab team trips and an **admin CMS** to create and manage those events. Each event has a dedicated page at `/<slug>` showing a countdown, a beer-progress bar, a transport vehicle with participant speech bubbles, and visual assets. The admin lives at `/admin` and is protected by GitHub OAuth.

## Stack

- **Nuxt 3** — SSR, file-based routing, auto-imports, H3 server routes
- **Vue 3** — Composition API only (`<script setup>`)
- **TypeScript** — strict, no implicit `any`
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
- The route middleware is at `middleware/admin.ts`.

Required env vars (see `.env`):
```
NUXT_SESSION_PASSWORD=        # random 32-char secret for session encryption
NUXT_OAUTH_GITHUB_CLIENT_ID=  # from the GitHub OAuth App
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
GITHUB_ALLOWED_LOGIN=         # your GitHub username (e.g. JulienMattiussi)
```

## Project structure

```
assets/css/theme.css      # CSS custom properties: colors, fonts, radii, shadows, spacing
assets/css/admin.css      # shared admin component styles (imported globally in nuxt.config.ts)
components/
  BeerProgress.vue        # beer progress bar
  EventCountdown.vue      # full countdown section, uses useCountdown composable
  EventPage.vue           # public event page wrapper
  TransportVehicle.vue    # animated transport with speech bubbles
composables/
  useCountdown.ts         # Vue composable wrapping countdown math
middleware/
  admin.ts                # redirects unauthenticated users to /login
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
  utils/events.ts         # read/write/list/normalize events and participants
  utils/fs.ts             # thin re-export of node:fs (allows mocking in tests)
tests/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright E2E tests
utils/
  constants.ts            # EVENT_LIMIT = 5
  countdownMath.ts        # pure math: computeProgress, splitDuration, beerCount, padTime
  slugify.ts              # shared slug/ID generation
```

## Coding rules

- **No type collisions**: always check for name conflicts with DOM/global types before naming a type.
- **No duplicated code**: shared logic lives in `utils/`, shared styles in `assets/css/admin.css`, shared constants in `utils/constants.ts`.
- **Theme variables**: all colors, fonts, radii, shadows and spacing live in `assets/css/theme.css` as CSS custom properties. Never hardcode these values in component styles — always reference a variable.
- **`node:fs` via wrapper**: never import `node:fs` directly in server code — use `~/server/utils/fs` so tests can mock it cleanly.
- **Nuxt auto-imports**: `utils/` and `composables/` are auto-imported by Nuxt; no explicit import needed in `.vue` files or server routes.
- **No speculative abstractions**: don't add helpers, fallbacks, or features that aren't required.
- **`vue-tsc --noEmit`** for typechecking (not `nuxt typecheck`) — the latter forces `.nuxt/tsconfig.json` which includes `node_modules/@nuxt/ui` source files that have upstream type errors.

## Commands

```bash
make install       # yarn install + playwright browsers
make dev           # start dev server
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
