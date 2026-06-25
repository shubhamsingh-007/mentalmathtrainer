## Goal

Prevent the same exact question (same prompt) from appearing twice within a single drill session.

## Where

- `src/lib/adaptive.ts` — `Session` state and `chooseNextQuestion`.
- `src/routes/practice.session.tsx` — already creates one `Session` per drill via `createAdaptiveSession()`, so no change to lifetime.

## Plan

1. **Track seen prompts on the session**
   - Add `seenPrompts: Set<string>` to the `Session` object returned by `createAdaptiveSession`.

2. **Retry generation to avoid duplicates**
   - In `chooseNextQuestion`, after picking a pattern, call `generateForPattern(chosen, diff)` and check whether `question.prompt` is already in `seenPrompts`.
   - If it is, retry up to **12 times**, re-rolling the pattern each attempt so we don't get stuck on a small pattern (e.g. `pow2` with only a few prompts).
   - If every attempt still collides (small pattern pool genuinely exhausted), accept the last generated question rather than loop forever.

3. **Record the chosen prompt**
   - After selecting, add `question.prompt` to `seenPrompts`.

4. **No change to adaptive weighting or persistence**
   - `seenPrompts` lives only on the in-memory session object; it is not saved to localStorage, so a brand-new drill starts fresh.
   - Pattern-level stats and the existing `MAX_REPEAT` pattern-streak guard stay as-is.

## Expected result

Within a single drill, no two questions share the exact same prompt string (e.g. you won't see `47 × 9` twice in the same session), while adaptive difficulty targeting remains unchanged.