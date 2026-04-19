# SSE Streaming Fix

## Problem
The frontend EventSource connection was getting 404 errors when trying to connect to the `/v1/session/{sessionId}/stream` endpoint, even though curl requests to the same URL worked perfectly.

## Root Cause
After investigation, we found:
1. **Timing Issue**: The stream endpoint was being called immediately after the invoke endpoint returned, but the session might not be fully initialized in the backend yet
2. **EventSource vs Fetch**: EventSource has different behavior than fetch() in browsers, particularly with CORS and chunked encoding
3. **Chunked Encoding Error**: When using fetch() with ReadableStream, we encountered `ERR_INCOMPLETE_CHUNKED_ENCODING` errors

## Solution Implemented
1. **Replaced EventSource with fetch() + ReadableStream**: This gives us more control over the connection and error handling
2. **Added 100ms delay**: Before opening the stream, we wait 100ms to ensure the session is fully created in the backend
3. **Enhanced logging**: Added detailed logging to track the stream lifecycle and event processing

## Code Changes
- `agent-console/lib/api/services.ts`: Replaced `EventSource` with `fetch()` + `ReadableStream` in `openSessionStream()` function
- `agent-console/app/chat/page.tsx`: 
  - Updated SSE connection ref type from `EventSource` to `{ close: () => void; readyState: number }`
  - Added 100ms delay before opening stream

## Current Status
- ✅ Invoke endpoint works correctly and returns sessionId
- ✅ Stream endpoint returns 200 OK (confirmed via curl and fetch)
- ❌ Stream reading fails with `ERR_INCOMPLETE_CHUNKED_ENCODING`

## Next Steps
The `ERR_INCOMPLETE_CHUNKED_ENCODING` error suggests one of:
1. **Kubernetes/Ingress Issue**: The load balancer or ingress might be closing long-running connections
2. **CORS Issue**: Missing or incorrect CORS headers for SSE streams
3. **Backend Issue**: The backend might be closing the connection prematurely

### Recommended Actions:
1. Check Kubernetes ingress/service configuration for SSE support
2. Verify CORS headers on the stream endpoint
3. Check backend logs for connection errors
4. Consider using a WebSocket connection instead of SSE if the infrastructure doesn't support long-running HTTP connections

## Testing
To test the fix:
```bash
# 1. Navigate to chat page
open http://localhost:3000/chat?agent=story_agent

# 2. Send a message
# 3. Check browser console for logs
# 4. Check network tab for stream request

# Test with curl (this works):
curl -v "http://localhost:8080/v1/session/{sessionId}/stream"
```

## References
- Backend API: `agent-engine/interfaces/rest/src/main/java/com/agentengine/interfaces/rest/SessionRestAPI.java`
- Frontend Stream Handler: `agent-console/lib/api/services.ts`
- Chat Page: `agent-console/app/chat/page.tsx`
