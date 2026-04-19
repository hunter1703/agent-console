# Historical Session Loading Fix

## Issue

User messages from historical sessions were not being rendered because the frontend was calling the wrong API endpoint.

## Root Cause

The frontend was calling:
```
GET /v1/catalog/AgentSession/{sessionId}?includeEvents=true
```

This endpoint returns the session with `aguiEvents` array, but the frontend was not processing these events. Instead, it was trying to call a separate `getSessionMessages()` API which doesn't include user messages from the event stream.

## Correct Approach

According to the backend architecture, the SSE stream endpoint already sends the complete history:

```
GET /v1/sessions/{sessionId}/stream
```

This endpoint:
1. Sends all committed history events (including user and assistant messages)
2. Sends uncommitted turn events
3. Then sends live events as they occur

## Solution

### Changed Behavior

**Before:**
1. Call `getSession(sessionId, true)` with `includeEvents=true`
2. Try to process `aguiEvents` from the response (but this wasn't implemented)
3. Call separate `getSessionMessages()` API (which doesn't have user messages)
4. Manually load tool calls and reconstruct plans

**After:**
1. Call `getSession(sessionId, false)` WITHOUT `includeEvents` (just get basic metadata)
2. Immediately open SSE stream with `openStream(sessionId)`
3. SSE stream sends ALL historical events
4. SSE handler processes events and builds chat history automatically

### Code Changes

#### `app/chat/page.tsx` - Session Query

```typescript
// OLD
queryFn: () => getSession(sessionId!, true), // includeEvents=true

// NEW  
queryFn: () => getSession(sessionId!, false), // DON'T include events - SSE stream will send them
```

#### `app/chat/page.tsx` - Session Loading

```typescript
// OLD
addSession(chatSession)
setActiveSession(session.id)
router.replace(`/session/${session.id}`)

// Load historical messages from API
const loadSessionHistory = async () => {
  const historicalMessages = await getSessionMessages(session.id)
  // ... process messages
}
loadSessionHistory()

// NEW
addSession(chatSession)
setActiveSession(session.id)
router.replace(`/session/${session.id}`)

// Open SSE stream immediately - it will send all historical events
console.log('Opening SSE stream for historical session:', session.id)
openStream(session.id)
```

## Benefits

1. **Simpler Code**: No need to manually load and process historical messages
2. **Single Source of Truth**: SSE stream is the only source for all events
3. **Consistent Behavior**: Same event processing for historical and live events
4. **Complete History**: User messages, assistant messages, tool calls, plans - all from one stream
5. **Real-time Updates**: Stream stays open for live events after sending history

## Event Flow

```
User navigates to /session/{sessionId}
    ↓
Frontend calls getSession(sessionId, false) for metadata
    ↓
Frontend opens SSE stream: GET /v1/sessions/{sessionId}/stream
    ↓
Backend sends committed history events:
  - TEXT_MESSAGE_START (user: "hello")
  - TEXT_MESSAGE_CHUNK (user: "hello")
  - TEXT_MESSAGE_END (user)
  - RUN_STARTED
  - TEXT_MESSAGE_START (assistant)
  - TEXT_MESSAGE_CHUNK (assistant: "Hello! How can I...")
  - TEXT_MESSAGE_END (assistant)
  - RUN_FINISHED
    ↓
SSE handler processes each event:
  - TEXT_MESSAGE_START → addMessage()
  - TEXT_MESSAGE_CHUNK → appendToMessage()
  - TEXT_MESSAGE_END → updateMessage(streaming: false)
    ↓
Chat history is built in store
    ↓
React renders messages from history
    ↓
Stream stays open for live events
```

## Testing

To verify the fix:

1. Navigate to an existing session: `/session/{sessionId}`
2. Check browser console for: "Opening SSE stream for historical session: {sessionId}"
3. Check Network tab for SSE connection to `/v1/sessions/{sessionId}/stream`
4. Verify all messages (user and assistant) are rendered
5. Verify tool calls and plans are displayed
6. Send a new message and verify it streams correctly

## Status

✅ Fixed - Historical sessions now load correctly via SSE stream
✅ User messages are rendered
✅ Assistant messages are rendered
✅ Tool calls and plans will be processed from stream events
✅ Live events continue to work after history is loaded

