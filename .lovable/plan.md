# Add a "Race the Bot" pacer to the drill

Add a competitive progress bar below the answer field so users can race a steady-paced bot through the session.

## What the user sees

Under the answer input on `/practice/session`:

```text
You  ████████████░░░░░░░░░░░  12 / 25
Bot  ██████████░░░░░░░░░░░░░  10 / 25
```

- Two stacked thin bars, each labeled with current question count.
- **You** bar uses `--primary`; **Bot** bar uses a muted foreground tone.
- When your bar passes the bot's, it briefly pulses (200ms primary glow) — no layout shift.
- A tiny status line under the bars: "Ahead by 2" (primary) / "Behind by 1" (muted) / "Tied".

On the results page, add one line to the summary: **"Beat the bot by 0:12"** or **"Bot won by 4 questions"**.

## Bot behavior

- **Speed**: fixed per difficulty — Easy 6000ms, Medium 4000ms, Hard 3000ms per question.
- **Accuracy**: always correct (pure speed pacer).
- **Start**: bot starts its first "answer" the moment the session begins (same `startRef`).
- The bot advances one question every `botMs`, capped at `length`. Pause logic: bot also halts during the brief feedback delay between your questions? No — bot is independent of your input; it just ticks on wall-clock time from session start. This keeps it a real benchmark.

## Implementation (technical)

All changes in `src/routes/practice.session.tsx`:

1. Add `const BOT_MS: Record<Difficulty, number> = { easy: 6000, medium: 4000, hard: 3000 }`.
2. Derive bot progress from existing `now` tick (already updates every 100ms):
   `const botIdx = Math.min(length, Math.floor((now - startRef.current) / BOT_MS[diff]))`.
3. Render two bars under the `<form>` inside the existing input column (max-w-xs):
   - Reuse the HUD's bar styling (`h-1 rounded-full bg-muted` + inner fill).
   - Label row above each bar: `You 12 / 25` and `Bot 10 / 25` in `text-xs text-muted-foreground numeric`.
   - Status line below in `text-[11px]`.
4. Pass `botIdx` (snapshot at finish time) into `SessionResult` via a new optional field `botFinishedAt?: number` (ms from start when bot hit `length`) so the results page can compute the gap. Update `src/lib/progress.ts` `SessionResult` type and `src/routes/results.tsx` to render the one-line outcome.
5. No new config controls on `/practice` — bot speed is implicit from difficulty. (We can promote it to a user-selectable "Pacer: Chill / Sharp / Ruthless" later if desired.)

## Out of scope

- Adaptive bot speed, selectable bot personalities, bot accuracy < 100%.
- Per-question "beat the bot" ticks or sound effects.
- Storing bot win/loss history in stats (can add later if it proves motivating).
