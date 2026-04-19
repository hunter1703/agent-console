# Runtime Fixes - April 17, 2026

## Critical Fixes Applied

### 1. Invalid Hook Call Error ✅ FIXED
**Error**: `Invalid hook call. Hooks can only be called inside of the body of a function component`

**Root Cause**: In `lib/store/chat.ts`, the `flushAutoSave()` action was calling `useShouldSaveToBackend()` (a React hook) instead of the non-hook version `shouldSaveToBackend()`.

**Fix**: Changed line 548 from:
```typescript
const { useShouldSaveToBackend } = await import('./temporaryChat')
if (useShouldSaveToBackend(activeSessionId)) {
```

To:
```typescript
const { shouldSaveToBackend } = await import('./temporaryChat')
if (shouldSaveToBackend(activeSessionId)) {
```

**Files Modified**:
- `agent-console/lib/store/chat.ts` (line 548)

---

### 2. Unknown AGUI Event Types ✅ FIXED
**Warning**: `Unknown AGUI event type: STEP_STARTED` and `STEP_FINISHED`

**Root Cause**: The SSE handler didn't have cases for internal step events that the backend sends.

**Fix**: Added silent handlers for these event types (matching original implementation pattern from backup-v1-20260408):
```typescript
case 'STEP_STARTED':
case 'STEP_FINISHED':
  // Silently ignore internal step events (original implementation pattern)
  break
```

**Original Implementation Reference**: From `adapters/aguiAdapter.ts` in commit 5915fa4:
```typescript
case "STEP_STARTED":
case "STEP_FINISHED":
    break;
```

**Files Modified**:
- `agent-console/lib/sse/handler.ts` (lines 106-109)

---

## Remaining Issues

### 1. Duplicate Message Warnings ⚠️
**Warning**: `Message msg-XXX already exists in session YYY`

**Status**: Non-critical - This is a safety check in the store. The SSE stream may be replaying historical events that are already in the store. The check prevents duplicates from being added.

**Action**: Monitor to ensure it's not causing UI issues. If messages appear duplicated in the UI, we'll need to investigate further.

---

## Testing Checklist

- [x] Fix invalid hook call error
- [x] Handle STEP_STARTED/STEP_FINISHED events (silently ignore)
- [x] Verify SSE endpoint URL is correct (`/v1/session/{id}/stream` - singular)
- [ ] Verify SSE stream connects successfully
- [ ] Verify historical sessions load correctly
- [ ] Verify user messages appear in historical sessions
- [ ] Verify auto-save works without errors
- [ ] Verify temporary mode respects save settings
- [ ] Test new chat creation
- [ ] Test session switching
- [ ] Test tool execution display
- [ ] Test plan widget display
- [ ] Test confirmation requests

---

## Architecture Notes

### SSE Stream Protocol
- **Endpoint**: `GET /v1/session/{sessionId}/stream` (singular "session"!)
- **Behavior**: Sends complete history (committed + uncommitted) then live events
- **Client**: Should NOT call `getSession(sessionId, true)` with `includeEvents=true`
- **Client**: Should call `getSession(sessionId, false)` for metadata only
- **Client**: Should immediately open SSE stream which replays all historical events

### Auto-Save Architecture
- **Debounced**: 1 second delay after last change
- **Respects Temporary Mode**: Checks `shouldSaveToBackend()` before saving
- **Triggers**: Message completion, run finish, manual flush
- **Non-Hook Version**: `shouldSaveToBackend()` for use in store actions
- **Hook Version**: `useShouldSaveToBackend()` for use in components

### Event Handler
- **Singleton**: `getAGUIEventHandler()` returns single instance
- **Processes**: All AGUI events from SSE stream
- **Updates**: Chat store directly (Open WebUI pattern)
- **Handles**: Messages, tool calls, plans, confirmations, custom events
- **Ignores**: STEP_STARTED, STEP_FINISHED (internal backend events)

### Original Implementation Reference
The STEP_STARTED/STEP_FINISHED handling follows the original pattern from commit 5915fa4 (backup-v1-20260408) where these events were silently ignored with a simple `break` statement in the adapter's switch case.
