# Agent Console

> **A modern, feature-rich workspace for AI agent interaction** — inspired by Open WebUI, built for Agent Engine.

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

## Features

- 🚀 **Modern Architecture** — Zustand state management, modular API layer, composable components
- 💬 **Rich Chat Interface** — Markdown, syntax highlighting, LaTeX math, Mermaid diagrams
- 🎨 **Beautiful UI** — Apple-inspired design system with smooth animations
- 📱 **Fully Responsive** — Mobile-first design with PWA support
- ♿ **Accessible** — WCAG 2.1 compliant with screen reader support
- ⚡ **Performant** — Virtual scrolling, lazy loading, optimized rendering
- 🔌 **Backend Agnostic** — Connects to any AGUI-compatible backend

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Agent Engine backend (for production use)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agent-console.git
cd agent-console

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run tests with UI
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Base URL (default: /api for proxy)
NEXT_PUBLIC_API_BASE_URL=/api

# Mock mode for development without backend
NEXT_PUBLIC_MOCK_MODE=false
```

---

## Architecture Overview

### State Management (Zustand)

```typescript
import { useChat, useAgents, useUI } from '@/lib/stores';

// Chat state
const { messages, addMessage, isStreaming } = useChat();

// Agent state  
const { agents, loading } = useAgents();

// UI state
const { sidebarOpen, addToast } = useUI();
```

### Modular API Layer

```typescript
import { fetchAgents, streamAgentChat } from '@/lib/apis';

// Fetch with pagination
const { agents, hasMore } = await fetchAgents({ limit: 20 });

// Stream with auto-reconnect
for await (const event of streamAgentChat(agentId, message)) {
    // Handle events
}
```

### Component Structure

```
components/
├── chat/           # Chat interface components
├── common/         # Reusable UI components
├── workspace/      # Workspace views (agents, models, sessions)
└── features/       # Feature-specific components
```

---

## Component Usage

### Chat Interface

```typescript
import { ChatWindow, ChatControls } from '@/components/chat';
import { MessageList, MessageInput } from '@/components/chat';

function ChatPage() {
    return (
        <div className="h-dvh flex flex-col">
            <MessageList messages={messages} events={events} />
            <MessageInput onSend={handleSend} onStop={handleStop} />
            <ChatControls agentId={agentId} />
        </div>
    );
}
```

### Workspace Views

```typescript
import { WorkspaceLayout, WorkspaceNav } from '@/components/workspace';
import { AgentGallery } from '@/components/workspace/Agents';
import { SessionGallery } from '@/components/workspace/Sessions';

function WorkspacePage() {
    return (
        <WorkspaceLayout activeSection="agents">
            <AgentGallery agents={agents} loading={loading} />
        </WorkspaceLayout>
    );
}
```

### Common Components

```typescript
import { Button, Card, Badge, EmptyState, Skeleton } from '@/components/common';

function Example() {
    return (
        <Card hover>
            <Badge variant="primary">New</Badge>
            <Button variant="primary" loading={isLoading}>
                Click Me
            </Button>
        </Card>
    );
}
```

---

## Design System

### Color Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#FFFFFF` | `#111111` |
| `--foreground` | `#1D1D1F` | `#F5F5F7` |
| `--surface` | `#F5F5F7` | `#1C1C1E` |
| `--primary` | `#5856D6` | `#6E6CF0` |

### Typography

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", ...
--font-mono: "SF Mono", "Menlo", "Consolas", ...
```

### Animations

```css
.message-enter       /* Message bubbles */
.animate-shimmer     /* Loading states */
.hover-lift          /* Card hover */
.typing-indicator    /* Three dots */
```

---

## Markdown Features

The chat interface supports rich Markdown rendering:

### Syntax Highlighting

\`\`\`typescript
function greet(name: string) {
    return `Hello, ${name}!`;
}
\`\`\`

### LaTeX Math

Inline: `$E = mc^2$`

Block:
```math
\int_{a}^{b} f(x) dx = F(b) - F(a)
```

### Mermaid Diagrams

\`\`\`mermaid
graph LR
    A[User] --> B[Agent]
    B --> C[Tools]
    C --> D[Response]
\`\`\`

---

## API Integration

### AGUI Event Format

The console consumes AGUI-compatible events from the backend:

```typescript
// Event types
type AgentEvent =
    | { type: 'RunStarted'; runId: string }
    | { type: 'AssistantTextDelta'; content: string }
    | { type: 'ThinkingStart'; stepName: string }
    | { type: 'ToolCallStarted'; toolName: string }
    | { type: 'ToolResult'; content: string }
    | { type: 'StreamEnd' };
```

### Event Adapter

```typescript
import { translateAguiEvent } from '@/adapters/aguiAdapter';

// Translate backend events to frontend format
const events = translateAguiEvent(backendEvent);
```

---

## Testing

### E2E Tests (Playwright)

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npm run test:e2e -- tests/e2e/chat.spec.ts
```

### Test Coverage

Tests cover:
- Chat message flow
- Session management
- Agent configuration
- Workspace navigation
- Responsive layouts

---

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Configuration

### Schema-Driven Forms

Agent and Model configuration forms are backend-controlled:

```typescript
import { fetchSchema } from '@/lib/api';

const schema = await fetchSchema('agent', 'create');
// Returns { schema, layout } for form rendering
```

### Customization

Modify `app/globals.css` for theme customization:

```css
:root {
    --primary: #your-color;
    --primary-hover: #your-hover-color;
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow existing code patterns
- Add tests for new features
- Update documentation
- Ensure accessibility compliance
- Test on mobile devices

---

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Component Guide](docs/COMPONENTS.md)
- [Design System](docs/DESIGN.md)

---

## Changelog

### v0.2.0 (Current)

- ✨ New Zustand-based state management
- ✨ Modular API architecture
- ✨ Enhanced Markdown rendering (Shiki, KaTeX, Mermaid)
- ✨ Workspace UI inspired by Open WebUI
- ✨ Improved streaming with auto-reconnect
- ✨ Mobile-responsive design enhancements
- ✨ Accessibility improvements

### v0.1.0

- Initial release
- Basic chat interface
- Agent configuration
- Session management

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Design inspiration from [Open WebUI](https://github.com/open-webui/open-webui)
- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Markdown by [react-markdown](https://github.com/remarkjs/react-markdown)
- Syntax highlighting by [Shiki](https://shiki.style/)

---

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/your-org/agent-console/issues) page.
