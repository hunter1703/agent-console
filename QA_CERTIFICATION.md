# Agent Console QA Certification

This document is the source of truth for QA coverage and automation mapping.

## Automation Status Legend
- `Automated`: Covered by Playwright E2E specs in `tests/e2e`.
- `Manual`: Requires manual/device-specific validation.

## 1. Infrastructure & Networking

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-INF-002 | Automated | Offline health banner is shown when `/api/health` fails | `tests/e2e/settings-agents-list.spec.ts` |
| AC-INF-003 | Automated | Events SSE proxy preserves streaming cadence and anti-buffering headers | `tests/e2e/sse-proxy-contract.spec.ts` |
| AC-INF-004 | Automated | SSE proxy routes preserve upstream status codes and anti-buffering headers (events + resume) | `tests/e2e/sse-proxy-live.spec.ts` |
| AC-INF-005 | Automated | Builder load failures do not trigger infinite schema/config refetch loops | `tests/e2e/agent-builder-validation.spec.ts` |

## 2. Settings Management

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-AGT-001 | Automated | Settings lists agents/models and routes to dedicated builders | `tests/e2e/settings-agents-list.spec.ts` |
| AC-AGT-003 | Automated | List row action controls reveal on hover (desktop contract) | `tests/e2e/settings-agents-list.spec.ts` |

## 3. Agent Builder Contract

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-AGT-010 | Automated | Step/section navigation renders from backend layout metadata | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-011 | Automated | Schema + layout fields render without frontend hardcoding | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-012a | Automated | Agent create payload roundtrip | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-012b | Automated | Agent edit payload roundtrip | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-013 | Automated | Dynamic schema lookup for tool configs renders | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-014 | Automated | Dynamic schema lookup only refetches on dependent-value change | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-015 | Automated | Dynamic schema field hides when backend returns empty schema | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-020 | Automated | Visibility rules react to discriminator changes | `tests/e2e/agent-builder-validation.spec.ts` |
| AC-AGT-021 | Automated | Fallback generic mode renders when wizard metadata missing | `tests/e2e/agent-builder-validation.spec.ts` |
| AC-AGT-022a | Automated | Draft restore hydrates state from localStorage | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-022b | Automated | Draft discard clears localStorage and keeps server edit state | `tests/e2e/agent-builder-core.spec.ts` |
| AC-AGT-022c | Automated | Refresh on clean baseline does not show restore dialog | `tests/e2e/agent-builder-core.spec.ts` |

## 4. Model Builder Contract

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-MDL-010 | Automated | Model builder renders backend-driven steps | `tests/e2e/model-builder.spec.ts` |
| AC-MDL-010b | Automated | Root presets apply backend payload patch | `tests/e2e/model-builder.spec.ts` |
| AC-MDL-011a | Automated | Model create payload roundtrip | `tests/e2e/model-builder.spec.ts` |
| AC-MDL-011b | Automated | Model edit payload roundtrip | `tests/e2e/model-builder.spec.ts` |

## 5. Chat Runtime & Eventing

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-CHAT-001 | Automated | Chat send/stream renders assistant output and tool usage details | `tests/e2e/chat-hardening.spec.ts` |
| AC-CHAT-002 | Automated | Stop action exits streaming and restores send affordance | `tests/e2e/chat-hardening.spec.ts` |
| AC-CHAT-003 | Automated | Paused session hydration + resume endpoint routing from direct URL | `tests/e2e/chat-hardening.spec.ts` |
| AC-CHAT-004 | Automated | Repeated text deltas are preserved (no token loss) | `tests/e2e/chat-hardening.spec.ts` |
| AC-CHAT-005 | Automated | SSE keepalive/comment frames do not break parsing | `tests/e2e/chat-hardening.spec.ts` |
| AC-EVT-001 | Automated | Reconstruction preserves pre-start tool args | `tests/e2e/events-hardening.spec.ts` |
| AC-EVT-002 | Automated | History/session hydration reconstructs out-of-order tool args in UI | `tests/e2e/history-reconstruct-hardening.spec.ts` |
| AC-EVT-003 | Automated | Streaming UI preserves complete args when args events precede tool start | `tests/e2e/chat-hardening.spec.ts` |

## 6. Mobile UX

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-MOB-010 | Automated | Builder navigation actions remain visible and usable on mobile | `tests/e2e/mobile-builder.spec.ts` |
| AC-MOB-011 | Automated | iOS safe-area contracts keep chat composer visible/usable | `tests/e2e/mobile-builder.spec.ts` |

## 7. Live Backend Smoke

| ID | Status | Scenario | Spec / Notes |
|---|---|---|---|
| AC-LIVE-001 | Automated | Settings page loads in live backend mode | `tests/e2e/live-smoke.spec.ts` |

## How To Run

```bash
npm run test:e2e
npm run test:e2e:live
npm run test:e2e:ui
```
