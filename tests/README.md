# `tests/` — QA automation

## Purpose

Playwright-driven smoke tests for multiplayer flows. Not part of ESLint (see `eslint.config.mjs` ignores).

## Files

| File | Coverage |
| --- | --- |
| [`qa_e2e.js`](qa_e2e.js) | Host, 2 guests, capacity guest 3, undo/re-like, match |
| [`qa_e2e_features.js`](qa_e2e_features.js) | Live like counter, superlike toast, movie night planner |
| [`debug.js`](debug.js) | Ad-hoc debugging |
| `artifacts/` | Screenshots (gitignored) |

## Prerequisites

```bash
npm run dev                    # terminal 1
npx playwright install chromium
npm test                       # or node tests/qa_e2e.js
```

## Artifact path

Scripts write to `tests/artifacts/` (created automatically). Do not use machine-specific paths.

## Known failures (2026-05-21)

| Test | Observation |
| --- | --- |
| `qa_e2e.js` | Guest join `waitForURL` timeout — verify home "Join" flow and room code input still match selectors |
| `qa_e2e_features.js` | Superlike toast — mitigated in `SwipeDeck`; re-run after fix |

Selectors rely on:

- `button:has-text("Popcorn Swipe Party")`
- `button[title="Like"]` (also `data-testid` on SwipeDeck)
- `text=Keep Surfing` (match modal)

## Optimal fix plan

1. Migrate to `@playwright/test` with `webServer` config auto-starting dev server.
2. Add `data-testid` on home join/host buttons.
3. CI: `npx playwright install --with-deps && npm test`

## Verification

```bash
npm test
```

## After successful execution

Paste pass/fail into `Architecture.md` section 3 command table.
