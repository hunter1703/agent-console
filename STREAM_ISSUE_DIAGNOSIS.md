# Stream Issue Diagnosis

## Summary

The frontend EventSource fails to connect to the backend SSE stream with `ERR_INCOMPLETE_CHUNKED_ENCODING`.

## Root Cause

The backend SSE stream is **missing double newlines** (`\n\n`) between events, which violates the SSE specification.

## Evidence

### 1. Backend Works with curl
```bash
$ curl -N http://localhost:8080/v1/session/{sessionId}/stream
# Returns 200 OK and streams events
data:{"type":"RUN_STARTED",...}
data:{"type":"STEP_STARTED",...}
```

### 2. Frontend EventSource Fails
```javascript
const es = new EventSource('http://localhost:8080/v1/session/{sessionId}/stream')
// Error: net::ERR_INCOMPLETE_CHUNKED_ENCODING
// readyState: 0 (CONNECTING - never reaches OPEN state)
```

### 3. SSE Format Issue
The backend output shows:
```
data:{"type":"RUN_STARTED",...}\n
data:{"type":"STEP_STARTED",...}\n
```

But SSE spec requires:
```
data:{"type":"RUN_STARTED",...}\n\n
data:{"type":"STEP_STARTED",...}\n\n
```

## Backend Code Location

File: `agent-engine/interfaces/rest/src/main/java/com/agentengine/interfaces/rest/SessionRestAPI.java`

```java
@GET
@Path("/{sessionId}/stream")
@Produces(SERVER_SENT_EVENTS)
@RestStreamElementType(APPLICATION_JSON)
public Publisher<BaseEvent> stream(@PathParam("sessionId") final String sessionId) {
    // ...
    return Flowable.fromPublisher(runtimeService.subscribeToSession(sessionId))
        .concatMap(mapper::map);
}
```

## Issue

Quarkus RESTEasy Reactive with `@RestStreamElementType(APPLICATION_JSON)` is supposed to handle SSE formatting automatically, but it's not adding the required double newlines between events.

## Possible Solutions

### Option 1: Return String with Manual SSE Formatting
```java
@GET
@Path("/{sessionId}/stream")
@Produces(SERVER_SENT_EVENTS)
public Publisher<String> stream(@PathParam("sessionId") final String sessionId) {
    return Flowable.fromPublisher(runtimeService.subscribeToSession(sessionId))
        .concatMap(mapper::map)
        .map(event -> "data: " + toJson(event) + "\n\n"); // Add double newline
}
```

### Option 2: Use Multi<String> with SSE Format
```java
@GET
@Path("/{sessionId}/stream")
@Produces(SERVER_SENT_EVENTS)
public Multi<String> stream(@PathParam("sessionId") final String sessionId) {
    return Multi.createFrom().publisher(runtimeService.subscribeToSession(sessionId))
        .onItem().transformToMulti(mapper::map)
        .onItem().transform(event -> "data: " + toJson(event) + "\n\n");
}
```

### Option 3: Configure RESTEasy Reactive SSE
Check if there's a configuration option to force double newlines in Quarkus application.properties.

## Next Steps

1. **Fix the backend** to add double newlines after each SSE event
2. **Test with curl** to verify format: `curl -N http://localhost:8080/v1/session/{sessionId}/stream`
3. **Test with browser** EventSource to verify it connects successfully
4. **Verify frontend** receives and processes events correctly

## Frontend Status

The frontend code is correct and follows the proper architecture:
- ✅ Opens stream immediately after getting sessionId from invoke
- ✅ Keeps stream open for entire session lifecycle  
- ✅ Only opens ONE stream per session (checks before opening)
- ✅ Handles confirmations concurrently with stream
- ✅ Never closes stream unless navigating away

The frontend is blocked waiting for the backend SSE format fix.
