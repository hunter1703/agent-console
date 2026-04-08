# Wireframes: Agent Console Web Modernization

This document provides ASCII wireframes for the Agent Console redesign, showing the Claude-style layout with 280px sidebar and 768px centered chat column.

## Design Specifications Reference

- **Sidebar Width**: 280px (desktop), collapsible to icon-only
- **Chat Column Max Width**: 768px (centered)
- **Horizontal Margins**: 24px minimum
- **Vertical Message Spacing**: 24px
- **Sidebar Item Padding**: 12px
- **Border Radius**: 8px (small), 12px (medium), 16px (large)
- **Breakpoints**: 375px, 768px, 1024px, 1440px, 1920px

---

## Wireframe 1: Desktop - Chat View with "My Agents" Sidebar

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BROWSER VIEWPORT (1440px)                                     │
├──────────────────┬──────────────────────────────────────────────────────────────────────────────┤
│                  │                                                                              │
│   SIDEBAR        │                         CHAT INTERFACE (768px max, centered)                │
│   280px          │                                                                              │
│                  │  ┌────────────────────────────────────────────────────────────────────┐    │
│ ┌──────────────┐ │  │                                                                    │    │
│ │ My Agents    │ │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ │ Recent Chats │ │  │  │  [User Avatar]                                           │    │    │
│ └──────────────┘ │  │  │  How do I implement authentication in Next.js?           │    │    │
│   ^active        │  │  │                                                          │    │    │
│                  │  │  └──────────────────────────────────────────────────────────┘    │    │
│ ┌──────────────┐ │  │                                                                    │    │
│ │ + New Agent  │ │  │                          ↕ 24px spacing                            │    │
│ └──────────────┘ │  │                                                                    │    │
│                  │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ ┌──────────────┐ │  │  │  [Agent Avatar]                                          │    │    │
│ │  🤖           │ │  │  │  Next.js offers several authentication approaches:      │    │    │
│ │  Code Helper │ │  │  │                                                          │    │    │
│ │  Assists with│ │  │  │  1. NextAuth.js - Most popular solution                 │    │    │
│ │  coding...   │ │  │  │  2. Auth0 - Enterprise-grade                            │    │    │
│ └──────────────┘ │  │  │  3. Clerk - Modern developer experience                 │    │    │
│   ^active        │  │  │                                                          │    │    │
│                  │  │  │  Here's a basic NextAuth.js setup:                       │    │    │
│ ┌──────────────┐ │  │  │                                                          │    │    │
│ │  🎨           │ │  │  │  ```typescript                                           │    │    │
│ │  Design Bot  │ │  │  │  import NextAuth from 'next-auth'                        │    │    │
│ │  Creates UI  │ │  │  │  // ... code continues                                   │    │    │
│ │  mockups     │ │  │  │  ```                                                     │    │    │
│ └──────────────┘ │  │  │                                                          │    │    │
│                  │  │  │  [Copy] [Regenerate]                                     │    │    │
│ ┌──────────────┐ │  │  └──────────────────────────────────────────────────────────┘    │    │
│ │  📊           │ │  │                                                                    │    │
│ │  Data Analyst│ │  │                          ↕ 24px spacing                            │    │
│ │  Analyzes    │ │  │                                                                    │    │
│ │  datasets    │ │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ └──────────────┘ │  │  │  [User Avatar]                                           │    │    │
│                  │  │  │  Can you show me the middleware approach?                │    │    │
│ ┌──────────────┐ │  │  └──────────────────────────────────────────────────────────┘    │    │
│ │  ✍️            │ │  │                                                                    │    │
│ │  Writer      │ │  │                          ↕ 24px spacing                            │    │
│ │  Content     │ │  │                                                                    │    │
│ │  creation    │ │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ └──────────────┘ │  │  │  [Agent Avatar]                                          │    │    │
│                  │  │  │  ● ● ●  Thinking...                                      │    │    │
│                  │  │  └──────────────────────────────────────────────────────────┘    │    │
│                  │  │                                                                    │    │
│                  │  └────────────────────────────────────────────────────────────────────┘    │
│                  │                                                                              │
│                  │  ┌────────────────────────────────────────────────────────────────────┐    │
│                  │  │  Type a message...                                      [Send] │    │    │
│                  │  └────────────────────────────────────────────────────────────────────┘    │
│                  │                                                                              │
│ ┌──────────────┐ │                                                                              │
│ │   🌙 Theme   │ │                                                                              │
│ └──────────────┘ │                                                                              │
│                  │                                                                              │
└──────────────────┴──────────────────────────────────────────────────────────────────────────────┘

ANNOTATIONS:
- Sidebar: 280px fixed width, #FEFCE8 background (light) / #18181B (dark)
- Toggle buttons at top: "My Agents" (active, #F59E0B accent) / "Recent Chats"
- Agent cards: 12px padding, 8px gap between, 12px border radius
- Active agent: subtle left border in primary color (#F59E0B)
- Chat column: 768px max width, centered with auto margins
- Messages: 24px vertical spacing, 16px padding
- User messages: subtle left border (#F59E0B), slightly elevated
- Agent messages: neutral styling, no accent
- Typing indicator: animated dots with pulse effect
- Message input: 44px height, 12px border radius, fixed at bottom
- Theme toggle: sidebar footer, moon/sun icon
```

---

## Wireframe 2: Desktop - Chat View with "Recent Chats" Sidebar

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BROWSER VIEWPORT (1440px)                                     │
├──────────────────┬──────────────────────────────────────────────────────────────────────────────┤
│                  │                                                                              │
│   SIDEBAR        │                         CHAT INTERFACE (768px max, centered)                │
│   280px          │                                                                              │
│                  │  ┌────────────────────────────────────────────────────────────────────┐    │
│ ┌──────────────┐ │  │                                                                    │    │
│ │ My Agents    │ │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ │ Recent Chats │ │  │  │  [User Avatar]                                           │    │    │
│ └──────────────┘ │  │  │  How do I implement authentication in Next.js?           │    │    │
│      ^active     │  │  │                                                          │    │    │
│                  │  │  └──────────────────────────────────────────────────────────┘    │    │
│ ┌──────────────┐ │  │                                                                    │    │
│ │ + New Chat   │ │  │                          ↕ 24px spacing                            │    │
│ └──────────────┘ │  │                                                                    │    │
│                  │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ ┌──────────────┐ │  │  │  [Agent Avatar]                                          │    │    │
│ │ 🤖 Code Helper│ │  │  │  Next.js offers several authentication approaches:      │    │    │
│ │ How do I     │ │  │  │                                                          │    │    │
│ │ implement... │ │  │  │  1. NextAuth.js - Most popular solution                 │    │    │
│ │ 2 hours ago  │ │  │  │  2. Auth0 - Enterprise-grade                            │    │    │
│ └──────────────┘ │  │  │  3. Clerk - Modern developer experience                 │    │    │
│   ^active        │  │  │                                                          │    │    │
│                  │  │  │  Here's a basic NextAuth.js setup...                     │    │    │
│ ┌──────────────┐ │  │  │                                                          │    │    │
│ │ 🎨 Design Bot │ │  │  │  [Copy] [Regenerate]                                     │    │    │
│ │ Create a     │ │  │  └──────────────────────────────────────────────────────────┘    │    │
│ │ landing page │ │  │                                                                    │    │
│ │ Yesterday    │ │  │                          ↕ 24px spacing                            │    │
│ └──────────────┘ │  │                                                                    │    │
│                  │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ ┌──────────────┐ │  │  │  [User Avatar]                                           │    │    │
│ │ 📊 Data Analyst│ │  │  │  Can you show me the middleware approach?                │    │    │
│ │ Analyze sales│ │  │  └──────────────────────────────────────────────────────────┘    │    │
│ │ data for Q4  │ │  │                                                                    │    │
│ │ 3 days ago   │ │  │                          ↕ 24px spacing                            │    │
│ └──────────────┘ │  │                                                                    │    │
│                  │  │  ┌──────────────────────────────────────────────────────────┐    │    │
│ ┌──────────────┐ │  │  │  [Agent Avatar]                                          │    │    │
│ │ ✍️ Writer      │ │  │  │  ● ● ●  Thinking...                                      │    │    │
│ │ Write a blog │ │  │  └──────────────────────────────────────────────────────────┘    │    │
│ │ post about   │ │  │                                                                    │    │
│ │ Last week    │ │  └────────────────────────────────────────────────────────────────────┘    │
│ └──────────────┘ │                                                                              │
│                  │  ┌────────────────────────────────────────────────────────────────────┐    │
│ ┌──────────────┐ │  │  Type a message...                                      [Send] │    │    │
│ │ 🤖 Code Helper│ │  └────────────────────────────────────────────────────────────────────┘    │
│ │ Debug Python │ │                                                                              │
│ │ script error │ │                                                                              │
│ │ 2 weeks ago  │ │                                                                              │
│ └──────────────┘ │                                                                              │
│                  │                                                                              │
│ ┌──────────────┐ │                                                                              │
│ │   🌙 Theme   │ │                                                                              │
│ └──────────────┘ │                                                                              │
│                  │                                                                              │
└──────────────────┴──────────────────────────────────────────────────────────────────────────────┘

ANNOTATIONS:
- Toggle switched to "Recent Chats" (active state)
- Session list: sorted by last activity (most recent first)
- Session items: agent icon + name, message preview (truncated 40 chars), timestamp
- Active session: highlighted with accent left border (#F59E0B)
- Hover state: subtle background color change (#FEFCE8 → slightly darker)
- Timestamps: relative format ("2 hours ago", "Yesterday", "Last week")
- Delete icon: appears on hover with fade-in animation
- Scroll: infinite scroll for large session lists
- Same chat interface layout as Wireframe 1
```

---

## Wireframe 3: Desktop - Agent Creation Modal

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BROWSER VIEWPORT (1440px)                                     │
├──────────────────┬──────────────────────────────────────────────────────────────────────────────┤
│                  │                                                                              │
│   SIDEBAR        │                         CHAT INTERFACE (blurred)                            │
│   280px          │                                                                              │
│   (blurred)      │  ┌─────────────────────────────────────────────────────────────┐           │
│                  │  │                                                             │           │
│                  │  │              MODAL OVERLAY (rgba(0,0,0,0.5))                │           │
│                  │  │                                                             │           │
│                  │  │    ┌───────────────────────────────────────────────┐       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │         Create New Agent                  [X] │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    ├───────────────────────────────────────────────┤       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │  Agent Name                                   │       │           │
│                  │  │    │  ┌─────────────────────────────────────────┐ │       │           │
│                  │  │    │  │ e.g., Code Helper                       │ │       │           │
│                  │  │    │  └─────────────────────────────────────────┘ │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │  Description                                  │       │           │
│                  │  │    │  ┌─────────────────────────────────────────┐ │       │           │
│                  │  │    │  │ Assists with coding tasks and           │ │       │           │
│                  │  │    │  │ debugging                               │ │       │           │
│                  │  │    │  │                                         │ │       │           │
│                  │  │    │  └─────────────────────────────────────────┘ │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │  System Prompt                                │       │           │
│                  │  │    │  ┌─────────────────────────────────────────┐ │       │           │
│                  │  │    │  │ You are an expert programming assistant │ │       │           │
│                  │  │    │  │ specializing in modern web development. │ │       │           │
│                  │  │    │  │ Provide clear, concise code examples... │ │       │           │
│                  │  │    │  │                                         │ │       │           │
│                  │  │    │  │                                         │ │       │           │
│                  │  │    │  └─────────────────────────────────────────┘ │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │  Model                                        │       │           │
│                  │  │    │  ┌─────────────────────────────────────────┐ │       │           │
│                  │  │    │  │ GPT-4 Turbo                          ▼  │ │       │           │
│                  │  │    │  └─────────────────────────────────────────┘ │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    │  ┌──────────┐  ┌──────────────────────────┐ │       │           │
│                  │  │    │  │  Cancel  │  │  Create Agent            │ │       │           │
│                  │  │    │  └──────────┘  └──────────────────────────┘ │       │           │
│                  │  │    │   ^secondary      ^primary (#F59E0B)        │       │           │
│                  │  │    │                                               │       │           │
│                  │  │    └───────────────────────────────────────────────┘       │           │
│                  │  │                                                             │           │
│                  │  │                                                             │           │
│                  │  └─────────────────────────────────────────────────────────────┘           │
│                  │                                                                              │
└──────────────────┴──────────────────────────────────────────────────────────────────────────────┘

ANNOTATIONS:
- Modal: 560px width, centered, 16px border radius
- Background overlay: rgba(0,0,0,0.5) with backdrop blur
- Modal animation: scale-up from 0.95 to 1.0 + fade-in (200ms)
- Close button: top-right, icon-only with hover state
- Form fields: 44px height, 12px border radius
- Labels: above inputs, 13px font size, medium weight
- Textarea: 120px height for system prompt
- Dropdown: native select styled to match design system
- Cancel button: neutral gray, hover state
- Create button: primary accent (#F59E0B), disabled state while processing
- Validation: inline errors below fields in red
- Focus states: 2px ring in primary color with expansion animation
- Escape key: closes modal
- Click outside: closes modal
```

---

## Wireframe 4: Mobile - Chat View (< 768px)

### 4a: Mobile - Sidebar Closed

```
┌───────────────────────────────────┐
│  MOBILE VIEWPORT (375px)          │
├───────────────────────────────────┤
│                                   │
│  ┌─┐  Agent Console          🌙  │
│  │☰│                              │
│  └─┘                              │
│  ^hamburger                       │
│                                   │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │ [User Avatar]         │ │ │
│  │  │ How do I implement    │ │ │
│  │  │ authentication in     │ │ │
│  │  │ Next.js?              │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │        ↕ 24px               │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │ [Agent Avatar]        │ │ │
│  │  │ Next.js offers        │ │ │
│  │  │ several auth          │ │ │
│  │  │ approaches:           │ │ │
│  │  │                       │ │ │
│  │  │ 1. NextAuth.js        │ │ │
│  │  │ 2. Auth0              │ │ │
│  │  │ 3. Clerk              │ │ │
│  │  │                       │ │ │
│  │  │ Here's a basic        │ │ │
│  │  │ NextAuth.js setup:    │ │ │
│  │  │                       │ │ │
│  │  │ ```typescript         │ │ │
│  │  │ import NextAuth       │ │ │
│  │  │ from 'next-auth'      │ │ │
│  │  │ // ...                │ │ │
│  │  │ ```                   │ │ │
│  │  │                       │ │ │
│  │  │ [Copy] [Regenerate]   │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │        ↕ 24px               │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │ [User Avatar]         │ │ │
│  │  │ Can you show me the   │ │ │
│  │  │ middleware approach?  │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │        ↕ 24px               │ │
│  │                             │ │
│  │  ┌───────────────────────┐ │ │
│  │  │ [Agent Avatar]        │ │ │
│  │  │ ● ● ●  Thinking...    │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ Type a message...    [Send] │ │
│  └─────────────────────────────┘ │
│                                   │
└───────────────────────────────────┘

ANNOTATIONS:
- Viewport: 375px width (iPhone SE)
- Sidebar: hidden by default
- Hamburger menu: top-left, 44x44px touch target
- Theme toggle: top-right, 44x44px touch target
- Chat: full width with 16px horizontal margins
- Messages: same 24px vertical spacing
- Message input: 44px height, fixed at bottom
- Touch targets: minimum 44x44px for all interactive elements
- Scroll: smooth scrolling with momentum
```

### 4b: Mobile - Sidebar Open

```
┌───────────────────────────────────┐
│  MOBILE VIEWPORT (375px)          │
├───────────────────────────────────┤
│                                   │
│ ┌─────────────────────────────┐  │
│ │ SIDEBAR (280px)             │  │
│ │                             │  │
│ │ ┌─┐                         │  │
│ │ │✕│  Agent Console          │  │
│ │ └─┘                         │  │
│ │  ^close                     │  │
│ │                             │  │
│ │ ┌───────────┬─────────────┐ │  │
│ │ │ My Agents │Recent Chats │ │  │
│ │ └───────────┴─────────────┘ │  │
│ │   ^active                   │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │ + New Agent             │ │  │
│ │ └─────────────────────────┘ │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │  🤖                      │ │  │
│ │ │  Code Helper            │ │  │
│ │ │  Assists with coding... │ │  │
│ │ └─────────────────────────┘ │  │
│ │   ^active                   │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │  🎨                      │ │  │
│ │ │  Design Bot             │ │  │
│ │ │  Creates UI mockups     │ │  │
│ │ └─────────────────────────┘ │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │  📊                      │ │  │
│ │ │  Data Analyst           │ │  │
│ │ │  Analyzes datasets      │ │  │
│ │ └─────────────────────────┘ │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │  ✍️                       │ │  │
│ │ │  Writer                 │ │  │
│ │ │  Content creation       │ │  │
│ │ └─────────────────────────┘ │  │
│ │                             │  │
│ │                             │  │
│ │ ┌─────────────────────────┐ │  │
│ │ │   🌙 Theme              │ │  │
│ │ └─────────────────────────┘ │  │
│ │                             │  │
│ └─────────────────────────────┘  │
│  │                               │
│  │  CHAT (dimmed/blurred)        │
│  │                               │
│  └───────────────────────────────┘
│                                   │
└───────────────────────────────────┘

ANNOTATIONS:
- Sidebar: slides in from left with Framer Motion (300ms)
- Animation: translateX(-280px) → translateX(0)
- Overlay: semi-transparent backdrop over chat
- Close button: top-left, 44x44px touch target
- Swipe gesture: swipe right to close sidebar
- Tap outside: closes sidebar
- Same sidebar content as desktop
- Scroll: independent scroll for sidebar
- Z-index: sidebar above chat content
```

---

## Color Palette Reference

### Light Mode (Warm)
- Background: `#FFFFFF`
- Surface: `#FEFCE8` (warm cream)
- Primary: `#F59E0B` (warm amber)
- Text: `#1C1917`
- Border: `#E5E5E5` (subtle gray)

### Dark Mode (Cool)
- Background: `#09090B`
- Surface: `#18181B`
- Primary: `#FAFAFA` (near-white)
- Secondary: `#60A5FA` (cool blue, sparingly)
- Text: `#FAFAFA`
- Border: `#27272A` (subtle gray)

---

## Interactive States

### Hover States
- Buttons: scale(1.02) + brightness increase
- Sidebar items: background color shift (subtle)
- Message actions: fade-in (opacity 0 → 1)

### Active States
- Toggle buttons: primary color background
- Selected agent/session: left border in primary color
- Input focus: 2px ring in primary color

### Loading States
- Typing indicator: three dots with staggered pulse
- Skeleton loaders: shimmer effect (gradient animation)
- Button loading: spinner + disabled state

### Animation Timings
- Quick interactions: 150ms (hover, click)
- Standard transitions: 250-300ms (view switching, modals)
- Smooth entrances: 200ms (fade-in, scale-up)
- Spring physics: stiffness 300, damping 30

---

## Accessibility Notes

- All interactive elements: minimum 44x44px touch targets
- Focus indicators: 2px outline in primary color
- Keyboard navigation: Tab, Shift+Tab, Enter, Escape
- Screen reader: ARIA labels on icon-only buttons
- Color contrast: WCAG AA compliant in both themes
- Reduced motion: respects prefers-reduced-motion
- Semantic HTML: nav, main, article, button elements

---

## Next Steps

These wireframes establish the visual structure. The next phase will create:

1. **Design Document**: Detailed component specifications, animation curves, state management
2. **Component Library**: Reusable UI components with Framer Motion integration
3. **Implementation Tasks**: Breakdown of development work with dependencies

**Review Questions:**
- Does the layout match your vision for the Claude-style interface?
- Are the spacing and dimensions appropriate?
- Should we add any additional views (settings, agent details, etc.)?
- Any changes needed before moving to detailed design?
