# Implementation Checklist - Complete Migration

## ✅ COMPLETED

1. ✅ Installed `eventsource-parser`
2. ✅ Created `lib/sse/streaming.ts`
3. ✅ Rewrote `lib/store/chat.ts` with history-based architecture
4. ✅ Rewrote `lib/sse/handler.ts` with direct state mutations
5. ✅ Updated `lib/api/types.ts` Message interface with branching support

## 🔄 IN PROGRESS - Critical Path

### File: `app/chat/page.tsx`

**Changes needed:**

1. **Remove old imports:**
   ```typescript
   // REMOVE these
   import { type StreamingMessage } from '@/lib/store/chat'
   ```

2. **Update state usage:**
   ```typescript
   // OLD (remove)
   const { streamingMessages, isStreaming } = useStreamingState()
   const streamingUpdateCounter = useChatStore(state => state.streamingUpdateCounter)
   
   // NEW (use)
   const { isStreaming } = useStreamingState()
   const getMessageChain = useChatStore(state => state.getMessageChain)
   ```

3. **Update message retrieval:**
   ```typescript
   // OLD (remove)
   const allMessages = activeSession ? (messages || []) : []
   const hasMessages = allMessages.length > 0 || Object.keys(streamingMessages).length > 0
   
   // NEW (use)
   const messages = activeSession ? getMessageChain(activeSession.sessionId) : []
   const hasMessages = messages.length > 0
   ```

4. **Simplify timeline building:**
   ```typescript
   // OLD (remove complex deduplication)
   const completedMessageIds = new Set(allMessages.map(msg => msg.id || msg.messageId))
   const timeline = [
     ...allMessages.map(...),
     ...Object.values(streamingMessages).filter(msg => !completedMessageIds.has(msg.messageId))
   ]
   
   // NEW (simple)
   const timeline: TimelineItem[] = [
     ...messages.map(msg => ({
       type: 'message' as const,
       data: msg,
       timestamp: new Date(msg.createdTime || Date.now()).getTime(),
       id: msg.id
     })),
     ...regularToolCalls.map(...),
     ...allPlans.map(...),
     ...pendingConfirmations.map(...)
   ].sort((a, b) => a.timestamp - b.timestamp)
   ```

5. **Update message rendering:**
   ```typescript
   // Show streaming indicator based on metadata
   {item.type === 'message' && (
     <div key={item.id}>
       <MessageContent message={item.data} />
       {item.data.metadata?.streaming && <TypingIndicator />}
     </div>
   )}
   ```

6. **Remove streaming message type handling:**
   ```typescript
   // DELETE this entire block
   else if (item.type === 'streaming') {
     const streamingData = eventHandler.getStreamingMessage(item.messageId)
     // ... all this code
   }
   ```

7. **Update session initialization:**
   ```typescript
   // When creating new session, use history structure
   const tempSession = {
     sessionId: tempSessionId,
     agentId: targetAgentId,
     name: `Chat with ${agent?.name || 'Agent'}`,
     history: {
       messages: {
         [messageId]: userMessage
       },
       currentId: messageId
     },
     isStreaming: true,
     connectionStatus: 'connecting' as const,
     lastActivity: new Date().toISOString(),
     // ... rest
   }
   ```

8. **Update history loading:**
   ```typescript
   // When loading historical messages
   const historicalMessages = await getSessionMessages(session.id)
   
   // Add to history structure
   const historyMessages: Record<string, Message> = {}
   for (const message of historicalMessages) {
     historyMessages[message.id] = message
   }
   
   // Update session with history
   chatStore.updateSession(session.id, {
     history: {
       messages: historyMessages,
       currentId: historicalMessages[historicalMessages.length - 1]?.id || null
     }
   })
   ```

### File: `components/chat/MessageList.tsx` (if exists)

**Create or update to render from history:**

```typescript
export function MessageList({ sessionId }: { sessionId: string }) {
  const getMessageChain = useChatStore(state => state.getMessageChain)
  const messages = getMessageChain(sessionId)
  
  return (
    <div className="space-y-4">
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={message.metadata?.streaming}
        />
      ))}
    </div>
  )
}
```

### File: `components/chat/Message.tsx`

**Update to show streaming state:**

```typescript
export function Message({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  return (
    <div className={`message message-${message.role}`}>
      <MarkdownRenderer content={message.content} />
      {isStreaming && <TypingIndicator />}
    </div>
  )
}
```

## 📝 Detailed Changes by Section

### Section 1: Imports (Lines 1-60)
- Remove `type StreamingMessage` import
- Keep all other imports

### Section 2: State Hooks (Lines 90-110)
```typescript
// REMOVE
const { streamingMessages, isStreaming } = useStreamingState()
const streamingUpdateCounter = useChatStore(state => state.streamingUpdateCounter)

// ADD
const { isStreaming } = useStreamingState()
const getMessageChain = useChatStore(state => state.getMessageChain)
```

### Section 3: Message Retrieval (Lines 900-920)
```typescript
// REMOVE
const allMessages = activeSession ? (messages || []) : []
const hasMessages = allMessages.length > 0 || Object.keys(streamingMessages).length > 0

// ADD
const messages = activeSession ? getMessageChain(activeSession.sessionId) : []
const hasMessages = messages.length > 0
```

### Section 4: Timeline Building (Lines 920-980)
```typescript
// REMOVE entire deduplication logic
const completedMessageIds = new Set(...)
...Object.values(streamingMessages).filter(...)

// REPLACE with simple mapping
const timeline: TimelineItem[] = [
  ...messages.map(msg => ({ type: 'message', data: msg, ... })),
  ...regularToolCalls.map(...),
  ...allPlans.map(...),
  ...pendingConfirmations.map(...)
].sort((a, b) => a.timestamp - b.timestamp)
```

### Section 5: Message Rendering (Lines 1100-1200)
```typescript
// REMOVE streaming message type
else if (item.type === 'streaming') { ... }

// UPDATE message rendering
{item.type === 'message' && (
  <div key={item.id}>
    {msg.role === 'user' ? (
      <div className="rounded-lg p-4 bg-indigo-600 text-white">
        {msg.content}
      </div>
    ) : (
      <div>
        <div className="text-xs font-semibold text-text-tertiary mb-2">
          {msg.metadata?.agentName || 'Assistant'}
        </div>
        <MarkdownRenderer content={msg.content} />
        {msg.metadata?.streaming && <TypingIndicator />}
      </div>
    )}
  </div>
)}
```

### Section 6: Session Creation (Lines 600-700)
```typescript
// UPDATE to use history structure
const tempSession = {
  sessionId: tempSessionId,
  agentId: targetAgentId,
  name: `Chat with ${agent?.name || 'Agent'}`,
  history: {
    messages: {
      [messageId]: userMessage
    },
    currentId: messageId
  },
  isStreaming: true,
  connectionStatus: 'connecting' as const,
  lastActivity: new Date().toISOString(),
  id: tempSessionId,
  status: 'ACTIVE' as const,
  messageCount: 1,
  createdTime: new Date().toISOString(),
  updatedTime: new Date().toISOString(),
}
```

### Section 7: History Loading (Lines 300-500)
```typescript
// UPDATE to build history structure
const historicalMessages = await getSessionMessages(session.id)

if (historicalMessages.length > 0) {
  const historyMessages: Record<string, Message> = {}
  
  for (const message of historicalMessages) {
    // Add agent metadata for assistant messages
    if (message.role === 'assistant') {
      const messageAgentId = message.metadata?.agentId || session.agentId
      if (messageAgentId) {
        try {
          const agentName = await getAgentNameFromAPI(messageAgentId)
          message.metadata = {
            ...message.metadata,
            agentId: messageAgentId,
            agentName,
          }
        } catch (error) {
          console.warn('Failed to get agent name:', error)
        }
      }
    }
    
    historyMessages[message.id] = message
  }
  
  // Update session with history
  chatStore.updateSession(session.id, {
    history: {
      messages: historyMessages,
      currentId: historicalMessages[historicalMessages.length - 1]?.id || null
    }
  })
}
```

## 🎯 Testing Checklist

After implementation, verify:

- [ ] Page loads without errors
- [ ] Can send messages
- [ ] Messages stream smoothly
- [ ] No duplicate key warnings
- [ ] No EventSource errors
- [ ] Typing indicator shows during streaming
- [ ] Messages persist after streaming completes
- [ ] Page refresh loads history correctly
- [ ] Tool calls display correctly
- [ ] Plans display correctly
- [ ] Confirmations work
- [ ] Multiple messages in queue work
- [ ] Session switching works
- [ ] New chat creation works

## 🚀 Deployment Steps

1. Test locally thoroughly
2. Run TypeScript check: `npm run type-check`
3. Run build: `npm run build`
4. Test build locally: `npm run start`
5. Deploy to staging
6. Monitor for errors
7. Deploy to production

## 📊 Success Metrics

- Zero console errors
- Zero duplicate key warnings
- Smooth streaming (no jank)
- Fast page loads
- All features working
- Performance maintained

## 🔧 Rollback Plan

If issues occur:
```bash
git log --oneline -10
git revert <commit-hash>
git push origin main
```

Keep previous version tagged:
```bash
git tag pre-migration-backup
git push origin pre-migration-backup
```
