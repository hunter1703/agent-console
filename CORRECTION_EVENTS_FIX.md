# Correction Events Fix

## Problem

Error messages from `PlanLoopResponseProcessor` violations were appearing as regular text messages instead of being displayed as correction events with proper styling and context.

## Root Cause

The issue was in the event flow from backend to frontend:

1. **Backend Flow (Working Correctly)**:
   - `PlanLoopResponseProcessor` creates violations when the agent tries to give a final answer while tasks are still open
   - `CorrectionProcessor` converts these violations to corrective events using `CorrectionUtils.buildCorrectiveEvent()`
   - These events include proper metadata via `buildCorrectionActions()`:
     - `correction` = true
     - `correction_type` = "violation"
     - `correction_code` = violation code (e.g., "final_answer_validation")
     - `correction_message` = violation message
   - `AGUIEventMapper` detects correction events via `SessionEventUtils.isCorrectionEvent()` and creates `CorrectionEvent` objects
   - These are sent as `CUSTOM` events with `name: "correction"`

2. **Frontend Issue (Fixed)**:
   - The frontend SSE handler's `handleCustomEvent()` method handled confirmations but **did not handle correction events**
   - Correction events fell through and were not processed
   - The backend also sent the correction message as a `TEXT_MESSAGE` event with `role: "user"`, causing it to appear as a regular user message

## Solution

### 1. Updated SSE Handler (`lib/sse/handler.ts`)

Added correction event handling in the `handleCustomEvent()` method:

```typescript
else if (event.name === 'correction') {
  console.log('🔧 Processing correction event:', event)
  const correctionId = `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  chatStore.addCorrectionEvent(sessionId, {
    correctionId,
    correctionType: event.correctionType || 'violation',
    code: event.code || 'unknown',
    message: event.message || 'Correction event received',
  })
  chatStore.addTimelineItem(sessionId, { type: 'correction', id: correctionId })
}
```

### 2. Created CorrectionCard Component (`components/chat/CorrectionCard.tsx`)

A new component to display correction events with:
- Warning icon and styling
- Correction code badge
- Clear message display
- Optional dismiss button
- Accessible design with proper ARIA attributes

### 3. Timeline Integration

The chat page already had support for rendering correction events in the timeline:

```typescript
if (item.type === 'correction') {
  const correction = correctionEvents[item.id]
  if (!correction) return null
  return (
    <div key={item.id} className="mt-6">
      <CorrectionCard
        correction={correction}
        onDismiss={() => removeCorrectionEvent(correction.correctionId)}
      />
    </div>
  )
}
```

## Timeline Principle

The fix follows the established timeline principle:

1. **Render at earliest reference**: Correction events appear at the position where they occur in the SSE stream
2. **Sequential processing**: All events are rendered in the order the backend sends them

## Testing

To test the fix:

1. Start the agent console: `npm run dev`
2. Create a plan with tasks
3. Try to give a final answer before completing all tasks
4. The correction event should now appear as a styled warning card instead of a plain text message

## Files Modified

- `agent-console/lib/sse/handler.ts` - Added correction event handling
- `agent-console/components/chat/CorrectionCard.tsx` - New component for displaying corrections
- `agent-console/app/chat/page.tsx` - Already had timeline rendering support (no changes needed)
- `agent-console/lib/store/chat.ts` - Already had correction event state management (no changes needed)

## Backend Context

The backend correction event creation is handled by:
- `agent-engine/runtime/src/main/java/com/agentengine/runtime/utils/CorrectionUtils.java`
- `agent-engine/runtime/src/main/java/com/agentengine/runtime/agents/processors/request/CorrectionProcessor.java`
- `agent-engine/util/agents/src/main/java/com/agentengine/util/agents/agui/AGUIEventMapper.java`
- `agent-engine/util/agents/src/main/java/com/agentengine/util/agents/agui/CorrectionEvent.java`

These components work correctly and did not require any changes.
