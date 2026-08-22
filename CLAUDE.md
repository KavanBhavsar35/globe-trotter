# GlobeTrotter — Project Guide

Multi-city travel planner (hackathon, Odoo problem statement). Users create trips, build day-wise itineraries from a seeded city/activity catalog, see an auto budget breakdown, and share a public read-only link.

**Deadline-driven MVP** — solo build, localhost demo, 5h. Scope is deliberately cut; see `docs/implementation.md`.

## Stack

- **Backend**: FastAPI + SQLModel + **SQLite** (`backend/globetrotter.db`, auto-created). Auth = **argon2** (passlib) password hash + **JWT** (PyJWT). No Alembic — tables via `create_all` on startup; catalog seeded on first boot. Catalog scope = **Japan, UK, India** only; reseed with `python backend/seed.py` (wipes catalog + dependent stops).
  - **Config**: all env-driven via `backend/core/config.py` (`pydantic-settings`, loads `backend/.env`; copy from `.env.example`). No hardcoded secrets/URLs — `SECRET_KEY`, `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `EMAIL_*`, `STORAGE_*` live there with localhost-demo defaults.
  - **Email**: `services/email_service.py` → `core/email.py` (`EmailSender`, provider = `console`|`smtp`). Default `console` prints emails (incl. password-reset link) to the backend terminal. Powers **forgot/reset password** (`/auth/forgot-password`, `/auth/reset-password`; `PasswordReset` table, single-use token, `RESET_TOKEN_MINUTES` expiry).
  - **Storage** (`boto3`): S3-compatible object store via `services/storage_service.py` → `core/storage.py`. Demo defaults target local **MinIO** (`localhost:9000`, bucket `globe-trotter`) — must be running + bucket created for uploads. Files are **private**; `/auth/me` hands back a short-lived **presigned GET URL** (`photo_url`). Powers **profile photo** (`POST /auth/me/photo`) and **trip cover photo** (`POST /trips/{id}/cover`, optional — create dialog uploads it after the trip is saved; `Trip.cover_key`, `cover_url` on `GET /trips`). Multipart, ≤5 MB, image only; stored under `profiles/` / `covers/`. Render presigned URLs with plain `<img>` (never `next/image` — the optimizer caches the expiring link).
- **Frontend**: Next.js **16** (App Router, ``) + React **19** + Tailwind **v4** + shadcn **"base-vega"** components.
  - shadcn base-vega is built on **Base UI** (`@base-ui/react`), **not Radix**. Controlled props are `open`/`onOpenChange` (Dialog) and `value`/`onValueChange` (Tabs). Some components use a `render={<El/>}` prop instead of Radix `asChild`.
  - Charts: **Recharts 3** via `components/ui/chart`. Icons: **lucide-react**.
  - ⚠️ Next 16 has breaking changes vs training data — see `frontend/AGENTS.md`; docs bundled at `frontend/node_modules/next/dist/docs/`. `params`/`searchParams` are async in server components; interactive pages use client hooks (`useParams`, `useSearchParams`).

## Run (two terminals)

```bash
# backend  → http://localhost:8000  (docs at /docs)
cd backend && . ../.venv/bin/activate && fastapi dev main.py
```
```bash
# frontend → http://localhost:3000
cd frontend && pnpm dev
```
Registries are firewalled inside the agent sandbox — **installs must be run by the human** in a normal terminal.

## Conventions

- API base: `http://localhost:8000` (override with `NEXT_PUBLIC_API_URL`).
- Auth: JWT + email in `localStorage` (`gt_token`, `gt_email`). All requests go through `lib/api.ts:apiFetch`; auth flows in `lib/auth.ts`. **localhost-demo only** — not XSS-safe for production. Signup (`/login` → Sign up tab) collects profile — first/last name, phone, city, country, bio ("Additional Information") — stored on `User`; `/auth/me` returns them. **Profile photo** upload lives at `/profile` (nav avatar → page; `POST /auth/me/photo` via S3/MinIO). **Catalog images**: `City.img_url` / `Activity.img_url` (blank in seed) fall back to searchable **loremflickr** (`lib/format.ts:imageOr`/`loremflickr`, whitelisted in `next.config.ts`) — rendered on city-search cards, activity cards, dashboard destinations, itinerary stop banners. Swap `img_url` for real photos later.
- Routes: `/login` (public), everything under `app/(app)/*` is guarded by `useRequireAuth`, `/trip/[token]` is the public share view.
- Dates: native `<input type="date">` — no date-picker library.
- Catalog is **country-scoped**: a trip picks ONE `country` at creation (dropdown, from `GET /countries`). Stop builder (`components/add-stop-form.tsx`) is a **city search** — search bar + image cards showing cost index + `popularity` (0–100, drives sort + "Popular" badge), scoped to the trip's country via `GET /cities?country=X` (`/cities` also accepts `q`). Activity search (`components/add-activity-dialog.tsx`) filters by type/cost/duration and shows `description` + image, with add/remove per activity.
- Toasts (sonner) at **top-left**; confirms go through `lib/confirm.ts:confirmToast` (never `window.confirm`/`alert`).
- **Theme** (modern-bright): indigo-violet `--primary`; bright multi-hue `--chart-1..5` for the budget pie; headings **Space Grotesk** (`--font-heading`), body **Inter**. Dark mode via `next-themes` — toggle in nav (`components/theme-toggle.tsx`) or `d` key. Tokens in `app/globals.css`. **Icons = `lucide-react`, never emojis.**
- Budget is a **naive heuristic** (flat meals $30/night, transport $100/stop, stay = city cost index × nights), computed on read in `backend/main.py:build_itinerary`. Tune only if asked.

## Scope status

Building all 13 screens. Profile settings now built: editable name/email/phone/city/country/bio (`PATCH /auth/me`), photo upload, delete account (`DELETE /auth/me`, cascades trips), saved-destinations list (`GET /auth/me/destinations`, derived from trip stops), language preference (localStorage `gt_lang` — preference-only, no i18n consumer). **Community feed** (`/community` page + `GET /community?q=&country=&sort=`): browse public trips; trips made public at creation (`is_public` on `TripIn`, mints `share_token`). **Calendar** (`/calendar`): shadcn `Calendar` (react-day-picker v9 — **human-installed dep**) with a custom `DayButton` cell showing trip names per day. **Admin panel** (`/admin`, gated on `ADMIN_EMAIL` env → `me.is_admin`; `GET /admin/stats`): stat tiles, popular-cities pie, popular-activities bar, users table. Drag-reorder stays list + up/down buttons.
