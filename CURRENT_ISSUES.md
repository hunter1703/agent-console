# Current Issues - April 17, 2026

## Fixed Issues ✅

1. **Invalid Hook Call** - Fixed by using `shouldSaveToBackend()` instead of `useShouldSaveToBackend()` in non-React contexts
2. **Unknown AGUI Events** - Fixed by silently ignoring `STEP_STARTED` and `STEP_FINISHED` events
3. **Auto-save 404 Errors** - Fixed by removing all auto-save functionality (frontend shouldn't update sessions)
4. **Duplicate Message Warnings** - Fixed by silently skipping duplicate messages instead of logging warnings

## Remaining Issues ⚠️

### 1. SSE Stream Closing After Historical Events

**Symptom:**
```
EventSource error: [object Event]
EventSource readyState: 0 (CLOSED)
Received 1368 events before error
```

**Analysis:**
- The SSE stream successfully connects
- It receives all historical events (1368 events in this case)
- Then it closes (readyState becomes 0)
- This suggests the backend is closing the stream after replaying history

**Expected Behavior:**
According to the backend code (`SessionRestAPI.java`), the stream should:
1. Send committed history
2. Send uncommitted turn events  
3. Stay open for live events

**Current Behavior:**
The stream appears to close after step 2, not staying open for live events.

**Possible Causes:**
1. Backend stream completion after history replay
2. Network timeout
3. Backend error during stream setup
4. Pekko actor stream completion

**Next Steps:**
- Check backend logs for stream errors
- Verify SessionActor is keeping the stream open
- Check if there's a timeout configuration
- Test with a new session (no history) to see if stream stays open

### 2. Stream Reconnection Loop

**Symptom:**
The frontend keeps trying to open new streams, leading to multiple connections.

**Analysis:**
- When the stream closes, the frontend may be opening a new one
- This creates a loop: open → receive history → close → open again

**Solution:**
Need to implement proper stream lifecycle management:
- Only open stream once per session
- Don't reopen if it closes after receiving all events
- Add reconnection logic only for unexpected closures

## Architecture Notes

### Frontend Responsibilities
- ✅ Read session data (GET endpoints)
- ✅ Listen to session events (SSE stream)
- ✅ Send user messages (POST invoke)
- ✅ Submit confirmations (POST confirm)
- ❌ Update session metadata (no PUT endpoint exists)

### Backend Responsibilities
- ✅ Manage session state (SessionActor)
- ✅ Persist session events
- ✅ Stream events to frontend (SSE)
- ✅ Handle message routing
- ✅ Update session metadata

### SSE Stream Protocol
- **Endpoint**: `GET /v1/session/{sessionId}/stream`
- **Expected**: Committed history → Uncommitted events → Live events (stays open)
- **Actual**: Committed history → Uncommitted events → CLOSE

## Testing Checklist

- [x] Fix invalid hook call error
- [x] Handle STEP_STARTED/STEP_FINISHED events
- [x] Remove auto-save functionality
- [x] Remove duplicate message warnings
- [ ] Fix SSE stream closing issue (backend)
- [ ] Verify stream stays open for live events
- [ ] Test with new session (no history)
- [ ] Test with historical session
- [ ] Verify messages display correctly
- [ ] Test tool execution display
- [ ] Test plan widget display
- [ ] Test confirmation requests
