# Agent Console: Unified QA Certification & Automated Test Specification

This document serves as the absolute source of truth for certifying the Agent Console. it contains exhaustive, "no stones unturned" verification steps suitable for human QA and automated LLM-driven testing suites (Playwright/Cypress).

---

## 1. Infrastructure & Networking

Verify the integrity of the Console-Backend bridge and its resilience to failure.

- [ ] **Connectivity & Pulse**: Open `http://localhost:3000`. Locate the circular status indicator at the bottom-left sidebar.
  - [ ] `Verify` color is green and text is "System Online" with a subtle pulse.
- [ ] **Failover & Recovery**:
  1. Open `next.config.ts`. Change backend port `18080` to `9999`. Save.
  2. `Verify` UI turns red and reports "System Offline" within the heart-beat interval.
  3. Revert port to `18080`. Verify status restores to Green without page reload.
- [ ] **SSE Proxy Performance (Low-Level)**:
  - [ ] Verify `X-Accel-Buffering: no` and `Cache-Control: no-cache` are present on `/api/v1/events`.
  - [ ] Ensure the Next.js proxy doesn't buffer for streams exceeding 60 seconds.

## 2. Intelligence Catalogs (Discovery)

Verify data ingestion, rendering, and responsive behavior.

- [ ] **Discovery Audit**: Click **Explore** in the sidebar.
  - [ ] `Verify` bootstrapped agents (`echo_agent`, `shell_agent`) appear with correct descriptions and model logos.
  - [ ] `Verify` a 1col (mobile) -> 3col+ (desktop) responsive transition.
- [ ] **Management Audit**: Click **Models** under Management.
  - [ ] `Verify` Gemini/Qwen/DeepSeek cards exist.
- [ ] **Edge Cases**:
  - [ ] Verify "No results found" empty states exist when backend catalogs are empty.
  - [ ] Insert an agent with missing optional fields (no description). Verify the grid doesn't crash.

## 3. Dynamic Form Engine (`JsonForm`)

Verify the "Dynamic Intelligence" logic and scoped variable resolution.

- [ ] **Model Registration**: Click **New Model**. Fill fields and click **Create**. Verify the model appears instantly in the list.
- [ ] **Scoped Variable Resolution**: Click **New Agent**.
  - [ ] **$.root**: Verify Model ID dropdown filters based on the top-level agent data.
  - [ ] **$local**: Add Tool -> select `run_cmd`. Verify sibling `tool_name` triggers the parameter schema lookup.
  - [ ] **$^parent**: Verify nested array items can access parent-level config data correctly.
- [ ] **Race Conditions (Brutal Stress)**:
  - [ ] Click through a dropdown (e.g., `echo` -> `run_cmd` -> `echo`) as fast as possible.
  - [ ] `Verify` final fields match the *last* selection. No duplicate boxes or stutters.
- [ ] **Lookup Failures**: Mock a 500 error for a schema lookup. Verify the form shows a field-level error instead of crashing.
- [ ] **Validation Borders**: Click **Create** with blank required fields. Verify red borders and "Field is required" messages appear instantly.

## 4. Chat UX, Activity Feed & Real-Time Events

Verify the real-time event processing and the atomic deduplication machine.

- [ ] **Instant Feedback (The Deduplication Machine)**:
  - [ ] Send: "Hello".
  - [ ] `Verify` "Thinking..." appears in <100ms (Placeholder event).
  - [ ] `Verify` that when the real packet arrives, the placeholder is **decisive replaced**. There must be exactly 1 Entry per interaction.
- [ ] **Tool Call Visualization**: Send: "List current directory".
  - [ ] `Verify` a `Tool Call` block appears in the Activity Panel.
  - [ ] `Verify` states: `Initialized` -> `Executing (Args)` -> `Result`.
  - [ ] **CRITICAL**: Verify the `Invoking [tool]` block expands to show the tool parameters/arguments.
  - [ ] `Click` to expand and verify raw JSON/Shell output is legible in the Result block.
- [ ] **Streaming Consistency**: Verify text appears char-by-char (unbuffered) for long responses.
- [ ] **Chat Copy Functionality**:
  - [ ] Hover over a user message. `Verify` a small "Copy" button appears.
  - [ ] `Click` Copy. `Verify` button label changes to "Copied" with a green checkmark for 2 seconds.
  - [ ] `Paste` into a notepad. `Verify` the exact message text was copied.
  - [ ] Hover over an assistant message. `Verify` both "Copy" and "Raw/Preview" buttons appear.
  - [ ] `Click` Copy on an assistant message. `Verify` the raw markdown text is copied.

## 5. Session Lifecycle & Persistence

Verify state integrity during resets and reloads.

- [ ] **Reset & Cleanup (Fixed)**:
  1. During an active chat with multiple activity nodes:
  2. `Click` the **Reset** button in the header.
  3. `Verify` both Chat and Activity (Timeline) panels are cleared instantly.
  4. `Verify` the URL resets to `/agents/[id]` without a session ID.
- [ ] **Server-Driven Fresh Start**:
  - [ ] Start a chat in a clean URL. `Verify` the server assigns a `threadId` on the first turn.
  - [ ] `Verify` the browser URL updates to the permanent thread ID.
- [ ] **Fresh Navigation Proofing (Regression)**:
  - [ ] Open a direct link to an agent (e.g., `/agents/echo_agent`) without any query parameters.
  - [ ] `Verify` the "Loading agent console..." splash screen disappears and the UI renders the agent header (Name, Avatar).
- [ ] **Persistence**:
  - [ ] `Cmd+R` during a run. Verify chat and activity return in the correct order.
- [ ] **History Reconstruction**: Go to **History**. Select an old session. Verify all historical "Thoughts" and "Tool Calls" are fully replayed in the Activity Panel.

## 6. UI/UX "Apple Principles" & Stability

Verify the premium "Studio" feel and memory integrity.

- [ ] **Design Polish**: Verify smooth theme transitions (Light/Dark) do not break glassmorphism or contrast.
- [ ] **Layout Shifts (CLS)**: Verify adding tools doesn't cause the "Update Agent" button to jump or disappear.
- [ ] **Storage Resilience**: Fill `localStorage`. Verify the console doesn't crash and shows a descriptive error if persistence fails.
- [ ] **Cross-Tab Sync**: Verify Tab A reflects config changes from Tab B immediately (or warns about stale data).

---

**Automated Testing Note**: This document serves as the prompt specification for LLM testing agents. When running automated verification, the agent should attempt to "break" the form using the boundary conditions listed above.
