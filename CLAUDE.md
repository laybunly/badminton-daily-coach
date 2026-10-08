# Badminton Daily Coach – project notes for Claude

Mobile web app with chess-style badminton tactics puzzles (doubles positioning and shot selection).
Live: https://badminton-daily-coach.com/ (Cloudflare Workers, connected to GitHub: builds `main` automatically, preview URL per branch).
Old address https://laybunly.github.io/badminton-daily-coach/ only serves `redirect/` (forwards, keeps `#CODE`; `sw.js` removes the old offline copy), deployed by `.github/workflows/deploy.yml`.
Owner: B (German speaker; app UI is German by default, English available).

## Working with the owner
- Give feedback / options first when asked ("tell me first", "don't do anything yet"). Only build after a go.
- Show visual options (mockups, icon variants) before picking one.
- Keep answers short and in simple terms (owner is not a developer). Explain trade-offs honestly; suggest the lowest-effort option first.
- Routine work needs no confirmation: running tests, creating files/folders, installing dev dependencies, commits and pushes
  on feature branches, opening PRs. Only **deploying** needs the owner's explicit go ("deploy"):
  merging to `main` (Cloudflare and GitHub Pages publish `main` automatically) and changing hosting/domain settings.
- Never handle the owner's logins or secrets (Cloudflare, GitHub, Supabase service role key). Owner does dashboard steps; give click-by-click instructions.
- German UI wording: keep English badminton terms (Clear, Smash, Drive, Lift, Push, Netzdrop, Flick).
  Grades are "✓ Am besten / ○ Gut / ! Ungenau / ✗ Fehler" (EN: Best / Good / Inaccuracy / Mistake). Never "Bester".

## Architecture
- Vite + TypeScript, no UI framework. `index.html` (markup) → `src/main.ts` (boot + listeners). `npm run dev` / `npm run build` (→ `dist/`).
  - `src/puzzles/` types, data (`data/*.json`), `catalog.ts` (`buildPuzzles`), `codes.ts`.
  - `src/daily/` plan + rating · `src/court/` SVG render, animation, input · `src/ui/` screens, panel, sheets, share, report
  - `src/state.ts` shared state (`S`, live bindings `LANG/T/PUZZLES/PREFS`) · `src/i18n/strings.ts` · `src/storage/` · `src/analytics/`
  - `legacy/index.html`: frozen copy of the original single-file app. Never edit; it is the reference for golden/parity tests.
  - PWA via vite-plugin-pwa (manifest + offline cache). Icons in `public/icons/` (`b1-512.png` is an upscaled placeholder).
- Court is an SVG in cm: x 0–610, y 0–1340, net at y 670, user's half is y > 670. A side-view strip shows shuttle height.
- State object `S`; render functions `renderSVG`, `renderPanel`, `renderHeader`, `renderHome`.
- Shuttle animation loops via requestAnimationFrame (FLY 1300 ms, HOLD 900 ms). Serve puzzles use a static shuttle.
- Puzzles:
  - `PUZ_DE` hand-written puzzles + `PUZ_EN_TEXT` English overlay.
  - `GEN`: 250 generated training puzzles from `CATS` via `mkShot` / `mkPlace` (10+ categories, 5 sets × 5).
  - `buildPuzzles()` applies, in order: language → level variants (`lv`, `lvLesson`) → handedness text swap (`handText`)
    → backhand shift for `bhY` targets (beginner 30, intermediate 20, advanced 0) → tolerance `TOL`
    (beginner 1.25, intermediate 1, advanced 0.8) → seeded option shuffle.
- Daily set: fixed plan `buildPlan()`, `PLAN_START=4`, 2 easy + 2 medium + 1 hard, no repeated category per day,
  55 days. `prefKey()` returns `'d-p2'` (bumping it changes today's set). `#plan` opens a plan preview.
- Streak by days; Elo-like rating counts only the first attempt outside the daily set.
- Storage: `store.get/set` on localStorage (keys prefixed `cs_`) with in-memory `MEM` fallback.
  `PREFS = {discs:['d'], level, hand, stats, set:true}` saved under `prefs3`. Settings changes after answering are deferred via `S.pend`.
- Glossary of 30 terms; `linkify()` makes terms in questions/explanations tappable.
- Task codes: `ID2CODE` / `CODE2IDX`, 5 chars, FNV hash. `#CODE` opens a shared task. Codes must never change.
- Report sheet: sends anonymous GoatCounter event `report/CODE/reasons` (title = task name · language · comment ≤200 chars),
  plus copy-text and prefilled GitHub issue link.
- Analytics: GoatCounter (https://badminton-daily-coach.goatcounter.com/) via `loadGC()` / `track(path,title)`,
  only if stats on, http(s), not on claude/anthropic hosts. Opt-out: settings, `#nostats`, `#stats`, `#toggle-goatcounter` (with toast).
- Placing players: drag (75-unit touch offset) or tap. `touch-action:none` on the svg.
- Favicon: B3 shuttle (SVG + 32px PNG) for tabs, B1 shuttle (180/192px PNG) for home screen; files in `public/icons/`.

## Working from the phone / cloud sessions
The owner often works from the phone (Claude app → Code, cloud session on this repo, Mac may be off).
1. Start from an up-to-date `main`, work on a feature branch (`stepN-…` or a short topic name).
2. `npm ci && npx playwright install --with-deps chromium`, then `npm test` before every commit.
3. Push and open a PR. GitHub Actions runs the tests; Cloudflare builds a preview URL for the branch
   (`<branch>-badminton-daily-coach.bunly-lay.workers.dev`). Send the owner the preview link to try on the phone.
4. Merge only after the owner says "deploy". Then check https://badminton-daily-coach.com/ (no console errors).

## Coaching rules already agreed with the owner (doubles)
- Serve: server stands at the T, partner behind in the middle. Short serves land just past the short service line.
- Defence after a lift: straight defender in line with the shuttle, cross defender near the centre line.
- Attack from the back: partner in front of the smasher, slightly towards the middle (to intercept cross replies).
  Straight smash from the back corner is usually best. Receive lifts wider and deeper.
- Front player stays at the net after a lift over them.
- Partner and opponents are always right-handed; user can be left-handed (avoid backhand except for advanced).
- Generated puzzles still need a coach review.

## Removed on purpose – don't re-add
3D view, pause button, correction animation, "Ergebnis ansehen" step (explanation + next button shows right after answering).

## Testing
`npm test` runs everything (also in GitHub Actions on every PR). Run it before every commit.
- `tests/unit/golden.test.ts` (vitest): data, codes, plan, 400 days of daily sets and all 12 lang/level/hand builds must equal
  the legacy app (`tests/golden/legacy.json`, regenerated from `legacy/index.html` by `npm run golden`).
- `tests/e2e/parity.spec.ts` (Playwright): new build vs legacy side by side, same DOM after every click, same localStorage and events.
- `tests/e2e/flows.spec.ts`: all 287 puzzles played through (de/int/R, en/beg/L, de/adv/R) without console errors,
  code links, `#plan`, report event, opt-out hashes, storage keys, PWA.

## Roadmap (agreed with the owner)
Work happens mainly in Claude Code on the desktop (local dev server for quick testing).
Do the steps in order; finish, test and get a go from the owner before starting the next one.

### Step 1 – Proper project structure (no visible changes)
- Move the single `index.html` into a Vite + TypeScript project. Split into modules, e.g.
  `court/` (SVG rendering, drag/tap), `puzzles/` (PUZ_DE, PUZ_EN_TEXT, GEN/CATS, buildPuzzles),
  `daily/` (buildPlan, streak, rating), `ui/` (home, panel, sheets, glossary, settings), `i18n/`, `analytics/`, `storage/`.
- Puzzle data moves to typed data files (JSON/TS) with a schema; generated puzzles are expanded once into data.
- The app must look and behave exactly as before: same IDs, same 5-character codes, same daily plan, same localStorage keys
  (`cs_*`, `prefs3`, `d-p2`) so testers keep streaks and settings.
- Playwright tests: daily flow, all puzzles in DE and EN without console errors, shared code links, report sending,
  settings, opt-out hashes. Add a test that compares all codes and the 55-day plan against the old version.
- Add GitHub Actions: run tests on every pull request.
- Make it a PWA (manifest, icons B1/B3, offline cache).

### Step 2 – Professional hosting
- Deploy to Cloudflare Pages or Netlify from GitHub, preview link per pull request. Owner creates the account and connects it.
- Optional own domain. Keep the GitHub Pages URL working (redirect) so existing links and home-screen icons don't break.
- Keep GoatCounter for now.

### Step 3 – Supabase backend (EU region, Frankfurt)
- Owner creates the project and provides the project URL and anon key. Never put the service role key in code, chat or the repo.
  Use environment variables (`.env.local`, not committed; `.env.example` committed).
- Tables (suggestion): `puzzles` (id, version, data jsonb, status, review_status, updated_by, updated_at),
  `puzzle_history` (every saved version), `daily_plan`, `reports`, `admins`/roles.
- Row level security: everyone can read published puzzles; only admins/coaches can write; reports insert-only for anonymous users.
- Migrate existing puzzles with unchanged IDs. The app loads puzzles from Supabase and falls back to the bundled data offline.
- Reports go into the `reports` table instead of (or in addition to) GoatCounter.
- Supabase migrations live in the repo (`supabase/migrations`).

### Step 4 – Admin mode on Supabase (edit existing puzzles first)
Concept approved by owner (see docs/admin-concept.png), adapted to Supabase:
1. Login (Supabase Auth, email magic link) with admin/coach role, at `/admin`.
2. Puzzle list: search, filter by review status (not reviewed / OK / needs work / changed), category, type, in daily plan.
3. Court editor: drag players, shuttle start/landing/peak height, each answer's landing spot, target circles and their size;
   preview as beginner / intermediate / advanced / left-handed; "Test puzzle" plays it like a user.
4. Texts: title, question, answers, grades, explanations, lesson in DE and EN; warn when EN is missing or older than DE.
5. Save with checks (exactly one "Am besten", everything inside the court, EN complete); every save creates a version that can be restored.
   Drafts vs published status, so half-finished edits don't reach users.
Rules: never change IDs, codes or the daily plan; level/handedness rules still apply to edited puzzles.
Creating new puzzles comes after this (new IDs appended, never reused).

### Later
User accounts with synced progress, report inbox in admin, club/team mode, payments, app stores (Capacitor).
Before real user accounts: Impressum, Datenschutzerklärung, data processing agreements (owner's task).
