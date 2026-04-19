# Historic Events Deduplication Fix

## Problem

When continuing a conversation (sending a new message to an existing session), the app reconnects to the SSE stream. The backend sends **all historic events** from the session, including messages that were already displayed. This caused duplicate messages to appear in the UI.

## Root Cause

The AGUI event handler was processing all events without checking if they had already been processed. When the stream reconnected:

1. Backend sends: `TEXT_MESSAGE_START` → `TEXT_MESSAGE_CHUNK` × N → `TEXT_MESSAGE_END` for **all messages** (historic + new)
2. Frontend processes all events and adds them to the store
3. Result: Duplicate messages appear in the UI

## Solution

Implemented deduplication logic in the event handler to distinguish between **historic events** (already processed) and **new events** (currently being created):

### 1. TEXT_MESSAGE_START Deduplication

```typescript
private handleTextMessageStart(event): void {
  const chatStore = this.getChatStore()
  
  // Check if this message already exists in any session (historic event)
  const sessions = Object.values(chatStore.sessions)
  const messageExists = sessions.some(session => 
    session.messages.some(msg => msg.messageId === event.messageId)
  )
  
  // Only start streaming if this is a new message (not historic)
  if (!messageExists) {
    chatStore.startStreamingMessage(event.messageId, event.role)
  }
}
```

**Logic**: Before starting to stream a message, check if a message with that `messageId` already exists in any session. If it exists, it's a historic event and should be ignored.

### 2. TEXT_MESSAGE_CHUNK Deduplication

```typescript
private handleTextMessageChunk(event): void {
  const chatStore = this.getChatStore()
  
  // Only append if we have an active streaming message (not historic)
  if (chatStore.streamingMessages[event.messageId]) {
    chatStore.appendToStreamingMessage(event.messageId, event.delta)
  }
}
```

**Logic**: Only append chunks if there's an active streaming message. Since historic messages won't have a streaming message entry (filtered out in TEXT_MESSAGE_START), their chunks will be ignored.

### 3. TEXT_MESSAGE_END Deduplication

```typescript
private handleTextMessageEnd(event): void {
  const chatStore = this.getChatStore()
  const streamingMessage = chatStore.streamingMessages[event.messageId]
  
  if (streamingMessage) {
    const sessionId = this.findSessionByRunId(event.runId || '')
    if (sessionId) {
      // Check if message already exists (to prevent duplicates from historic events)
      const session = chatStore.sessions[sessionId]
      const messageExists = session?.messages.some(msg => msg.messageId === event.messageId)
      
      if (!messageExists) {
        // Add message to session
        chatStore.addMessage(sessionId, { /* message data */ })
      }
    }
  }
  
  chatStore.completeStreamingMessage(event.messageId)
}
```

**Logic**: Before adding the completed message to the session, check if it already exists. This is a safety check in case the message was added through another path.

## Event Flow Comparison

### Before Fix (Duplicates)

**First message:**
1. TEXT_MESSAGE_START → Start streaming ✅
2. TEXT_MESSAGE_CHUNK × N → Append chunks ✅
3. TEXT_MESSAGE_END → Add to session ✅

**Second message (reconnect):**
1. TEXT_MESSAGE_START (historic) → Start streaming ❌ (duplicate)
2. TEXT_MESSAGE_CHUNK × N (historic) → Append chunks ❌ (duplicate)
3. TEXT_MESSAGE_END (historic) → Add to session ❌ (duplicate)
4. TEXT_MESSAGE_START (new) → Start streaming ✅
5. TEXT_MESSAGE_CHUNK × N (new) → Append chunks ✅
6. TEXT_MESSAGE_END (new) → Add to session ✅

**Result**: First message appears twice

### After Fix (No Duplicates)

**First message:**
1. TEXT_MESSAGE_START → Check exists? No → Start streaming ✅
2. TEXT_MESSAGE_CHUNK × N → Streaming active? Yes → Append ✅
3. TEXT_MESSAGE_END → Check exists? No → Add to session ✅

**Second message (reconnect):**
1. TEXT_MESSAGE_START (historic) → Check exists? Yes → Skip ✅
2. TEXT_MESSAGE_CHUNK × N (historic) → Streaming active? No → Skip ✅
3. TEXT_MESSAGE_END (historic) → Streaming message? No → Skip ✅
4. TEXT_MESSAGE_START (new) → Check exists? No → Start streaming ✅
5. TEXT_MESSAGE_CHUNK × N (new) → Streaming active? Yes → Append ✅
6. TEXT_MESSAGE_END (new) → Check exists? No → Add to session ✅

**Result**: Each message appears exactly once

## Benefits

1. ✅ **No duplicate messages** when continuing conversations
2. ✅ **Efficient** - Historic events are filtered early (at TEXT_MESSAGE_START)
3. ✅ **Safe** - Multiple layers of deduplication (START, CHUNK, END)
4. ✅ **Maintains streaming** - New messages still stream in real-time
5. ✅ **Session-aware** - Checks across all sessions to handle multi-session scenarios

## Testing

Test scenarios:
1. ✅ New conversation → Messages display correctly
2. ✅ Continue conversation → No duplicates, new messages stream correctly
3. ✅ Refresh page and continue → Historic messages preserved, new messages added
4. ✅ Multiple sessions → Each session maintains its own message history

## Files Modified

- `agent-console/lib/sse/handler.ts`
  - `handleTextMessageStart()` - Added existence check
  - `handleTextMessageChunk()` - Added streaming message check
  - `handleTextMessageEnd()` - Added existence check before adding

## Architecture Note

This fix aligns with the principle that **the backend is the source of truth** for session history. The frontend:
- Accepts historic events from the backend
- Deduplicates them intelligently
- Only processes new events for display
- Maintains a consistent view of the conversation

The backend can safely replay all events on reconnect, and the frontend will handle deduplication automatically.
