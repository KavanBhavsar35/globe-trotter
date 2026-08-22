# GlobeTrotter — Implementation Plan

Solo build · localhost demo · 5-hour budget · MVP-safe. Each phase below is self-contained and verifiable. Status legend: ✅ done · 🔧 in progress · ⬜ todo.

## Screen coverage (13 in the brief)

| # | Screen | Where | Status |
|---|--------|-------|--------|
| 1 | Login / Signup | `login/` | P1 |
| 2 | Dashboard / Home | `(app)/dashboard` (merged w/ trips) | P2 |
| 3 | Create Trip | dialog on dashboard | P2 |
| 4 | My Trips | `(app)/trips` | P2 |
| 5 | Itinerary Builder | `(app)/trips/[id]/build` | P3 |
| 6 | Itinerary View | `(app)/trips/[id]` | P4 |
| 7 | City Search | inside builder | P3 |
| 8 | Activity Search | inside builder | P3 |
| 9 | Budget & Cost Breakdown | on itinerary view | P4 |
| 10 | Calendar / Timeline | **cut** → day-grouped list only | — |
| 11 | Shared / Public Itinerary | `trip/[token]` | P5 |
| 12 | Profile / Settings | **trimmed** → email + logout in nav | P1 |
| 13 | Admin / Analytics | **cut** (optional in brief) | — |

---

## Design system

Modern-bright travel look. Tokens live in `app/globals.css`; fonts in `app/layout.tsx`.

- **Primary**: vivid indigo-violet — `oklch(0.55 0.23 275)` light, `oklch(0.62 0.24 278)` dark. `--ring` matches it.
- **Charts** (budget pie, both themes): indigo / cyan / amber / rose / green — `--chart-1..5`.
- **Fonts**: headings **Space Grotesk** via `--font-display` → `--font-heading` (base-vega titles + `h1/h2/h3` pick it up automatically); body **Inter** (`--font-sans`); mono Geist Mono.
- **Dark mode**: `next-themes` (class strategy). Toggle = `components/theme-toggle.tsx` (Sun/Moon) in the nav; `d` key also toggles.
- **Icons**: `lucide-react` everywhere — **no emojis**.
- Trip cards get a gradient accent bar (`from-primary to-chart-2`); dashboard hero is a primary→cyan gradient.

---

## P0 — Setup ✅

Backend skeleton + frontend scaffold, wired end to end.

- Backend: `db.py`, `models.py`, `auth.py` (argon2 + JWT), `seed_data.py` (15 cities, ~60 activities), `main.py` (all routes + startup seed). Syntax-checked.
- Frontend: `create-next-app` (Next 16, TS, Tailwind v4, ``, `@/*`) + shadcn base-vega with: button, input, card, dialog, table, tabs, sonner, chart, badge, label, skeleton.
- Verified: `GET /health` + `/docs` live; `pnpm dev` serves.

## P1 — Auth + app shell ✅

Goal: sign up / log in, guarded app area, nav with logout. Screens #1, #12(trimmed).

Backend (already built in P0): `POST /auth/signup`, `POST /auth/login` → `{token,email}`; `GET /auth/me`; `current_user` dependency.

Frontend:
- `lib/api.ts` — `apiFetch` wrapper + token/email localStorage helpers.
- `lib/auth.ts` — `login`, `signup`, `useRequireAuth` guard hook.
- `app/login/page.tsx` — tabbed Log in / Sign up card, inline validation, toasts.
- `app/(app)/layout.tsx` — auth guard + shell.
- `components/site-nav.tsx` — brand, Dashboard/My Trips links, email, Logout.
- `app/(app)/dashboard/page.tsx` — welcome placeholder (P2 fills it).
- `app/page.tsx` — redirect to `/dashboard` or `/login`.
- Root layout: `<Toaster/>`, title.

Verify: signup → redirected into app; refresh keeps session; bad login shows toast; logout returns to `/login`; hitting `/dashboard` logged-out redirects to `/login`.

## P2 — Trips + Dashboard/My Trips ✅

Goal: create, list, delete trips. Screens #2, #3, #4.

Backend (built): `GET /trips` (with `stop_count`), `POST /trips`, `DELETE /trips/{id}`.

Frontend:
- `lib/types.ts` — shared TS types (Trip, City, Activity, Itinerary). `lib/format.ts` — date/money helpers. `lib/use-trips.ts` — shared fetch + `reload()`.
- `components/create-trip-dialog.tsx` — Base UI Dialog: name, **country** (`<select>` from `GET /countries`), start/end date (native), description; validates end ≥ start; toasts; `onCreated` reloads.
- `components/trip-card.tsx` — gradient card: name, date range, stop-count badge, delete (confirm + `DELETE /trips/{id}`), links to `/trips/[id]`.
- `app/(app)/dashboard/page.tsx` — hero + recent 3 trips + empty state.
- `app/(app)/trips/page.tsx` — full grid + client-side search + empty state.

Verify: create trip appears in list; delete removes it; counts correct. `tsc --noEmit` clean.

## P3 — Cities/Activities + Itinerary Builder ✅

Goal: add city stops with dates, attach activities. Screens #5, #7, #8.

Backend (built): `GET /cities?q=`, `GET /cities/{id}/activities`, `POST /trips/{id}/stops`, `DELETE /stops/{id}`, `POST /stops/{id}/activities`, `DELETE /stop-activities/{id}`.

Frontend (all read off `GET /trips/{id}/itinerary`, reload after each mutation):
- `app/(app)/trips/[id]/build/page.tsx` — header (name, dates, live total, Add-city) + numbered stop cards (city, date range, nights, subtotal, activities w/ remove, delete-stop).
- `components/add-stop-form.tsx` — **inline** bar (no popup): city `<select>` scoped to the trip's country (`GET /cities?country=X`) + arrive/leave dates → `POST /stops`.
- `components/add-activity-dialog.tsx` — per-stop `GET /cities/{id}/activities`; add (dedup via `existingIds`) / stays open for multiple.
- Trip cards link to the **itinerary view** (`/trips/[id]`); the view's **Edit itinerary** button opens the builder (`/trips/[id]/build`).
- Confirms via `lib/confirm.ts:confirmToast` (toast with Confirm/Cancel); toasts pinned top-left.

Verify: search filters; adding a stop persists; activities add/remove; reload restores state. `tsc --noEmit` clean.

## P4 — Itinerary View + Budget ✅

Goal: read-only structured plan + cost breakdown. Screens #6, #9.

Backend (built): `GET /trips/{id}/itinerary` → `{trip, stops[{city,dates,nights,activities,subtotal}], budget{total,categories,per_day_avg}}`.

Frontend `app/(app)/trips/[id]/page.tsx`:
- Stop-grouped read-only layout: numbered city headers (name, country, date range, nights, subtotal), activity rows (name, type badge, cost, duration). Empty → "Start building" link.
- Budget tab: Recharts donut `Pie` by category (stay/meals/transport/activities, `--chart-1..4`) + total + per-day average + swatch/%-of-total breakdown list.
- Tabs: "Itinerary" / "Budget". Button: **Edit itinerary** (→ builder). Share deferred to P5.
- Builder back-link now points to the trip overview (`/trips/[id]`).

Verify: `tsc --noEmit` clean. Totals equal sum of stop subtotals; pie renders; matches builder data.

## P5 — Public share ✅

Goal: shareable read-only itinerary. Screen #11.

Backend (built): `POST /trips/{id}/share` → `{share_token}`; `GET /public/{token}` (no auth).

Frontend:
- `components/share-dialog.tsx` — **Share** button (on the trip view) → `POST /trips/{id}/share` → dialog with the public URL (`${origin}/trip/{token}`), readonly input + copy (`navigator.clipboard`) + open-in-new.
- `app/trip/[token]/page.tsx` — public, **unguarded** (outside `(app)`, own header/container), reads `GET /public/{token}` with `auth:false`; "Plan your own trip" CTA → `/login`; invalid/unshared → not-found card.
- `components/itinerary-detail.tsx` — shared read-only Itinerary/Budget tabs block, reused by the owner view and the public page (single source of truth).

Verify: `tsc --noEmit` clean. Open share URL logged-out → itinerary shows; private/unknown token → not-found.

## P6 — Demo prep + buffer ⬜

- Seed a demo user with one fully built trip (never demo empty). Small script or manual via `/docs`.
- Loading skeletons, toasts, mobile pass, bug sweep.
- Buffer for overrun.

## Cut order if behind

1. Drop P5 (share). 2. Budget as numbers, no pie. 3. Skip demo seed; build a trip live.

## Testing note

Backend runs only after human `pip install` (registries firewalled in sandbox). Budget arithmetic (`build_itinerary`) is the one non-trivial path — verify against a hand-computed trip during P4, or add a small pure-function assert once deps are installed.
