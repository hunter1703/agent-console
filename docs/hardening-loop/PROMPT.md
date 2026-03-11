You are running an autonomous hardening loop for /Users/rhp/Projects/agent-console.

Mission:
Drive agent-console to production-grade stability with evidence-driven testing against both:
1) frontend behavior (Next.js app + Playwright)
2) real backend integration (agent-engine at BACKEND_URL)

Critical context from this repo:
- Next.js app with API rewrites/proxies to backend (`/api/*` -> backend), plus custom SSE proxy routes.
- SSE chat/event flow is core-risk area (`/api/v1/events` and `/api/v1/agent/session/:sessionId/resume/events`).
- Existing QA mapping lives in automated tests via `AC-*` IDs and must be kept current.
- Existing E2E scripts:
  - `npm run test:e2e` (mock deterministic)
  - `npm run test:e2e:live` (live backend smoke)
  - `npm run test:e2e:headed` / `npm run test:e2e:ui`

Execution policy (strict):
1. Start required services end-to-end:
   - Start agent-engine backend from `/Users/rhp/Projects/agent-engine` using deploy scripts.
   - Start/ensure agent-console app on port 3000.
   - Verify health (`/api/health`, backend `/q/health`) before test runs.
2. Build a feature matrix and continuously burn it down:
   - settings list + CRUD routing
   - schema-driven builders (agent/model)
   - payload roundtrip create/update/delete
   - catalog/schema lookups
   - chat send/stream/stop
   - event translation + ordering + reconstruction
   - thinking/tool/planning rendering
   - pause/resume flows
   - session persistence/load/history behavior
   - offline/health banner behavior
   - mobile viewport behavior
3. Use BOTH:
   - automated Playwright tests
   - direct curl checks (backend and `/api` proxy paths)
4. On every bug:
   - reproduce first with a failing automated test (Playwright/unit as appropriate)
   - implement minimal fix
   - rerun impacted tests + regression slice
   - document evidence
5. Never stop at analysis; continue loops until exit criteria are met.
6. Do not revert unrelated local changes. Avoid destructive git operations.

Artifacts to maintain each loop:
- `/Users/rhp/Projects/agent-console/docs/hardening-loop/ISSUES.md`
- `/Users/rhp/Projects/agent-console/docs/hardening-loop/FIXES.md`
- `/Users/rhp/Projects/agent-console/docs/hardening-loop/TEST-CASES.md`
- `/Users/rhp/Projects/agent-console/docs/hardening-loop/RUN-LOG.md`
- update/add automated tests with `AC-*` IDs (add/strengthen checks)

Required record format:
- ISSUE: id, severity, reproducible steps, expected vs actual, root cause, affected AC IDs
- FIX: files changed, rationale, risk, verification
- TEST CASE: command, fixture/setup, assertions, pass/fail
- RUN LOG: loop number, timestamps, commands, summary counts, blockers

Exit criteria:
- All critical/high issues closed
- Mock E2E suite passes
- Live smoke suite passes
- New regressions covered by tests
- automated tests updated for all new fixes/features
- Final report includes verified scope, fixed defects, residual risks, and evidence

Important:
Do not claim "bug free." Use "no known critical/high defects under tested scope" with explicit residual-risk notes.
Start now and keep iterating.
