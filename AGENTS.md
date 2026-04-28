# AGENTS.md

## What this repo is

Single-package React SPA — a case management dashboard ("Lederflate") for NAV Kontroll team leads. Static mock data only; no backend or API calls.

Scaffolded via [Lovable](https://lovable.dev), deployed to GitHub Pages at base path `/nav-vue-central/`.

## Stack

- **React 18** + **TypeScript 5** (strict mode OFF — see below)
- **Vite 5** with `@vitejs/plugin-react-swc`
- **Tailwind CSS 3** + HSL design tokens in `src/index.css`
- **shadcn/ui** (Radix primitives) — all generated files live in `src/components/ui/`
- **React Router v6** with `HashRouter` (required for GitHub Pages)
- **Recharts 2** for charts
- **Vitest** + `@testing-library/react` + jsdom

## Dev commands

```bash
npm run dev          # Dev server at http://localhost:8080
npm run build        # Production build → dist/
npm run build:dev    # Dev build
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run deploy       # Build + publish to GitHub Pages (gh-pages)
```

No `typecheck` script — run manually:
```bash
npx tsc --noEmit
```

No formatter (Prettier) configured.

## Running a single test

```bash
npx vitest run src/test/example.test.ts
npx vitest run --reporter=verbose src/components/SomeComponent
```

## Key directories

| Path | Purpose |
|---|---|
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Root: QueryClientProvider + HashRouter + routes |
| `src/index.css` | **All design tokens** (HSL CSS custom properties) + Tailwind directives |
| `src/pages/` | Route-level components (`Dashboard`, `Saksoversikt`, `NotFound`) |
| `src/components/aksel/` | Hand-authored NAV Aksel-style primitives (`KpiCard`, `Panel`, `ScopeBar`, `Tag`) |
| `src/components/ui/` | shadcn/ui generated — treat as vendored, add via CLI |
| `src/data/cases.ts` | **Sole data source**: 184 mock cases + employees, seeded RNG (`seed=42`) |
| `src/test/` | Vitest setup + test files |

## Critical conventions

- **All UI text and comments are in Norwegian (Bokmål).** Keep this consistent.
- **Path alias**: always use `@/` (maps to `src/`), never relative `../../` imports.
- **Design tokens**: colors are defined as HSL CSS vars in `src/index.css`. Never hardcode hex/rgb. Use semantic tokens (`primary`, `success`, `warning`, etc.).
- **Border radius**: intentionally tiny — `--radius: 0.25rem`. Use `rounded-sm` by default.
- **Adding shadcn components**: use the CLI, not manual editing:
  ```bash
  npx shadcn@latest add <component>
  ```
- **No real API calls**: all data comes from `src/data/cases.ts`. Don't add fetches without discussing architecture.
- **HashRouter** is intentional for GitHub Pages — all routes are hash-based (`/#/saksoversikt`).
- **`lovable-tagger`** (`componentTagger`) runs in dev only. Do not remove it.

## TypeScript — intentionally loose

`tsconfig.app.json` has `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`. **Do not tighten these** without explicit discussion.

## ESLint notes

- `@typescript-eslint/no-unused-vars` is OFF
- `react-hooks/rules-of-hooks` and `exhaustive-deps` are errors
- The `eslint-disable` comment on the URL-sync effect in `Saksoversikt.tsx` is intentional

## Tests

- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Vitest globals enabled (no need to import `describe`/`it`/`expect`)
- `src/test/setup.ts` sets up jest-dom matchers and stubs `window.matchMedia`
- Only a placeholder test exists currently

## CI

No GitHub Actions workflows. Deployment is manual via `npm run deploy`.
