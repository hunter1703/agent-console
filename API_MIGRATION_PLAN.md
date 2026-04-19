# API Migration Plan: New Stream Architecture

## Overview
The backend has migrated to a new streaming architecture that decouples invoke/confirm from streaming. This document outlines the required frontend changes.

## Backend Changes

### 1. Invoke Endpoint
- **Old**: `POST /v1/invoke/{agentId}` → SSE stream
- **New**: `POST /v1/agent/{agentId}/invoke` → `{ "sessionId": "..." }`

### 2. Stream Endpoint (NEW)
- **Endpoint**: `GET /v1/session/{sessionId}/stream`
- **Returns**: SSE stream with full history + live events
- **Behavior**: Safe to reconnect - replays all committed events

### 3. Confirm Endpoint
- **Old**: `POST /v1/invoke/session/{sessionId}/confirm/{confirmationId}` → SSE stream
- **New**: `POST /v1/session/{sessionId}/confirm/{confirmationId}` → `{ "confirmed": true }`

## Frontend Changes Required

### ✅ COMPLETED

1. **lib/api/services.ts**
   - ✅ Updated `invokeAgent()` to return `{ sessionId }` instead of streaming
   - ✅ Added `openSessionStream()` function for dedicated SSE connection
   - ✅ Updated `submitConfirmation()` endpoint path and return type

2. **lib/api/confirmations.ts**
   - ✅ Updated endpoint path from `/v1/invoke/session/...` to `/v1/session/...`
   - ✅ Updated to expect JSON response instead of SSE stream

3. **lib/constants/toolConfigs.ts**
   - ✅ Fixed fallback tool names to show actual tool name instead of "Tool Execution"

### 🔄 IN PROGRESS

4. **app/chat/page.tsx** - Major refactor needed
   - Current: Calls `invokeAgent()` which opens SSE stream inline
   - Required: 
     - Call `invokeAgent()` to get sessionId
     - Call `openSessionStream(sessionId)` to open dedicated stream
     - Keep stream open across multiple messages
     - Reuse same stream after confirmations
     - Handle stream reconnection on page refresh

### Implementation Strategy for chat/page.tsx

```typescript
// Pseudo-code for new flow

// 1. On component mount or session load
useEffect(() => {
  if (sessionId && !sseConnection) {
    // Open stream for existing session
    const stream = openSessionStream(sessionId, handleSSEEvent)
    chatStore.setSSEConnection(stream)
  }
}, [sessionId])

// 2. On send message
async function handleSendMessage(message: string) {
  // Add user message to UI
  addUserMessage(message)
  
  // Invoke agent (returns sessionId)
  const { sessionId } = await invokeAgent(agentId, { message, sessionId: existingSessionId })
  
  // If new session, open stream
  if (!sseConnection) {
    const stream = openSessionStream(sessionId, handleSSEEvent)
    chatStore.setSSEConnection(stream)
  }
  
  // Events will arrive on the stream automatically
}

// 3. On confirmation submit
async function handleConfirmation(confirmationId, confirmed, answer) {
  // Submit confirmation (returns JSON ack)
  await submitConfirmation(sessionId, confirmationId, { confirmed, message: answer })
  
  // Events continue on existing stream - no need to reopen
  hideConfirmation(confirmationId)
}

// 4. On page refresh
// Stream automatically replays history when reconnected
// No special handling needed
```

## Benefits of New Architecture

1. **Page Refresh Support**: Stream replays full history on reconnect
2. **Multi-Tab Support**: Multiple tabs can open same stream
3. **Simpler Client Code**: No need to manage stream lifecycle per invoke
4. **Better Error Handling**: Stream errors don't affect invoke/confirm operations
5. **Cleaner Separation**: Invoke/confirm are fire-and-forget, streaming is separate concern

## Testing Checklist

- [ ] New chat starts correctly (invoke → get sessionId → open stream)
- [ ] Messages stream correctly
- [ ] Confirmations work (submit → events continue on same stream)
- [ ] Page refresh loads history correctly
- [ ] Multiple messages in same session work
- [ ] Tool executions display correctly
- [ ] Plans display correctly
- [ ] Error handling works

## Rollout Plan

1. ✅ Update API service functions
2. ✅ Update confirmation endpoints
3. ✅ Fix tool name display
4. 🔄 Refactor chat page to use new flow
5. Test all scenarios
6. Deploy

## Notes

- The SSE event format (AGUI events) remains unchanged
- All existing event handlers can be reused
- Main change is in connection management, not event processing
