# Immediate Fixes Checklist

Based on Open WebUI analysis, here are the critical fixes needed RIGHT NOW to stop the EventSource errors.

## 🔥 Critical (Fix Today)

### 1. Revert DOM Ref Approach
**Problem:** We're trying to update DOM directly, fighting React's paradigm
**Solution:** Go back to state-based updates

```bash
# Revert these changes
git diff HEAD~5 agent-console/lib/sse/handler.ts
git diff HEAD~5 agent-console/lib/store/chat.ts
```

### 2. Install Proper Streaming Library
```bash
cd agent-console
npm install eventsource-parser
```

### 3. Fix State Structure
**Current (broken):**
```typescript
streamingMessages: Record<string, StreamingMessage>  // ❌
messages: Message[]  // ❌
```

**Target (working):**
```typescript
history: {
    messages: Record<string, Message>,  // ✅ Single source
    currentId: string | null
}
```

### 4. Fix Streaming Handler
**Current (broken):**
```typescript
// Trying to update DOM directly
streamingMsg.element.textContent = content;  // ❌
```

**Target (working):**
```typescript
// Update state, let React handle DOM
chatStore.appendToMessage(messageId, chunk);  // ✅
```

## ⚠️ High Priority (Fix This Week)

### 5. Simplify Event Handler
- Remove `streamingMessageRefs` Map
- Remove `registerStreamingElement` function
- Remove `streamingUpdateCounter`
- Direct state updates only

### 6. Use EventSourceParserStream
Replace manual SSE parsing with proper library:

```typescript
import { EventSourceParserStream } from 'eventsource-parser/stream';

const eventStream = responseBody
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();
```

### 7. Add Error Boundaries
Wrap chat page in error boundary to catch streaming errors gracefully.

## 📋 Medium Priority (Next Week)

### 8. Add Chunking for Smooth Streaming
```typescript
// Split large chunks into smaller pieces for smooth animation
async function* chunkLargeDeltas(iterator) {
    for await (const update of iterator) {
        let content = update.value;
        while (content) {
            const chunk = content.slice(0, 3);
            yield chunk;
            await sleep(5);
            content = content.slice(3);
        }
    }
}
```

### 9. Implement Conversation Branching
- Add `parentId` and `childrenIds` to Message type
- Support multiple response variations
- Add branch navigation UI

### 10. Add Message Actions
- Copy message
- Regenerate response
- Delete message
- Edit message (for user messages)

## 🎯 Quick Win (Do First)

**The Absolute Minimum to Stop Errors:**

1. **Revert to simple state updates**
   ```typescript
   // In handler
   const handleChunk = (messageId: string, chunk: string) => {
       setMessages(prev => {
           const updated = [...prev];
           const msg = updated.find(m => m.id === messageId);
           if (msg) msg.content += chunk;
           return updated;
       });
   };
   ```

2. **Remove all DOM manipulation**
   - Delete `streamingMessageRefs`
   - Delete `registerStreamingElement`
   - Delete `getStreamingMessage`

3. **Test with curl**
   ```bash
   # Verify backend SSE works
   curl -N http://localhost:8080/v1/session/SESSION_ID/stream
   ```

## Testing Checklist

After fixes, verify:
- [ ] No EventSource errors in console
- [ ] Messages stream smoothly
- [ ] No duplicate key warnings
- [ ] Page refresh loads history correctly
- [ ] Multiple messages in queue work
- [ ] Confirmations still work
- [ ] Tool calls still display
- [ ] Plans still render

## Rollback Plan

If fixes cause issues:
```bash
# Revert to last known good state
git revert HEAD~3..HEAD
git push origin main --force-with-lease
```

## Success Criteria

✅ Stream stays open for entire conversation
✅ Zero EventSource errors
✅ Zero duplicate key warnings
✅ Smooth streaming animation
✅ All features still work

## Time Estimate

- Critical fixes: 2-4 hours
- High priority: 1-2 days
- Medium priority: 3-5 days
- **Total: ~1 week for stable foundation**

## Next Steps

1. ✅ Read this checklist
2. ⬜ Revert DOM ref approach
3. ⬜ Install eventsource-parser
4. ⬜ Fix state structure
5. ⬜ Test thoroughly
6. ⬜ Deploy to staging
7. ⬜ Monitor for errors
8. ⬜ Move to high priority items
