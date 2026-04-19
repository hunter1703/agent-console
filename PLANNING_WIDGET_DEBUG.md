# Planning Widget Not Rendering - Debug Guide

## Issue
Planning widgets are not being displayed even though the backend is sending planning tool events (`create_plan`, `start_task`, etc.).

## What We Know

### ✅ Backend is Working
The curl output shows the backend IS sending:
- `TOOL_CALL_START` with `toolCallName: "create_plan"`
- `TOOL_CALL_ARGS` with the plan data (title, goal, tasks)
- `TOOL_CALL_END`
- `TOOL_CALL_RESULT`

### ✅ Frontend Code is Present
- `PlanningCard` component exists and is imported
- `activePlanningCards` variable is defined (line 593)
- Planning cards are being rendered in JSX (lines 820-832)
- `useToolCalls` hook is being used (line 98)

### ❓ Unknown: Are Events Reaching the Handler?
We need to verify:
1. Are TOOL_CALL events being received by the event handler?
2. Is `startToolCall` being called in the chat store?
3. Are tool calls being stored in `activeToolCalls`?
4. Is the component re-rendering when tool calls are added?

## Debug Steps

### Step 1: Check Console Logs
I've added debug logging to help diagnose the issue. Refresh the browser and send the message "Create a plan for a 3-chapter mystery story". Then check the browser console for:

**Expected logs from event handler:**
```
Starting tool call: i2Hetv0mw create_plan
Tool call started, active tool calls: { i2Hetv0mw: {...} }
```

**Expected logs from chat page:**
```
Active tool calls: { i2Hetv0mw: {...} }
Active planning cards: [{ toolCallId: 'i2Hetv0mw', toolName: 'create_plan', ... }]
```

### Step 2: Diagnose Based on Logs

#### Case A: No "Starting tool call" logs
**Problem**: Events are not reaching the handler
**Solution**: Check if `onStreamEvent` callback is being called in `invokeAgent`

#### Case B: "Starting tool call" logs but no tool calls in state
**Problem**: `startToolCall` is not updating the store correctly
**Solution**: Check Zustand devtools or add more logging to `startToolCall` in chat store

#### Case C: Tool calls in state but no "Active planning cards" logs
**Problem**: Component is not re-rendering
**Solution**: Check if `useToolCalls` hook is subscribed correctly

#### Case D: "Active planning cards" logs but no UI
**Problem**: Rendering logic issue
**Solution**: Check if `activePlanningCards.map()` is being executed

## Potential Root Causes

### 1. Store Not Updating
The `startToolCall` function might not be triggering a re-render. Check if Zustand's `set()` is being called correctly.

### 2. Hook Not Subscribing
The `useToolCalls` hook might not be subscribing to the correct state slice. Check the implementation in `chat.ts`.

### 3. Tool Calls Being Cleared
Something might be calling `clearAllSessions()` or clearing `activeToolCalls` after they're added.

### 4. Session Mismatch
Tool calls might be associated with a different session than the active one.

## Quick Fixes to Try

### Fix 1: Force Re-render
Add a key to the planning cards section:
```typescript
{activePlanningCards.map((planningTool, index) => (
  <div key={`${planningTool.toolCallId}-${index}`}>
```

### Fix 2: Check Store Directly
Instead of using the hook, try accessing the store directly:
```typescript
const activeToolCalls = useChatStore(state => state.activeToolCalls)
```

### Fix 3: Add Data Attributes
Add data attributes to help debug rendering:
```typescript
<div 
  key={planningTool.toolCallId}
  data-tool-call-id={planningTool.toolCallId}
  data-tool-name={planningTool.toolName}
>
```

## Next Steps

1. **Refresh browser** and send planning message
2. **Check console logs** for the debug output
3. **Report findings** - which logs appear and which don't
4. Based on findings, we can pinpoint the exact issue and fix it

## Files Modified for Debugging

- `agent-console/app/chat/page.tsx` - Added useEffect logging for tool calls
- `agent-console/lib/sse/handler.ts` - Added console.log in handleToolCallStart
