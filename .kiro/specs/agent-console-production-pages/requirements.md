# Requirements Document

## Introduction

This document specifies requirements for building production-ready web application pages for the Agent Console. The console provides a modern, animated, user-friendly interface for interacting with AI agents through the Agent Engine REST API (Java/Quarkus backend at localhost:8080).

All foundational building blocks are complete: components, animations, widgets, state management, and themes. This spec focuses on assembling these blocks into four core pages: Dashboard, Chat Interface, Agent Management, and Session Browser. Each page integrates key backend features including dynamic forms, SSE streaming, planning tools, confirmation requests, tool execution display, and multi-agent sessions.

The design strictly follows Unseen.co principles: 90% grayscale, smooth animations, generous spacing, and playful interactions. Multiple design alternatives are provided for each page to ensure production-ready quality with comprehensive error handling, loading states, and empty states.

## Glossary

- **Agent_Console**: The Next.js 16 + React 19 + TypeScript frontend application
- **Agent_Engine**: The Java/Quarkus REST API backend running at localhost:8080
- **Dashboard**: Landing page showing agent overview and recent session activity
- **Chat_Interface**: Full conversation page with streaming responses and tool execution
- **Agent_Management**: Page for creating and editing agents using dynamic forms
- **Session_Browser**: Page displaying all conversations with parent-child hierarchy
- **Dynamic_Form**: Form generated from `/schema` API supporting CREATE/EDIT/VIEW modes
- **SSE_Stream**: Server-Sent Events stream delivering AGUI events in real-time
- **AGUI_Event**: Agent UI event types (RunStarted, TextMessageChunk, ToolCallStart, etc.)
- **Planning_Tool**: Backend tools (create_plan, update_task) with patch updates
- **Confirmation_Request**: User approval mechanism with DECISION/TEXT kinds
- **Tool_Execution**: Display of tool calls with arguments and results using inline widgets
- **Multi_Agent_Session**: Conversation with parent-child agent relationships shown in tabs
- **Session**: Persistent conversation thread auto-created on first message
- **Technical_Builder**: User persona who creates and configures agents
- **End_User**: User persona who interacts with agents through conversations
- **Unseen_Design**: Design principles emphasizing 90% grayscale, smooth animations, generous spacing
- **Empty_State**: UI shown when no data exists with helpful guidance
- **Loading_State**: UI shown during async operations with animated indicators
- **Error_State**: UI shown when operations fail with recovery options

## Requirements

### Requirement 1: Dashboard Landing Page

**User Story:** As an End User, I want a dashboard overview, so that I can quickly access my agents and recent conversations.

#### Acceptance Criteria

1. THE Dashboard SHALL display a hero section with welcome message and primary CTA
2. THE Dashboard SHALL show a grid of available agents with name, avatar, description, and last used timestamp
3. THE Dashboard SHALL display recent sessions list with agent name, last message preview, and timestamp
4. WHEN no agents exist, THE Dashboard SHALL show an empty state with "Create Your First Agent" CTA
5. WHEN no sessions exist, THE Dashboard SHALL show an empty state with "Start a Conversation" guidance
6. THE Dashboard SHALL provide quick action buttons: "New Chat", "Create Agent", "View All Sessions"
7. THE Dashboard SHALL display agent statistics: total agents, total sessions, messages today
8. THE Dashboard SHALL animate agent cards on hover with lift effect and scale transform
9. THE Dashboard SHALL animate recent sessions on hover with background color transition
10. THE Dashboard SHALL load agent data from `/api/agents` endpoint with loading skeleton
11. THE Dashboard SHALL load session data from `/api/sessions` endpoint with loading skeleton
12. IF agent loading fails, THEN THE Dashboard SHALL show error state with retry button
13. IF session loading fails, THEN THE Dashboard SHALL show error state with retry button
14. THE Dashboard SHALL navigate to Chat Interface when agent card is clicked
15. THE Dashboard SHALL navigate to Session Browser when "View All Sessions" is clicked
16. THE Dashboard SHALL navigate to Agent Management when "Create Agent" is clicked
17. THE Dashboard SHALL use Framer Motion for all entrance animations with stagger effect
18. THE Dashboard SHALL follow Unseen.co spacing principles with 24px minimum gaps
19. THE Dashboard SHALL be fully responsive from 320px to 2560px viewport width
20. THE Dashboard SHALL maintain 90% grayscale color scheme with amber accents in light mode

### Requirement 2: Chat Interface with Streaming

**User Story:** As an End User, I want a full-featured chat interface, so that I can have natural conversations with agents and see their work in real-time.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display a centered conversation column with 768px maximum width
2. THE Chat_Interface SHALL show message history with user messages right-aligned and agent messages left-aligned
3. THE Chat_Interface SHALL render markdown in agent messages including code blocks, lists, and emphasis
4. THE Chat_Interface SHALL display a message input textarea at the bottom with send button
5. THE Chat_Interface SHALL connect to SSE stream at `/api/sessions/{sessionId}/stream` on mount
6. WHEN RunStarted event is received, THE Chat_Interface SHALL show typing indicator
7. WHEN TextMessageChunk event is received, THE Chat_Interface SHALL append text to current message
8. WHEN ToolCallStart event is received, THE Chat_Interface SHALL display tool execution widget
9. WHEN ToolCallEnd event is received, THE Chat_Interface SHALL update widget with results
10. WHEN ConfirmationRequestedEvent is received, THE Chat_Interface SHALL show confirmation card
11. WHEN user confirms, THE Chat_Interface SHALL send ConfirmedEvent to `/api/sessions/{sessionId}/confirm`
12. THE Chat_Interface SHALL display planning cards when create_plan or update_task tools are used
13. THE Chat_Interface SHALL update planning cards in real-time with patch updates
14. THE Chat_Interface SHALL show multi-agent sessions in tabbed view with parent-child hierarchy
15. THE Chat_Interface SHALL auto-scroll to bottom when new messages arrive
16. THE Chat_Interface SHALL disable input during agent response with visual feedback
17. THE Chat_Interface SHALL show "Regenerate" button on agent messages for retry
18. THE Chat_Interface SHALL show "Copy" button on code blocks with success feedback
19. THE Chat_Interface SHALL animate new messages with fade-in-up transition (150ms)
20. THE Chat_Interface SHALL animate tool widgets with scale-up entrance (200ms)
21. THE Chat_Interface SHALL animate confirmation cards with slide-in-right (250ms)
22. IF SSE connection fails, THEN THE Chat_Interface SHALL show reconnection UI with retry
23. IF message send fails, THEN THE Chat_Interface SHALL show error toast with retry option
24. WHEN session is empty, THE Chat_Interface SHALL show empty state with suggested prompts
25. THE Chat_Interface SHALL create new session on first message via POST `/api/sessions`
26. THE Chat_Interface SHALL load session history from `/api/sessions/{sessionId}/messages`
27. THE Chat_Interface SHALL support keyboard shortcuts: Enter to send, Shift+Enter for newline
28. THE Chat_Interface SHALL show character count when message exceeds 80% of limit
29. THE Chat_Interface SHALL follow Unseen.co animation principles with spring physics
30. THE Chat_Interface SHALL maintain responsive layout on mobile with full-width messages

### Requirement 3: Agent Management with Dynamic Forms

**User Story:** As a Technical Builder, I want to create and edit agents using dynamic forms, so that I can configure agent capabilities without writing code.

#### Acceptance Criteria

1. THE Agent_Management SHALL display a list of existing agents with edit and delete actions
2. THE Agent_Management SHALL provide "Create New Agent" button navigating to creation form
3. THE Agent_Management SHALL fetch form schema from `/api/schema?type=agent&mode=CREATE`
4. THE Agent_Management SHALL render dynamic form fields based on schema field types
5. THE Agent_Management SHALL support text input fields with validation rules from schema
6. THE Agent_Management SHALL support textarea fields for long-form content
7. THE Agent_Management SHALL support select dropdowns with options from schema
8. THE Agent_Management SHALL support multi-select fields with tag-style display
9. THE Agent_Management SHALL support checkbox fields for boolean values
10. THE Agent_Management SHALL support number input fields with min/max validation
11. THE Agent_Management SHALL support lookup fields using @UiLookup annotation data
12. THE Agent_Management SHALL display field labels, descriptions, and required indicators
13. THE Agent_Management SHALL show inline validation errors below fields
14. THE Agent_Management SHALL disable submit button until form is valid
15. THE Agent_Management SHALL show loading state on submit button during save
16. WHEN creating agent, THE Agent_Management SHALL POST form data to `/api/agents`
17. WHEN editing agent, THE Agent_Management SHALL PUT form data to `/api/agents/{id}`
18. WHEN deleting agent, THE Agent_Management SHALL show confirmation dialog before DELETE
19. IF save succeeds, THEN THE Agent_Management SHALL show success toast and navigate to list
20. IF save fails, THEN THE Agent_Management SHALL show error toast with validation details
21. THE Agent_Management SHALL load agent data for editing from `/api/agents/{id}`
22. THE Agent_Management SHALL support VIEW mode with read-only form fields
23. THE Agent_Management SHALL animate form field entrance with stagger (50ms per field)
24. THE Agent_Management SHALL animate validation errors with shake effect
25. THE Agent_Management SHALL show empty state when no agents exist with "Create First Agent" CTA
26. THE Agent_Management SHALL display agent count and filter/search controls
27. THE Agent_Management SHALL support searching agents by name or description
28. THE Agent_Management SHALL follow Unseen.co spacing with 16px padding in form containers
29. THE Agent_Management SHALL use generous 24px gaps between form sections
30. THE Agent_Management SHALL be fully responsive with single-column layout on mobile

### Requirement 4: Session Browser with Hierarchy

**User Story:** As an End User, I want to view all my conversations, so that I can find and resume past interactions.

#### Acceptance Criteria

1. THE Session_Browser SHALL display a list of all sessions sorted by last activity
2. THE Session_Browser SHALL show session card with agent name, last message preview, and timestamp
3. THE Session_Browser SHALL display parent-child session relationships with visual indentation
4. THE Session_Browser SHALL show session status indicator (active, completed, error)
5. THE Session_Browser SHALL provide search input filtering sessions by content or agent name
6. THE Session_Browser SHALL support sorting by: newest, oldest, most messages, agent name
7. THE Session_Browser SHALL load sessions from `/api/sessions` with pagination
8. THE Session_Browser SHALL implement infinite scroll loading more sessions on scroll
9. THE Session_Browser SHALL show loading skeleton while fetching sessions
10. WHEN session card is clicked, THE Session_Browser SHALL navigate to Chat Interface
11. THE Session_Browser SHALL provide delete action on session cards with confirmation
12. WHEN deleting session, THE Session_Browser SHALL send DELETE to `/api/sessions/{id}`
13. THE Session_Browser SHALL show empty state when no sessions exist with "Start Chatting" CTA
14. THE Session_Browser SHALL display total session count and filter status
15. THE Session_Browser SHALL animate session cards on hover with lift and shadow
16. THE Session_Browser SHALL animate session deletion with fade-out and collapse (300ms)
17. THE Session_Browser SHALL animate new sessions appearing with slide-in-up (200ms)
18. IF session loading fails, THEN THE Session_Browser SHALL show error state with retry
19. IF session deletion fails, THEN THE Session_Browser SHALL show error toast and restore card
20. THE Session_Browser SHALL show child sessions nested under parent with connecting lines
21. THE Session_Browser SHALL support expanding/collapsing parent sessions to show/hide children
22. THE Session_Browser SHALL display message count badge on each session card
23. THE Session_Browser SHALL show agent avatar on session cards for visual identification
24. THE Session_Browser SHALL truncate long message previews with ellipsis (100 characters max)
25. THE Session_Browser SHALL format timestamps as relative time (2 hours ago, yesterday, etc.)
26. THE Session_Browser SHALL follow Unseen.co spacing with 12px gaps between session cards
27. THE Session_Browser SHALL use 16px padding in session card containers
28. THE Session_Browser SHALL be fully responsive with single-column layout on mobile
29. THE Session_Browser SHALL support keyboard navigation through session list
30. THE Session_Browser SHALL maintain scroll position when returning from Chat Interface

### Requirement 5: Tool Execution Display

**User Story:** As an End User, I want to see tool execution details, so that I understand what the agent is doing.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display tool execution widgets inline in conversation
2. THE Tool_Execution widget SHALL show tool name as heading
3. THE Tool_Execution widget SHALL display tool arguments in collapsible JSON viewer
4. THE Tool_Execution widget SHALL show execution status: pending, running, success, error
5. THE Tool_Execution widget SHALL display animated spinner during execution
6. THE Tool_Execution widget SHALL show execution duration in milliseconds
7. WHEN tool succeeds, THE Tool_Execution widget SHALL display results in formatted view
8. WHEN tool fails, THE Tool_Execution widget SHALL display error message with details
9. THE Tool_Execution widget SHALL support expanding/collapsing arguments and results
10. THE Tool_Execution widget SHALL use syntax highlighting for JSON arguments and results
11. THE Tool_Execution widget SHALL animate status transitions with color fade (200ms)
12. THE Tool_Execution widget SHALL show success state with green accent color
13. THE Tool_Execution widget SHALL show error state with red accent color
14. THE Tool_Execution widget SHALL show pending state with amber accent color
15. THE Tool_Execution widget SHALL follow Unseen.co design with subtle borders and spacing
16. THE Tool_Execution widget SHALL be fully responsive with horizontal scroll for wide JSON
17. THE Tool_Execution widget SHALL provide copy button for arguments and results
18. THE Tool_Execution widget SHALL display tool icon if available from backend
19. THE Tool_Execution widget SHALL show retry button for failed tool executions
20. THE Tool_Execution widget SHALL maintain collapsed state preference per tool type

### Requirement 6: Planning Tool Integration

**User Story:** As an End User, I want to see agent planning in real-time, so that I understand the agent's approach to complex tasks.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display planning cards when create_plan tool is executed
2. THE Planning_Card SHALL show plan title and description at top
3. THE Planning_Card SHALL display task list with task IDs, descriptions, and status
4. THE Planning_Card SHALL show task status indicators: not_started, in_progress, completed
5. THE Planning_Card SHALL update tasks in real-time when update_task tool is executed
6. THE Planning_Card SHALL apply patch updates to task status without full reload
7. THE Planning_Card SHALL animate task status changes with color transition (300ms)
8. THE Planning_Card SHALL show progress bar indicating completed vs total tasks
9. THE Planning_Card SHALL display task hierarchy with indentation for subtasks
10. THE Planning_Card SHALL support expanding/collapsing task groups
11. THE Planning_Card SHALL show task timestamps for started and completed times
12. THE Planning_Card SHALL use green accent for completed tasks
13. THE Planning_Card SHALL use amber accent for in-progress tasks
14. THE Planning_Card SHALL use gray for not-started tasks
15. THE Planning_Card SHALL follow Unseen.co spacing with 16px padding
16. THE Planning_Card SHALL animate entrance with scale-up and fade-in (250ms)
17. THE Planning_Card SHALL be fully responsive with single-column layout on mobile
18. THE Planning_Card SHALL show task count summary (3 of 5 completed)
19. THE Planning_Card SHALL display plan creation timestamp
20. THE Planning_Card SHALL support copying plan as markdown

### Requirement 7: Confirmation Request Handling

**User Story:** As an End User, I want to approve agent actions, so that I maintain control over important decisions.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display confirmation cards when ConfirmationRequestedEvent is received
2. THE Confirmation_Card SHALL show confirmation message prominently
3. THE Confirmation_Card SHALL display confirmation kind: DECISION or TEXT
4. WHEN kind is DECISION, THE Confirmation_Card SHALL show Approve and Reject buttons
5. WHEN kind is TEXT, THE Confirmation_Card SHALL show text input with Submit button
6. THE Confirmation_Card SHALL disable all buttons during submission
7. THE Confirmation_Card SHALL show loading spinner on clicked button
8. WHEN user approves, THE Confirmation_Card SHALL send ConfirmedEvent with approved=true
9. WHEN user rejects, THE Confirmation_Card SHALL send ConfirmedEvent with approved=false
10. WHEN user submits text, THE Confirmation_Card SHALL send ConfirmedEvent with text value
11. THE Confirmation_Card SHALL animate entrance with slide-in-right (250ms)
12. THE Confirmation_Card SHALL animate exit with fade-out (200ms) after submission
13. THE Confirmation_Card SHALL use amber accent color for attention
14. THE Confirmation_Card SHALL show warning icon for important confirmations
15. THE Confirmation_Card SHALL follow Unseen.co design with generous padding
16. THE Confirmation_Card SHALL be fully responsive with stacked buttons on mobile
17. IF confirmation submission fails, THEN THE Confirmation_Card SHALL show error and re-enable buttons
18. THE Confirmation_Card SHALL display confirmation context if provided by backend
19. THE Confirmation_Card SHALL show timeout countdown if confirmation has time limit
20. THE Confirmation_Card SHALL auto-reject if timeout expires without user action

### Requirement 8: Multi-Agent Session Display

**User Story:** As an End User, I want to see multi-agent conversations clearly, so that I understand which agent is responding.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display tabs for parent and child agent sessions
2. THE Chat_Interface SHALL show parent session in first tab labeled with parent agent name
3. THE Chat_Interface SHALL show child sessions in additional tabs with child agent names
4. THE Chat_Interface SHALL indicate active tab with accent color underline
5. THE Chat_Interface SHALL load messages for active tab only to optimize performance
6. WHEN switching tabs, THE Chat_Interface SHALL animate tab transition with fade (200ms)
7. THE Chat_Interface SHALL show unread message badge on inactive tabs
8. THE Chat_Interface SHALL display agent avatar in tab label for visual identification
9. THE Chat_Interface SHALL support closing child session tabs with X button
10. THE Chat_Interface SHALL show tab count indicator when more than 5 tabs exist
11. THE Chat_Interface SHALL support horizontal scroll for many tabs on mobile
12. THE Chat_Interface SHALL maintain tab order: parent first, then children by creation time
13. THE Chat_Interface SHALL animate new tab appearance with slide-in-right (200ms)
14. THE Chat_Interface SHALL follow Unseen.co design with subtle tab borders
15. THE Chat_Interface SHALL be fully responsive with scrollable tabs on narrow screens
16. THE Chat_Interface SHALL show loading state when switching tabs
17. THE Chat_Interface SHALL preserve scroll position per tab
18. THE Chat_Interface SHALL display parent-child relationship indicator in tab
19. THE Chat_Interface SHALL support keyboard navigation between tabs (Ctrl+Tab)
20. THE Chat_Interface SHALL show tooltip with full agent name on tab hover

### Requirement 9: Error Handling and Recovery

**User Story:** As a user, I want clear error messages and recovery options, so that I can resolve issues without frustration.

#### Acceptance Criteria

1. THE Agent_Console SHALL display error toast notifications for failed operations
2. THE Agent_Console SHALL show error state UI when page data fails to load
3. THE Agent_Console SHALL provide retry button on error states
4. THE Agent_Console SHALL display specific error messages from backend API responses
5. THE Agent_Console SHALL show network error message when API is unreachable
6. THE Agent_Console SHALL display validation errors inline on form fields
7. THE Agent_Console SHALL show error summary at top of forms with multiple errors
8. THE Agent_Console SHALL animate error messages with shake effect (300ms)
9. THE Agent_Console SHALL use red accent color for error states
10. THE Agent_Console SHALL log errors to console for debugging
11. IF SSE connection drops, THEN THE Agent_Console SHALL show reconnection UI
12. IF SSE reconnection fails after 3 attempts, THEN THE Agent_Console SHALL show manual retry
13. THE Agent_Console SHALL display timeout errors for long-running operations
14. THE Agent_Console SHALL show 404 error page for invalid routes
15. THE Agent_Console SHALL show 500 error page for server errors with support contact
16. THE Agent_Console SHALL preserve user input when form submission fails
17. THE Agent_Console SHALL provide "Report Issue" link on error pages
18. THE Agent_Console SHALL follow Unseen.co design for error states with generous spacing
19. THE Agent_Console SHALL be accessible with ARIA labels on error messages
20. THE Agent_Console SHALL auto-dismiss success toasts after 3 seconds

### Requirement 10: Loading States and Skeletons

**User Story:** As a user, I want to see loading indicators, so that I know the application is working.

#### Acceptance Criteria

1. THE Agent_Console SHALL display loading skeletons while fetching page data
2. THE Agent_Console SHALL show skeleton cards matching final content layout
3. THE Agent_Console SHALL animate skeletons with shimmer effect
4. THE Agent_Console SHALL display spinner on buttons during async operations
5. THE Agent_Console SHALL show typing indicator during agent responses
6. THE Agent_Console SHALL display progress bar for file uploads
7. THE Agent_Console SHALL show loading overlay on modals during save operations
8. THE Agent_Console SHALL animate loading state transitions with fade (200ms)
9. THE Agent_Console SHALL use neutral gray for skeleton backgrounds
10. THE Agent_Console SHALL follow Unseen.co animation principles for loading states
11. THE Agent_Console SHALL show loading text for operations exceeding 2 seconds
12. THE Agent_Console SHALL display estimated time remaining for long operations
13. THE Agent_Console SHALL provide cancel button for cancellable operations
14. THE Agent_Console SHALL show loading state in page title for background tabs
15. THE Agent_Console SHALL be accessible with ARIA live regions for loading announcements
16. THE Agent_Console SHALL maintain layout stability during loading (no content shift)
17. THE Agent_Console SHALL show partial content as it loads (progressive rendering)
18. THE Agent_Console SHALL display loading state for infinite scroll pagination
19. THE Agent_Console SHALL show loading indicator on search input during debounced search
20. THE Agent_Console SHALL use consistent loading animation duration (1.5s shimmer cycle)

### Requirement 11: Empty States with Guidance

**User Story:** As a user, I want helpful empty states, so that I know what to do when no data exists.

#### Acceptance Criteria

1. THE Agent_Console SHALL display empty state when no data exists for a view
2. THE Empty_State SHALL show descriptive illustration or icon
3. THE Empty_State SHALL display helpful heading explaining the empty state
4. THE Empty_State SHALL provide descriptive text with guidance on next steps
5. THE Empty_State SHALL show primary CTA button for creating first item
6. THE Empty_State SHALL show secondary action links for alternative paths
7. THE Dashboard SHALL show empty state for agents with "Create Your First Agent" CTA
8. THE Dashboard SHALL show empty state for sessions with "Start a Conversation" guidance
9. THE Session_Browser SHALL show empty state with "No conversations yet" message
10. THE Chat_Interface SHALL show empty state with suggested prompts for new sessions
11. THE Agent_Management SHALL show empty state with "Build Your First Agent" CTA
12. THE Empty_State SHALL animate entrance with fade-in-up (300ms)
13. THE Empty_State SHALL follow Unseen.co design with generous spacing
14. THE Empty_State SHALL use neutral colors with subtle accent on CTA
15. THE Empty_State SHALL be fully responsive with centered layout
16. THE Empty_State SHALL show different messages for filtered vs truly empty views
17. THE Empty_State SHALL provide "Clear Filters" button when filters cause empty result
18. THE Empty_State SHALL display helpful tips or feature highlights in empty state
19. THE Empty_State SHALL be accessible with proper heading hierarchy
20. THE Empty_State SHALL show loading state before displaying empty state

### Requirement 12: Responsive Design and Mobile Support

**User Story:** As a user on any device, I want a responsive interface, so that I can use the console on desktop, tablet, and mobile.

#### Acceptance Criteria

1. THE Agent_Console SHALL be fully responsive from 320px to 2560px viewport width
2. THE Agent_Console SHALL use mobile-first responsive design approach
3. THE Agent_Console SHALL display single-column layout on mobile (< 768px)
4. THE Agent_Console SHALL display two-column layout on tablet (768px - 1024px)
5. THE Agent_Console SHALL display multi-column layout on desktop (> 1024px)
6. THE Agent_Console SHALL hide sidebar on mobile and show hamburger menu
7. THE Agent_Console SHALL use full-width messages on mobile Chat Interface
8. THE Agent_Console SHALL stack form fields vertically on mobile
9. THE Agent_Console SHALL use larger touch targets (44px minimum) on mobile
10. THE Agent_Console SHALL support touch gestures: swipe to delete, pull to refresh
11. THE Agent_Console SHALL disable hover effects on touch devices
12. THE Agent_Console SHALL use viewport-relative font sizes for fluid typography
13. THE Agent_Console SHALL maintain readable line length (45-75 characters) on all screens
14. THE Agent_Console SHALL use responsive spacing scaling with viewport size
15. THE Agent_Console SHALL support landscape and portrait orientations on mobile
16. THE Agent_Console SHALL hide non-essential UI elements on small screens
17. THE Agent_Console SHALL use bottom sheet modals on mobile instead of centered dialogs
18. THE Agent_Console SHALL support safe area insets for notched devices
19. THE Agent_Console SHALL be tested on iOS Safari, Chrome Android, and desktop browsers
20. THE Agent_Console SHALL maintain 60fps animations on mobile devices

### Requirement 13: Accessibility Compliance

**User Story:** As a user with disabilities, I want an accessible interface, so that I can use the console effectively.

#### Acceptance Criteria

1. THE Agent_Console SHALL meet WCAG 2.1 Level AA standards
2. THE Agent_Console SHALL maintain 4.5:1 contrast ratio for normal text
3. THE Agent_Console SHALL maintain 3:1 contrast ratio for large text and UI components
4. THE Agent_Console SHALL provide keyboard navigation for all interactive elements
5. THE Agent_Console SHALL show visible focus indicators on keyboard navigation
6. THE Agent_Console SHALL support screen readers with proper ARIA labels
7. THE Agent_Console SHALL use semantic HTML elements (header, nav, main, article)
8. THE Agent_Console SHALL provide alt text for all images and icons
9. THE Agent_Console SHALL announce dynamic content changes with ARIA live regions
10. THE Agent_Console SHALL support browser zoom up to 200% without breaking layout
11. THE Agent_Console SHALL respect prefers-reduced-motion for animations
12. THE Agent_Console SHALL provide skip links for keyboard navigation
13. THE Agent_Console SHALL use proper heading hierarchy (h1, h2, h3)
14. THE Agent_Console SHALL label all form inputs with associated label elements
15. THE Agent_Console SHALL show validation errors in accessible manner
16. THE Agent_Console SHALL support high contrast mode
17. THE Agent_Console SHALL provide text alternatives for color-coded information
18. THE Agent_Console SHALL make modals and dialogs keyboard-accessible with focus trap
19. THE Agent_Console SHALL announce loading states to screen readers
20. THE Agent_Console SHALL be tested with NVDA, JAWS, and VoiceOver screen readers

### Requirement 14: Performance Optimization

**User Story:** As a user, I want fast page loads and smooth interactions, so that the console feels responsive.

#### Acceptance Criteria

1. THE Agent_Console SHALL achieve Lighthouse performance score above 90
2. THE Agent_Console SHALL load initial page in under 2 seconds on 3G connection
3. THE Agent_Console SHALL achieve First Contentful Paint under 1.5 seconds
4. THE Agent_Console SHALL achieve Time to Interactive under 3 seconds
5. THE Agent_Console SHALL use code splitting for route-based lazy loading
6. THE Agent_Console SHALL implement virtual scrolling for long lists (> 100 items)
7. THE Agent_Console SHALL debounce search input with 300ms delay
8. THE Agent_Console SHALL cache API responses with appropriate TTL
9. THE Agent_Console SHALL use optimistic UI updates for instant feedback
10. THE Agent_Console SHALL prefetch data for likely next navigation
11. THE Agent_Console SHALL compress images and use modern formats (WebP, AVIF)
12. THE Agent_Console SHALL minimize bundle size with tree shaking
13. THE Agent_Console SHALL use React.memo for expensive component renders
14. THE Agent_Console SHALL implement pagination for large data sets
15. THE Agent_Console SHALL use CSS transforms for animations (GPU acceleration)
16. THE Agent_Console SHALL avoid layout thrashing in animation loops
17. THE Agent_Console SHALL maintain 60fps during all animations
18. THE Agent_Console SHALL use service worker for offline support
19. THE Agent_Console SHALL implement request deduplication for concurrent requests
20. THE Agent_Console SHALL monitor performance with Web Vitals metrics

### Requirement 15: Design System Consistency

**User Story:** As a user, I want consistent design across all pages, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE Agent_Console SHALL use consistent color palette across all pages
2. THE Agent_Console SHALL maintain 90% grayscale with 10% accent colors
3. THE Agent_Console SHALL use amber (#F59E0B) as primary accent in light mode
4. THE Agent_Console SHALL use near-white (#FAFAFA) as primary accent in dark mode
5. THE Agent_Console SHALL use consistent typography scale across all pages
6. THE Agent_Console SHALL use consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
7. THE Agent_Console SHALL use consistent border radius (4px, 8px, 12px, 16px)
8. THE Agent_Console SHALL use consistent shadow system (sm, md, lg, xl)
9. THE Agent_Console SHALL use consistent animation durations (150ms, 200ms, 250ms, 300ms)
10. THE Agent_Console SHALL use consistent easing curves (ease-out, ease-in-out)
11. THE Agent_Console SHALL use consistent button styles across all pages
12. THE Agent_Console SHALL use consistent form input styles across all pages
13. THE Agent_Console SHALL use consistent card styles across all pages
14. THE Agent_Console SHALL use consistent modal styles across all pages
15. THE Agent_Console SHALL use consistent toast notification styles
16. THE Agent_Console SHALL use consistent loading indicator styles
17. THE Agent_Console SHALL use consistent empty state styles
18. THE Agent_Console SHALL use consistent error state styles
19. THE Agent_Console SHALL follow Unseen.co spacing principles on all pages
20. THE Agent_Console SHALL maintain design consistency in both light and dark themes
