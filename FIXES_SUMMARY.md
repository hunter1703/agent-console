# Bug Fixes Summary

## Issue 1: Incorrect API Endpoint for Agent Lookup
**Problem**: The `getAgentName` function was calling `/v1/catalog/resource/{id}` which returned 400/500 errors.

**Root Cause**: Using `getResource` function which calls the wrong endpoint.

**Fix**: Changed `getAgentName` to use `getAgent` function which calls the correct catalog API endpoint `/v1/catalog/Agent/{id}`.

**Files Changed**:
- `agent-console/lib/api/services.ts`
  - Removed `getResource` function
  - Updated `getAgentName` to use `getAgent` instead

**Impact**: Agent names now load correctly in chat messages without 400 errors.

---

## Issue 2: CUSTOM Event Not Recognized
**Problem**: Confirmation request events were being sent by the backend but not processed by the frontend. Console showed "Unknown AGUI event type: CUSTOM".

**Root Cause**: The event handler switch statement had `case 'Custom':` but the backend sends `type: 'CUSTOM'` (uppercase).

**Fix**: Added `case 'CUSTOM':` to the switch statement alongside the existing `case 'Custom':` to handle both formats.

**Files Changed**:
- `agent-console/lib/sse/handler.ts`
  - Added `case 'CUSTOM':` before `case 'Custom':`

**Impact**: Confirmation request widgets now appear correctly when the agent requests user input.

---

## Issue 3: Planning Widgets Not Rendering on Session Reload
**Problem**: When reopening an existing session, planning widgets and tool calls were not visible, even though they were present during the original conversation.

**Root Cause**: The `getSessionMessages` function only reconstructed messages from session events but ignored tool call events. The `activeToolCalls` store remained empty when loading historical sessions.

**Fix**: 
1. Created `getSessionToolCalls` function to reconstruct tool calls from `TOOL_CALL_*` events
2. Updated session loading logic to populate `activeToolCalls` store with historical tool calls
3. Modified `startToolCall` to accept optional `startTime` for historical data

**Files Changed**:
- `agent-console/lib/api/services.ts`
  - Added `ReconstructedToolCall` interface
  - Added `getSessionToolCalls` function
- `agent-console/app/chat/page.tsx`
  - Updated `loadSessionHistory` to call `getSessionToolCalls`
  - Populate `activeToolCalls` store with reconstructed tool calls
- `agent-console/lib/store/chat.ts`
  - Modified `startToolCall` to preserve `startTime` from historical data

**Status**: Implementation complete, but **blocked by backend bug** - sessions return HTTP 500 errors when fetching with `includeEvents=true`.

**Impact**: Once backend is fixed, planning widgets and tool execution cards will render correctly when reopening sessions.

---

## Backend Issues Discovered

### Session Event Serialization Bug
**Endpoint**: `GET /v1/catalog/AgentSession/{sessionId}?includeEvents=true`

**Problem**: Returns HTTP 500 Internal Server Error

**Sessions Affected**:
- `429d3a62-5a8b-457f-83a8-790bc21d3c52`
- `0329ee6c-c91c-4451-9b0c-12e0e2c20732`

**Impact**: Cannot load historical messages or tool calls when reopening sessions.

**Likely Cause**: Java serialization issue in `SessionActor` or `SessionAssetHandler` when converting AGUI events to JSON.

**Action Required**: Backend team needs to fix session event serialization.

---

## Testing Status

### ✅ Working
- Live conversations with tool calls
- Planning cards during active chats
- Tool execution cards
- Confirmation request widgets (after fix #2)
- Agent name lookups (after fix #1)

### ❌ Blocked by Backend
- Loading historical tool calls when reopening sessions
- Loading historical messages when reopening sessions
- Testing tool call reconstruction feature

---

## Code Quality

✅ No TypeScript errors
✅ No React hooks violations  
✅ Follows existing code patterns
✅ Properly typed interfaces
✅ Error handling in place
✅ Console logging for debugging

---

## Next Steps

1. **Backend Team**: Fix session event serialization bug
   - Investigate `SessionActor.getAguiEvents()` method
   - Check `SessionAssetHandler` JSON serialization
   - Test with sessions that have planning tool calls

2. **Frontend Team**: Once backend is fixed, verify:
   - Historical tool calls are reconstructed correctly
   - Planning cards render when reopening sessions
   - Tool execution cards show historical tool results
   - All tool types (planning, spawn_agent, etc.) are reconstructed


---

## Issue 4: React Key Prop Warning in TaskList
**Problem**: Console warning "Each child in a list should have a unique 'key' prop" in TaskList component.

**Root Cause**: Tasks without `taskId` property caused undefined keys in the map function.

**Fix**: Added fallback keys using index when `taskId` is undefined:
- Root level: `task.taskId || `task-${index}``
- Children level: `child.taskId || `child-${task.taskId}-${i}``

**Files Changed**:
- `agent-console/components/chat/TaskList.tsx`
  - Updated key prop in root task map
  - Updated key prop in children task map

**Impact**: Eliminates React warnings and ensures proper component reconciliation.


---

## Issue 5: Planning Tools Displayed as Regular Tool Calls
**Problem**: Planning tools (`create_plan`, `start_task`, etc.) were being displayed as both regular tool execution cards AND planning cards, causing duplicate/incorrect rendering.

**Root Cause**: All tool calls were being rendered as `ToolExecutionCard`, including planning tools. Planning tools should only be rendered as `PlanningCard`.

**Fix**: 
1. Created `regularToolCalls` variable that filters out planning tools
2. Updated tool call rendering to use `regularToolCalls` instead of all `activeToolCalls`
3. Planning tools now only render as `PlanningCard` components

**Files Changed**:
- `agent-console/app/chat/page.tsx`
  - Added `planningToolNames` array
  - Created `regularToolCalls` filter
  - Updated tool call rendering to exclude planning tools

**Impact**: Planning tools now display correctly as planning widgets instead of generic tool execution cards.
