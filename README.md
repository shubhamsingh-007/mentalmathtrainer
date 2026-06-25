# Mind Math

A local-only mental math trainer for adults. Practice arithmetic, build streaks, race a virtual bot, and track your progress — all in your browser, no account required.

## Features

- **Practice modes**: Addition / Subtraction, Multiplication / Division, Squares / Roots / Powers, Percentages & Fractions
- **Three difficulty tiers**: Easy, Medium, Hard
- **Adaptive engine**: Spaced-repetition style weighting surfaces patterns you miss most (e.g. carries across 10, ×11 trick, percentage swaps)
- **Contextual hints**: A tip chip appears after a 5-second stall or a repeated miss, explaining the mental trick
- **Race the Bot**: Dual progress bars pace you against a benchmark bot tuned per difficulty
- **Combo streaks**: 🔥 Combo ×N badge after 3+ correct in a row
- **Progress charts**: Accuracy trend + average time per operation on the Stats page
- **Privacy-first**: 100% local — all session history lives in `localStorage`, no network, no account

## Tech stack

- **Framework**: TanStack Start v1 (React 19, file-based routing, SSR-capable)
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4 with a custom "Cloud White" OKLCH palette
- **Language**: TypeScript (strict)
- **Runtime**: Bun (Node 20+ also works)

## Getting started

```bash
# install
bun install

# dev server (http://localhost:8080)
bun dev

# production build + preview
bun run build
bun run start
```

## Project structure

```
src/
  routes/
    __root.tsx              # Root layout + head/meta
    index.tsx               # Landing page
    practice.index.tsx      # Drill configuration (operation, difficulty, count)
    practice.session.tsx    # Active drill UI (input, HUD, hints, bot race)
    results.tsx             # Session summary
    stats.tsx               # Lifetime progress + charts
    techniques.tsx          # Mental math techniques library
  lib/
    math.ts                 # Pattern-based question generation
    adaptive.ts             # Spaced-repetition weighting + dedupe
    hints.ts                # Logic-based tips per pattern
    progress.ts             # localStorage session history
  components/
    AppHeader.tsx           # Logo + nav
    ProgressCharts.tsx      # Custom SVG charts
  styles.css                # Tailwind v4 imports + design tokens
```

## How it works

- **Adaptive engine** (`src/lib/adaptive.ts`): Tracks per-pattern accuracy and weights pattern selection toward weaker areas. Each drill maintains a `seenPrompts` set so the same exact question never repeats within a session.
- **Hint triggers** (`src/lib/hints.ts`): Fires after 5s of inactivity or immediately after a wrong answer on a recently-missed pattern.
- **Bot pacing**: Fixed milliseconds per question, scaled by difficulty (`BOT_MS` map in the session route).
- **Feedback timing**: 120ms after correct, 1200ms after wrong (so the revealed answer is readable).

## Testing notes (QA)

Surfaces worth exercising:

1. Start a drill in each **operation × difficulty** combination.
2. Confirm **no duplicate prompts** in a single session (10–20 question drills).
3. Trigger the **hint chip** two ways: wait 5s without typing, and submit a wrong answer.
4. **Mobile**: the on-screen keyboard should stay open across question transitions; the sticky HUD with progress bars stays visible.
5. **Results page**: verify "Beat the bot by …" wording only appears when all questions were answered, and time format reads `12.3s` for under a minute or `1m 05s` above.
6. **Stats page**: charts should render after at least one completed session.
7. **Reset**: `localStorage.clear()` in DevTools wipes all progress.

## Data & privacy

Everything stays on your device. The app makes no backend calls and stores session history, streaks, and per-pattern accuracy entirely in `localStorage`.

## Deployment

Published via Lovable. The GitHub integration is two-way — pushes to the connected repo sync back into the Lovable editor automatically.
