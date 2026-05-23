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

## Selectors and Locators

Selectors rely on:
- `button:has-text("Popcorn Swipe Party")`
- `button[title="Like"]` (also `data-testid` on SwipeDeck)
- `text=Keep Surfing` (match modal)
