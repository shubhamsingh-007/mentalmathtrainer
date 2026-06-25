## The root cause

The answer input uses `inputMode="numeric"`, which on iOS Safari shows the compact numeric keypad — and that keypad has **no return/Go key at all**. `enterKeyHint="go"` is ignored because there's no key to label. Whatever the user is tapping to "submit" isn't a submit key, so nothing happens. This isn't a bug we can fix with JS; it's how the iOS numeric keypad works.

The clean fix is to **add a visible Submit button**. It also helps non-iOS touch users and keeps keyboard submit (Enter) working on desktop.

## Plan

Edit `src/routes/practice.session.tsx` only — presentation change, no logic change.

1. Replace the existing `sr-only` submit button (lines 322–324) with a real, visible primary button rendered directly under the input.
2. Button behavior:
   - `type="submit"` so the existing `<form onSubmit>` path runs (same `submit()` that Enter triggers — no duplicated logic).
   - Disabled when `input` is empty or when `feedback !== null` (mirrors the input's disabled state, prevents double-submit during the post-answer pause).
   - Label: `Submit` (changes to `Next` visual hint is out of scope — `advance()` is automatic after feedback).
3. Styling: full-width, same max-width as the input (`w-full`), height ~`h-12`, rounded, primary background, matches the app's existing button tokens (`bg-primary text-primary-foreground`, hover state, disabled opacity). Sits ~`mt-3` below the "Type the answer · Enter to submit" helper line.
4. Update the helper text to `Tap Submit or press Enter` so the on-screen affordance is discoverable on mobile, while desktop users still see the Enter hint.
5. Keep the hint chip ("Tip …") position unchanged — it renders above the new button via existing order in the form.

## Out of scope

- No change to `submit()`, scoring, adaptive logic, or timers.
- No switch away from `inputMode="numeric"` (switching to `decimal` or `text` would add a return key but also bring up the full alphabetic keyboard or change the keypad layout — worse UX for a math drill).
