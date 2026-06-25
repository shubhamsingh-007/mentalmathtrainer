## The problem

On mobile, when the input is focused, the on-screen keyboard covers the bottom ~45% of the screen. The YOU / BOT race bars currently live below the question, so they get pushed off-screen the moment the keyboard opens.

## Plan

Edit `src/routes/practice.session.tsx` only — layout/CSS, no logic change.

1. **Move the race bars into the top HUD** and make the HUD `sticky top-0 z-20` with a translucent `bg-background/95 backdrop-blur` border. The HUD now contains, top-to-bottom:
   - Q counter · Score · Combo · timer · End
   - Overall progress bar (and optional per-question timer)
   - YOU bar + count
   - BOT bar + count
   - "Ahead by N / Behind by N / Tied"

   Because it's sticky, iOS scrolling the focused input into view above the keyboard cannot push the bars off — they re-pin to the top of the visible viewport.

2. **Switch the page container to `min-h-[100dvh]`** (with `min-h-screen` fallback) so layout math uses the *visible* viewport once the keyboard appears.

3. **Tighten mobile vertical rhythm** so question + input + Submit + tip fit in the remaining ~55% of viewport:
   - Question: `text-5xl sm:text-6xl md:text-7xl` (down from `text-6xl` baseline).
   - Input height: `h-16 sm:h-20`, font `text-3xl sm:text-4xl`.
   - Inner container padding: `py-4 sm:py-10`.
   - Form top margin: `mt-6 sm:mt-10`.
   - Hint chip top margin: `mt-3`.

4. **Race bars compacted for the HUD**: text size `text-[10px] sm:text-[11px]`, row spacing `space-y-1.5`, bar height stays `h-1.5`. Remove the old race-bar block from below the form.

5. **No change** to scoring, adaptive logic, hint timer, race-bar math, or Submit button behavior. Desktop (`≥sm`) layout reverts to today's spacing via `sm:` breakpoints.

## Technical notes

- `100dvh` (dynamic viewport units) is the standard fix for "iOS keyboard covers my UI." Supported by Safari 15.4+ and all current Android browsers. Tailwind orders the `min-h-screen` fallback first.
- `position: sticky` is enough; no JS measuring of keyboard height needed.

## Out of scope

- No changes to results page, bar update interval, or adaptive engine.
- No floating "minimize keyboard" toggle — sticky-top covers the need.
