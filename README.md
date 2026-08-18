# Toggl 2.0 — W0 prototype

Prototype for the Toggl home assignment: an improvement to the individual
user experience aimed at **W0 retention** (a new user returning and getting
value within their first week).

**Live:** _(GitHub Pages URL once deployed)_

## Running it

```bash
npm install
npm run dev
```

## How it's built

Vite + React + TypeScript + Tailwind v4. Frontend only, mock data, no backend
— as the brief allows.

The visual layer is not approximated. `src/styles/toggl-focus-tokens.css`
holds **329 design tokens** (plus 288 dark-mode overrides) extracted from
Toggl Focus's own production CSS bundle, so the prototype uses Toggl's real
semantic token system rather than eyeballed colours:

- `bg-*` → `--background-*`, `text-*` → `--foreground-*`, `border-*` →
  `--stroke-*` (Toggl maps the same suffix to three different families;
  `src/styles/utilities.css` reproduces that)
- Type scale is Toggl's: body 14px, `text-p2` 12px, `text-h6` 11px for
  ALL-CAPS labels
- Radii are Toggl's: 4 / **8 (default)** / 20 / 32
- GT Haptik for display, Inter for UI text
- Light and dark both work, driven entirely by tokens

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/<repo-name>/` and publishes to GitHub Pages.

One-time setup: **Settings → Pages → Source: GitHub Actions**.
