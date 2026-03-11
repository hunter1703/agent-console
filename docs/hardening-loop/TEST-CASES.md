# Hardening Test Cases

## TEST CASE TC-001
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/live-smoke.spec.ts --project=chromium-live-smoke`
- fixture/setup: Live backend at `http://localhost:18080`, console on `http://localhost:3000`
- assertions:
  - `/settings` loads in live mode.
  - `data-testid="settings-page"` is visible.
- pass/fail: Pass

## TEST CASE TC-002
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Playwright projects `chromium-mock`, `chromium-mobile-mock`, `chromium-live-smoke`
- assertions:
  - Mock deterministic suite passes.
  - Live smoke spec passes.
- pass/fail: Pass (`26 passed, 1 skipped`)

## TEST CASE TC-003
- command: `curl -si -m 15 -X POST http://localhost:3000/api/v1/catalog/list -H 'content-type: application/json' --data '{"assetType":"agent"}'`
- fixture/setup: Backend reachable through Next.js proxy
- assertions:
  - HTTP status is `200 OK`.
  - Response contains catalog `items`.
- pass/fail: Pass

## TEST CASE TC-004
- command: `curl -si -N -m 12 -X POST http://localhost:3000/api/v1/events -H 'content-type: application/json' --data '{"agentId":"echo_agent","input":"health stream probe"}'`
- fixture/setup: SSE proxy route enabled
- assertions:
  - Response content type is `text/event-stream`.
  - Backend validation response is propagated by proxy (for malformed payload).
- pass/fail: Pass

## TEST CASE TC-005
- command: `curl -si -N -m 8 -X POST http://localhost:3000/api/v1/agent/session/nonexistent-session/resume/events -H 'content-type: application/json' --data '{"input":"resume probe"}'`
- fixture/setup: Resume SSE proxy route enabled
- assertions:
  - Response returns backend validation error over stream-compatible response.
- pass/fail: Pass

## TEST CASE TC-006
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts --project=chromium-mock`
- fixture/setup: Route-level mock backend in spec; covers direct chat surface independent of existing builder/settings suite.
- assertions:
  - AC-CHAT-001: send/stream renders assistant text and tool usage marker.
  - AC-CHAT-002: stop action clears streaming state and restores send affordance.
  - AC-CHAT-003: paused session banner appears and send uses resume endpoint.
- pass/fail: Pass

## TEST CASE TC-007
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full Playwright run including new chat-hardening spec and live smoke project.
- assertions:
  - No regressions in existing AC coverage.
  - New AC-CHAT-* tests pass in desktop and mobile mock projects.
- pass/fail: Pass (`32 passed, 1 skipped`)

## TEST CASE TC-008
- command: `curl -s -o /tmp/events.out -w '%{http_code}\n' -m 12 -X POST http://localhost:3000/api/v1/events -H 'content-type: application/json' --data '{"agentId":"echo_agent","input":"health stream probe"}'`
- fixture/setup: Live backend through Next.js SSE proxy
- assertions:
  - Status code equals `400` for malformed payload.
  - Body contains backend validation violation report.
- pass/fail: Pass

## TEST CASE TC-009
- command: `curl -s -o /tmp/resume.out -w '%{http_code}\n' -m 12 -X POST http://localhost:3000/api/v1/agent/session/nonexistent-session/resume/events -H 'content-type: application/json' --data '{"input":"resume probe"}'`
- fixture/setup: Live backend resume SSE proxy
- assertions:
  - Status code equals `400` for malformed payload.
  - Body contains backend validation violation report.
- pass/fail: Pass

## TEST CASE TC-010
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
- fixture/setup: Independent chat hardening suite across desktop/mobile mock projects
- assertions:
  - Stream parsing still correctly renders assistant output.
  - Stop and pause/resume behaviors remain correct after parser hardening.
- pass/fail: Pass (`6 passed`)

## TEST CASE TC-011
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
- fixture/setup: Live backend smoke
- assertions:
  - Live settings load still passes after SSE/proxy/parser changes.
- pass/fail: Pass

## TEST CASE TC-012
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/events-hardening.spec.ts --project=chromium-mock`
- fixture/setup: Pure-function reconstruction test for out-of-order tool arg events
- assertions:
  - `ToolArgsUpdate` arriving before `ToolCallStarted` is not lost.
  - Final reconstructed `ToolCallStarted.arguments` includes all deltas in order.
- pass/fail: Pass (failed before fix)

## TEST CASE TC-013
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite with new event hardening test across projects
- assertions:
  - No regressions in existing AC checks.
  - New AC-EVT-001 passes in mock+mobile projects.
- pass/fail: Pass (`34 passed, 1 skipped`)

## TEST CASE TC-014
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/sse-proxy-live.spec.ts --project=chromium-live-smoke`
- fixture/setup: Live backend + Next.js proxy paths
- assertions:
  - `/api/v1/events` malformed payload returns HTTP `400` and validation report.
  - `/api/v1/agent/session/:sessionId/resume/events` malformed payload returns HTTP `400` and validation report.
- pass/fail: Pass (`2 passed`)

## TEST CASE TC-015
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite including `events-hardening`, `chat-hardening`, `sse-proxy-live`, and live smoke
- assertions:
  - Regression clean across all projects.
- pass/fail: Pass (`36 passed, 1 skipped`)

## TEST CASE TC-016
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mock`
- fixture/setup: Mocked backend session load with out-of-order tool arg events
- assertions:
  - Chat history shows tool usage block.
  - Expanded tool details include reconstructed argument content (`pwd`).
- pass/fail: Pass

## TEST CASE TC-017
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mobile-mock`
- fixture/setup: Same as TC-016 under mobile project
- assertions:
  - Same as TC-016 on mobile viewport.
- pass/fail: Pass

## TEST CASE TC-018
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite including `history-reconstruct-hardening`
- assertions:
  - No regressions; new AC-EVT-002 passes in desktop+mobile.
- pass/fail: Pass (`38 passed, 1 skipped`)

## TEST CASE TC-019
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-004" --project=chromium-mock`
- fixture/setup: Mock stream with identical consecutive deltas
- assertions:
  - Final assistant text preserves all repeated chunks (`aaa`).
- pass/fail: Pass (failed pre-fix)

## TEST CASE TC-020
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
- fixture/setup: Full chat hardening suite (desktop+mobile)
- assertions:
  - AC-CHAT-001..004 all pass.
- pass/fail: Pass (`8 passed`)

## TEST CASE TC-021
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite with expanded chat coverage
- assertions:
  - No regressions with AC-CHAT-004 included.
- pass/fail: Pass (`40 passed, 1 skipped`)

## TEST CASE TC-022
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-005" --project=chromium-mock`
- fixture/setup: Mock SSE stream containing comment/keepalive frame before JSON events
- assertions:
  - Chat stream remains functional and assistant text renders.
- pass/fail: Pass (failed pre-fix)

## TEST CASE TC-023
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
- fixture/setup: Full chat hardening suite (desktop+mobile)
- assertions:
  - AC-CHAT-001..005 all pass.
- pass/fail: Pass (`10 passed`)

## TEST CASE TC-024
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite with AC-CHAT-005 integrated
- assertions:
  - No regressions across all projects.
- pass/fail: Pass (`42 passed, 1 skipped`)

## TEST CASE TC-025
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-EVT-003" --project=chromium-mock`
- fixture/setup: Mock stream with `TOOL_CALL_ARGS` emitted before `TOOL_CALL_START`
- assertions:
  - Tool details preserve complete argument content.
- pass/fail: Pass

## TEST CASE TC-026
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite including AC-EVT-003
- assertions:
  - No regressions with expanded stream-order coverage.
- pass/fail: Pass (`44 passed, 1 skipped`)

## TEST CASE TC-027
- command: `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
- fixture/setup: Chat hardening suite across desktop/mobile mock projects
- assertions:
  - AC-CHAT-001..005 and AC-EVT-003 remain green after ThinkingCard effect/state change.
- pass/fail: Pass (`12 passed`)

## TEST CASE TC-028
- command: `BACKEND_URL=http://localhost:18080 npx playwright test --grep-invert @live`
- fixture/setup: Full non-live suite while backend is unavailable
- assertions:
  - Mock and mobile regressions remain clean despite backend outage.
- pass/fail: Pass (`41 passed, 1 skipped`)

## TEST CASE TC-029
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
- fixture/setup: Live backend + Next.js proxy paths
- assertions:
  - AC-LIVE-001 passes.
  - AC-INF-004a/b live SSE status passthrough tests pass.
- pass/fail: Pass (`3 passed`)

## TEST CASE TC-030
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite after backend recovery
- assertions:
  - Previously blocked live checks included and passing.
  - Full regression remains green under current scope.
- pass/fail: Pass (`61 passed, 4 skipped`)

## TEST CASE TC-031
- command: `curl -si -m 12 -X POST http://localhost:3000/api/v1/events ...` and `curl -si -m 12 -X POST http://localhost:3000/api/v1/agent/session/nonexistent-session/resume/events ...`
- fixture/setup: Live backend + console dev server with updated rewrite exclusions
- assertions:
  - Both endpoints return `400` for malformed payloads.
  - Both include anti-buffering headers and route marker headers.
- pass/fail: Pass

## TEST CASE TC-032
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
- fixture/setup: Live suite with strengthened `sse-proxy-live.spec.ts`
- assertions:
  - AC-INF-004a/b verify status + headers (`x-accel-buffering`, `cache-control`, `x-agent-console-proxy`).
- pass/fail: Pass (`3 passed`)

## TEST CASE TC-033
- command: `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- fixture/setup: Full suite after rewrite/header contract fix
- assertions:
  - Full regression clean under tested scope.
- pass/fail: Pass (`61 passed, 4 skipped`)
