# SSE Format Bug - Missing Double Newlines

## Problem

The frontend EventSource gets `ERR_INCOMPLETE_CHUNKED_ENCODING` when connecting to the backend SSE stream endpoint.

## Root Cause

The backend is sending SSE events with **single newlines** instead of **double newlines**.

### Current Backend Output (WRONG):
```
data:{"type":"RUN_STARTED",...}\n
data:{"type":"STEP_STARTED",...}\n
data:{"type":"TEXT_MESSAGE_START",...}\n
```

### Required SSE Format (CORRECT):
```
data:{"type":"RUN_STARTED",...}\n\n
data:{"type":"STEP_STARTED",...}\n\n
data:{"type":"TEXT_MESSAGE_START",...}\n\n
```

## SSE Specification

According to the [Server-Sent Events W3C Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events):

> Each event is terminated by a blank line (two newline characters).

The EventSource API in browsers expects each event to end with `\n\n` (double newline). Without this, the browser waits indefinitely for the event to complete, eventually timing out with `ERR_INCOMPLETE_CHUNKED_ENCODING`.

## Evidence

### Test with curl (works but shows format issue):
```bash
$ curl -N http://localhost:8080/v1/session/{sessionId}/stream
data:{"type":"RUN_STARTED",...}
data:{"type":"STEP_STARTED",...}
# No blank lines between events!
```

### Browser EventSource (fails):
```javascript
const es = new EventSource('http://localhost:8080/v1/session/{sessionId}/stream')
// Error: net::ERR_INCOMPLETE_CHUNKED_ENCODING
// readyState: 0 (CONNECTING - never reaches OPEN)
```

## Solution

The backend SSE endpoint needs to be fixed to send double newlines after each event.

### Backend Fix Location

Look for the SSE streaming code in the Java backend (likely in `SessionAssetHandler` or similar) and ensure it sends:

```java
// WRONG:
writer.write("data: " + json + "\n");

// CORRECT:
writer.write("data: " + json + "\n\n");
writer.flush();
```

## Verification

After fixing, verify with:

```bash
# Should see blank lines between events
curl -N http://localhost:8080/v1/session/{sessionId}/stream

# Should work in browser
const es = new EventSource('...')
es.onopen = () => console.log('Connected!') // Should fire
es.onmessage = (e) => console.log('Event:', e.data) // Should receive events
```

## Impact

- **Frontend**: Cannot receive SSE events at all
- **User Experience**: Chat appears to hang after sending a message
- **Workaround**: None - this must be fixed in the backend

## Related Files

- Backend: `agent-engine/interfaces/rest/src/main/java/com/agentengine/interfaces/rest/handlers/catalog/SessionAssetHandler.java`
- Frontend: `agent-console/lib/api/services.ts` (openSessionStream function)
- Frontend: `agent-console/app/chat/page.tsx` (openStream function)
