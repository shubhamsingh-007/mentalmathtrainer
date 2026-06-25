## Plan

Edit `src/components/AppHeader.tsx` only — purely responsive CSS, no behavior change.

1. **Shrink header padding on mobile** so logo + nav have more room:
   - Container: `px-3 sm:px-6` (was `px-6`).
   - Container: keep `h-14` but allow it to grow on mobile: `min-h-14` so a wrapped second row doesn't clip.

2. **Compact the logo on mobile** so it occupies less of the row:
   - Logo icon square: `h-7 w-7 sm:h-8 sm:w-8` (was `h-8 w-8`), inner svg `16 → 18`.
   - Wordmark size: `text-base sm:text-lg` (was `text-lg`).
   - Gap between icon and wordmark: `gap-2 sm:gap-2.5`.

3. **Tighten the nav on mobile**:
   - Each link: `px-2 py-1.5 text-xs sm:px-3 sm:text-sm` (was `px-3 py-1.5 text-sm`).
   - Nav gap: `gap-0.5 sm:gap-1`.

4. **Allow graceful wrap if it still doesn't fit** (e.g. very narrow 320px screens):
   - Container: `flex-wrap gap-y-1`. Logo stays on the first row; the nav wraps under it as a second row only when truly needed. Sticky header height grows by one row in that edge case — acceptable, and avoids the overlap.

5. **No changes** to links, routes, colors, sticky behavior, or desktop appearance (`≥sm` reverts to today's sizing).

## Out of scope

- No hamburger menu, icon swap, or bottom tab bar (user picked shrink + wrap).
- No changes to any page content or other components.
