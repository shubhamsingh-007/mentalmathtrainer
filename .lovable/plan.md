## Goal

Make practice sessions feel like they coach you. Two related additions:

1. **Contextual hints** — when you stall or miss, surface a one-line tip that mirrors a technique from the Techniques page.
2. **Adaptive drill logic** — track which *kinds* of problems you miss and bias the next generator toward them until accuracy recovers.

Both features stay local-only (no account), consistent with the rest of Mind Math.

---

## 1. Contextual hints

**Trigger rules** (during an active question, before feedback shows):
- Stall: 5 seconds elapsed on the current question with the input still empty.
- Repeat miss: the same *pattern* (see §2) was answered wrong in the previous 2 attempts this session.

**Display**
- A small chip under the input: muted background, one short line, no buttons.
- Fades in; dismisses automatically when you start typing or the question advances.
- Single hint per question; never blocks input or steals focus.

**Hint content** — each `Question` gets an optional `hint` string produced by the generator, chosen to match a Techniques entry. Examples:
- `47 × 9` → "Try (47 × 10) − 47."
- `36 × 11` → "Split the digits: 3 _ (3+6) _ 6."
- `16% of 25` → "Swap it: 25% of 16 = 4."
- `75²` → "n × (n+1), then tack 25: 7×8 → 5625."
- `19 + 6` → "Round up: 20 + 6 − 1."
- `813 − 296` → "Round to 300, then add 4 back."
- `√196` → "Between 13² (169) and 14² (196)."
- Fallback: omit the hint rather than show a generic one.

Hints are static derivations of the operands — no AI call, no network.

---

## 2. Adaptive drill logic (spaced repetition)

**Pattern tagging.** Each generated question is tagged with a coarse `pattern` key that captures the *kind* of mental move it needs, not the exact numbers. Initial taxonomy:

- Add/Sub: `add.carry`, `add.nocarry`, `sub.borrow`, `sub.nobutton`, `add.crosses10` (e.g. 8+7, 19+6)
- Mul/Div: `mul.table` (≤12×12), `mul.x11`, `mul.x9`, `mul.2digit`, `div.clean`
- Powers: `square.small`, `square.ends5`, `cube`, `root.perfect`, `pow2`
- Percent: `pct.simple`, `pct.swap`, `frac.of`, `tip`, `ofwhat`

**Per-pattern stats** (stored in localStorage, separate key `mm.adaptive.v1`):
```
{ pattern: { seen, correct, lastWrongAt, recentResults: bool[] (last 8) } }
```

**Weighting.** When generating the next question:
- Compute a weakness score per pattern eligible for the current `op`+`difficulty`:
  `weight = 1 + 4 * (1 − recentAccuracy) + recencyBoost(lastWrongAt)`
- Pick the pattern by weighted random; fall back to uniform when no data exists.
- Cap: a pattern can't appear more than 3× in a row, to keep variety.

**Decay.** A correct answer on a weak pattern decays its weight; after 5 consecutive corrects the pattern returns to baseline.

**Reset.** Stats reset alongside the existing "reset progress" control.

---

## Files to change

- `src/lib/math.ts` — extend `Question` with `pattern` and `hint`; update each generator to set them; add a `pickPattern(op, diff, stats)` helper.
- `src/lib/adaptive.ts` *(new)* — load/save pattern stats, `recordResult(pattern, correct)`, `chooseNextQuestion(op, diff)`.
- `src/lib/hints.ts` *(new)* — pure functions that derive hint strings from operands when a pattern qualifies; keeps `math.ts` lean.
- `src/routes/practice.session.tsx` — call `chooseNextQuestion` instead of `generateQuestion`; record results into adaptive stats on submit/timeout; add stall timer (5s) and recent-miss tracker; render the hint chip under the input.
- `src/lib/progress.ts` — extend `resetProgress` to also clear adaptive stats.

No backend, no schema, no new dependencies.

---

## Out of scope (call out if you want them next)

- Showing pattern-level weakness in the Stats page.
- Cross-session decay by wall-clock time (current plan uses count-based decay).
- Hints for the percent `ofwhat` and `pow2` patterns beyond the basic library above.
