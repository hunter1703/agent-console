# Agent Console Architecture Documentation

## Overview

The Agent Console has been re-architected following patterns inspired by Open WebUI while maintaining its unique identity as a frontend-only interface for the Agent Engine backend.

## Design Philosophy

- **Aesthetic Integrity**: Every UI element clearly reflects its function
- **Minimalism**: Strip away unnecessary elements, focus on essential functionality
- **Immediate Feedback**: Subtle but clear feedback for every action
- **Direct Manipulation**: Users interact directly with content
- **Hierarchy & Consistency**: Information organized in clear, structured layouts

---

## Architecture Layers

### 1. State Management (Zustand)

Located: `lib/stores/index.ts`

The application uses Zustand for centralized state management, inspired by Open WebUI's Svelte store pattern.

```typescript
// Available stores
useAgentStore      // Agent list and CRUD operations
useModelStore      // Model configuration
useSessionStore    // Session management
useChatStateStore  // Chat messages and events
useUIStore         // UI state (sidebar, modals, toasts, theme)

// Combined hooks for convenience
useChat()          // All chat-related state
useAgents()        // Agents + models
useUI()            // UI state
```

**Example Usage:**
```typescript
import { useChat, useUI } from '@/lib/stores';

function MyComponent() {
    const { messages, addMessage, isStreaming } = useChat();
    const { addToast, setSidebarOpen } = useUI();

    const handleSend = () => {
        addMessage({ id: '1', role: 'user', content: 'Hello' });
        addToast({ type: 'success', message: 'Message sent!' });
    };
}
```

---

### 2. API Layer (Modular)

Located: `lib/apis/`

```
lib/apis/
├── index.ts        # Re-exports all modules
├── catalog.ts      # Generic catalog operations
├── agents.ts       # Agent-specific API
├── sessions.ts     # Session management
└── streaming.ts    # SSE stream handling (enhanced)
```

**Key Features:**
- Automatic retry with exponential backoff
- Stream reconnection support
- Type-safe responses
- Error handling

**Example Usage:**
```typescript
import { fetchAgents, streamAgentChat } from '@/lib/apis';

// Fetch agents with pagination
const { agents, hasMore, total } = await fetchAgents({ offset: 0, limit: 20 });

// Stream chat with auto-reconnect
for await (const event of streamAgentChat(agentId, message, sessionId)) {
    console.log(event);
}
```

---

### 3. Utility Library

Located: `lib/utils/index.ts`

Comprehensive utility functions inspired by Open WebUI:

```typescript
// Date/Time
formatRelativeTime(timestamp)  // "2 hours ago"
formatDate(timestamp, format)  // "Jan 15, 2024 3:30 PM"
getGreeting()                   // "Good morning"

// String
sanitizeContent(content)       // Remove harmful HTML
getInitials(name)              // "John Doe" -> "JD"
truncate(text, maxLength)      // Truncate with ellipsis

// Clipboard
copyToClipboard(text)          // Async clipboard with fallback

// Browser
isMobile()                     // Detect mobile device
isIOS()                        // Detect iOS
scrollToElement(element)       // Smooth scroll

// Storage
getFromStorage(key, default)   // Safe localStorage get
setToStorage(key, value)       // Safe localStorage set

// Performance
debounce(fn, delay)            // Debounce function
throttle(fn, limit)            // Throttle function
```

---

### 4. Component Architecture

```
components/
├── chat/                      # Chat-specific components
│   ├── Messages/
│   │   ├── MessageList.tsx    # Virtual scrolling message list
│   │   ├── UserMessage.tsx    # User message bubble
│   │   ├── AssistantMessage.tsx
│   │   ├── ThinkingMessage.tsx
│   │   └── ToolCallMessage.tsx
│   ├── MessageInput/
│   │   ├── MessageInput.tsx   # Main input component
│   │   ├── SendButton.tsx
│   │   ├── StopButton.tsx
│   │   └── AttachFileButton.tsx
│   ├── ChatControls.tsx       # Settings panel
│   ├── ChatWindow.tsx         # Main chat container
│   └── index.ts
│
├── common/                    # Reusable UI components
│   ├── Spinner.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── Skeleton.tsx
│   ├── AriaLive.tsx           # Accessibility
│   ├── Layout/
│   │   ├── MobileNav.tsx
│   │   └── PageHeader.tsx
│   └── Markdown/
│       └── (see below)
│
├── workspace/                 # Workspace UI (Open WebUI inspired)
│   ├── WorkspaceLayout.tsx
│   ├── WorkspaceNav.tsx
│   ├── WorkspaceSection.tsx
│   ├── Agents/
│   │   ├── AgentCard.tsx
│   │   ├── AgentListItem.tsx
│   │   └── AgentGallery.tsx   # Grid/list with search
│   ├── Models/
│   ├── Tools/
│   └── Sessions/
│       ├── SessionCard.tsx
│       ├── SessionListItem.tsx
│       └── SessionGallery.tsx
│
└── features/                  # Feature-specific components
    ├── PlanningCard.tsx       # Retained from original
    ├── ThinkingCard.tsx       # Retained from original
    ├── EventTimeline.tsx      # Retained from original
    └── ToolDetails.tsx        # Retained from original
```

---

### 5. Enhanced Markdown Renderer

Located: `components/MarkdownRenderer.tsx`

**Features:**
- Syntax highlighting (Shiki with 15+ languages)
- LaTeX math support (KaTeX)
- Mermaid diagrams
- Copy code button
- Collapsible code blocks
- Lazy-loaded images
- Anchor links for headings

**Supported Languages:**
JavaScript, TypeScript, Python, Java, Go, Rust, Bash, JSON, YAML, HTML, CSS, SQL, Markdown, TSX, JSX

**Example:**
```typescript
import MarkdownRenderer from '@/components/MarkdownRenderer';

function Message({ content }) {
    return (
        <MarkdownRenderer
            content={content}
            enableMermaid={true}
            enableLatex={true}
        />
    );
}
```

**Mermaid Diagram Support:**
\`\`\`mermaid
graph TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
\`\`\`

---

### 6. Streaming (Enhanced)

Located: `lib/apis/streaming.ts`

**Features:**
- Automatic reconnection with exponential backoff
- Configurable retry attempts
- Stream state tracking
- Error recovery
- Abort support

**Example:**
```typescript
import { createResilientStream, streamAgentChat } from '@/lib/apis/streaming';

// Create resilient stream
const { start, stop, getState } = createResilientStream(
    () => streamAgentChat(agentId, message, sessionId),
    {
        onEvent: (event) => console.log(event),
        onError: (error) => console.error(error),
        onComplete: () => console.log('Stream complete'),
        onReconnecting: (attempt) => console.log(`Reconnecting... ${attempt}`),
    }
);

// Start streaming
await start();

// Check status
const state = getState();
console.log(state.isConnected); // boolean
```

---

## Design System

### Color Tokens

```css
:root {
    /* Surfaces */
    --background: #FFFFFF;
    --foreground: #1D1D1F;
    --surface: #F5F5F7;
    --surface-hover: #EBEBED;
    --surface-active: #E3E3E6;

    /* Accent */
    --primary: #5856D6;
    --primary-hover: #4744C7;
    --primary-foreground: #FFFFFF;

    /* Text */
    --muted: #6E6E73;
    --muted-foreground: #AEAEB2;

    /* Status */
    --green: #34C759;
    --red: #FF3B30;
    --amber: #FF9F0A;
}
```

### Typography

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", ...
--font-mono: "SF Mono", "Menlo", "Consolas", ...
```

### Animation Classes

```css
.message-enter          /* Message bubble animation */
.thinking-dot           /* Thinking indicator */
.animate-shimmer        /* Loading shimmer */
.animate-skeleton       /* Skeleton loading */
.animate-fade-in-up     /* Fade in from bottom */
.animate-scale-in       /* Scale in animation */
.hover-lift             /* Hover lift effect */
.typing-indicator       /* Three-dot typing */
```

---

## Accessibility

### ARIA Live Regions

```typescript
import { AriaLive, useAriaAnnounce } from '@/components/common';

function StatusUpdate({ status }) {
    const { announce } = useAriaAnnounce();

    useEffect(() => {
        announce(`Status: ${status}`);
    }, [status]);

    return <div>{status}</div>;
}
```

### Keyboard Navigation

All interactive elements support:
- Tab navigation
- Enter/Space activation
- Escape to close
- Arrow keys for lists

### Focus Management

```css
.focus-ring:focus-visible {
    box-shadow: 0 0 0 2px var(--ring);
}
```

---

## Performance Optimizations

### Virtual Scrolling

For large message lists:
```typescript
import { useVirtualScroll } from '@/lib/hooks';

const { visibleItems, offsetY, handleScroll } = useVirtualScroll({
    items: messages,
    itemHeight: 100,
    containerHeight: 600,
    overscan: 5,
});
```

### Memoization

```typescript
import { useStableObject, useStableArray } from '@/lib/hooks';

const stableConfig = useStableObject(config);
const stableList = useStableArray(items);
```

### Lazy Loading

```typescript
import { useIntersectionObserver } from '@/lib/hooks';

const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
```

---

## Migration Guide

### From Old API to New

**Before:**
```typescript
import { fetchAgents } from '@/lib/api';
```

**After:**
```typescript
import { fetchAgents } from '@/lib/apis';
// or
import { fetchAgents } from '@/lib/apis/agents';
```

### From Local State to Stores

**Before:**
```typescript
const [messages, setMessages] = useState([]);
```

**After:**
```typescript
const { messages, addMessage, setMessages } = useChat();
```

---

## Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '@/lib/utils';

describe('formatRelativeTime', () => {
    it('formats recent timestamps', () => {
        expect(formatRelativeTime(Date.now())).toBe('just now');
    });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('send message', async ({ page }) => {
    await page.goto('/chat/test-agent');
    await page.getByTestId('message-input').fill('Hello');
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('message-list')).toContainText('Hello');
});
```

---

## File Structure Summary

```
agent-console/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── chat/
│   ├── common/
│   ├── workspace/
│   └── features/
├── lib/                    # Core libraries
│   ├── apis/               # API modules
│   ├── stores/             # Zustand stores
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom hooks
│   └── models/             # TypeScript types
├── adapters/               # External API adapters (AGUI)
├── tests/                  # Playwright E2E tests
└── public/                 # Static assets
```

---

## Key Differences from Open WebUI

| Aspect | Open WebUI | Agent Console |
|--------|------------|---------------|
| Framework | SvelteKit | Next.js + React |
| Backend | Python FastAPI | External (Agent Engine) |
| State | Svelte stores | Zustand |
| Events | Native SSE | AGUI events |
| Config UI | Built-in forms | Schema-driven |
| Auth | Built-in | External |

---

## Contributing

1. Follow existing patterns
2. Add tests for new features
3. Update this documentation
4. Ensure accessibility compliance
5. Test on mobile devices

---

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Shiki Documentation](https://shiki.style/)
- [KaTeX Documentation](https://katex.org/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
