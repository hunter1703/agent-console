# Agent Console

Schema-driven management console for Agent Engine.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Schema-Driven Builders

Agent and Model builders are backend-controlled:
- `/settings/agents/new`
- `/settings/agents/:id`
- `/settings/models/new`
- `/settings/models/:id`

Frontend behavior (wizard steps, sections, presets, validations, widgets) is read from backend `/schemas/{asset}` response (`schema + layout`).

## E2E Testing (Playwright)

```bash
npm run test:e2e
npm run test:e2e:live
npm run test:e2e:ui
```

- Mock-first deterministic suite validates critical/high QA coverage.
- Live smoke suite (`@live`) validates basic backend integration.
- Coverage is tracked directly in automated specs using stable `AC-*` IDs in test names.
