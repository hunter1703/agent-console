# Agent Console — Production Redesign Design
*2026-03-04*

---

## Context

The current app has accumulated design debt: glassmorphism effects that don't add clarity, performative animations that don't communicate state, a conceptual model split across too many pages, and UI language borrowed from the original implementation that no longer fits. The app "tries to look smart" rather than being genuinely clear.

The redesign starts from first principles:
- **Don Norman**: affordances are obvious, signifiers are clear, feedback is immediate, conceptual model matches user expectation, gulf of execution and evaluation are minimized
- **Apple HIG**: clarity (interface defers to content), deference (controls don't shout), focus (one primary task), simplicity through reduction (remove, don't add)
- **Target**: Desktop-first developer workspace. Mobile is secondary but must not feel neglected.

---

## Information Architecture

Four pages, clean separation. No modals hiding key functionality.

```
/               → Home (Launcher)
/chat/[id]      → Studio (full-screen conversation)
/history        → History (all sessions, searchable + filterable)
/settings       → Settings (agents + models management)
```

**Navigation:** A slim persistent nav. Desktop: top bar or left rail with 4 items (Home, History, Settings) + active state indicator. Mobile: bottom tab bar.

**Routing rename:** `/agents/[id]` → `/chat/[id]`. Language shift: this is a conversation, not an agent endpoint.

**Admin is "Settings" now.** The word "Admin" implies an IT department. "Settings" is what Apple calls it, and that's what it is.

---

## Visual Design Language

### Color

Two themes, restrained palette. All values from Apple's system color system or directly adjacent.

**Light Mode**
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F5F5F7` | Cards, inputs |
| `--surface-raised` | `#FFFFFF` | Cards on surface |
| `--text-primary` | `#1D1D1F` | Body text |
| `--text-secondary` | `#6E6E73` | Metadata, labels |
| `--text-tertiary` | `#AEAEB2` | Placeholders, disabled |
| `--accent` | `#5856D6` | Interactive: links, active states, thinking indicator |
| `--accent-surface` | `rgba(88, 86, 214, 0.08)` | Thinking card tint |
| `--border` | `rgba(0, 0, 0, 0.08)` | Card/input borders |
| `--green` | `#34C759` | Success, online |
| `--red` | `#FF3B30` | Error, destructive |
| `--amber` | `#FF9F0A` | Warning |

**Dark Mode**
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#111111` | Page background (not pure black — avoids harsh OLED contrast) |
| `--surface` | `#1C1C1E` | Cards, inputs |
| `--surface-raised` | `#2C2C2E` | Elevated cards |
| `--text-primary` | `#F5F5F7` | Body text |
| `--text-secondary` | `#AEAEB2` | Metadata, labels |
| `--text-tertiary` | `#636366` | Placeholders |
| `--accent` | `#6E6CF0` | Slightly brightened for dark mode visibility |
| `--accent-surface` | `rgba(110, 108, 240, 0.12)` | Thinking card tint |
| `--border` | `rgba(255, 255, 255, 0.08)` | Card/input borders |

**Removed:** All aurora gradient variables, AI orb animation colors, glassmorphism backdrop blur variables, `--primary` with heavy saturation. No decorative color.

### Typography

System font everywhere: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`

Four sizes only. No arbitrary intermediate values.

| Role | Size | Weight | Use |
|------|------|--------|-----|
| Label | `13px` | `400` | Timestamps, metadata, captions |
| Body | `15px` | `400` | Messages, descriptions, list items |
| Title | `17px` | `600` | Section headers, agent names, page titles |
| Display | `28px` | `700` | Home greeting only |

**Letter-spacing:** `normal` everywhere. No `tracking-wide` or `tracking-wider` for aesthetics. SF Pro is designed for normal tracking.

**Line-height:** `1.5` for body, `1.2` for titles.

### Spacing

4px base unit. Only multiples: `4, 8, 12, 16, 20, 24, 32, 48px`. Zero arbitrary values anywhere.

### Shadows

One elevation level only:
```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
```

If an element needs more shadow to be visible, that's a layout problem. No `shadow-floating`, `shadow-lg`, or dramatic elevations.

### Border Radius

Three values only:
- `8px` — inputs, small chips
- `12px` — cards, buttons
- `16px` — large cards (thinking/planning)

### Motion

| Interaction | Duration | Easing | Details |
|---|---|---|---|
| Message entry | `150ms` | `ease-out` | `opacity 0→1 + translateY(6px→0)` |
| Launcher → Studio | `200ms` | `ease-out` | `scale(0.97→1) + opacity 0→1` |
| Studio → Launcher | `180ms` | `ease-in` | `scale(1→0.97) + opacity 1→0` |
| Card expand/collapse | `200ms` | `ease-in-out` | Height + opacity |
| Button press | `80ms` | `ease-out` | `opacity 0.7 on active` |
| Slide-in panel | `250ms` | `ease-out` | `translateX` from right |
| Thinking indicator | `1200ms` | `ease-in-out` | Dot `opacity 0.4↔1`, infinite |
| Planning task entry | `150ms` | `ease-out` | `opacity 0→1 + translateY(4px→0)` |

**Removed:** `spring-bounce-anim`, `aurora-drift`, `rotate-gradient`, `ai-core-breathe`, `pulse-glow`. Every removed animation was decoration, not communication.

---

## Pages

### Home / Launcher (`/`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Home]  [History]  [Settings]                        [theme]   │  ← nav, 48px
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Good morning.                                │  ← 28px display, time-aware
│              What would you like to explore?                    │  ← 15px secondary
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │  ← agents row
│  │  [○ Research]  [○ Code Helper]  [○ Writer]  [+ New]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Recent                                         [All history →] │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Research Agent              Today, 2:14 PM              │  │
│  │  Can you help me analyze this dataset...                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Code Helper                 Yesterday                   │  │
│  │  Refactor the authentication module                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content max-width:** `680px`, centered. Breathing room on wide screens.

**Greeting:** Time-aware ("Good morning" / "Good afternoon" / "Good evening"). Simple, human. No logo, no "Agent Console" title competing with content.

**Agent row:** Scrollable horizontal row on overflow. Each agent is a clickable pill/card with avatar (initials if no image) and name. [+ New] at the end opens Settings/Agents.

**Recent sessions:** Up to 5 most recent. Each row shows agent name, timestamp (relative for <24h, absolute for older), and first-message preview. Click → Studio. "All history →" → `/history`.

**Empty state:** No recent sessions → show only the agents row with "Start a conversation" subheading. No illustration needed.

**Connectivity:** Not shown when healthy. A quiet top banner `Connection error · Retrying...` appears only when the backend is unreachable. No pulse, no performative status indicator.

**Cmd+K:** Opens a search overlay for sessions and agents. Keyboard-first workflow for developers.

---

### Studio (`/chat/[id]`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ←  Research Agent                          [Sessions]  [⚙]    │  ← 48px header
├─────────────────────────────────────────────────────────────────┤
│                           ↑ scroll                              │
│                                                                 │
│         ┌──────────────────────────────────────────┐           │
│         │  ● Thinking                               │           │  ← thinking card
│         │  I'm scanning the repository structure    │           │
│         │  to find all authentication handlers...  │           │
│         └──────────────────────────────────────────┘           │
│                                                                 │
│         ┌──────────────────────────────────────────┐           │
│         │  Plan: Refactor Auth System               │           │  ← planning card
│         │  Goal: Consolidate token strategies       │           │
│         │  ──────────────────────────────────────── │           │
│         │  ✓  Audit current codebase                │           │
│         │  ⟳  Extract shared utilities    ████░░   │           │
│         │  ○  Write unit tests                      │           │
│         │  ○  Update documentation                  │           │
│         └──────────────────────────────────────────┘           │
│                                                                 │
│         The auth.ts file uses three token strategies.          │  ← assistant message
│         I'd recommend consolidating to JWT...                   │
│                                                                 │
│         ▶ 2 tools used                                         │  ← collapsed tool row
│                                                                 │
│  ──────────────────────────────────────────────────────  │
│                                   [You: Can you refactor this?] │  ← user message
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Message...                                             [↑]     │  ← input, 52px
└─────────────────────────────────────────────────────────────────┘
```

**Content max-width:** `720px`, centered in the chat area.

**Header (48px):**
- Left: `←` back to Launcher (or `⌘[` keyboard shortcut)
- Center: current agent name (17px/600 weight)
- Right: `[Sessions]` button (opens slide-in panel with session history for this agent) + `[⚙]` (opens settings for this agent)

**Message order:** Chronological top-to-bottom. Auto-scroll to bottom. Stops auto-scrolling if user manually scrolls up (scroll-to-bottom button appears).

**Thinking card:**
- Background: `--accent-surface` tint
- Left border: `3px solid --accent`
- Header: small animated dot (opacity pulse) + "Thinking" label (13px, `--text-secondary`)
- Body: streaming markdown text (15px, `--text-primary`)
- When done: dot disappears, header becomes "Thought for 4s" chevron (collapsed, expandable)
- Border radius: `12px`

**Planning card:**
- Background: `--surface`
- Thin top border in `--border`
- Header: plan title (17px/600) + goal (15px, secondary)
- Divider
- Task list: each task has status icon + name. In-progress shows `████░░` progress bar.
- New tasks animate in with `150ms ease-out` fade+slide
- Border radius: `12px`
- No expand/collapse — always shown in full (it's center stage)

**Tool details (collapsed by default):**
- Single line: `▶ 3 tools used` (13px, `--text-secondary`)
- Click expands to list: `search_web("react") → 5 results`, etc.
- Positioned between planning/thinking cards and the next assistant message

**User messages:**
- Right-aligned
- Background: `--accent`
- Text: white, 15px
- Border radius: `12px 12px 4px 12px` (asymmetric — Apple iMessage style)
- Max-width: 60% of content area

**Assistant messages:**
- Left-aligned
- No background (content is the UI)
- Markdown rendered (bold, code blocks, lists)
- Code blocks: monospace, `--surface` background, `8px` padding, `8px` radius

**Input area (52px base, grows):**
- `--surface` background, `--border` border, `8px` radius
- Grows to max 5 lines
- Enter = send, Shift+Enter = newline (label hint shown on focus)
- `[↑]` send button → becomes `[■]` stop button during streaming
- Input is cleared on send

**Sessions slide-in panel:**
- Slides from right (250ms)
- Shows all sessions for this agent
- Each row: timestamp + message preview
- Click → load that session (URL changes to `/chat/{id}?session={sessionId}`)
- Close on backdrop click or `Esc`

---

### History (`/history`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Home]  [History]  [Settings]                        [theme]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  History                              [🔍 Search sessions...]   │
│                                                                 │
│  [All]  [Research Agent]  [Code Helper]  [Writer]               │  ← filter pills
│                                                                 │
│  Today                                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Research Agent          2:14 PM                  [↗][⋯] │  │
│  │  Can you help me analyze this dataset...                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Yesterday                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Code Helper             11:30 AM                 [↗][⋯] │  │
│  │  Refactor the authentication module                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content max-width:** `720px`, centered.

**Search:** Full-text search bar (visible, not Cmd+K here — in history, search is the primary action). Searches session titles and message content.

**Filter pills:** `[All]` + one pill per agent. Horizontal scrollable row. Active pill has `--accent` background. Filters sessions by agent.

**Time grouping:** Today / Yesterday / This week / Last month / Earlier. Each group is a section with a 13px label header.

**Session row:** Agent name (17px/600) + timestamp (13px secondary) + message preview (15px, truncated to one line). `[↗]` opens in Studio. `[⋯]` shows delete confirmation.

**Data source:** Fetched from `POST /v1/catalog/list` with `assetType: "session"`, paginated. Filter by agent via query params (see Backend API notes below).

---

### Settings (`/settings`)

Two tabs: **Agents** | **Models**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Home]  [History]  [Settings]                        [theme]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Settings                                                       │
│                                                                 │
│  [Agents]  [Models]                                             │
│  ────────                                                       │
│                                                                 │
│  ┌────────────────────────────────────────────┐  [+ New Agent] │
│  │  Research Agent                            │                 │
│  │  claude-3-5-sonnet · 3 tools enabled       │  [Edit][Delete] │
│  ├────────────────────────────────────────────┤                 │
│  │  Code Helper                               │                 │
│  │  gpt-4o · 5 tools enabled                  │  [Edit][Delete] │
│  └────────────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Edit flow:** Clicking Edit navigates to `/settings/agents/[id]` (full page form, not a modal). The existing `JsonForm` component is reused and restyled. Full page forms are better for complex configuration.

**[+ New Agent]** → `/settings/agents/new` (same full-page form, blank).

**Delete:** Inline confirmation row expands below the item ("Delete Research Agent? [Confirm] [Cancel]"). No modal for this — it's a two-step action that doesn't need a popup.

---

## Key Backend API Notes

### Currently Available (works now)
- `POST /v1/catalog/list` (`assetType: agent`) → list agents
- `POST /v1/catalog/list` (`assetType: session`) → list sessions (paginated)
- `GET /v1/catalog/session/{id}?includeEvents=true` → session with events
- `POST /v1/agent/agent` / `PUT /v1/agent/agent/{id}` / `DELETE` → agent CRUD
- `POST /v1/model`, `PUT /v1/model/{id}`, `DELETE` → model CRUD
- `POST /v1/agent/events` → SSE streaming
- `GET /schemas/{assetType}` → JSON schema for forms

### Needed from Backend
1. **Session filtering by agentId** — The `AssetRequest.query` needs to support `agentId` as a filter parameter in `SessionAssetHandler`. Currently unclear if this is supported.
2. **Session deletion** — No `DELETE /v1/catalog/session/{id}` endpoint exists. Needed for the `[⋯] Delete` action in History.
3. **Session search (full-text)** — `POST /v1/catalog/search` exists but unclear if it searches session content/titles. Needs verification.
4. **Session title storage** — Sessions need a stored `title` field (first message or user-set). Currently may only be generated client-side. The backend `AgentSession` model should persist this.

---

## Implementation Approach

### Preserve (reuse with restyling)
- `JsonForm` component — dynamic schema-driven forms, keep the engine, replace the styling
- `lib/api.ts`, `lib/api-v1.ts` — API functions, update endpoints to match new naming
- `lib/eventAdapter.ts` — event translation logic (keep entirely)
- `lib/planning.ts` — planning data merge logic (keep entirely)
- `MarkdownRenderer` — keep, just update font/spacing
- `EventTimeline` component — keep for the "tool details" expandable section (simplify display)

### New Components to Build
- `NavBar` — top navigation with active state (replaces `Sidebar`)
- `Launcher` — home page with greeting, agent row, recent sessions
- `Studio` — full-screen chat view (replaces `ChatWindow` + `agents/[id]/page.tsx`)
- `ThinkingCard` — inline thinking card (replaces `ThoughtPulse`)
- `PlanningCard` — redesigned planning card (replace current `PlanningMessage`)
- `ToolDetails` — collapsed tool call row (replaces `EventTimeline` sidebar)
- `MessageInput` — updated input with Send/Stop toggle
- `SessionsPanel` — slide-in panel for session history in Studio
- `SearchOverlay` — Cmd+K global search
- `HistoryPage` — `/history` with search + agent filter pills
- `SettingsPage` — `/settings` with tabs for agents + models

### Files to Remove (or gut + replace)
- `components/Sidebar.tsx` → replaced by `NavBar`
- `components/AppShell.tsx` → replaced by simpler layout in `layout.tsx`
- `components/ChatWindow.tsx` → replaced by `Studio`
- `components/ThoughtPulse.tsx` → replaced by `ThinkingCard`
- `components/PlanningMessage.tsx` → replaced by `PlanningCard`
- `app/globals.css` → complete replacement with new design tokens
- `app/admin/agents/page.tsx` → moved to `app/settings/agents/page.tsx`
- `app/admin/models/page.tsx` → moved to `app/settings/models/page.tsx`

### Data Layer Changes
- Sessions loaded from backend (`/v1/catalog/list`) as primary source, localStorage as write-cache
- Add session deletion API call when backend endpoint is available
- Navigation: `useRouter` from Next.js App Router (already in use)

---

## Verification

After implementation, verify:
1. **Home:** Greeting renders correctly for time of day. Agent cards show all agents. Recent sessions show with preview. Empty state (no sessions) shows correctly.
2. **Launcher → Studio:** Transition animation plays (scale + fade). Agent name shows in Studio header.
3. **Studio:** Message sends. Thinking card appears with animated dot. Planning card updates in-place. Tool details collapsed, expands on click. User messages right-aligned, assistant left. Auto-scroll works, stops on user scroll.
4. **History:** All sessions listed, grouped by time. Search filters correctly. Agent filter pills work. [↗] opens correct session in Studio. Delete works.
5. **Settings:** Agents and models list correctly. Edit opens form. Form saves via backend. Delete works.
6. **Theme:** Light/dark toggle works. All tokens respect the theme.
7. **Mobile:** Nav collapses to bottom bar. Studio header remains visible. Input stays at viewport bottom. Slide-in panels work.
8. **Error states:** Backend offline → connection banner appears. Message fails → inline error shown.
