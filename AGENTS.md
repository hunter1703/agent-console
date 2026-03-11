# Agent Console: Design & Implementation Standards

This document defines the core philosophies and technical patterns that govern the Agent Console. It synthesizes premium design principles with rigorous implementation standards to ensure a consistent, "Apple-like" studio experience.

## 1. Design Philosophy

The Agent Console is built on the principle of **Aesthetic Integrity**. Every UI element must clearly reflect its function, prioritizing simplicity and immediate feedback.

### Core Tenets

- **Minimalism**: Strip away unnecessary elements. Focus on essential functionality to reduce cognitive load and user frustration.
- **Immediate Feedback**: Provide subtle but clear feedback for every action (e.g., the "Thinking..." state, pulse animations, and interactive hover effects).
- **Direct Manipulation**: Allow users to interact directly with content. The interface should feel alive and responsive, using familiar metaphors to bridge the gap between real-world concepts and digital tools.
- **Hierarchy & Consistency**: Information is organized into clear, structured layouts. Standard UI elements are used predictably across the platform to ensure a seamless "magical" experience.

---

## 2. Entity Management & Interface Patterns

To maintain data integrity while providing a user-friendly experience, all entity relationships (Agents, Models, tools) follow a standardized binding pattern.

### The "ID-Name" Protocol

Across the platform, selection fields and dropdowns adhere to a strict separation of display and storage:

1. **Display `name`**: Users always interact with human-readable names (e.g., "Gemini-3-Flash") in dropdowns and forms.
2. **Store `id`**: The system internally stores and transmits UUIDs or identifiers (e.g., `gemini-3-flash`) for all API requests and model definitions.
3. **Automated Discovery**: Dropdowns are dynamically populated using the `/v1/catalog/list` API, ensuring that only currently available entities are selectable.

### Implementation Specifics

- **Agent Form**: Model selection is handled via a dynamic dropdown. Users see the friendly model name; the system binds the selection to the backend-required Model ID.
- **Model Form**: All relationships between models, providers, and parameters are handled through these selection patterns, removing the need for manual, error-prone ID entry.

---

## 3. Data Integrity & API Sync

- **Catalog Integration**: The frontend acts as a thin, intelligent layer over the `/v1/catalog` endpoints.
- **Consistency**: Centralized implementation ensures that the same lookup logic applies to Agents, Models, and Tool configurations.
- **Maintainability**: By using IDs for logic and Names for display, we ensure that backend migrations or renames do not break existing UI bindings.

---

## 4. Maintenance & QA Policy

To ensure long-term integrity of the Agent Console, all non-trivial code changes must include automated test coverage.

### **Bug Fix Protocol**

1. **New Tests Required**: If a bug is fixed, add or update at least one automated test that fails before the fix and passes after it.
2. **Accepted Test Types**: Use either unit/integration tests (logic-level) or Playwright E2E tests (behavior-level), based on where the bug lives.
3. **Strengthen Existing Coverage**: If a bug escaped existing tests, improve assertions and/or add lower-level checks to prevent recurrence.
4. **No Doc-Only Substitution**: Documentation updates never replace required automated tests.
