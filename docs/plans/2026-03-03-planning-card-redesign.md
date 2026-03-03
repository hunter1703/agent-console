# Planning Card Redesign & Event Stitching Fix

**Date:** 2026-03-03
**Status:** Approved

---

## Problem

### 1. Task ID Stitching Bug

`create_plan` delivers tasks with names but no IDs (IDs are assigned server-side). When `start_task` fires with `{task_id: "uuid"}` and no name, the current promotion logic fails to connect the incoming ID to an existing named task. It creates a **phantom ID-only row** while the named placeholder remains as a permanent "todo" stub.

Root cause: `extractDiscoveredTasks` only extracts name-ID pairs from the *current* event's content (e.g., `next_task` hints from `complete_task` results). `start_task` results contain no name information. The name-match promotion logic never fires.

### 2. Visual Problems

The current card is over-engineered:
- "Snapshot Sync: HH:MM" footer — meaningless theater
- Action badge ("Plan Created", "Task Started") mutates on every update — confusing
- Plan ID shown in header — technical noise
- `rounded-[28px]` + rainbow gradient + glassmorphism — overwrought
- `text-[10px] font-black uppercase tracking-[0.3em]` labels everywhere — forced
- "Hide Map / Show Map" jargon

---

## Solution

### Logic: Sequential Promotion (lib/planning.ts)

When `applyUpdate` in `mergePlanningData` receives a task with an ID that:
1. Doesn't match any existing ID in `taskMap`, AND
2. Has no name to match by name

→ Find the **first todo task** (identified by a `name:` prefix key = no ID assigned yet) and **promote** it: assign the incoming ID, delete the old key, merge the update.

This works because the agent almost always works through tasks in declared order.

```
Before start_task("2dba347f-"):
  taskMap["name:Protagonist Profile"] = { name, status: "todo" }
  taskMap["name:Secondary Characters"] = { name, status: "todo" }

After start_task("2dba347f-"):
  taskMap["2dba347f-..."] = { name: "Protagonist Profile", status: "in_progress" }
  taskMap["name:Secondary Characters"] = { name, status: "todo" }
```

`view_plan` remains the authoritative reconciliation path — it returns the full server state with all IDs and is already handled correctly (full replace).

### All 8 Tool Handlers

| Tool | Behavior | Status |
|---|---|---|
| `create_plan` | Create plan + tasks (name-only, no IDs), status: todo | ✅ already correct |
| `start_task` | Sequential promotion of first todo task to in_progress | 🔧 fix needed |
| `complete_task` | Sequential promotion of first in_progress task to done + store result | 🔧 fix needed |
| `add_task` | Get task_id from result, create new task with that ID | ✅ already correct |
| `update_plan` | Merge title/goal into existing plan | ✅ already correct |
| `update_task_info` | Update task fields — only non-blank values applied | ✅ already correct |
| `view_plan` | Full snapshot replace from server | ✅ already correct |
| `finish_plan` | Mark plan status as done/abandoned | ✅ already correct |

### Visual: Document-Style Card

**Removed:**
- "Snapshot Sync" footer text
- Action badge (Plan Created, Task Started, etc.)
- Plan ID in header
- Rainbow gradient stripe
- Glassmorphism / excessive backdrop-blur
- "Hide Map / Show Map" jargon
- Excessive uppercase tracking labels

**Card structure:**
```
┌──────────────────────────────────────────────┐
│  Valiant King Story            [In Progress] │
│  Create a short story about a valiant king   │
│                                              │
│  ████████░░░░░░░░  2 / 6 tasks               │
│                                              │
│  ✓  Protagonist Profile                      │
│     Create protagonist profile               │  ← goal, always visible, muted
│                                              │
│  ●  Character Profiles        ← active       │
│     Define all character profiles            │
│                                              │
│  ○  Theme                                    │
│     Determine the core theme                 │
└──────────────────────────────────────────────┘
```

**Task row hierarchy:**
- **Always visible**: task name (primary) + goal (small, muted)
- **On click/hover**: description (if any) + result (if completed)

**Task states:**
- `todo`: grey dot, muted text
- `in_progress`: pulsing blue dot, full-weight text, subtle left border accent
- `done`: green checkmark, dimmed + strikethrough name, click to reveal result
- `abandoned`: amber indicator, dimmed text

**Plan status badge (top-right):**
- `todo` → grey "To Do"
- `in_progress` → blue "In Progress"
- `done` → green "Completed"
- `abandoned` → amber "Abandoned"

---

## Files to Change

| File | Change |
|---|---|
| `lib/planning.ts` | Fix sequential promotion in `mergePlanningData` |
| `components/PlanningMessage.tsx` | Full visual redesign — document-style |

No changes to `adapters/aguiAdapter.ts` or `app/agents/[id]/page.tsx`.
