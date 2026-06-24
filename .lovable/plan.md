# Fix undici vulnerabilities in @tanstack/react-start

## Background

All three high-severity advisories come from `undici`, pulled in transitively through `@tanstack/react-start` → `@tanstack/start-server-core`. We can't simply bump `@tanstack/react-start` because version `1.167.50` is the latest that still ships the vulnerable `undici` range. The fix is to force the resolved `undici` version to a patched release.

The relevant advisories are all fixed in `undici@7.16.0` (and backported to `6.22.0` on the 6.x line).

## Change

Add a `resolutions` / `overrides` block to `package.json` so Bun pins every transitive `undici` to a safe version:

```jsonc
{
  // existing fields…
  "overrides": {
    "undici": "^7.16.0"
  },
  "resolutions": {
    "undici": "^7.16.0"
  }
}
```

Both keys are included so the pin works whether the lockfile is resolved by Bun (`overrides`) or a future npm/yarn run (`resolutions`).

Then reinstall to refresh `bun.lock`:

```bash
bun install
```

## Verification

- `bun pm ls undici` should show a single `undici@7.16.x` entry.
- Re-run the security scan; the three GHSA findings should clear.
- Dev server still boots and SSR server functions still work (no API surface of `undici` we consume directly changes between 6.x and 7.x for our usage — it's only used internally by `@tanstack/start-server-core` for fetch).

## Risk / rollback

If something in the Worker/SSR runtime regresses with undici 7.x, fall back to `"^6.22.0"` in both override blocks and reinstall. No application code changes required either way.
