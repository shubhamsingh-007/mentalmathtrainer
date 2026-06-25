## Add README.md

Create a `README.md` at the project root to help testers/contributors get the app running quickly.

### Sections

1. **Mind Math** — one-line intro: local-only mental math trainer for adults.
2. **Features** — practice modes (add/sub, mul/div, squares/roots/powers, percentages), adaptive drills with spaced repetition, contextual hints, Race the Bot pacer, combo streaks, progress charts, fully local (no account, localStorage).
3. **Tech stack** — TanStack Start v1, React 19, Vite 7, Tailwind v4, TypeScript, Bun.
4. **Getting started**
   - Prerequisites: Bun (or Node 20+)
   - `bun install`
   - `bun dev` → opens on `localhost:8080`
   - `bun run build` / `bun run start` for production preview
5. **Project structure** — brief map:
   - `src/routes/` — file-based routes (index, practice, practice.session, results, stats, techniques)
   - `src/lib/` — `math.ts`, `adaptive.ts`, `hints.ts`, `progress.ts`
   - `src/components/` — `AppHeader`, `ProgressCharts`
   - `src/styles.css` — Tailwind v4 + Cloud White palette tokens
6. **How it works** — short notes on adaptive engine (pattern weighting by accuracy), dedupe within a session, hint triggers (5s stall or repeated miss), bot pacing per difficulty.
7. **Testing notes for QA** — known surfaces to exercise:
   - Start a drill from each operation × difficulty
   - Verify no duplicate prompts in one session
   - Trigger hint via 5s stall and via a wrong answer
   - Mobile: keyboard should stay open across questions; sticky HUD visible
   - Results page: "Beat the bot" wording + time format (`12.3s` / `1m 05s`)
   - Stats page charts render with ≥1 session in localStorage
   - Clear data: `localStorage.clear()` in devtools resets progress
8. **Data & privacy** — everything in `localStorage`; no network calls, no account.
9. **Deployment** — published via Lovable; GitHub sync is two-way.

### Out of scope
No code changes, no dependency changes — documentation only.
