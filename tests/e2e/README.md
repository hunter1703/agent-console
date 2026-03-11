# Playwright E2E

## Suites
- `npm run test:e2e`: mock-first deterministic suite (`chromium-mock`, `chromium-mobile-mock`).
- `npm run test:e2e:live`: live backend smoke (`@live` specs).
- `npm run test:e2e:ui`: interactive Playwright UI.

## Notes
- Mock suite intercepts `/api/**` and validates schema-driven builder behavior without backend availability.
- Live smoke expects backend routes to be reachable through the configured `BACKEND_URL`.
- Test coverage is keyed by `AC-*` IDs embedded in test names.
