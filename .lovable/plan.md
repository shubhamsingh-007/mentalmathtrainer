## Bug

On the results page the user sees `Ended early at 9/10` even though they answered all 10 questions (8 correct + 2 missed = 10 attempted, matching the 80% accuracy shown).

Root cause is a stale-closure bug in `src/routes/practice.session.tsx`:

- `finish()` is wrapped in `useCallback` with `score` in its deps.
- `advance(true, …)` calls `setScore(s => s + 1)` and then schedules `finish()` via `setTimeout(..., 350)`.
- That `setTimeout` was scheduled with the version of `advance`/`finish` captured at the time of the click, BEFORE the last `setScore` flushed. When the timer fires on the final question, `finish()` reads the previous render's `score` — exactly one less than reality.
- The results page then computes `userAttempted = r.correct + r.missed.length` = `7 + 2 = 9`, treats it as `< r.total`, and renders `Ended early at 9/10`.

Net effect: every successful final answer is undercounted by 1 in `correct` (and therefore in the "completed all" check on the results screen).

## Fix

In `src/routes/practice.session.tsx`:

1. Add `const scoreRef = useRef(0)` next to the other refs.
2. In `advance(true, …)`, increment `scoreRef.current` synchronously right next to the `setScore` call so the ref stays in lockstep with the displayed score.
3. In `finish()`, use `scoreRef.current` instead of the `score` state when building `SessionResult.correct`, and drop `score` from the `useCallback` deps so `finish`/`advance` no longer churn on every answer.
4. Leave `score` state in place for the HUD render — only the value persisted to the result changes.

No changes to `src/routes/results.tsx` or `src/lib/progress.ts`. The existing "Beat the bot / Bot won / Ended early" branching is correct once `r.correct` is accurate.

## Verification

- Run a 10-question drill, answer all 10 (mix correct + wrong).
- Confirm results page shows `correct + missed.length === total` and renders the bot outcome (`Beat the bot by …` or `Bot won by …`) instead of `Ended early at 9/10`.
- Hitting "End" mid-drill should still show `Ended early at N/10` with the correct partial count.
