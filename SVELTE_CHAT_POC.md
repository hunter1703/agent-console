# Svelte Chat Component - Proof of Concept

## Goal

Replace the React chat page with a Svelte component while keeping the rest of the Next.js app intact.

## Architecture

### Hybrid Approach
```
Next.js App (React)
├── Dashboard (React)
├── Agents (React)
├── Settings (React)
└── Chat Page (React wrapper)
    └── Svelte Chat Component (Svelte island)
```

### Integration Strategy

**Option 1: Web Component (Recommended)**
- Compile Svelte to Web Component
- Use in React like any HTML element
- Complete isolation
- No React/Svelte conflicts

**Option 2: Direct Mount**
- Mount Svelte component in React useEffect
- Manual lifecycle management
- Tighter integration
- More complex

We'll use **Option 1** for simplicity and isolation.

## Implementation Plan

### Step 1: Setup Svelte in Next.js Project

```bash
# Install Svelte dependencies
npm install svelte svelte-preprocess @sveltejs/vite-plugin-svelte
npm install -D @sveltejs/package
```

### Step 2: Configure Vite for Svelte

```typescript
// vite.config.ts (add to existing)
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true, // Enable Web Component mode
      },
    }),
  ],
});
```

### Step 3: Project Structure

```
agent-console/
├── app/
│   └── chat/
│       └── page.tsx          # React wrapper
├── components/
│   └── svelte/               # NEW: Svelte components
│       ├── Chat.svelte       # Main chat component
│       ├── MessageList.svelte
│       ├── MessageInput.svelte
│       ├── Message.svelte
│       └── stores/
│           └── chat.ts       # Svelte store
├── lib/
│   ├── api/                  # Shared (keep as-is)
│   ├── sse/                  # Shared (keep as-is)
│   └── utils/                # Shared (keep as-is)
└── public/
    └── svelte-chat.js        # Compiled Web Component
```

### Step 4: Svelte Chat Store

```typescript
// components/svelte/stores/chat.ts
import { writable, derived, get } from 'svelte/store';
import type { Message, ChatSession } from '@/lib/api/types';

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  activeToolCalls: Record<string, any>;
  activeConfirmations: Record<string, any>;
  plans: Record<string, any>;
  isInputDisabled: boolean;
}

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>({
    sessions: {},
    activeSessionId: null,
    activeToolCalls: {},
    activeConfirmations: {},
    plans: {},
    isInputDisabled: false,
  });

  return {
    subscribe,
    
    // Session management
    addSession: (session: ChatSession) => {
      update(state => {
        state.sessions[session.sessionId] = session;
        return state;
      });
    },
    
    setActiveSession: (sessionId: string | null) => {
      update(state => {
        state.activeSessionId = sessionId;
        return state;
      });
    },
    
    // Message management - Direct mutation!
    addMessage: (sessionId: string, message: Message) => {
      update(state => {
        const session = state.sessions[sessionId];
        if (!session) return state;
        
        // Link to previous message
        const previousCurrentId = session.history.currentId;
        if (previousCurrentId) {
          message.metadata = {
            ...message.metadata,
            parentId: previousCurrentId
          };
        }
        
        // Direct mutation - Svelte handles reactivity
        session.history.messages[message.id] = message;
        session.history.currentId = message.id;
        
        return state;
      });
    },
    
    // Append to message - NO BATCHING NEEDED!
    appendToMessage: (sessionId: string, messageId: string, content: string) => {
      update(state => {
        const message = state.sessions[sessionId]?.history.messages[messageId];
        if (message) {
          message.content += content; // Direct mutation!
        }
        return state;
      });
    },
    
    updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => {
      update(state => {
        const message = state.sessions[sessionId]?.history.messages[messageId];
        if (message) {
          Object.assign(message, updates);
        }
        return state;
      });
    },
    
    // Get message chain
    getMessageChain: (sessionId: string): Message[] => {
      const state = get({ subscribe });
      const session = state.sessions[sessionId];
      if (!session || !session.history.currentId) return [];
      
      const chain: Message[] = [];
      let currentId: string | null = session.history.currentId;
      
      while (currentId) {
        const message = session.history.messages[currentId];
        if (!message) break;
        chain.unshift(message);
        currentId = message.metadata?.parentId || null;
      }
      
      return chain;
    },
    
    // Tool calls
    startToolCall: (toolCall: any) => {
      update(state => {
        state.activeToolCalls[toolCall.toolCallId] = {
          ...toolCall,
          startTime: new Date().toISOString(),
        };
        return state;
      });
    },
    
    updateToolCall: (toolCallId: string, updates: any) => {
      update(state => {
        const toolCall = state.activeToolCalls[toolCallId];
        if (toolCall) {
          Object.assign(toolCall, updates);
        }
        return state;
      });
    },
    
    completeToolCall: (toolCallId: string, result: any, endTime?: string) => {
      update(state => {
        const toolCall = state.activeToolCalls[toolCallId];
        if (toolCall) {
          toolCall.result = result;
          toolCall.status = 'completed';
          toolCall.endTime = endTime || new Date().toISOString();
        }
        return state;
      });
    },
    
    // Input state
    setInputDisabled: (disabled: boolean) => {
      update(state => {
        state.isInputDisabled = disabled;
        return state;
      });
    },
    
    // Clear
    clearAllSessions: () => {
      set({
        sessions: {},
        activeSessionId: null,
        activeToolCalls: {},
        activeConfirmations: {},
        plans: {},
        isInputDisabled: false,
      });
    },
  };
}

export const chatStore = createChatStore();

// Derived stores
export const activeSession = derived(
  chatStore,
  $chatStore => $chatStore.activeSessionId 
    ? $chatStore.sessions[$chatStore.activeSessionId] 
    : null
);

export const activeMessages = derived(
  [chatStore, activeSession],
  ([$chatStore, $activeSession]) => 
    $activeSession ? chatStore.getMessageChain($activeSession.sessionId) : []
);
```

### Step 5: Main Chat Component

```svelte
<!-- components/svelte/Chat.svelte -->
<svelte:options customElement="svelte-chat" />

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { chatStore, activeSession, activeMessages } from './stores/chat';
  import { getAGUIEventHandler } from '@/lib/sse/handler';
  import { invokeAgent, openSessionStream } from '@/lib/api/services';
  import MessageList from './MessageList.svelte';
  import MessageInput from './MessageInput.svelte';
  import EmptyState from './EmptyState.svelte';
  
  // Props from React
  export let agentid: string = '';
  export let sessionid: string = '';
  
  let sseConnection: EventSource | null = null;
  let inputValue = '';
  let isSending = false;
  
  // Reactive declarations
  $: hasMessages = $activeMessages.length > 0;
  $: isStreaming = $activeSession?.isStreaming ?? false;
  $: isInputDisabled = $chatStore.isInputDisabled || isSending || isStreaming;
  
  // Open SSE stream
  function openStream(sessionId: string) {
    if (sseConnection) {
      sseConnection.close();
    }
    
    console.log('Opening SSE stream:', sessionId);
    const eventHandler = getAGUIEventHandler();
    
    sseConnection = openSessionStream(
      sessionId,
      (event: MessageEvent) => {
        eventHandler.handleSSEMessage(event);
      },
      (error: Event) => {
        console.log('SSE stream closed');
        sseConnection = null;
      }
    );
  }
  
  // Send message
  async function handleSendMessage(message: string) {
    if (!message.trim() || isSending) return;
    
    isSending = true;
    chatStore.setInputDisabled(true);
    
    try {
      const isNewChat = !$activeSession;
      let currentSessionId = $activeSession?.sessionId;
      
      // Create temp session for new chat
      if (isNewChat) {
        const tempSessionId = `temp-${Date.now()}`;
        const messageId = `user-${Date.now()}`;
        
        chatStore.addSession({
          sessionId: tempSessionId,
          agentId: agentid,
          name: 'New Chat',
          history: {
            messages: {},
            currentId: null
          },
          isStreaming: true,
          connectionStatus: 'connecting',
          lastActivity: new Date().toISOString(),
          id: tempSessionId,
          status: 'ACTIVE',
          messageCount: 0,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
        });
        
        chatStore.setActiveSession(tempSessionId);
        
        chatStore.addMessage(tempSessionId, {
          messageId,
          sessionId: tempSessionId,
          role: 'user',
          content: message.trim(),
          timestamp: new Date().toISOString(),
          id: messageId,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
        });
        
        currentSessionId = tempSessionId;
      } else {
        // Add message to existing session
        const messageId = `user-${Date.now()}`;
        chatStore.addMessage(currentSessionId!, {
          messageId,
          sessionId: currentSessionId!,
          role: 'user',
          content: message.trim(),
          timestamp: new Date().toISOString(),
          id: messageId,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
        });
      }
      
      inputValue = '';
      
      // Invoke agent
      const response = await invokeAgent(agentid, {
        message: message.trim(),
        sessionId: isNewChat ? undefined : currentSessionId,
      });
      
      const realSessionId = response.sessionId;
      
      // Migrate temp session if needed
      if (isNewChat && realSessionId !== currentSessionId) {
        const tempSession = $chatStore.sessions[currentSessionId!];
        if (tempSession) {
          chatStore.addSession({
            ...tempSession,
            sessionId: realSessionId,
            id: realSessionId,
          });
          chatStore.setActiveSession(realSessionId);
          
          // Update URL
          window.history.replaceState({}, '', `/session/${realSessionId}`);
        }
      }
      
      // Open stream
      openStream(realSessionId);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      isSending = false;
    }
  }
  
  // Load session on mount
  onMount(() => {
    if (sessionid) {
      // Load existing session
      // TODO: Fetch session data
    }
  });
  
  onDestroy(() => {
    if (sseConnection) {
      sseConnection.close();
    }
  });
</script>

<div class="min-h-screen bg-background flex flex-col">
  <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
    <div class="flex-1 overflow-auto mb-6">
      {#if hasMessages}
        <MessageList messages={$activeMessages} />
      {:else}
        <EmptyState />
      {/if}
    </div>
    
    <MessageInput 
      bind:value={inputValue}
      on:send={(e) => handleSendMessage(e.detail)}
      disabled={isInputDisabled}
      {isStreaming}
    />
  </div>
</div>

<style>
  /* Scoped styles */
  div {
    font-family: var(--font-sans);
  }
</style>
```

### Step 6: React Wrapper

```typescript
// app/chat/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const agentId = searchParams.get('agent')
  const sessionId = searchParams.get('session')
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Load Svelte Web Component
    const script = document.createElement('script')
    script.src = '/svelte-chat.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <svelte-chat 
        agentid={agentId || ''} 
        sessionid={sessionId || ''}
      />
    </div>
  )
}
```

### Step 7: Build Configuration

```json
// package.json (add scripts)
{
  "scripts": {
    "build:svelte": "vite build --config vite.svelte.config.ts",
    "dev:svelte": "vite build --watch --config vite.svelte.config.ts",
    "dev": "concurrently \"npm run dev:svelte\" \"next dev\""
  }
}
```

```typescript
// vite.svelte.config.ts
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: 'components/svelte/Chat.svelte',
      name: 'SvelteChat',
      fileName: 'svelte-chat',
      formats: ['iife'],
    },
    outDir: 'public',
  },
})
```

## Benefits of This Approach

1. **Isolated** - Svelte and React don't interfere
2. **Incremental** - Can migrate other pages later
3. **Performance** - Get Svelte benefits where it matters
4. **Low risk** - Easy to rollback
5. **Proven** - Web Components are standard

## Next Steps

1. Install Svelte dependencies
2. Create Svelte store
3. Port chat components to Svelte
4. Build Web Component
5. Update React wrapper
6. Test streaming performance
7. Compare with React version

## Success Metrics

- [ ] Streaming works without lag
- [ ] Bundle size < 50KB for chat component
- [ ] No performance degradation
- [ ] All features working
- [ ] E2E tests passing

Ready to start implementation?
