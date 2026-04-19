# Streaming Architecture Refactor

## Problem

The original implementation had a **dual-array architecture** that caused React duplicate key errors:

1. **`streamingMessages` object** - temporary storage for messages being streamed
2. **`messages` array** - permanent storage for completed messages

### The Bug

When a streaming message completed:
- Message existed in `streamingMessages` (being finalized)
- Message got added to `messages` (completed)
- Brief overlap caused **React duplicate key error**
- Required deduplication filter as a patch

## Solution

Refactored to use **direct DOM updates** for streaming with **single source of truth** for completed messages.

### New Architecture

```typescript
// State - only completed items
messages: Message[]           // Historical + completed messages ONLY
activeToolCalls: ToolCall[]   // In-progress tool executions  
activePlans: Plan[]           // Current plans
confirmations: Confirmation[] // Pending confirmations

// NO streamingMessages object

// Streaming handled by direct DOM refs
const streamingMessageRefs = Map<messageId, {
  element: HTMLDivElement | null
  content: string
  role: 'assistant' | 'user' | 'system'
}>
```

### How It Works

**For streaming messages:**

1. `TEXT_MESSAGE_START` → Create ref entry, render placeholder
2. `TEXT_MESSAGE_CHUNK` → Append directly to `ref.element.textContent`
3. `TEXT_MESSAGE_END` → Add to `messages` array, delete ref

**Benefits:**

✅ No dual storage - single source of truth  
✅ No transition overlap - no duplicate keys  
✅ No deduplication needed  
✅ Direct DOM updates = better performance  
✅ Simpler state management  

## Files Changed

### `lib/store/chat.ts`
- Removed `streamingMessages` from state
- Removed `startStreamingMessage`, `appendToStreamingMessage`, `completeStreamingMessage` actions
- Simplified `useStreamingState` hook to only check `session.isStreaming` flag

### `lib/sse/handler.ts`
- Added `streamingMessageRefs` Map for direct DOM updates
- Added `registerStreamingElement()` to connect DOM refs
- Added `getStreamingMessage()` to access streaming data
- Added `getActiveStreamingMessageIds()` for rendering
- Updated `handleTextMessageStart()` to create ref entry
- Updated `handleTextMessageChunk()` to update DOM directly
- Updated `handleTextMessageEnd()` to add to messages and cleanup ref
- Removed references to `streamingMessages` state

### `app/chat/page.tsx`
- Removed `StreamingMessage` type import
- Updated timeline building to use `eventHandler.getActiveStreamingMessageIds()`
- Updated streaming message rendering to use refs with `registerStreamingElement()`
- Removed deduplication filter (no longer needed)
- Simplified `hasMessages` check

## Migration Notes

### Before (Dual Array)
```typescript
// State
streamingMessages: Record<string, StreamingMessage>
messages: Message[]

// Rendering
const completedMessageIds = new Set(messages.map(m => m.id))
const timeline = [
  ...messages,
  ...Object.values(streamingMessages)
    .filter(m => !completedMessageIds.has(m.messageId)) // Dedup patch
]
```

### After (Direct DOM)
```typescript
// State
messages: Message[]  // Only completed

// Rendering  
const streamingIds = eventHandler.getActiveStreamingMessageIds()
const timeline = [
  ...messages,
  ...streamingIds.map(id => ({ type: 'streaming', messageId: id }))
]

// In component
<div ref={(el) => eventHandler.registerStreamingElement(messageId, el)} />
```

## Testing

The refactor maintains the same user-facing behavior:
- Messages stream in real-time
- Completed messages persist
- Page refresh loads history correctly
- No duplicate key warnings

## Future Improvements

1. **Markdown streaming**: Currently streams plain text, could stream markdown tokens
2. **Reasoning blocks**: Could add reasoning metadata to streaming refs
3. **Multi-chunk batching**: Could batch multiple chunks before DOM update
4. **Virtual scrolling**: For very long conversations

## Conclusion

This refactor eliminates architectural complexity by recognizing that:
- **Streaming is ephemeral** → use direct DOM updates
- **History is persistent** → use state array
- **No need for dual storage** → simpler, faster, no bugs
