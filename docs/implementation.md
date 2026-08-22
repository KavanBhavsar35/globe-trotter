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

## P0 — Setup ✅

Backend skeleton + frontend scaffold, wired end to end.

- Backend: `db.py`, `models.py`, `auth.py` (argon2 + JWT), `seed_data.py` (15 cities, ~60 activities), `main.py` (all routes + startup seed). Syntax-checked.
- Frontend: `create-next-app` (Next 16, TS, Tailwind v4, `src/`, `@/*`) + shadcn base-nova with: button, input, card, dialog, table, tabs, sonner, chart, badge, label, skeleton.
- Verified: `GET /health` + `/docs` live; `npm run dev` serves.

## P1 — Auth + app shell ✅

Goal: sign up / log in, guarded app area, nav with logout. Screens #1, #12(trimmed).

Backend (already built in P0): `POST /auth/signup`, `POST /auth/login` → `{token,email}`; `GET /auth/me`; `current_user` dependency.

Frontend:
- `src/lib/api.ts` — `apiFetch` wrapper + token/email localStorage helpers.
- `src/lib/auth.ts` — `login`, `signup`, `useRequireAuth` guard hook.
- `src/app/login/page.tsx` — tabbed Log in / Sign up card, inline validation, toasts.
- `src/app/(app)/layout.tsx` — auth guard + shell.
- `src/components/site-nav.tsx` — brand, Dashboard/My Trips links, email, Logout.
- `src/app/(app)/dashboard/page.tsx` — welcome placeholder (P2 fills it).
- `src/app/page.tsx` — redirect to `/dashboard` or `/login`.
- Root layout: `<Toaster/>`, title.

Verify: signup → redirected into app; refresh keeps session; bad login shows toast; logout returns to `/login`; hitting `/dashboard` logged-out redirects to `/login`.

## P2 — Trips + Dashboard/My Trips ⬜

Goal: create, list, delete trips. Screens #2, #3, #4.

Backend (built): `GET /trips` (with `stop_count`), `POST /trips`, `DELETE /trips/{id}`.

Frontend:
- `src/lib/types.ts` — shared TS types (Trip, City, Activity, Itinerary).
- Dashboard = recent trips + "Plan New Trip" (Create Trip dialog: name, start/end date, description) + link to full list.
- `src/app/(app)/trips/page.tsx` — trip cards (name, date range, stop count, View / Delete).
- Empty state + toasts. Date validation (end ≥ start).

Verify: create trip appears in list; delete removes it; counts correct.

## P3 — Cities/Activities + Itinerary Builder ⬜ (biggest — protect time)

Goal: add city stops with dates, attach activities. Screens #5, #7, #8.

Backend (built): `GET /cities?q=`, `GET /cities/{id}/activities`, `POST /trips/{id}/stops`, `DELETE /stops/{id}`, `POST /stops/{id}/activities`, `DELETE /stop-activities/{id}`.

Frontend `src/app/(app)/trips/[id]/build/page.tsx`:
- City search (debounced `q`) → results with country + cost index → "Add stop" (pick start/end date via native inputs).
- Per stop: list attached activities; "Add activity" opens the city's catalog (filter by type/cost), add/remove.
- Reorder: keep insertion order (drag-reorder cut). Live running subtotal per stop.

Verify: search filters; adding a stop persists; activities add/remove; reload restores state.

## P4 — Itinerary View + Budget ⬜

Goal: read-only structured plan + cost breakdown. Screens #6, #9.

Backend (built): `GET /trips/{id}/itinerary` → `{trip, stops[{city,dates,nights,activities,subtotal}], budget{total,categories,per_day_avg}}`.

Frontend `src/app/(app)/trips/[id]/page.tsx`:
- Day/city-grouped layout: city headers, activity blocks (name, type badge, cost, duration).
- Budget card: Recharts pie by category (stay/meals/transport/activities) + total + per-day average. Overbudget hint if per-day avg > threshold.
- Tabs: "Itinerary" / "Budget". Buttons: Edit (→ builder), Share.

Verify: totals equal sum of stop subtotals; pie renders; matches builder data.

## P5 — Public share ⬜

Goal: shareable read-only itinerary. Screen #11.

Backend (built): `POST /trips/{id}/share` → `{share_token}`; `GET /public/{token}` (no auth).

Frontend:
- Share button → calls share, shows public URL, "Copy link" (`navigator.clipboard`).
- `src/app/trip/[token]/page.tsx` — public, unguarded, read-only itinerary + budget; "Copy Trip" CTA routes to signup.

Verify: open share URL in a logged-out/incognito window → itinerary shows; private trips 404.

## P6 — Demo prep + buffer ⬜

- Seed a demo user with one fully built trip (never demo empty). Small script or manual via `/docs`.
- Loading skeletons, toasts, mobile pass, bug sweep.
- Buffer for overrun.

## Cut order if behind

1. Drop P5 (share). 2. Budget as numbers, no pie. 3. Skip demo seed; build a trip live.

## Testing note

Backend runs only after human `pip install` (registries firewalled in sandbox). Budget arithmetic (`build_itinerary`) is the one non-trivial path — verify against a hand-computed trip during P4, or add a small pure-function assert once deps are installed.
