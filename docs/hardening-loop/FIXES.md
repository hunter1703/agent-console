# Hardening Fixes

## FIX HC-001
- files changed: `tests/e2e/live-smoke.spec.ts`
- rationale: Use stable `data-testid="settings-page"` selector to avoid strict-mode ambiguity and keep live smoke deterministic.
- risk: Low. Test-only change; no runtime behavior change.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/live-smoke.spec.ts --project=chromium-live-smoke` -> pass
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`26 passed, 1 skipped`)

## FIX HC-002
- files changed: `app/chat/[id]/page.tsx`
- rationale: Ensure direct session URL loads fetch backend session details even without local cache by falling back to `currentSid`.
- risk: Medium-low. Changes chat session hydration path; could affect session bootstrap sequencing.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts --project=chromium-mock` -> pass
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`32 passed, 1 skipped`)

## FIX HC-003
- files changed:
  - `app/api/v1/events/route.ts`
  - `app/api/v1/agent/session/[sessionId]/resume/events/route.ts`
- rationale: Replace manual proxy plumbing with upstream `fetch` passthrough and return upstream `status/statusText` + body to preserve error semantics.
- risk: Medium. Changes SSE proxy implementation path and header propagation behavior.
- verification:
  - `curl` malformed `/api/v1/events` now returns `400`.
  - `curl` malformed resume route now returns `400`.
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`32 passed, 1 skipped`).

## FIX HC-004
- files changed: `lib/stream.ts`
- rationale: Harden SSE parser for protocol variants by supporting CRLF framing and ignoring comment keepalive lines.
- risk: Low. Parsing-only behavior made more permissive and standards-aligned.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts` -> pass (desktop+mobile)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live` -> pass

## FIX HC-005
- files changed:
  - `lib/events.ts`
  - `tests/e2e/events-hardening.spec.ts`
- rationale: Buffer pre-start tool arg deltas by `toolCallId` and merge into `ToolCallStarted` once it arrives; keep merging post-start deltas as before.
- risk: Medium-low. Logic touches event reconstruction path but is narrow and covered by deterministic test.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/events-hardening.spec.ts --project=chromium-mock` -> pass (after failing pre-fix)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`34 passed, 1 skipped`)

## FIX HC-006
- files changed:
  - `tests/e2e/history-reconstruct-hardening.spec.ts`
- rationale: Add end-to-end session history reconstruction coverage to ensure UI correctness for out-of-order tool args on backend-loaded historical sessions.
- risk: Low. Test-only change.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mock` -> pass
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mobile-mock` -> pass
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`38 passed, 1 skipped`)

## FIX HC-007
- files changed:
  - `app/chat/[id]/page.tsx`
  - `tests/e2e/chat-hardening.spec.ts`
- rationale: Remove unsafe suffix-based dedup in delta assembly and add explicit regression test for repeated deltas.
- risk: Medium. Could re-allow true duplicate chunks from transport retries, but avoids guaranteed token-loss corruption in normal streaming.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-004" --project=chromium-mock` -> pass (failed pre-fix)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts` -> pass (`8 passed`)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`40 passed, 1 skipped`)

## FIX HC-008
- files changed:
  - `lib/stream.ts`
  - `tests/e2e/chat-hardening.spec.ts`
- rationale: Skip SSE events with empty `data` payload in stream utility and add targeted keepalive regression test.
- risk: Low. Empty events are non-actionable for current protocol and should be ignored.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-005" --project=chromium-mock` -> pass (failed pre-fix)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts` -> pass (`10 passed`)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`42 passed, 1 skipped`)

## FIX HC-009
- files changed:
  - `tests/e2e/chat-hardening.spec.ts`
- rationale: Added explicit streaming out-of-order tool-args coverage (`AC-EVT-003`) and certified it in QA matrix.
- risk: Low. Test-only change.
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-EVT-003" --project=chromium-mock` -> pass
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`44 passed, 1 skipped`)

## FIX HC-010
- files changed: `components/ThinkingCard.tsx`
- rationale: Remove synchronous `setState` from effect and derive `expanded` state from `isStreaming` to avoid cascading render risk while preserving UX.
- risk: Low. Behavior retained (always expanded while streaming, auto-collapse after completion).
- verification:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts` -> pass (`12 passed`)
  - `BACKEND_URL=http://localhost:18080 npx playwright test --grep-invert @live` -> pass (`41 passed, 1 skipped`)

## FIX HC-BLK-001-CLOSE
- files changed: `docs/hardening-loop/ISSUES.md`, `docs/hardening-loop/RUN-LOG.md`
- rationale: Backend availability restored; reran all previously blocked live validations end-to-end.
- risk: None (documentation/state update).
- verification:
  - `curl http://localhost:18080/q/health` -> UP
  - `curl http://localhost:3000/api/health` -> UP
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live` -> pass (`3 passed`)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`61 passed, 4 skipped`)
  - direct live curl SSE checks show expected 400 validation semantics on malformed payloads.

## FIX HC-011
- files changed:
  - `next.config.ts`
  - `tests/e2e/sse-proxy-live.spec.ts`
- rationale: Exclude SSE endpoints from generic `/api/v1/:path*` rewrite so dedicated stream proxy handlers are always used; strengthen live tests to assert header-level contract.
- risk: Medium-low. Rewrite matching changed for `/api/v1/events` and resume events only.
- verification:
  - `curl` header checks now show both routes include `cache-control: no-cache, no-transform`, `x-accel-buffering: no`, and route marker (`x-agent-console-proxy`).
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live` -> pass (`3 passed`)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e` -> pass (`61 passed, 4 skipped`)
