# Hardening Run Log

## Loop 1
- loop number: 1
- timestamps:
  - start: 2026-03-10 11:24:00 +04
  - end: 2026-03-10 11:35:00 +04
- commands:
  - `curl -fsS -m 5 http://localhost:18080/q/health`
  - `curl -fsS -m 5 http://localhost:3000/api/health`
  - `npm run test:e2e`
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/live-smoke.spec.ts --project=chromium-live-smoke`
  - `curl -si -m 15 -X POST http://localhost:3000/api/v1/catalog/list -H 'content-type: application/json' --data '{"assetType":"agent"}'`
  - `curl -si -N -m 12 -X POST http://localhost:3000/api/v1/events -H 'content-type: application/json' --data '{"agentId":"echo_agent","input":"health stream probe"}'`
  - `curl -si -N -m 8 -X POST http://localhost:3000/api/v1/agent/session/nonexistent-session/resume/events -H 'content-type: application/json' --data '{"input":"resume probe"}'`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 31 total observed (`1` isolated live + `26` full run + `4` curl endpoint checks)
  - tests failed: 1 (pre-fix isolated/full live smoke failure)
- blockers: None

## Loop 2
- loop number: 2
- timestamps:
  - start: 2026-03-10 11:36:00 +04
  - end: 2026-03-10 11:43:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts --project=chromium-mock` (pre-fix)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts --project=chromium-mock` (post-fix)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 35 observed (`3` post-fix targeted + `32` full run)
  - tests failed: 1 (pre-fix AC-CHAT-003)
- blockers: None

## Loop 3
- loop number: 3
- timestamps:
  - start: 2026-03-10 11:44:00 +04
  - end: 2026-03-10 11:50:00 +04
- commands:
  - `curl` malformed payload against `/api/v1/events`
  - `curl` malformed payload against `/api/v1/agent/session/nonexistent-session/resume/events`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 34 observed (`32` Playwright + `2` curl assertions)
  - tests failed: 0
- blockers: None

## Loop 4
- loop number: 4
- timestamps:
  - start: 2026-03-10 11:50:00 +04
  - end: 2026-03-10 11:54:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 7 observed
  - tests failed: 0
- blockers: None

## Loop 5
- loop number: 5
- timestamps:
  - start: 2026-03-10 11:55:00 +04
  - end: 2026-03-10 12:01:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/events-hardening.spec.ts --project=chromium-mock` (pre-fix fail)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/events-hardening.spec.ts --project=chromium-mock` (post-fix pass)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 41 observed (`1` events targeted + `6` chat targeted + `34` full regression)
  - tests failed: 1 (pre-fix targeted failure)
- blockers: None

## Loop 6
- loop number: 6
- timestamps:
  - start: 2026-03-10 12:02:00 +04
  - end: 2026-03-10 12:08:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/sse-proxy-live.spec.ts --project=chromium-live-smoke`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 0
  - issues fixed: 0
  - tests passed: 41 observed (`2` targeted live SSE + `3` live suite + `36` full suite)
  - tests failed: 0
- blockers: None

## Loop 7
- loop number: 7
- timestamps:
  - start: 2026-03-10 12:09:00 +04
  - end: 2026-03-10 12:15:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mock`
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/history-reconstruct-hardening.spec.ts --project=chromium-mobile-mock`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 0
  - issues fixed: 0
  - tests passed: 40 observed (`1` desktop targeted + `1` mobile targeted + `38` full suite)
  - tests failed: 0
- blockers: None

## Loop 8
- loop number: 8
- timestamps:
  - start: 2026-03-10 12:16:00 +04
  - end: 2026-03-10 12:22:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-004" --project=chromium-mock` (pre-fix fail + post-fix pass)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 49 observed (`1` targeted + `8` chat suite + `40` full suite)
  - tests failed: 1 (pre-fix targeted failure)
- blockers: None

## Loop 9
- loop number: 9
- timestamps:
  - start: 2026-03-10 12:23:00 +04
  - end: 2026-03-10 12:29:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-CHAT-005" --project=chromium-mock` (pre-fix fail + post-fix pass)
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 53 observed (`1` targeted + `10` chat suite + `42` full suite)
  - tests failed: 1 (pre-fix targeted failure)
- blockers: None

## Loop 10
- loop number: 10
- timestamps:
  - start: 2026-03-10 12:30:00 +04
  - end: 2026-03-10 12:35:00 +04
- commands:
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts -g "AC-EVT-003" --project=chromium-mock`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 0
  - issues fixed: 0
  - tests passed: 45 observed (`1` targeted + `44` full suite)
  - tests failed: 0
- blockers: None

## Loop 11
- loop number: 11
- timestamps:
  - start: 2026-03-10 12:36:00 +04
  - end: 2026-03-10 12:43:00 +04
- commands:
  - `npm run lint`
  - `BACKEND_URL=http://localhost:18080 npx playwright test tests/e2e/chat-hardening.spec.ts`
  - `BACKEND_URL=http://localhost:18080 npx playwright test --grep-invert @live`
  - live curl probes (`/api/v1/events`, `/api/v1/agent/session/:id/resume/events`) during backend outage
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 53 observed (`12` chat suite + `41` non-live full)
  - tests failed: 0
- blockers:
  - HC-BLK-001 backend unavailable on `localhost:18080` (live validation blocked)

## Loop 12
- loop number: 12
- timestamps:
  - start: 2026-03-10 19:50:00 +04
  - end: 2026-03-10 20:00:00 +04
- commands:
  - `curl -fsS -m 5 http://localhost:18080/q/health`
  - `curl -fsS -m 5 http://localhost:3000/api/health`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
  - live curl probes for `/api/v1/events` and `/api/v1/agent/session/:id/resume/events`
- summary counts:
  - issues found: 0
  - issues fixed: 0
  - tests passed: 64 observed (`3` live suite + `61` full suite)
  - tests failed: 0
- blockers:
  - HC-BLK-001 resolved (backend reachable; live checks completed)

## Loop 13
- loop number: 13
- timestamps:
  - start: 2026-03-10 20:40:00 +04
  - end: 2026-03-10 20:48:00 +04
- commands:
  - health checks (`/q/health`, `/api/health`)
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
  - curl header contract probes for SSE and resume SSE routes
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 64 observed (`3` live suite + `61` full suite)
  - tests failed: 0
- blockers: None

## Loop 14
- loop number: 14
- timestamps:
  - start: 2026-03-10 21:35:00 +04
  - end: 2026-03-10 21:46:00 +04
- commands:
  - rewrite/header contract curl probes for `/api/v1/events` and resume SSE route
  - restart dev server to apply `next.config.ts` rewrite changes
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e:live`
  - `BACKEND_URL=http://localhost:18080 npm run test:e2e`
- summary counts:
  - issues found: 1
  - issues fixed: 1
  - tests passed: 64 observed (`3` live suite + `61` full suite)
  - tests failed: 0
- blockers: None
