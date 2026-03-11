# Hardening Issues

## ISSUE HC-001
- id: HC-001
- severity: High
- reproducible steps:
  1. Run `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/live-smoke.spec.ts --project=chromium-live-smoke`.
  2. Observe failure in strict-mode selector resolution for `getByText("Settings")`.
- expected vs actual:
  - Expected: Live smoke confirms settings page loads.
  - Actual: Test fails due to ambiguous locator matching both nav link and page heading.
- root cause: Non-deterministic text locator in `tests/e2e/live-smoke.spec.ts` violated Playwright strict mode after UI contained multiple "Settings" elements.
- affected AC IDs: AC-LIVE-001
- status: Closed

## ISSUE HC-002
- id: HC-002
- severity: High
- reproducible steps:
  1. Open `/chat/echo_agent?sessionId=s-1` directly in a fresh browser context with no `localStorage` session cache.
  2. Backend session `s-1` includes `pause.paused=true` and prompt data.
  3. Observe chat UI does not show pause banner and sends to `/api/v1/events` instead of resume path.
- expected vs actual:
  - Expected: UI hydrates pause state from backend session and resumes through `/api/v1/agent/session/s-1/resume/events`.
  - Actual: Pause state was skipped because session fetch depended on cached `threadId`.
- root cause: `app/chat/[id]/page.tsx` only fetched session details when `backendThreadId` existed in local storage; direct URL session loads did not fetch backend session metadata.
- affected AC IDs: AC-CHAT-003
- status: Closed

## ISSUE HC-003
- id: HC-003
- severity: High
- reproducible steps:
  1. POST malformed body to `/api/v1/events` through console proxy.
  2. Observe backend responds with validation error body, but proxy previously returned HTTP 200.
  3. Repeat on `/api/v1/agent/session/:sessionId/resume/events`.
- expected vs actual:
  - Expected: Proxy preserves backend HTTP status codes so client can detect stream-start failures.
  - Actual: Proxy always returned HTTP 200 with stream headers, masking backend 4xx/5xx.
- root cause: Route handlers used low-level Node proxy and always created `new Response(..., { headers })` without propagating upstream status.
- affected AC IDs: AC-INF-004
- status: Closed

## ISSUE HC-004
- id: HC-004
- severity: Medium
- reproducible steps:
  1. Consume SSE responses that use CRLF (`\r\n`) event separators or include comment lines (`:keepalive`).
  2. Parse stream with current `fetchSseStream` implementation.
- expected vs actual:
  - Expected: SSE parser accepts both LF and CRLF framing and ignores comments.
  - Actual: Parser split logic assumed only LF separators, increasing risk of malformed event chunks with some proxies/backends.
- root cause: `lib/stream.ts` used `split("\n\n")` and line splitting on `"\n"` only.
- affected AC IDs: AC-CHAT-001
- status: Closed

## ISSUE HC-005
- id: HC-005
- severity: High
- reproducible steps:
  1. Feed `reconstructEvents` with `ToolArgsUpdate` for `toolCallId=tc-1` before `ToolCallStarted`.
  2. Include another trailing `ToolArgsUpdate` after start.
  3. Check reconstructed `ToolCallStarted.arguments`.
- expected vs actual:
  - Expected: all arg deltas are preserved and merged in final tool-call arguments.
  - Actual: pre-start delta was dropped; only post-start content remained.
- root cause: `reconstructEvents` only merged `ToolArgsUpdate` if corresponding `ToolCallStarted` already existed in `result`.
- affected AC IDs: AC-EVT-001
- status: Closed

## ISSUE HC-007
- id: HC-007
- severity: High
- reproducible steps:
  1. Stream assistant text deltas with identical consecutive chunks (e.g., `"a"`, `"a"`, `"a"`) for same `messageId`.
  2. Observe rendered assistant text in chat.
- expected vs actual:
  - Expected: all deltas are appended in order (result `"aaa"`).
  - Actual: dedup check dropped chunks when existing content ended with incoming delta.
- root cause: `app/chat/[id]/page.tsx` used `existing.content.endsWith(ev.content)` to suppress duplicates, which incorrectly treats valid repeated tokens as duplicates.
- affected AC IDs: AC-CHAT-004
- status: Closed

## ISSUE HC-008
- id: HC-008
- severity: High
- reproducible steps:
  1. SSE stream includes keepalive/comment frame (`:keepalive\n\n`) before normal `data:` events.
  2. Send chat message and process stream in client.
- expected vs actual:
  - Expected: keepalive frames are ignored; subsequent assistant tokens render normally.
  - Actual: empty-data SSE event reached JSON parser and aborted stream handling.
- root cause: `fetchSseStream` yielded parsed events even when `data` was empty.
- affected AC IDs: AC-CHAT-005
- status: Closed

## ISSUE HC-010
- id: HC-010
- severity: Medium
- reproducible steps:
  1. Run `npm run lint`.
  2. Observe `react-hooks/set-state-in-effect` violation in `components/ThinkingCard.tsx`.
- expected vs actual:
  - Expected: no synchronous `setState` in effect bodies to avoid cascading renders.
  - Actual: `setIsExpanded(true)` executed synchronously in effect `else` branch.
- root cause: state reset logic implemented directly in effect instead of deriving render-time expansion from streaming state.
- affected AC IDs: AC-CHAT-001
- status: Closed

## ISSUE HC-BLK-001
- id: HC-BLK-001
- severity: High
- reproducible steps:
  1. Start/restart Next app and hit `/api/health` or SSE proxy routes.
  2. Observe proxy fetch errors with `ECONNREFUSED` to `http://localhost:18080`.
- expected vs actual:
  - Expected: backend health endpoint and live proxy checks reachable.
  - Actual: backend connection refused; live integration loops blocked.
- root cause: backend service unavailable on expected port.
- affected AC IDs: AC-LIVE-001, AC-INF-004
- status: Closed (resolved on 2026-03-10 after backend recovery; blocked live checks rerun)

## ISSUE HC-011
- id: HC-011
- severity: High
- reproducible steps:
  1. POST malformed payload to `/api/v1/events` and `/api/v1/agent/session/:sessionId/resume/events`.
  2. Compare response headers.
- expected vs actual:
  - Expected: both SSE endpoints pass through custom route handlers with consistent anti-buffering headers (`cache-control`, `x-accel-buffering`) and proxy marker.
  - Actual: resume endpoint was matched by generic `/api/v1/:path*` rewrite, bypassing custom route and missing proxy headers/contract consistency.
- root cause: broad Next.js rewrite rule matched resume path before intended dedicated route behavior.
- affected AC IDs: AC-INF-004
- status: Closed
