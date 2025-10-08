# Homeflow


## Run

### Backend
```sh
cd backend
```

#### push database
```sh
pnpm run db:push
```

#### start backend
```sh
pnpm run dev
```



#### Chatler sog mach
# TODO (Backend Hardening & Polish)

## Routing & IDs
- [ ] Decide on a single ID scheme (prefer numeric IDs in URLs).
- [ ] Add explicit routes if supporting both:
  - [ ] `/api/devices/by-id/:id`
  - [ ] `/api/devices/by-name/:name`
- [ ] Remove/merge duplicate list endpoints (`/api/data/devices` vs `/api/drivers/devices`) or clearly scope them.

## Validation & Error Handling
- [ ] Add zod (or valibot) for:
  - [ ] Path params (coerced positive ints).
  - [ ] Query params (`from`, `to`, `limit`, `order`).
  - [ ] Bodies (`value` type union, optional `timestamp`).
- [ ] Standardize responses:
  - [ ] Success → `{ data: ... }` (or `{ success: true }`, pick one).
  - [ ] Errors → `{ error: string, code?: string, detail?: any }`.
- [ ] Replace `c.notFound()`/plain strings with JSON errors + correct status codes.
- [ ] Add global error handler middleware (hide stack traces in prod).
- [ ] Add per-request timeouts around driver calls; catch and return `502` on driver issues.

## Writes & Consistency
- [ ] Make `POST /api/data/properties/:id/write` transactional (current + history in one tx).
- [ ] Validate `value` against `device_properties.value_type` (number/boolean/string).
- [ ] Allow optional backfill writes with `timestamp` (validated ISO datetime).

## DB Schema Safety & Performance
- [ ] Add FKs:
  - [ ] `device_properties.device_id → devices.id (ON DELETE CASCADE)`
  - [ ] `device_data.property_id → device_properties.id (CASCADE)`
  - [ ] `device_current_data.property_id → device_properties.id (CASCADE)`
- [ ] Add unique constraint: `(device_id, key)` on `device_properties`.
- [ ] Add indexes:
  - [ ] `device_data(property_id, timestamp DESC)`
  - [ ] `device_properties(device_id)`
- [ ] Timescale setup (`init-timescale.sql`):
  - [ ] `create_hypertable('device_data', 'timestamp')`
  - [ ] Enable compression (segment by `property_id`) after 7 days.
  - [ ] Optional retention (e.g., 365 days) if desired.

## History & Current Data APIs
- [ ] Add query options to history endpoints:
  - [ ] `?from=ISO&to=ISO&limit=…&order=asc|desc`
  - [ ] Enforce sane max `limit` (e.g., ≤ 5000).
- [ ] Add a symmetric “current by key” route:
  - [ ] `GET /api/devices/:id/:key/current`
- [ ] Ensure all timestamps serialize as ISO strings.

## Devices API Cleanup
- [ ] Make `:id` consistently numeric everywhere (if chosen).
- [ ] If keeping name-based addressing, expose `/by-name/:name` variants only (avoid overloading `:id`).

## Security (pre-auth stopgaps)
- [ ] Add env flag to gate write operations in dev/prod:
  - [ ] `ALLOW_UNAUTH_WRITES=false` → return `403` for state-changing routes.
- [ ] Restrict CORS in prod to UI origin (keep `*` only for local dev).
- [ ] Add simple rate limiting for write endpoints.

## Observability & DX
- [ ] Request logging with request-id (pino).
- [ ] Log structure: method, path, status, duration, request-id.
- [ ] Health endpoint: `GET /healthz` (DB + driver readiness).
- [ ] Graceful shutdown: handle `SIGINT/SIGTERM`, stop drivers cleanly before closing server.

## Driver Runtime Contracts
- [ ] Wrap `runtime.sendProperty`/`runAction` in try/catch with timeouts.
- [ ] Map driver errors to 4xx vs 5xx (e.g., invalid value → 400, offline device → 502).
- [ ] Add `getRuntimeForDevice` failure → clear 5xx JSON error with code.

## Pagination
- [ ] Add `?limit`/`?offset` to list endpoints (`/api/devices`, `/api/drivers`, properties lists).
- [ ] Enforce max page size.

## OpenAPI & Client
- [ ] Annotate routes with `@hono/openapi` (or `hono zod-openapi`).
- [ ] Generate OpenAPI spec + publish Swagger UI in dev.
- [ ] Generate a typed client for the frontend (or use `hono/client`).

## Testing
- [ ] Route tests with Vitest + supertest (or Hono test utilities).
- [ ] DB tests with Testcontainers (Postgres + Timescale) loading `init-timescale.sql`.
- [ ] Driver runtime mocks for sendProperty/runAction paths.
- [ ] Smoke test for boot sequence (discover → start → serve).

## Small Consistency Nits
- [ ] Pick one success shape: `{ ok: true }` or `{ success: true }`.
- [ ] Unify naming of routes (`history` vs `current` vs root value retrieval).
- [ ] Return arrays as `{ data: [...] }` for consistency (if adopting that pattern).
- [ ] Ensure all numeric query/route params are validated/coerced.

## Docs & Dev Ergonomics
- [ ] Document all endpoints in README (paths, params, examples).
- [ ] Include env var table (PORT, DB URL, ALLOW_UNAUTH_WRITES, etc.).
- [ ] Add `pnpm` scripts: `dev`, `lint`, `test`, `migrate`, `seed`.
- [ ] Provide a small seed script for demo devices/properties.
- [ ] Add migration for new FKs/indexes/constraints.

## Future: Auth (later)
- [ ] Choose auth approach (Better Auth/Clerk/NextAuth w/ JWT API gating).
- [ ] Protect all write routes + sensitive reads.
- [ ] Store users/sessions (tables already sketched in comments).
- [ ] Add role/ownership checks for driver config updates.
