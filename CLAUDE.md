# GlobeTrotter — Project Guide

Multi-city travel planner (hackathon, Odoo problem statement). Users create trips, build day-wise itineraries from a seeded city/activity catalog, see an auto budget breakdown, and share a public read-only link.

**Deadline-driven MVP** — solo build, localhost demo, 5h. Scope is deliberately cut; see `docs/implementation.md`.

## Stack

- **Backend**: FastAPI + SQLModel + **SQLite** (`backend/globetrotter.db`, auto-created). Auth = **argon2** (passlib) password hash + **JWT** (PyJWT). No Alembic — tables via `create_all` on startup; catalog seeded on first boot. Catalog scope = **Japan, UK, India** only; reseed with `python backend/seed.py` (wipes catalog + dependent stops).
  - **Config**: all env-driven via `backend/core/config.py` (`pydantic-settings`, loads `backend/.env`; copy from `.env.example`). No hardcoded secrets/URLs — `SECRET_KEY`, `DATABASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS`, `EMAIL_*` live there with localhost-demo defaults.
  - **Email**: `services/email_service.py` → `core/email.py` (`EmailSender`, provider = `console`|`smtp`). Default `console` prints emails (incl. password-reset link) to the backend terminal. Powers **forgot/reset password** (`/auth/forgot-password`, `/auth/reset-password`; `PasswordReset` table, single-use token, `RESET_TOKEN_MINUTES` expiry).
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
- Auth: JWT + email in `localStorage` (`gt_token`, `gt_email`). All requests go through `lib/api.ts:apiFetch`; auth flows in `lib/auth.ts`. **localhost-demo only** — not XSS-safe for production.
- Routes: `/login` (public), everything under `app/(app)/*` is guarded by `useRequireAuth`, `/trip/[token]` is the public share view.
- Dates: native `<input type="date">` — no date-picker library.
- Catalog is **country-scoped**: a trip picks ONE `country` at creation (dropdown, from `GET /countries`). Builder lists only that country's cities via `GET /cities?country=X` in an inline `<select>` (no popup). `/cities` still accepts `q`.
- Toasts (sonner) at **top-left**; confirms go through `lib/confirm.ts:confirmToast` (never `window.confirm`/`alert`).
- **Theme** (modern-bright): indigo-violet `--primary`; bright multi-hue `--chart-1..5` for the budget pie; headings **Space Grotesk** (`--font-heading`), body **Inter**. Dark mode via `next-themes` — toggle in nav (`components/theme-toggle.tsx`) or `d` key. Tokens in `app/globals.css`. **Icons = `lucide-react`, never emojis.**
- Budget is a **naive heuristic** (flat meals $30/night, transport $100/stop, stay = city cost index × nights), computed on read in `backend/main.py:build_itinerary`. Tune only if asked.

## Scope status

Building 10 of 13 screens. **Cut**: admin dashboard (#13), calendar/drag-reorder (#10 → list only), real profile settings (#12 → email + logout), photo upload.
