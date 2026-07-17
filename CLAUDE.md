# CLAUDE.md — EasyOrder (claude-labs-nexgen)

## What is this

Restaurant management app (EasyOrder) built with React 19 + CRA + Tailwind CSS v4. Features a metrics dashboard with export functionality, and a reports page with PDF generation.

## Architecture

```
src/
  App.js              — Router (react-router-dom v7). Routes: /, /reportes, /ordenes, /menu, /ajustes
  components/         — Reusable UI (NavBar, MetricsDashboard, MetricsFilters, ReportTable, etc.)
  pages/              — Page-level components (MetricsPage, ReportsPage)
  data/mockData.js    — Deterministic mock data generator (seed=42, 7 months of orders)
  services/           — pdfGenerator.js (pdfmake)
  utils/              — dateFormatter.js, dateValidation.js
```

## Commands

```bash
npm start            # Dev server on port 3000
npm run build        # Production build
npm test             # Jest tests
```

## Tailwind CSS

CRA ignores postcss.config.js, so Tailwind is compiled separately:
```bash
npx @tailwindcss/cli -i src/tailwind.input.css -o src/tailwind.output.css
```
`src/index.css` imports `./tailwind.output.css`, NOT `"tailwindcss"` directly.

## DOM Contract

MetricsDashboard publishes state via `data-*` attributes for verification:
- `data-verify="metrics-dashboard"` on root
- `data-metric="total|approval-rate|status-breakdown|avg-review-time|daily-trend"`
- `data-action="export-csv"` on export button

## Verification

```bash
node verification/verify-headless.js    # Headless Playwright verification
```
Schema, invariants, probes, and fixtures in `verification/`.

## Conventions

- Spanish UI text, English code identifiers.
- No inline styles — use Tailwind utility classes.
- Mock data only (no backend). All data from `src/data/mockData.js`.
- Components use `.jsx` extension.
- Date format: YYYY-MM-DD for data, localized for display.

## Key decisions

- Tailwind v4 with CLI compilation (CRA incompatibility workaround).
- pdfmake for client-side PDF generation (no server needed).
- Deterministic seed (42) for reproducible mock data across tests.
