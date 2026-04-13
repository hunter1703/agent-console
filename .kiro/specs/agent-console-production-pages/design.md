# Design Document: Agent Console Production Pages

## Overview

This document provides comprehensive technical specifications for building four production-ready pages in the Agent Console: Dashboard, Chat Interface, Agent Management, and Session Browser. All foundational building blocks (components, animations, state management, themes) are complete. This design focuses on assembling these blocks into cohesive, production-quality pages.

### Design Philosophy

The design strictly follows **Unseen.co principles**:

1. **90% Grayscale**: Interface is primarily neutral grays; color signals meaning, not decoration
2. **Smooth Animations**: Every interaction uses spring physics for natural, organic feel (60fps minimum)
3. **Generous Spacing**: Breathing room between elements creates calm, focused experience
4. **Playful Interactions**: Delightful micro-interactions on hover, click, and transition
5. **Typography-First Hierarchy**: Establish importance through font weight and size, not color

### Technical Context

**Backend**: Agent Engine REST API (Java/Quarkus) at `localhost:8080`
**Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind v4
**State Management**: Zustand for global state, React Query for server state
**Animations**: Framer Motion with spring physics
**Themes**: Light (warm cream/amber) and Dark (cool black/white)

### Key Integration Points

- **Dynamic Forms**: `/api/schema?type=agent&mode=CREATE` returns JSON schema for form generation
- **SSE Streaming**: `/api/sessions/{sessionId}/stream` delivers AGUI events in real-time
- **Planning Tools**: `create_plan` and `update_task` tools with patch updates
- **Confirmation Requests**: User approval mechanism with DECISION/TEXT kinds
- **Multi-Agent Sessions**: Parent-child agent relationships shown in tabs

---

## Dashboard Landing Page

### Purpose

The Dashboard serves as the entry point, providing quick access to agents and recent conversations. It must feel welcoming, fast, and guide users toward their next action.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (fixed)                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hero Section                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Welcome back, [User]                                │   │
│  │ [New Chat] [Create Agent] [View All Sessions]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Statistics Bar                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 5 Agents │ │ 23 Chats │ │ 47 Today │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  Your Agents                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ Agent  │ │ Agent  │ │ Agent  │ │ Agent  │             │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │ │ Card 4 │             │
│  └────────┘ └────────┘ └────────┘ └────────┘             │
│                                                             │
│  Recent Conversations                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Session 1 - Agent Name - "Last message..."         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Session 2 - Agent Name - "Last message..."         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Session 3 - Agent Name - "Last message..."         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design Alternative 1: Grid-Focused Dashboard

**Philosophy**: Emphasize visual browsing of agents with large, prominent cards.

**Hero Section**
- Full-width container with gradient background (subtle)
- Heading: "Welcome back" (font-size: 32px, font-weight: 600)
- Subheading: "Choose an agent or start a new conversation" (font-size: 17px, text-secondary)
- Three primary action buttons in horizontal row
- Spacing: 48px padding top/bottom, 24px between elements

**Statistics Bar**
- Three stat cards in horizontal row
- Each card: 120px width, 80px height, rounded-lg (16px)
- Background: surface color with subtle border
- Icon + number + label layout
- Hover: lift 2px, scale 1.02, shadow-md
- Animation: stagger entrance (50ms delay per card)

**Agent Grid**
- Responsive grid: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Gap: 24px between cards
- Each card: 280px width (flexible), 200px height
- Card structure:
  - Avatar: 64px circle at top
  - Name: font-size 20px, font-weight 600
  - Description: font-size 15px, text-secondary, 2 lines max with ellipsis
  - Last used: font-size 13px, text-tertiary
  - Hover: lift 4px, scale 1.03, shadow-lg, border accent color
- Animation: stagger entrance (75ms delay per card)
- Empty state: Large icon + "Create Your First Agent" CTA

**Recent Sessions List**
- Vertical list, max 5 items
- Each item: 80px height, full width
- Structure:
  - Agent avatar: 40px circle on left
  - Agent name: font-size 15px, font-weight 600
  - Last message preview: font-size 15px, text-secondary, 1 line with ellipsis
  - Timestamp: font-size 13px, text-tertiary, right-aligned
  - Hover: background surface-hover, translate-x 4px
- Animation: slide-in-up with stagger (50ms delay per item)
- Empty state: "No conversations yet" with "Start Chatting" CTA

**Color Usage**
- Background: background color (white in light, #09090B in dark)
- Cards: surface color (#FEFCE8 in light, #18181B in dark)
- Accents: primary color only on hover states and CTAs
- Borders: border-subtle for default, border-accent on hover

**Spacing**
- Container padding: 32px (desktop), 16px (mobile)
- Section gaps: 48px between major sections
- Card padding: 24px internal padding
- List item padding: 16px internal padding

### Design Alternative 2: Activity-Focused Dashboard

**Philosophy**: Prioritize recent activity and quick actions over visual browsing.

**Hero Section**
- Compact header with greeting and quick stats inline
- Single prominent "New Chat" CTA (large, centered)
- Secondary actions as text links below
- Spacing: 32px padding, 16px between elements

**Activity Timeline**
- Combined view of agents and sessions in chronological order
- Each item shows: type (agent/session), name, timestamp, action
- Hover: background change, slide-in action buttons (edit, delete, open)
- Infinite scroll for older items
- Animation: fade-in-up for new items

**Agent Quick Access**
- Horizontal scrollable row of agent avatars
- 64px circles with names below
- Click to start new chat with that agent
- Hover: scale 1.1, lift 2px
- Animation: slide-in-right with stagger

**Advantages**
- Faster access to recent work
- Less visual clutter
- Better for power users
- Easier to scan chronologically

**Disadvantages**
- Less discoverable for new users
- Harder to browse all agents
- Requires more scrolling

### Design Alternative 3: Sidebar-Enhanced Dashboard

**Philosophy**: Use persistent sidebar for navigation, maximize content area for dashboard.

**Left Sidebar** (280px width)
- Agent list with avatars and names
- "Create Agent" button at top
- Active agent highlighted
- Collapsible to icons only
- Hover: expand to show full names

**Main Content Area**
- Full-width hero with large "Start Conversation" CTA
- Recent sessions in card grid (not list)
- Each session card: 320px x 180px
- Shows: agent avatar, last 2 messages, timestamp
- Hover: lift, shadow, border accent
- Click: navigate to chat

**Advantages**
- Persistent agent access
- More space for session previews
- Better for multi-agent workflows
- Cleaner visual hierarchy

**Disadvantages**
- Less space on smaller screens
- Sidebar may feel redundant with header nav
- More complex responsive behavior

### Recommended Design: Alternative 1 (Grid-Focused)

**Rationale**:
- Best balance of discoverability and usability
- Clear visual hierarchy guides new users
- Agent cards provide rich preview information
- Scales well from mobile to desktop
- Aligns with Unseen.co generous spacing principles
- Supports both browsing and quick access patterns

### Component Specifications

#### DashboardHero Component

```typescript
interface DashboardHeroProps {
  userName?: string
  onNewChat: () => void
  onCreateAgent: () => void
  onViewSessions: () => void
}

// Styling
- Container: full-width, gradient background (subtle), 48px padding vertical
- Heading: text-3xl (32px), font-semibold, text-primary
- Subheading: text-lg (17px), text-secondary, mt-3
- Button group: flex row, gap-4, mt-6
- Buttons: primary style, 44px height, 16px padding horizontal

// Animation
- Entrance: fade-in-up, duration 300ms, ease-out
- Buttons: stagger 50ms delay each
```

#### StatCard Component

```typescript
interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  trend?: { value: number; direction: 'up' | 'down' }
}

// Styling
- Container: 120px width, 80px height, rounded-lg, surface background
- Border: border-subtle, hover: border-accent
- Padding: 16px
- Icon: 24px, text-secondary
- Value: text-2xl (24px), font-bold, text-primary
- Label: text-sm (13px), text-tertiary

// Animation
- Hover: lift 2px, scale 1.02, shadow-md, duration 200ms
- Entrance: fade-in-up with stagger
```

#### AgentCard Component

```typescript
interface AgentCardProps {
  id: string
  name: string
  description: string
  avatar?: string
  lastUsed?: Date
  onClick: (id: string) => void
}

// Styling
- Container: 280px width (flexible), 200px height, rounded-lg
- Background: surface, border: border-subtle
- Padding: 24px
- Avatar: 64px circle, centered, mb-4
- Name: text-xl (20px), font-semibold, text-primary, text-center
- Description: text-base (15px), text-secondary, 2 lines, ellipsis
- Last used: text-sm (13px), text-tertiary, mt-auto

// Animation
- Hover: lift 4px, scale 1.03, shadow-lg, border-accent, duration 250ms
- Entrance: fade-in-up with stagger (75ms per card)
- Click: scale 0.98, duration 100ms
```

#### RecentSessionItem Component

```typescript
interface RecentSessionItemProps {
  sessionId: string
  agentName: string
  agentAvatar?: string
  lastMessage: string
  timestamp: Date
  onClick: (sessionId: string) => void
}

// Styling
- Container: full-width, 80px height, rounded-md, padding 16px
- Background: transparent, hover: surface-hover
- Layout: flex row, items-center, gap-4
- Avatar: 40px circle
- Content: flex-1, flex column
- Agent name: text-base (15px), font-semibold, text-primary
- Last message: text-base (15px), text-secondary, truncate
- Timestamp: text-sm (13px), text-tertiary, ml-auto

// Animation
- Hover: background transition 200ms, translate-x 4px
- Entrance: slide-in-up with stagger (50ms per item)
```

### API Integration

#### Load Agents

```typescript
// GET /api/agents
const { data: agents, isLoading, error } = useQuery({
  queryKey: ['agents'],
  queryFn: async () => {
    const response = await fetch('/api/agents')
    if (!response.ok) throw new Error('Failed to load agents')
    return response.json()
  },
})

// Response shape
interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  lastUsed?: string // ISO date
  createdAt: string
  updatedAt: string
}
```

#### Load Recent Sessions

```typescript
// GET /api/sessions?limit=5&sort=lastActivity:desc
const { data: sessions, isLoading, error } = useQuery({
  queryKey: ['sessions', 'recent'],
  queryFn: async () => {
    const response = await fetch('/api/sessions?limit=5&sort=lastActivity:desc')
    if (!response.ok) throw new Error('Failed to load sessions')
    return response.json()
  },
})

// Response shape
interface Session {
  id: string
  agentId: string
  agentName: string
  agentAvatar?: string
  lastMessage: string
  lastActivity: string // ISO date
  messageCount: number
}
```

#### Load Statistics

```typescript
// GET /api/dashboard/stats
const { data: stats } = useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: async () => {
    const response = await fetch('/api/dashboard/stats')
    if (!response.ok) throw new Error('Failed to load stats')
    return response.json()
  },
})

// Response shape
interface DashboardStats {
  totalAgents: number
  totalSessions: number
  messagesToday: number
  trends?: {
    agents: { value: number; direction: 'up' | 'down' }
    sessions: { value: number; direction: 'up' | 'down' }
    messages: { value: number; direction: 'up' | 'down' }
  }
}
```

### State Management

```typescript
// Dashboard page state
interface DashboardState {
  agents: Agent[]
  sessions: Session[]
  stats: DashboardStats
  isLoadingAgents: boolean
  isLoadingSessions: boolean
  isLoadingStats: boolean
  agentsError: Error | null
  sessionsError: Error | null
  statsError: Error | null
}

// Actions
const navigateToChat = (agentId: string) => {
  router.push(`/chat?agent=${agentId}`)
}

const navigateToSession = (sessionId: string) => {
  router.push(`/chat/${sessionId}`)
}

const navigateToAgentManagement = () => {
  router.push('/agents')
}

const navigateToSessionBrowser = () => {
  router.push('/sessions')
}
```

### Loading States

**Skeleton Structure**
- Hero: shimmer rectangle for heading, buttons
- Stats: 3 shimmer cards in row
- Agent grid: 4 shimmer cards (desktop), 2 (tablet), 1 (mobile)
- Sessions: 5 shimmer list items

**Animation**
- Shimmer effect: 1.5s cycle, linear gradient sweep
- Color: neutral gray with subtle highlight

### Error States

**Agent Loading Error**
- Icon: alert triangle
- Message: "Failed to load agents"
- Action: "Retry" button
- Fallback: Show empty state with "Create Agent" CTA

**Session Loading Error**
- Icon: alert triangle
- Message: "Failed to load recent conversations"
- Action: "Retry" button
- Fallback: Show empty state with "Start Chatting" CTA

### Empty States

**No Agents**
- Icon: user-plus (large, 64px)
- Heading: "Create Your First Agent"
- Description: "Agents are AI assistants you can customize for specific tasks"
- CTA: "Create Agent" button (primary style)

**No Sessions**
- Icon: message-circle (large, 64px)
- Heading: "No conversations yet"
- Description: "Start chatting with an agent to see your conversations here"
- CTA: "New Chat" button (primary style)

### Responsive Behavior

**Mobile (< 768px)**
- Single column layout
- Hero: reduced padding (24px), smaller heading (24px)
- Stats: horizontal scroll or stack vertically
- Agent grid: 1 column, full width
- Sessions: full width list

**Tablet (768px - 1024px)**
- Two column agent grid
- Stats: 3 columns, full width
- Sessions: full width list
- Increased spacing (32px between sections)

**Desktop (1024px+)**
- Four column agent grid
- Stats: 3 columns, centered
- Sessions: max-width 768px, centered
- Maximum spacing (48px between sections)

---

## Chat Interface with Streaming

### Purpose

The Chat Interface is the core interaction page where users have conversations with agents. It must handle real-time streaming, tool execution display, planning cards, confirmation requests, and multi-agent sessions while maintaining smooth 60fps animations.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (fixed) - Agent name, session info                  │
├─────────────────────────────────────────────────────────────┤
│ Multi-Agent Tabs (if applicable)                           │
│ [Parent Agent] [Child Agent 1] [Child Agent 2]             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Message History (scrollable, 768px max-width, centered)   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ User Message (right-aligned)                        │   │
│  │                                                     │   │
│  │                    Agent Message (left-aligned)     │   │
│  │                    [Tool Execution Widget]          │   │
│  │                    [Planning Card]                  │   │
│  │                                                     │   │
│  │ User Message (right-aligned)                        │   │
│  │                                                     │   │
│  │                    [Confirmation Request Card]      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Message Input (fixed bottom, 768px max-width, centered)    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [Textarea]                                    [Send]│   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Design Alternative 1: Centered Column (Recommended)

**Philosophy**: Focus attention on conversation with centered, constrained width.

**Message Column**
- Max-width: 768px, centered horizontally
- Padding: 32px horizontal (desktop), 16px (mobile)
- Background: background color (not surface)
- Messages float within column

**User Messages**
- Align: right (margin-left: auto)
- Max-width: 80% of column
- Background: primary color (amber in light, white in dark)
- Text color: inverse (white in light, black in dark)
- Border-radius: 12px (rounded-lg)
- Padding: 16px
- Font-size: 15px, line-height: 1.6

**Agent Messages**
- Align: left (margin-right: auto)
- Max-width: 100% of column
- Background: surface color
- Text color: text-primary
- Border-radius: 12px (rounded-lg)
- Padding: 16px
- Font-size: 15px, line-height: 1.6
- Markdown rendering: code blocks, lists, emphasis

**Message Spacing**
- Gap between messages: 16px
- Gap between user and agent: 24px
- Gap before tool widgets: 12px
- Gap before planning cards: 16px

**Advantages**
- Optimal reading width (45-75 characters)
- Clear visual hierarchy
- Scales well to all screen sizes
- Matches Claude, ChatGPT patterns

### Design Alternative 2: Full-Width with Sidebar

**Philosophy**: Maximize space for complex tool outputs and planning cards.

**Layout**
- Left: Message column (flexible width, min 600px)
- Right: Context sidebar (320px, collapsible)
- Sidebar shows: session info, agent details, tool history

**Advantages**
- More space for wide tool outputs
- Persistent context visibility
- Better for technical users

**Disadvantages**
- More complex responsive behavior
- Sidebar may feel cluttered
- Harder to focus on conversation

### Design Alternative 3: Bubble-Style Chat

**Philosophy**: Familiar messaging app aesthetic with tight bubbles.

**Messages**
- Smaller max-width (60% of column)
- Tighter padding (12px)
- Smaller font (14px)
- Tighter line-height (1.4)
- Avatar next to each message

**Advantages**
- Familiar to mobile users
- More messages visible at once
- Clearer speaker attribution

**Disadvantages**
- Less space for complex content
- Harder to read long messages
- Avatars add visual noise

### Recommended Design: Alternative 1 (Centered Column)

**Rationale**:
- Best readability for long-form content
- Clean, focused aesthetic
- Proven pattern (Claude, ChatGPT)
- Scales gracefully to mobile
- Aligns with Unseen.co generous spacing

### Component Specifications

#### ChatMessage Component

```typescript
interface ChatMessageProps {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  isStreaming?: boolean
  onRegenerate?: () => void
}

// User Message Styling
- Container: ml-auto, max-w-[80%], rounded-lg, p-4
- Background: primary color
- Text: text-inverse, text-base (15px), leading-relaxed (1.6)
- Timestamp: text-xs (11px), text-inverse, opacity-70, mt-2

// Agent Message Styling
- Container: mr-auto, max-w-full, rounded-lg, p-4
- Background: surface color
- Text: text-primary, text-base (15px), leading-relaxed (1.6)
- Markdown: prose styling with syntax highlighting
- Timestamp: text-xs (11px), text-tertiary, mt-2
- Actions: hover to show [Copy] [Regenerate] buttons

// Animation
- Entrance: fade-in-up, duration 150ms, ease-out
- Streaming: cursor blink animation on last character
```

#### TypingIndicator Component

```typescript
interface TypingIndicatorProps {
  agentName: string
}

// Styling
- Container: mr-auto, max-w-[200px], rounded-lg, p-4
- Background: surface color
- Dots: 3 circles, 8px diameter, gap-2
- Animation: bounce with stagger (150ms delay per dot)
- Text: text-sm (13px), text-secondary, mb-2

// Animation
- Entrance: fade-in, duration 200ms
- Dots: scale pulse, infinite loop
```

#### MessageInput Component

```typescript
interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
}

// Styling
- Container: fixed bottom, max-w-[768px], mx-auto, p-4
- Background: surface color, border: border-medium, rounded-lg
- Textarea: min-h-[44px], max-h-[200px], resize-none
- Font: text-base (15px), text-primary
- Placeholder: text-tertiary
- Send button: 44px square, rounded-md, primary color
- Character count: text-xs (11px), text-tertiary, shown when > 80% of limit

// Animation
- Focus: border-accent, shadow-md, duration 200ms
- Send button hover: scale 1.05, lift 2px
- Send button active: scale 0.95
- Disabled: opacity-50, cursor-not-allowed
```

#### ToolExecutionWidget Component

```typescript
interface ToolExecutionWidgetProps {
  toolName: string
  arguments: Record<string, any>
  result?: any
  status: 'pending' | 'running' | 'success' | 'error'
  duration?: number
  error?: string
  onRetry?: () => void
}

// Styling
- Container: max-w-full, rounded-lg, border-2, p-4, mt-3
- Border color: amber (pending), blue (running), green (success), red (error)
- Background: surface color
- Header: flex row, items-center, gap-3
  - Icon: 20px, status color
  - Tool name: text-base (15px), font-semibold, text-primary
  - Duration: text-xs (11px), text-tertiary, ml-auto
- Collapsible sections:
  - Arguments: JSON viewer with syntax highlighting
  - Result: formatted view (JSON, text, or custom)
- Status indicator: animated spinner (running), checkmark (success), X (error)

// Animation
- Entrance: scale-up from 0.95 to 1, duration 200ms
- Status change: color fade, duration 200ms
- Expand/collapse: height transition, duration 250ms
```

#### PlanningCard Component

```typescript
interface PlanningCardProps {
  planId: string
  title: string
  description: string
  tasks: Task[]
  onTaskUpdate?: (taskId: string, status: TaskStatus) => void
}

interface Task {
  id: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  subtasks?: Task[]
  startedAt?: Date
  completedAt?: Date
}

// Styling
- Container: max-w-full, rounded-lg, border: border-medium, p-6, mt-4
- Background: surface-elevated color
- Title: text-xl (20px), font-semibold, text-primary, mb-2
- Description: text-base (15px), text-secondary, mb-4
- Progress bar: h-2, rounded-full, bg-border-subtle
  - Fill: bg-success, transition width 300ms
- Task list: space-y-3, mt-4
- Task item: flex row, items-start, gap-3
  - Status icon: 20px circle, colored by status
  - Description: text-base (15px), text-primary
  - Timestamp: text-xs (11px), text-tertiary
- Subtasks: ml-8, border-l-2, border-border-subtle, pl-4

// Animation
- Entrance: scale-up + fade-in, duration 250ms
- Task status change: color transition 300ms, scale pulse
- Progress bar: width transition 300ms, ease-out
```

#### ConfirmationRequestCard Component

```typescript
interface ConfirmationRequestCardProps {
  message: string
  kind: 'DECISION' | 'TEXT'
  context?: string
  timeout?: number
  onConfirm: (approved: boolean, text?: string) => void
}

// Styling
- Container: max-w-full, rounded-lg, border-2, border-warning, p-6, mt-4
- Background: warning-light color (subtle)
- Icon: warning triangle, 32px, warning color, mb-4
- Message: text-lg (17px), font-semibold, text-primary, mb-2
- Context: text-base (15px), text-secondary, mb-4
- Timeout: text-sm (13px), text-warning, mb-4, countdown animation

// DECISION kind
- Buttons: flex row, gap-4, mt-6
  - Approve: primary style, "Approve" label
  - Reject: secondary style, "Reject" label
  - Both: 44px height, full-width on mobile

// TEXT kind
- Input: textarea, min-h-[80px], border: border-medium, rounded-md, p-3
- Submit: primary button, "Submit" label, mt-4

// Animation
- Entrance: slide-in-right, duration 250ms
- Exit: fade-out, duration 200ms
- Timeout: pulse animation on countdown
- Button loading: spinner inside button
```

### SSE Stream Integration

#### Connection Setup

```typescript
// Connect to SSE stream on mount
useEffect(() => {
  const eventSource = new EventSource(
    `/api/sessions/${sessionId}/stream`
  )

  eventSource.onmessage = (event) => {
    const aguiEvent = JSON.parse(event.data)
    handleAGUIEvent(aguiEvent)
  }

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error)
    setConnectionStatus('error')
    // Attempt reconnection with exponential backoff
  }

  return () => {
    eventSource.close()
  }
}, [sessionId])
```

#### AGUI Event Handling

```typescript
const handleAGUIEvent = (event: AGUIEvent) => {
  switch (event.type) {
    case 'RunStarted':
      setIsAgentTyping(true)
      setCurrentMessageId(event.messageId)
      break

    case 'TextMessageChunk':
      appendToMessage(event.messageId, event.chunk)
      break

    case 'TextMessageComplete':
      setIsAgentTyping(false)
      finalizeMessage(event.messageId)
      break

    case 'ToolCallStart':
      addToolWidget({
        id: event.toolCallId,
        toolName: event.toolName,
        arguments: event.arguments,
        status: 'running',
      })
      break

    case 'ToolCallEnd':
      updateToolWidget(event.toolCallId, {
        result: event.result,
        status: event.error ? 'error' : 'success',
        duration: event.duration,
        error: event.error,
      })
      break

    case 'ConfirmationRequestedEvent':
      showConfirmationCard({
        message: event.message,
        kind: event.kind,
        context: event.context,
        timeout: event.timeout,
      })
      break

    case 'PlanCreated':
      addPlanningCard({
        planId: event.planId,
        title: event.title,
        description: event.description,
        tasks: event.tasks,
      })
      break

    case 'TaskUpdated':
      updatePlanningCard(event.planId, {
        taskId: event.taskId,
        status: event.status,
        timestamp: event.timestamp,
      })
      break

    default:
      console.warn('Unknown AGUI event type:', event.type)
  }
}
```

#### Confirmation Submission

```typescript
const submitConfirmation = async (
  approved: boolean,
  text?: string
) => {
  try {
    const response = await fetch(
      `/api/sessions/${sessionId}/confirm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          text,
          timestamp: new Date().toISOString(),
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to submit confirmation')
    }

    // Remove confirmation card
    removeConfirmationCard()
  } catch (error) {
    console.error('Confirmation submission error:', error)
    showErrorToast('Failed to submit confirmation')
  }
}
```

### Multi-Agent Session Tabs

#### Tab Structure

```typescript
interface SessionTab {
  sessionId: string
  agentId: string
  agentName: string
  agentAvatar?: string
  isParent: boolean
  unreadCount: number
}

// Styling
- Container: flex row, gap-2, border-b: border-subtle, px-4
- Tab: px-4, py-3, rounded-t-md, cursor-pointer
  - Background: transparent, hover: surface-hover
  - Active: border-b-2, border-accent, bg-surface
- Label: flex row, items-center, gap-2
  - Avatar: 24px circle
  - Name: text-sm (13px), font-medium, text-primary
  - Badge: unread count, 16px circle, bg-error, text-white
- Close button: 16px, opacity-0, hover: opacity-100

// Animation
- Tab switch: fade transition 200ms
- New tab: slide-in-right 200ms
- Close tab: fade-out 150ms
```

#### Tab Behavior

```typescript
const switchTab = (sessionId: string) => {
  // Save scroll position of current tab
  saveScrollPosition(activeSessionId)

  // Switch active session
  setActiveSessionId(sessionId)

  // Load messages if not cached
  if (!messageCache[sessionId]) {
    loadMessages(sessionId)
  }

  // Restore scroll position
  restoreScrollPosition(sessionId)

  // Mark as read
  markSessionAsRead(sessionId)
}
```

### Auto-Scroll Behavior

```typescript
// Auto-scroll to bottom when new messages arrive
useEffect(() => {
  if (shouldAutoScroll) {
    scrollToBottom({ behavior: 'smooth' })
  }
}, [messages])

// Determine if should auto-scroll
const shouldAutoScroll = () => {
  const scrollContainer = scrollRef.current
  if (!scrollContainer) return false

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight

  // Auto-scroll if within 100px of bottom
  return distanceFromBottom < 100
}

// User can disable auto-scroll by scrolling up
const handleScroll = () => {
  const isNearBottom = shouldAutoScroll()
  setShouldAutoScroll(isNearBottom)
}
```

### Keyboard Shortcuts

```typescript
// Enter: Send message
// Shift+Enter: New line
// Ctrl+K: Focus input
// Ctrl+Tab: Next tab
// Ctrl+Shift+Tab: Previous tab
// Escape: Close confirmation card

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Send message
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault()
      handleSendMessage()
    }

    // Focus input
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      inputRef.current?.focus()
    }

    // Tab navigation
    if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault()
      const direction = e.shiftKey ? -1 : 1
      switchToAdjacentTab(direction)
    }

    // Close confirmation
    if (e.key === 'Escape' && hasActiveConfirmation) {
      e.preventDefault()
      closeConfirmationCard()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### Loading States

**Initial Load**
- Show skeleton messages (3-5 shimmer bubbles)
- Show skeleton input at bottom
- Duration: until first message loads

**Tab Switch**
- Show loading overlay with spinner
- Fade in new messages
- Duration: 200-500ms

**Message Send**
- Disable input immediately
- Show optimistic user message
- Show typing indicator
- Re-enable input when agent starts responding

### Error States

**SSE Connection Error**
- Show banner at top: "Connection lost. Reconnecting..."
- Attempt reconnection with exponential backoff
- After 3 failures: show "Reconnect" button
- Disable message input during disconnection

**Message Send Error**
- Show error toast: "Failed to send message"
- Keep message in input (don't clear)
- Show "Retry" button
- Remove optimistic message if shown

**Tool Execution Error**
- Show error state in tool widget
- Display error message from backend
- Show "Retry" button if retryable
- Use red accent color

### Empty State

**New Session**
- Icon: message-circle (64px)
- Heading: "Start a conversation"
- Suggested prompts: 3-4 example questions as clickable chips
- Description: "Ask me anything or try one of these:"

```typescript
const suggestedPrompts = [
  "Help me plan a project",
  "Explain a complex topic",
  "Review my code",
  "Brainstorm ideas",
]
```

### Responsive Behavior

**Mobile (< 768px)**
- Full-width messages (no max-width constraint)
- Reduced padding (12px)
- Smaller font (14px)
- Tabs: horizontal scroll
- Input: full-width, fixed bottom with safe area inset

**Tablet (768px - 1024px)**
- 768px max-width column, centered
- Standard padding (16px)
- Standard font (15px)
- Tabs: scrollable if many

**Desktop (1024px+)**
- 768px max-width column, centered
- Generous padding (32px horizontal)
- Standard font (15px)
- Tabs: scrollable with fade indicators

---

## Agent Management with Dynamic Forms

### Purpose

Agent Management allows Technical Builders to create and configure agents using dynamic forms generated from backend schemas. It must support CREATE, EDIT, and VIEW modes with comprehensive validation and error handling.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header - "Agent Management"                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Actions Bar                                                │
│  [Search] [Filter] [Sort]              [Create New Agent]  │
│                                                             │
│  Agent List                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Agent 1 - Description          [Edit] [Delete]      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Agent 2 - Description          [Edit] [Delete]      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Agent 3 - Description          [Edit] [Delete]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

OR (when creating/editing)

┌─────────────────────────────────────────────────────────────┐
│ Header - "Create Agent" / "Edit Agent"                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dynamic Form (768px max-width, centered)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Agent Name *                                        │   │
│  │ [Text Input]                                        │   │
│  │                                                     │   │
│  │ Description                                         │   │
│  │ [Textarea]                                          │   │
│  │                                                     │   │
│  │ Model                                               │   │
│  │ [Select Dropdown]                                   │   │
│  │                                                     │   │
│  │ Tools                                               │   │
│  │ [Multi-Select with Tags]                           │   │
│  │                                                     │   │
│  │ [Cancel] [Save Agent]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design Alternative 1: List View with Modal Forms

**Philosophy**: Keep list always visible, use modal for create/edit.

**Agent List**
- Table layout with columns: Avatar, Name, Description, Last Used, Actions
- Sortable columns
- Search filters list in real-time
- Pagination: 20 items per page
- Hover: background surface-hover, lift 1px

**Modal Form**
- Centered modal, 600px width, max-height 80vh
- Backdrop: overlay color with blur
- Form inside modal with scroll if needed
- Close: X button, Escape key, click outside

**Advantages**
- List always visible for context
- Quick switching between agents
- Familiar pattern

**Disadvantages**
- Modal can feel cramped for long forms
- Harder to show validation errors
- Less space for field descriptions

### Design Alternative 2: Full-Page Forms (Recommended)

**Philosophy**: Dedicated page for create/edit with generous space.

**List Page**
- Card grid layout (similar to Dashboard)
- Each card: 320px x 180px
- Shows: avatar, name, description, last used, actions
- Search bar at top
- "Create New Agent" as large card in grid

**Form Page**
- Full page dedicated to form
- 768px max-width, centered
- Breadcrumb: "Agents > Create Agent"
- Form sections with clear headings
- Generous spacing between fields (24px)
- Sticky footer with Cancel/Save buttons

**Advantages**
- More space for complex forms
- Better for long descriptions
- Clearer focus on task
- Easier to show validation errors

**Disadvantages**
- Requires navigation away from list
- Can't see other agents while editing

### Recommended Design: Alternative 2 (Full-Page Forms)

**Rationale**:
- Better UX for complex agent configuration
- Aligns with Unseen.co generous spacing
- Clearer visual hierarchy
- Easier to add more fields in future
- Better mobile experience

### Component Specifications

#### AgentListCard Component

```typescript
interface AgentListCardProps {
  id: string
  name: string
  description: string
  avatar?: string
  lastUsed?: Date
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onClick: (id: string) => void
}

// Styling
- Container: 320px width (flexible), 180px height, rounded-lg
- Background: surface, border: border-subtle
- Padding: 20px
- Layout: flex column
- Avatar: 48px circle, mb-3
- Name: text-lg (17px), font-semibold, text-primary, mb-2
- Description: text-sm (13px), text-secondary, 2 lines, ellipsis
- Last used: text-xs (11px), text-tertiary, mt-auto
- Actions: absolute top-right, opacity-0, hover: opacity-100
  - Edit: icon button, 32px
  - Delete: icon button, 32px

// Animation
- Hover: lift 4px, scale 1.02, shadow-lg, border-accent, duration 250ms
- Entrance: fade-in-up with stagger (75ms per card)
- Delete: fade-out + scale-down, duration 300ms
```

#### DynamicForm Component

```typescript
interface DynamicFormProps {
  schema: FormSchema
  mode: 'CREATE' | 'EDIT' | 'VIEW'
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => Promise<void>
  onCancel: () => void
}

interface FormSchema {
  fields: FormField[]
  validation?: ValidationRules
}

interface FormField {
  name: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'number' | 'lookup'
  label: string
  description?: string
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: FieldValidation
  lookupEndpoint?: string // For @UiLookup fields
}

// Styling
- Container: max-w-[768px], mx-auto, p-6
- Form: space-y-6 (24px between fields)
- Field group: space-y-2 (8px between label and input)
- Label: text-sm (13px), font-medium, text-primary
  - Required indicator: text-error, ml-1, "*"
- Description: text-xs (11px), text-secondary, mt-1
- Input: h-11 (44px), rounded-md, border: border-medium, px-3
  - Focus: border-accent, ring-2, ring-accent/20
  - Error: border-error, ring-2, ring-error/20
- Error message: text-xs (11px), text-error, mt-1, flex items-center, gap-1
- Footer: sticky bottom-0, bg-background, border-t, p-4, flex gap-3
  - Cancel: secondary button
  - Submit: primary button, disabled until valid

// Animation
- Field entrance: stagger 50ms per field, fade-in-up
- Validation error: shake animation 300ms
- Submit loading: spinner in button
```

#### Field Type Components

**TextInput**
```typescript
interface TextInputProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

// Styling: standard input with 44px height
```

**TextareaInput**
```typescript
interface TextareaInputProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  rows?: number
  maxLength?: number
}

// Styling: min-h-[120px], resize-vertical
// Show character count if maxLength provided
```

**SelectInput**
```typescript
interface SelectInputProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  error?: string
  required?: boolean
  placeholder?: string
}

// Styling: custom dropdown with search
// Use Headless UI Listbox for accessibility
```

**MultiSelectInput**
```typescript
interface MultiSelectInputProps {
  name: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: Array<{ value: string; label: string }>
  error?: string
  required?: boolean
}

// Styling: tag-style display
// Selected items shown as removable chips
// Dropdown for adding more
```

**LookupInput**
```typescript
interface LookupInputProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  lookupEndpoint: string
  error?: string
  required?: boolean
}

// Behavior: fetch options from endpoint
// Autocomplete with debounced search
// Show loading state while fetching
```

### Schema Fetching

```typescript
// Fetch form schema from backend
const fetchFormSchema = async (
  type: 'agent',
  mode: 'CREATE' | 'EDIT' | 'VIEW'
) => {
  const response = await fetch(
    `/api/schema?type=${type}&mode=${mode}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch form schema')
  }

  return response.json() as FormSchema
}

// Example schema response
{
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Agent Name",
      "required": true,
      "placeholder": "My Assistant",
      "validation": {
        "minLength": 3,
        "maxLength": 50
      }
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Description",
      "description": "What does this agent do?",
      "placeholder": "This agent helps with...",
      "validation": {
        "maxLength": 500
      }
    },
    {
      "name": "modelId",
      "type": "select",
      "label": "Model",
      "required": true,
      "options": [
        { "value": "gpt-4", "label": "GPT-4" },
        { "value": "claude-3", "label": "Claude 3" }
      ]
    },
    {
      "name": "tools",
      "type": "multiselect",
      "label": "Tools",
      "description": "Select tools this agent can use",
      "options": [
        { "value": "web_search", "label": "Web Search" },
        { "value": "calculator", "label": "Calculator" },
        { "value": "file_reader", "label": "File Reader" }
      ]
    }
  ]
}
```

### Form Validation

```typescript
// Client-side validation
const validateField = (
  field: FormField,
  value: any
): string | null => {
  // Required check
  if (field.required && !value) {
    return `${field.label} is required`
  }

  // Type-specific validation
  if (field.type === 'text' && field.validation) {
    const { minLength, maxLength, pattern } = field.validation

    if (minLength && value.length < minLength) {
      return `Minimum ${minLength} characters required`
    }

    if (maxLength && value.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`
    }

    if (pattern && !new RegExp(pattern).test(value)) {
      return `Invalid format`
    }
  }

  return null
}

// Form-level validation
const validateForm = (
  schema: FormSchema,
  values: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {}

  schema.fields.forEach((field) => {
    const error = validateField(field, values[field.name])
    if (error) {
      errors[field.name] = error
    }
  })

  return errors
}
```

### CRUD Operations

**Create Agent**
```typescript
const createAgent = async (values: Record<string, any>) => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create agent')
  }

  return response.json()
}
```

**Update Agent**
```typescript
const updateAgent = async (
  id: string,
  values: Record<string, any>
) => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update agent')
  }

  return response.json()
}
```

**Delete Agent**
```typescript
const deleteAgent = async (id: string) => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete agent')
  }
}
```

### Loading States

**Schema Loading**
- Show skeleton form with shimmer fields
- 5-6 skeleton fields of varying heights
- Skeleton buttons at bottom

**Form Submission**
- Disable all inputs
- Show spinner in submit button
- Change button text to "Saving..."
- Prevent form submission

**Agent List Loading**
- Show skeleton cards in grid
- 6-8 skeleton cards matching final layout
- Shimmer animation

### Error States

**Schema Load Error**
- Icon: alert triangle
- Message: "Failed to load form"
- Action: "Retry" button
- Fallback: Show basic form with common fields

**Validation Errors**
- Inline errors below each field
- Red border on invalid fields
- Shake animation on submit attempt
- Focus first invalid field
- Error summary at top if multiple errors

**Save Error**
- Toast notification with error message
- Keep form data (don't clear)
- Re-enable form for editing
- Show "Retry" button

**Delete Error**
- Toast notification: "Failed to delete agent"
- Keep agent in list
- Show "Retry" button

### Empty State

**No Agents**
- Icon: user-plus (64px)
- Heading: "Build Your First Agent"
- Description: "Agents are AI assistants you can customize for specific tasks"
- CTA: "Create Agent" button (primary style)
- Secondary: "Learn about agents" link

---

## Session Browser with Hierarchy

### Purpose

Session Browser displays all conversations with parent-child relationships, search/filter capabilities, and quick navigation to resume conversations.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header - "Conversations"                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Controls Bar                                               │
│  [Search]  [Sort: Newest ▼]  [Filter: All Agents ▼]       │
│                                                             │
│  Session List (768px max-width, centered)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ┌─ Parent Session 1                                 │   │
│  │ │  Agent Name - "Last message preview..."           │   │
│  │ │  2 hours ago • 15 messages                        │   │
│  │ │                                                    │   │
│  │ │  ├─ Child Session 1.1                             │   │
│  │ │  │  Child Agent - "Last message..."               │   │
│  │ │  │  1 hour ago • 8 messages                       │   │
│  │ │  │                                                 │   │
│  │ │  └─ Child Session 1.2                             │   │
│  │ │     Child Agent - "Last message..."               │   │
│  │ │     30 min ago • 5 messages                       │   │
│  │ └─                                                   │   │
│  │                                                      │   │
│  │ ┌─ Parent Session 2                                 │   │
│  │ │  Agent Name - "Last message preview..."           │   │
│  │ │  Yesterday • 23 messages                          │   │
│  │ └─                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Load More]                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design Alternative 1: Hierarchical List (Recommended)

**Philosophy**: Show parent-child relationships with visual indentation.

**Session Card**
- Full-width card, 100px height (parent), 80px (child)
- Background: surface, border: border-subtle
- Padding: 16px
- Layout: flex row, items-center, gap-4
- Avatar: 48px circle (parent), 40px (child)
- Content: flex-1, flex column
  - Agent name: text-base (15px), font-semibold, text-primary
  - Message preview: text-sm (13px), text-secondary, truncate
  - Metadata: text-xs (11px), text-tertiary, flex row, gap-2
- Actions: opacity-0, hover: opacity-100
  - Delete: icon button

**Child Sessions**
- Indented 32px from left
- Connected with vertical line (border-l-2, border-border-subtle)
- Slightly smaller (80px height vs 100px)
- Collapsible under parent

**Advantages**
- Clear parent-child relationships
- Easy to scan chronologically
- Familiar tree structure

### Design Alternative 2: Grouped Cards

**Philosophy**: Group children as nested cards within parent card.

**Parent Card**
- Expandable card with children inside
- Click to expand/collapse
- Children shown as smaller cards within parent
- Nested border styling

**Advantages**
- More compact
- Clear grouping
- Less vertical space

**Disadvantages**
- Harder to scan all sessions
- More complex interaction
- Children less prominent

### Recommended Design: Alternative 1 (Hierarchical List)

**Rationale**:
- Clearer visual hierarchy
- Easier to scan all sessions
- Better for keyboard navigation
- Aligns with file tree patterns
- More space for message previews

### Component Specifications

#### SessionCard Component

```typescript
interface SessionCardProps {
  sessionId: string
  agentId: string
  agentName: string
  agentAvatar?: string
  lastMessage: string
  lastActivity: Date
  messageCount: number
  status: 'active' | 'completed' | 'error'
  isParent: boolean
  hasChildren?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
  onClick: (sessionId: string) => void
  onDelete: (sessionId: string) => void
}

// Parent Session Styling
- Container: full-width, h-[100px], rounded-lg, p-4
- Background: surface, border: border-subtle
- Hover: bg-surface-hover, border-accent, lift 2px
- Layout: flex row, items-center, gap-4
- Avatar: 48px circle
- Content: flex-1, flex column, gap-1
- Agent name: text-base (15px), font-semibold, text-primary
- Message preview: text-sm (13px), text-secondary, truncate, max-w-[600px]
- Metadata: flex row, gap-3, text-xs (11px), text-tertiary
  - Timestamp: relative time
  - Message count: with icon
  - Status indicator: colored dot
- Expand button: if hasChildren, chevron icon, rotate on expand
- Delete button: opacity-0, hover: opacity-100, absolute top-right

// Child Session Styling
- Container: ml-8, h-[80px], rounded-lg, p-3
- Border-left: 2px solid border-subtle (connecting line)
- Background: surface, border: border-subtle
- Hover: bg-surface-hover, border-accent
- Avatar: 40px circle
- Slightly smaller text (text-sm for name, text-xs for preview)

// Animation
- Entrance: fade-in-up with stagger (50ms per card)
- Hover: lift 2px, border color transition 200ms
- Expand: height transition 250ms, ease-out
- Delete: fade-out + collapse, duration 300ms
```

#### SessionListControls Component

```typescript
interface SessionListControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'newest' | 'oldest' | 'messages' | 'agent'
  onSortChange: (sort: string) => void
  filterAgent?: string
  onFilterChange: (agentId?: string) => void
  agents: Array<{ id: string; name: string }>
}

// Styling
- Container: flex row, gap-4, mb-6, flex-wrap
- Search: flex-1, min-w-[200px], h-11 (44px)
  - Icon: search, 20px, text-tertiary
  - Input: pl-10, rounded-md, border: border-medium
- Sort dropdown: w-[180px], h-11
- Filter dropdown: w-[200px], h-11
- Dropdowns: custom styled with Headless UI

// Animation
- Search focus: border-accent, ring-2
- Dropdown open: fade-in, slide-down, duration 150ms
```

### Search and Filter

```typescript
// Search implementation
const searchSessions = (
  sessions: Session[],
  query: string
): Session[] => {
  if (!query) return sessions

  const lowerQuery = query.toLowerCase()

  return sessions.filter((session) => {
    return (
      session.agentName.toLowerCase().includes(lowerQuery) ||
      session.lastMessage.toLowerCase().includes(lowerQuery)
    )
  })
}

// Sort implementation
const sortSessions = (
  sessions: Session[],
  sortBy: string
): Session[] => {
  switch (sortBy) {
    case 'newest':
      return [...sessions].sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
      )

    case 'oldest':
      return [...sessions].sort(
        (a, b) =>
          new Date(a.lastActivity).getTime() -
          new Date(b.lastActivity).getTime()
      )

    case 'messages':
      return [...sessions].sort(
        (a, b) => b.messageCount - a.messageCount
      )

    case 'agent':
      return [...sessions].sort((a, b) =>
        a.agentName.localeCompare(b.agentName)
      )

    default:
      return sessions
  }
}

// Filter implementation
const filterSessions = (
  sessions: Session[],
  agentId?: string
): Session[] => {
  if (!agentId) return sessions

  return sessions.filter(
    (session) => session.agentId === agentId
  )
}
```

### Infinite Scroll

```typescript
// Load more sessions on scroll
const { ref, inView } = useInView({
  threshold: 0,
  rootMargin: '100px',
})

useEffect(() => {
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }
}, [inView, hasNextPage, isFetchingNextPage])

// Render
<div ref={ref} className="h-20 flex items-center justify-center">
  {isFetchingNextPage && <Spinner />}
</div>
```

### Parent-Child Expansion

```typescript
// Track expanded parents
const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
  new Set()
)

const toggleExpand = (sessionId: string) => {
  setExpandedSessions((prev) => {
    const next = new Set(prev)
    if (next.has(sessionId)) {
      next.delete(sessionId)
    } else {
      next.add(sessionId)
    }
    return next
  })
}

// Render children conditionally
{session.hasChildren && expandedSessions.has(session.id) && (
  <div className="ml-8 space-y-2 mt-2">
    {session.children.map((child) => (
      <SessionCard key={child.id} {...child} isParent={false} />
    ))}
  </div>
)}
```

### Delete Confirmation

```typescript
// Show confirmation dialog before delete
const confirmDelete = (sessionId: string, agentName: string) => {
  showDialog({
    title: 'Delete Conversation',
    message: `Are you sure you want to delete this conversation with ${agentName}? This action cannot be undone.`,
    confirmLabel: 'Delete',
    confirmStyle: 'danger',
    onConfirm: async () => {
      try {
        await deleteSession(sessionId)
        showToast({
          type: 'success',
          message: 'Conversation deleted',
        })
      } catch (error) {
        showToast({
          type: 'error',
          message: 'Failed to delete conversation',
        })
      }
    },
  })
}
```

### Loading States

**Initial Load**
- Show 5-6 skeleton session cards
- Shimmer animation
- Maintain layout structure

**Infinite Scroll Load**
- Show spinner at bottom
- Load 20 more sessions
- Smooth append to list

**Delete Loading**
- Disable delete button
- Show spinner in button
- Prevent interaction

### Error States

**Load Error**
- Icon: alert triangle
- Message: "Failed to load conversations"
- Action: "Retry" button
- Fallback: Show empty state

**Delete Error**
- Toast notification: "Failed to delete conversation"
- Keep session in list
- Show "Retry" button

### Empty States

**No Sessions**
- Icon: message-circle (64px)
- Heading: "No conversations yet"
- Description: "Start chatting with an agent to see your conversations here"
- CTA: "New Chat" button (primary style)

**No Search Results**
- Icon: search (48px)
- Heading: "No conversations found"
- Description: "Try adjusting your search or filters"
- Action: "Clear Filters" button

**No Sessions for Agent**
- Icon: message-circle (48px)
- Heading: "No conversations with this agent"
- Description: "Start a new conversation to get started"
- CTA: "Chat with [Agent Name]" button

### Responsive Behavior

**Mobile (< 768px)**
- Full-width cards
- Reduced padding (12px)
- Smaller avatars (40px parent, 32px child)
- Stack metadata vertically
- Hide delete button, show on swipe

**Tablet (768px - 1024px)**
- 768px max-width, centered
- Standard padding (16px)
- Standard avatars (48px parent, 40px child)
- Horizontal metadata

**Desktop (1024px+)**
- 768px max-width, centered
- Generous padding (16px)
- Standard avatars
- Hover effects enabled

---

## Shared Components and Patterns

### Toast Notifications

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Styling
- Container: fixed top-right, z-50, space-y-2, p-4
- Toast: min-w-[320px], max-w-[480px], rounded-lg, p-4
- Background: surface-elevated, border: 2px solid
  - Success: border-success
  - Error: border-error
  - Warning: border-warning
  - Info: border-info
- Layout: flex row, items-start, gap-3
- Icon: 24px, colored by type
- Content: flex-1, flex column, gap-1
- Message: text-sm (13px), font-medium, text-primary
- Description: text-xs (11px), text-secondary
- Close button: 20px, opacity-70, hover: opacity-100
- Action button: text-xs, font-medium, colored by type

// Animation
- Entrance: slide-in-right + fade-in, duration 250ms
- Exit: slide-out-right + fade-out, duration 200ms
- Auto-dismiss: fade-out after duration (default 3s)

// Usage
showToast({
  type: 'success',
  message: 'Agent created successfully',
  duration: 3000,
})

showToast({
  type: 'error',
  message: 'Failed to save agent',
  description: 'Please check your connection and try again',
  action: {
    label: 'Retry',
    onClick: () => retryOperation(),
  },
})
```

### Confirmation Dialog

```typescript
interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmStyle?: 'primary' | 'danger'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

// Styling
- Backdrop: fixed inset-0, bg-overlay, backdrop-blur-sm
- Dialog: fixed center, w-[480px], max-w-[90vw], rounded-lg
- Background: surface-elevated, border: border-medium
- Padding: 24px
- Title: text-lg (17px), font-semibold, text-primary, mb-3
- Message: text-base (15px), text-secondary, mb-6
- Buttons: flex row, gap-3, justify-end
  - Cancel: secondary button
  - Confirm: primary or danger button

// Animation
- Backdrop: fade-in, duration 200ms
- Dialog: scale-up (0.95 to 1) + fade-in, duration 250ms
- Exit: scale-down + fade-out, duration 200ms

// Usage
showDialog({
  title: 'Delete Agent',
  message: 'Are you sure you want to delete this agent? This action cannot be undone.',
  confirmLabel: 'Delete',
  confirmStyle: 'danger',
  onConfirm: async () => {
    await deleteAgent(agentId)
  },
})
```

### Loading Skeleton

```typescript
interface SkeletonProps {
  variant: 'text' | 'circle' | 'rectangle' | 'card'
  width?: string | number
  height?: string | number
  className?: string
}

// Styling
- Base: bg-border-subtle, rounded
- Animation: shimmer effect, 1.5s linear infinite
- Shimmer: linear-gradient sweep from left to right

// Variants
- text: h-4, rounded-sm, width varies
- circle: aspect-square, rounded-full
- rectangle: rounded-md, width and height specified
- card: full component skeleton with multiple elements

// Animation
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// Usage
<Skeleton variant="text" width="60%" />
<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="rectangle" width="100%" height={200} />
```

### Empty State

```typescript
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

// Styling
- Container: flex flex-col, items-center, justify-center
- Min-height: 400px, text-center
- Icon: 64px, text-tertiary, mb-4
- Title: text-xl (20px), font-semibold, text-primary, mb-2
- Description: text-base (15px), text-secondary, max-w-[400px], mb-6
- Action: primary button
- Secondary action: text link, text-sm, text-secondary, mt-3

// Animation
- Entrance: fade-in-up, duration 300ms

// Usage
<EmptyState
  icon={<MessageCircle size={64} />}
  title="No conversations yet"
  description="Start chatting with an agent to see your conversations here"
  action={{
    label: 'New Chat',
    onClick: () => router.push('/chat'),
  }}
  secondaryAction={{
    label: 'Learn more',
    onClick: () => router.push('/docs'),
  }}
/>
```

### Error State

```typescript
interface ErrorStateProps {
  title: string
  message: string
  error?: Error
  onRetry?: () => void
  showDetails?: boolean
}

// Styling
- Container: flex flex-col, items-center, justify-center
- Min-height: 400px, text-center
- Icon: alert-triangle, 64px, text-error, mb-4
- Title: text-xl (20px), font-semibold, text-primary, mb-2
- Message: text-base (15px), text-secondary, max-w-[400px], mb-6
- Retry button: primary button
- Details: collapsible section with error stack
  - Background: surface, border: border-error, rounded-md, p-4
  - Font: mono, text-xs, text-secondary

// Animation
- Entrance: fade-in-up, duration 300ms
- Retry button: pulse animation on error

// Usage
<ErrorState
  title="Failed to load agents"
  message="We couldn't load your agents. Please check your connection and try again."
  error={error}
  onRetry={() => refetch()}
  showDetails={isDevelopment}
/>
```

---

## Performance Optimizations

### Code Splitting

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ChatInterface = lazy(() => import('./pages/ChatInterface'))
const AgentManagement = lazy(() => import('./pages/AgentManagement'))
const SessionBrowser = lazy(() => import('./pages/SessionBrowser'))

// Component-based code splitting
const PlanningCard = lazy(() => import('./components/PlanningCard'))
const ToolExecutionWidget = lazy(() => import('./components/ToolExecutionWidget'))

// Suspense boundaries
<Suspense fallback={<PageSkeleton />}>
  <Dashboard />
</Suspense>
```

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Prefetch on hover
const prefetchAgent = (agentId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgent(agentId),
  })
}

// Optimistic updates
const updateAgentMutation = useMutation({
  mutationFn: updateAgent,
  onMutate: async (newAgent) => {
    await queryClient.cancelQueries({ queryKey: ['agents'] })
    const previousAgents = queryClient.getQueryData(['agents'])
    
    queryClient.setQueryData(['agents'], (old: Agent[]) =>
      old.map((agent) =>
        agent.id === newAgent.id ? { ...agent, ...newAgent } : agent
      )
    )
    
    return { previousAgents }
  },
  onError: (err, newAgent, context) => {
    queryClient.setQueryData(['agents'], context.previousAgents)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] })
  },
})
```

### Virtual Scrolling

```typescript
// For long lists (> 100 items)
import { useVirtualizer } from '@tanstack/react-virtual'

const SessionList = ({ sessions }: { sessions: Session[] }) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <SessionCard session={sessions[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Animation Performance

```typescript
// Use GPU-accelerated transforms
const animationVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
}

// Avoid layout thrashing
const optimizedAnimation = {
  // Good: transform (GPU)
  transform: 'translateY(10px)',
  
  // Bad: top (CPU, triggers layout)
  // top: '10px',
}

// Use will-change sparingly
.animated-element {
  will-change: transform, opacity;
}

// Remove will-change after animation
useEffect(() => {
  const element = ref.current
  if (element) {
    element.style.willChange = 'transform, opacity'
    
    return () => {
      element.style.willChange = 'auto'
    }
  }
}, [])
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={agent.avatar}
  alt={agent.name}
  width={48}
  height={48}
  className="rounded-full"
  loading="lazy"
  placeholder="blur"
  blurDataURL={agent.avatarBlur}
/>

// Generate blur placeholders at build time
// Use WebP/AVIF formats
// Responsive images with srcset
```

### Bundle Size Optimization

```typescript
// Tree shaking
import { Button } from '@/components/ui/Button' // Good
// import * as UI from '@/components/ui' // Bad

// Dynamic imports for heavy libraries
const ReactMarkdown = lazy(() => import('react-markdown'))
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter'))

// Analyze bundle
// npm run build -- --analyze
```

---

## Accessibility

### Keyboard Navigation

```typescript
// Focus management
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  })
}

// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### ARIA Labels

```typescript
// Buttons
<button aria-label="Send message">
  <SendIcon />
</button>

// Loading states
<div role="status" aria-live="polite" aria-busy="true">
  Loading agents...
</div>

// Form validation
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'name-error' : undefined}
/>
{error && <span id="name-error" role="alert">{error}</span>}

// Dialogs
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Delete Agent</h2>
  <p id="dialog-description">Are you sure?</p>
</div>
```

### Screen Reader Support

```typescript
// Announce dynamic content
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Usage
announceToScreenReader('Agent created successfully')
announceToScreenReader('New message from agent')
```

### Color Contrast

```typescript
// Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)

// Light mode
const lightTheme = {
  text: {
    primary: '#1C1917', // 15.8:1 on white
    secondary: '#78716C', // 4.6:1 on white
    tertiary: '#A8A29E', // 3.1:1 on white (large text only)
  },
}

// Dark mode
const darkTheme = {
  text: {
    primary: '#FAFAFA', // 16.1:1 on #09090B
    secondary: '#A1A1AA', // 8.3:1 on #09090B
    tertiary: '#71717A', // 4.8:1 on #09090B
  },
}

// Test with tools
// - Chrome DevTools Lighthouse
// - axe DevTools
// - WAVE browser extension
```

### Reduced Motion

```typescript
// Respect prefers-reduced-motion
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return prefersReducedMotion
}

// Usage
const animationVariants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0.01 : 0.3,
    },
  },
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Component tests with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { AgentCard } from './AgentCard'

describe('AgentCard', () => {
  it('should render agent information', () => {
    render(
      <AgentCard
        id="1"
        name="Test Agent"
        description="Test description"
        onClick={jest.fn()}
      />
    )
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
  
  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(
      <AgentCard
        id="1"
        name="Test Agent"
        description="Test description"
        onClick={onClick}
      />
    )
    
    fireEvent.click(screen.getByText('Test Agent'))
    expect(onClick).toHaveBeenCalledWith('1')
  })
})
```

### Integration Tests

```typescript
// Page-level tests
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('should load and display agents', async () => {
    const queryClient = new QueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )
    
    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Should show agents after loading
    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

```typescript
// Playwright tests
import { test, expect } from '@playwright/test'

test('should create new agent', async ({ page }) => {
  await page.goto('/agents')
  
  // Click create button
  await page.click('text=Create New Agent')
  
  // Fill form
  await page.fill('input[name="name"]', 'Test Agent')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.selectOption('select[name="modelId"]', 'gpt-4')
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Should redirect to list
  await expect(page).toHaveURL('/agents')
  
  // Should show success toast
  await expect(page.locator('text=Agent created successfully')).toBeVisible()
  
  // Should show new agent in list
  await expect(page.locator('text=Test Agent')).toBeVisible()
})
```

### Accessibility Tests

```typescript
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Dashboard accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Dashboard />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## Error Handling Patterns

### API Error Handling

```typescript
// Centralized error handler
const handleAPIError = (error: unknown): string => {
  if (error instanceof Response) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'You are not authenticated. Please log in.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return 'An unexpected error occurred.'
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unknown error occurred.'
}

// Usage in React Query
const { data, error } = useQuery({
  queryKey: ['agents'],
  queryFn: fetchAgents,
  onError: (error) => {
    const message = handleAPIError(error)
    showToast({ type: 'error', message })
  },
})
```

### SSE Error Handling

```typescript
// Reconnection with exponential backoff
const useSSEConnection = (sessionId: string) => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'error'>('connecting')
  const [retryCount, setRetryCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  const connect = useCallback(() => {
    setStatus('connecting')
    
    const eventSource = new EventSource(`/api/sessions/${sessionId}/stream`)
    eventSourceRef.current = eventSource
    
    eventSource.onopen = () => {
      setStatus('connected')
      setRetryCount(0)
    }
    
    eventSource.onerror = () => {
      setStatus('error')
      eventSource.close()
      
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * 2 ** retryCount, 30000)
      
      setTimeout(() => {
        if (retryCount < 5) {
          setRetryCount((prev) => prev + 1)
          connect()
        }
      }, delay)
    }
    
    return eventSource
  }, [sessionId, retryCount])
  
  useEffect(() => {
    const eventSource = connect()
    
    return () => {
      eventSource.close()
    }
  }, [connect])
  
  return { status, retry: connect }
}
```

### Form Validation Errors

```typescript
// Display validation errors
const FormField = ({ name, error, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      {children}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-error"
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}

// Shake animation on error
const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 },
}
```

---

## Design System Consistency

### Color Usage Guidelines

**90% Grayscale Rule**
- Backgrounds: white, cream, black, grays
- Text: black, grays, white
- Borders: subtle grays
- Shadows: transparent black

**10% Accent Colors**
- Primary: amber (light mode), white (dark mode)
- Success: green (completed states)
- Error: red (errors, destructive actions)
- Warning: amber (confirmations, cautions)
- Info: blue (informational messages)

**When to Use Color**
- Active/selected states
- User message indicators
- Primary CTAs
- Status indicators
- Semantic feedback (success, error, warning)

**When NOT to Use Color**
- Decorative purposes
- Non-interactive elements
- Secondary information
- Disabled states

### Spacing Consistency

```typescript
// Use consistent spacing scale
const spacing = {
  xs: '4px',   // Tight spacing within components
  sm: '8px',   // Related elements
  md: '12px',  // List items, form fields
  lg: '16px',  // Component padding, card spacing
  xl: '24px',  // Section gaps
  '2xl': '32px', // Major section gaps
  '3xl': '48px', // Page section gaps
}

// Apply consistently
- Component padding: 16px (p-4)
- Card gaps: 24px (gap-6)
- Form field gaps: 16px (space-y-4)
- List item gaps: 12px (space-y-3)
- Section gaps: 48px (space-y-12)
```

### Typography Consistency

```typescript
// Use consistent type scale
const typography = {
  xs: '11px',   // Metadata, timestamps
  sm: '13px',   // Secondary text, captions
  base: '15px', // Body text, UI elements
  lg: '17px',   // Emphasized text
  xl: '20px',   // Small headings
  '2xl': '24px', // Medium headings
  '3xl': '32px', // Large headings
}

// Apply consistently
- Body text: text-base (15px)
- Headings: text-xl to text-3xl (20-32px)
- Metadata: text-xs (11px)
- Secondary: text-sm (13px)
```

### Animation Consistency

```typescript
// Use consistent durations
const durations = {
  instant: 100,  // Button press
  fast: 150,     // Hover effects
  normal: 200,   // Standard transitions
  slow: 250,     // Complex animations
  slower: 300,   // Page transitions
}

// Use consistent easing
const easing = {
  easeOut: [0.16, 1, 0.3, 1],      // Entrance animations
  easeInOut: [0.4, 0, 0.2, 1],     // Transitions
  spring: { stiffness: 300, damping: 25 }, // Interactive elements
}

// Apply consistently
- Hover: 200ms ease-out
- Entrance: 250ms ease-out
- Exit: 200ms ease-in
- Interactive: spring physics
```

---

## Deployment Considerations

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_ENV=development

# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
NEXT_PUBLIC_ENV=production
```

### Build Configuration

```typescript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['api.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ]
  },
}
```

### Performance Monitoring

```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
  
  // Send to analytics
  if (metric.label === 'web-vital') {
    analytics.track('Web Vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    })
  }
}
```

---

## Summary

This design document provides comprehensive specifications for building four production-ready pages in the Agent Console:

1. **Dashboard**: Landing page with agent grid and recent sessions
2. **Chat Interface**: Full-featured conversation page with streaming, tools, and multi-agent support
3. **Agent Management**: Dynamic form-based agent creation and editing
4. **Session Browser**: Hierarchical conversation list with search and filters

All designs follow **Unseen.co principles**:
- 90% grayscale with restrained color usage
- Smooth animations with spring physics
- Generous spacing (16-48px gaps)
- Typography-first hierarchy
- Delightful micro-interactions

The implementation uses:
- **Next.js 16** + React 19 + TypeScript
- **Tailwind v4** for styling
- **Framer Motion** for animations
- **React Query** for server state
- **Zustand** for client state
- **SSE** for real-time streaming

All components include:
- Loading states with skeletons
- Error states with recovery
- Empty states with guidance
- Responsive behavior (320px - 2560px)
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimizations (code splitting, virtual scrolling)

The design is production-ready with comprehensive error handling, validation, and user feedback mechanisms.
