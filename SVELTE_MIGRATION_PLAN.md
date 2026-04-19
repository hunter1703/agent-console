# React to Svelte Migration Plan

## Executive Summary

Migrating agent-console from React/Next.js to Svelte/SvelteKit for superior streaming performance and simpler state management.

## Why Svelte for This Project

### Performance Benefits
1. **Fine-grained reactivity** - Only updates changed DOM nodes
2. **No Virtual DOM** - Direct DOM manipulation
3. **Smaller bundle** - ~3KB vs ~40KB+ for React
4. **Natural streaming** - Direct mutation works perfectly

### Code Simplicity
1. **Less boilerplate** - No hooks, no memo, no useCallback
2. **Reactive by default** - `$:` reactive statements
3. **Built-in stores** - Simpler than Zustand
4. **Better TypeScript** - Native support

### Open WebUI Compatibility
- Open WebUI uses Svelte
- Can directly port their battle-tested patterns
- Same SSE/WebSocket architecture
- Proven at scale

## Migration Strategy

### Phase 1: Setup SvelteKit (Week 1)
- [ ] Create new SvelteKit project alongside React
- [ ] Configure TypeScript
- [ ] Setup Tailwind CSS
- [ ] Configure Vite
- [ ] Setup testing (Vitest + Playwright)

### Phase 2: Core Infrastructure (Week 1-2)
- [ ] Port API client (`lib/api/`)
- [ ] Port SSE handler (`lib/sse/`)
- [ ] Create Svelte stores (`lib/stores/`)
- [ ] Port utilities (`lib/utils/`)
- [ ] Setup routing

### Phase 3: UI Components (Week 2-3)
- [ ] Port base components (Button, Card, etc.)
- [ ] Port markdown renderer
- [ ] Port chat components
- [ ] Port sidebar components
- [ ] Port form components

### Phase 4: Pages (Week 3-4)
- [ ] Dashboard page
- [ ] Chat page (critical path)
- [ ] Agents page
- [ ] Settings page
- [ ] Error pages

### Phase 5: Testing & Polish (Week 4-5)
- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Bug fixes
- [ ] Documentation

### Phase 6: Deployment (Week 5)
- [ ] Build optimization
- [ ] Deploy to staging
- [ ] Load testing
- [ ] Production deployment
- [ ] Decommission React app

## Technical Architecture

### Project Structure
```
agent-console-svelte/
├── src/
│   ├── lib/
│   │   ├── api/           # API client
│   │   ├── stores/        # Svelte stores
│   │   ├── sse/           # SSE handler
│   │   ├── utils/         # Utilities
│   │   └── components/    # Reusable components
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte   # Dashboard
│   │   ├── chat/
│   │   │   └── +page.svelte
│   │   ├── agents/
│   │   │   └── +page.svelte
│   │   └── session/
│   │       └── [id]/
│   │           └── +page.svelte
│   └── app.html
├── static/
├── tests/
├── svelte.config.js
├── vite.config.ts
└── package.json
```

### State Management

**Chat Store (Svelte Store)**
```typescript
// lib/stores/chat.ts
import { writable, derived } from 'svelte/store';

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  activeToolCalls: Record<string, ActiveToolCall>;
  // ...
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>({
    sessions: {},
    activeSessionId: null,
    activeToolCalls: {},
  });

  return {
    subscribe,
    addMessage: (sessionId: string, message: Message) => {
      update(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;
        
        // Direct mutation - Svelte handles reactivity
        session.history.messages[message.id] = message;
        session.history.currentId = message.id;
        
        return state;
      });
    },
    appendToMessage: (sessionId: string, messageId: string, content: string) => {
      update(state => {
        const message = state.sessions[sessionId]?.history.messages[messageId];
        if (message) {
          message.content += content; // Direct mutation!
        }
        return state;
      });
    },
    // ... other methods
  };
}

export const chatStore = createChatStore();
```

### SSE Handler (Same as React)
```typescript
// lib/sse/handler.ts
export class AGUIEventHandler {
  private handleTextMessageChunk(event: any): void {
    const sessionId = get(chatStore).activeSessionId;
    if (!sessionId) return;
    
    // Direct store update - no batching needed!
    chatStore.appendToMessage(sessionId, event.messageId, event.delta);
  }
}
```

### Chat Page (Svelte)
```svelte
<!-- routes/chat/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { chatStore } from '$lib/stores/chat';
  import MessageList from '$lib/components/chat/MessageList.svelte';
  import MessageInput from '$lib/components/chat/MessageInput.svelte';
  
  // Reactive declarations
  $: agentId = $page.url.searchParams.get('agent');
  $: sessionId = $page.params.sessionId;
  $: activeSession = $chatStore.sessions[$chatStore.activeSessionId];
  $: messages = activeSession ? getMessageChain(activeSession.sessionId) : [];
  
  // Reactive statement - runs when dependencies change
  $: if (sessionId && !$chatStore.sessions[sessionId]) {
    loadSession(sessionId);
  }
  
  let sseConnection: EventSource | null = null;
  
  function openStream(sessionId: string) {
    // ... SSE setup
  }
  
  function handleSendMessage(message: string) {
    // ... send logic
  }
  
  onMount(() => {
    // Setup
  });
  
  onDestroy(() => {
    sseConnection?.close();
  });
</script>

<div class="min-h-screen bg-background flex">
  <Sidebar />
  
  <div class="flex-1 flex flex-col">
    <header class="border-b border-border-subtle">
      <h1>{activeSession?.name || 'Chat'}</h1>
    </header>
    
    <div class="flex-1 overflow-auto">
      {#if messages.length > 0}
        <MessageList {messages} />
      {:else}
        <EmptyState />
      {/if}
    </div>
    
    <MessageInput 
      on:send={(e) => handleSendMessage(e.detail)}
      disabled={$chatStore.isInputDisabled}
    />
  </div>
</div>
```

### Message Component (Svelte)
```svelte
<!-- lib/components/chat/Message.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import MarkdownRenderer from './MarkdownRenderer.svelte';
  
  export let message: Message;
  export let agentName: string = 'Assistant';
  
  $: isStreaming = message.metadata?.streaming;
</script>

<div 
  class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
  transition:fade
>
  <div class="max-w-3xl" data-role={message.role}>
    {#if message.role === 'user'}
      <div class="rounded-lg p-4 bg-indigo-600 text-white">
        {message.content}
      </div>
    {:else}
      <div>
        <div class="text-xs font-semibold text-text-tertiary mb-2">
          {agentName}
        </div>
        <MarkdownRenderer content={message.content} />
        {#if isStreaming}
          <TypingIndicator />
        {/if}
      </div>
    {/if}
  </div>
</div>
```

## Key Differences from React

### 1. Reactivity
```typescript
// React
const [count, setCount] = useState(0);
setCount(count + 1);

// Svelte
let count = 0;
count += 1; // Just works!
```

### 2. Derived State
```typescript
// React
const doubled = useMemo(() => count * 2, [count]);

// Svelte
$: doubled = count * 2;
```

### 3. Effects
```typescript
// React
useEffect(() => {
  console.log(count);
}, [count]);

// Svelte
$: console.log(count);
```

### 4. Stores
```typescript
// React (Zustand)
const count = useStore(state => state.count);

// Svelte
$: count = $countStore;
// or just: $countStore
```

### 5. Events
```typescript
// React
<button onClick={handleClick}>

// Svelte
<button on:click={handleClick}>
```

## Performance Comparison

### React (Current)
- Bundle: ~200KB (minified)
- Initial render: ~50ms
- Streaming update: ~5ms per chunk (with optimization)
- Memory: ~15MB

### Svelte (Expected)
- Bundle: ~50KB (minified) - **75% smaller**
- Initial render: ~20ms - **60% faster**
- Streaming update: ~1ms per chunk - **80% faster**
- Memory: ~8MB - **47% less**

## Migration Risks & Mitigation

### Risk 1: Learning Curve
**Mitigation:** 
- Team training sessions
- Pair programming
- Reference Open WebUI codebase

### Risk 2: Library Compatibility
**Mitigation:**
- Audit dependencies
- Find Svelte alternatives
- Use vanilla JS where needed

### Risk 3: Testing Infrastructure
**Mitigation:**
- Playwright works with both
- Vitest similar to Jest
- Keep E2E tests

### Risk 4: Timeline Slippage
**Mitigation:**
- Incremental migration
- Feature freeze during migration
- Buffer time in schedule

## Success Criteria

### Performance
- [ ] Streaming text without lag (500+ chunks/sec)
- [ ] Initial load < 1 second
- [ ] Bundle size < 100KB
- [ ] Memory usage < 10MB

### Functionality
- [ ] All features working
- [ ] E2E tests passing
- [ ] No regressions
- [ ] Accessibility maintained

### Code Quality
- [ ] TypeScript coverage > 90%
- [ ] Test coverage > 80%
- [ ] No console errors
- [ ] Clean architecture

## Timeline

**Total: 5 weeks**

- Week 1: Setup + Infrastructure
- Week 2: Core components
- Week 3: Pages
- Week 4: Testing
- Week 5: Deployment

## Next Steps

1. **Get approval** for migration
2. **Create new repo** `agent-console-svelte`
3. **Setup SvelteKit** project
4. **Start Phase 1** (Setup)
5. **Daily standups** to track progress

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Open WebUI Source](https://github.com/open-webui/open-webui)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Migration Guide](https://svelte.dev/docs/v4-migration-guide)

## Decision

**Approved:** ✅  
**Start Date:** TBD  
**Target Completion:** TBD  
**Team Lead:** TBD
