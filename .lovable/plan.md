
# Mental Math Trainer — Plan

A clean, local-first web app that helps adults sharpen mental arithmetic through quick, focused drill sessions. No accounts; all progress lives in the browser via localStorage. Visual style will be picked later (we'll generate design directions before building UI).

## Core pages (routes)

- `/` — Home / landing: pitch, "Start training" CTA, quick stats (current streak, best score), shortcuts to each mode.
- `/practice` — Mode picker: choose operation, difficulty, session length, timer mode.
- `/practice/session` — The actual drill screen (question → input → feedback).
- `/results` — Post-session summary: accuracy, avg time per question, score, mistakes to review.
- `/stats` — All-time progress: streak, totals per operation, accuracy trends, personal bests.
- `/how-it-works` — Tips, mental math techniques (e.g. doubling/halving, distributive tricks, percentage shortcuts).

## Practice modes (operations)

Launch set:
1. **Addition / Subtraction** — difficulty controls digit count (1–4 digits) and whether carries/borrows are allowed.
2. **Multiplication / Division** — times tables (×2–×12), 2-digit × 1-digit, 2-digit × 2-digit; division with/without remainders.
3. **Squares / Roots / Powers** — squares up to 25², cubes up to 12³, square roots of perfect squares, simple powers of 2.
4. **Percentages & Fractions** — "15% of 80", "3/4 of 60", fraction-to-decimal, tip calculations.

Each mode supports: Easy / Medium / Hard, session length (10 / 25 / 50 questions or 1 / 3 / 5 minutes), and optional per-question timer.

## Session mechanics

- Numeric input with on-screen keypad (mobile) + physical keyboard support; Enter submits.
- Instant feedback: correct → green flash + auto-advance; wrong → red flash, shows correct answer briefly.
- Live HUD: question number, score, current streak inside session, elapsed time.
- Pause and quit-to-results buttons.
- End-of-session screen: score, accuracy %, average response time, fastest answer, list of missed questions with correct answers.

## Progress & gamification (local-only)

Stored in `localStorage`:
- Daily streak (consecutive days with at least one completed session).
- Per-operation best score, best accuracy, fastest avg time.
- Last 30 sessions history for a simple sparkline on `/stats`.
- Achievement badges (e.g. "7-day streak", "100 questions in a day", "95%+ accuracy on Hard multiplication").

Reset-progress button in `/stats` with confirm dialog.

## Content for `/how-it-works`

Short, scannable technique cards:
- Add left-to-right instead of right-to-left.
- Round-and-adjust for subtraction.
- ×11 trick, ×9 finger trick, doubling/halving for multiplication.
- Percentage swap ("x% of y = y% of x").
- Squaring numbers ending in 5.
- Estimating square roots between perfect squares.

## Out of scope (for now)

- Accounts, cloud sync, leaderboards.
- Multiplayer / head-to-head.
- More operations (logs, modular arithmetic, calendar tricks) — noted as future additions per your message.

## Technical notes

- Stack: TanStack Start + React (already scaffolded), Tailwind v4, shadcn/ui components.
- Pure client app — no backend needed; no Lovable Cloud activation.
- Question generation: small pure functions per operation, seedable for reproducibility, returning `{ prompt, answer, acceptableAnswers? }`.
- State: a `useSession` hook manages the running drill; a `useProgress` hook reads/writes localStorage with a versioned schema.
- Routing: one file per route under `src/routes/` (no hash anchors for major sections), each with its own `head()` metadata.
- Accessibility: large tap targets, keyboard-first input, prefers-reduced-motion respected for the correct/incorrect flashes.
- After plan approval, the first build step will be generating 3 design directions for you to pick the visual style.
