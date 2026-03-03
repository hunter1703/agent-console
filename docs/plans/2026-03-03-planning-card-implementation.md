# Planning Card Redesign & Event Stitching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the task ID stitching bug and redesign the planning card to be clean, elegant, and document-style.

**Architecture:** Two isolated changes — (1) a surgical fix to `mergePlanningData` in `lib/planning.ts` that adds sequential promotion when an incoming task ID doesn't match any existing task, and (2) a full visual rewrite of `components/PlanningMessage.tsx` with a document-style card.

**Tech Stack:** TypeScript, React, Next.js, Tailwind CSS, lucide-react

---

## Task 1: Fix Sequential Promotion in `lib/planning.ts`

**Files:**
- Modify: `lib/planning.ts` (lines 277–303, the `applyUpdate` inner function inside `mergePlanningData`)

**Context:**

`create_plan` stores tasks as `name:`-prefixed keys (no IDs). When `start_task` fires with `{task_id: "uuid"}` and no name, the current name-match promotion never fires (no name to match). A new phantom ID-only row gets created instead of promoting the existing named placeholder.

Fix: add a third fallback that finds the first `name:`-prefixed task with `in_progress` status (for complete_task), or `todo` status (for start_task), and promotes it.

**Step 1: Open the file and locate `applyUpdate`**

In `lib/planning.ts`, find the `applyUpdate` function defined inside `mergePlanningData` (around line 277). It currently ends after the name-match promotion block:

```typescript
// PROMOTION LOGIC: If ID not found, check if an ID-less task has a matching name
if (!existing) {
    const entries = Array.from(taskMap.entries());
    const nameKey = entries.find(([k, v]) => !v.taskId && v.name && v.name === update.name)?.[0];
    if (nameKey) {
        existing = taskMap.get(nameKey);
        taskMap.delete(nameKey);
    }
}
```

**Step 2: Add sequential promotion block immediately after the existing name-match block**

The full updated `applyUpdate` function body should look like this:

```typescript
function applyUpdate(update: PlanningTask) {
    let existing: PlanningTask | undefined;
    let existingKey: string | undefined;

    if (update.taskId) {
        existing = taskMap.get(update.taskId);
        existingKey = update.taskId;

        // PROMOTION LOGIC: If ID not found, check if an ID-less task has a matching name
        if (!existing) {
            const entries = Array.from(taskMap.entries());
            const nameKey = entries.find(([k, v]) => !v.taskId && v.name && v.name === update.name)?.[0];
            if (nameKey) {
                existing = taskMap.get(nameKey);
                taskMap.delete(nameKey);
            }
        }

        // SEQUENTIAL PROMOTION: If still not found, promote the first nameless in_progress
        // task (for complete_task), or first todo task (for start_task).
        // Tasks without IDs are keyed as "name:TaskName" in the map.
        if (!existing) {
            const entries = Array.from(taskMap.entries());
            const inProgressEntry = entries.find(
                ([k, v]) => k.startsWith('name:') && v.status === 'in_progress'
            );
            const todoEntry = entries.find(
                ([k, v]) => k.startsWith('name:') && (!v.status || v.status === 'todo')
            );
            const toPromote = inProgressEntry || todoEntry;
            if (toPromote) {
                existing = toPromote[1];
                taskMap.delete(toPromote[0]);
            }
        }
    } else if (update.name) {
        const nameKey = `name:${update.name}`;
        existing = taskMap.get(nameKey);
        existingKey = nameKey;
    }

    const merged = mergeTasks(existing, update);
    const finalKey = merged.taskId || existingKey || `name:${merged.name}`;
    taskMap.set(finalKey, merged);
}
```

**Step 3: Verify manually**

Open the app, send a message that triggers the story agent (or any agent with planning tools). Confirm:
- After `create_plan`: tasks appear with their names, all "todo"
- After `start_task`: the first task shows as "In Progress" (not a new phantom row)
- After `complete_task`: the first task shows as "Completed" with the result attached
- After `view_plan`: the full plan snapshot reconciles correctly

**Step 4: Commit**

```bash
git add lib/planning.ts
git commit -m "fix: sequential task ID promotion in mergePlanningData"
```

---

## Task 2: Redesign `components/PlanningMessage.tsx`

**Files:**
- Modify: `components/PlanningMessage.tsx` (full rewrite)

**Context:**

Replace the entire component with a clean document-style card. Removed: action badge, "Snapshot Sync" footer, Plan ID in header, rainbow gradient, glassmorphism, uppercase-everything labels. Added: clean status badge, goal shown under each task name, result expandable on click.

**Step 1: Replace the entire file contents**

Replace `components/PlanningMessage.tsx` with:

```tsx
"use client";

import { useState, useMemo } from "react";
import { PlanningMessageData, PlanningTask } from "@/lib/planning";
import { CheckCircle2, Circle, ChevronRight, AlertTriangle } from "lucide-react";

const PLAN_STATUS: Record<string, { label: string; className: string }> = {
    todo:        { label: "To Do",      className: "bg-muted/20 text-muted-foreground border-border/40" },
    in_progress: { label: "In Progress", className: "bg-primary/10 text-primary border-primary/25" },
    done:        { label: "Completed",  className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
    abandoned:   { label: "Abandoned",  className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25" },
};

export default function PlanningMessage({ data }: { data: PlanningMessageData }) {
    const plan = data.plan;
    const task = data.task;

    const planTitle = plan?.title || "Plan";
    const planGoal  = plan?.goal;
    const planStatus = plan?.status || "todo";

    const tasks   = useMemo(() => plan?.tasks || (task ? [task] : []), [plan?.tasks, task]);
    const rows    = useMemo(() => buildTaskRows(tasks), [tasks]);

    const doneCount  = tasks.filter(t => t.status === "done").length;
    const totalCount = tasks.length;
    const progress   = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const statusMeta = PLAN_STATUS[planStatus] || PLAN_STATUS.todo;

    return (
        <div className="rounded-xl border border-border/50 bg-surface/60 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-foreground leading-snug tracking-tight">
                        {planTitle}
                    </h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.className}`}>
                        {statusMeta.label}
                    </span>
                </div>

                {planGoal && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {planGoal}
                    </p>
                )}

                {data.error && (
                    <div className="flex items-start gap-2 text-[12px] text-rose-500 bg-rose-500/8 border border-rose-500/20 rounded-lg px-3 py-2">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        <span>{data.error}</span>
                    </div>
                )}

                {totalCount > 0 && (
                    <div className="space-y-1">
                        <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 font-medium">
                            {doneCount} / {totalCount} tasks
                        </p>
                    </div>
                )}
            </div>

            {/* Task list */}
            {rows.length > 0 && (
                <>
                    <div className="h-px bg-border/30 mx-5" />
                    <div className="px-3 py-3 space-y-0.5">
                        {rows.map(({ task: t, depth, key }) => (
                            <TaskRow
                                key={key}
                                task={t}
                                depth={depth}
                                isActive={t.taskId ? t.taskId === data.taskId : false}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function TaskRow({
    task,
    depth,
    isActive,
}: {
    task: PlanningTask;
    depth: number;
    isActive: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    const isDone       = task.status === "done";
    const isInProgress = task.status === "in_progress";
    const hasDetail    = Boolean(task.description || (isDone && task.result));

    return (
        <div style={{ paddingLeft: depth * 18 }}>
            <button
                onClick={() => hasDetail && setExpanded(e => !e)}
                className={[
                    "w-full flex items-start gap-3 px-2 py-2 rounded-lg text-left transition-colors",
                    isInProgress
                        ? "bg-primary/5 border-l-2 border-l-primary pl-[6px]"
                        : hasDetail
                        ? "hover:bg-secondary/30 cursor-pointer"
                        : "cursor-default",
                ].join(" ")}
            >
                {/* Status dot */}
                <div className="mt-[3px] shrink-0 w-4 flex items-center justify-center">
                    {isDone ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : isInProgress ? (
                        <span className="relative flex w-2.5 h-2.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping" />
                            <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-primary" />
                        </span>
                    ) : (
                        <Circle size={13} className="text-border" />
                    )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={[
                            "text-[13px] font-medium leading-snug",
                            isDone
                                ? "line-through text-muted-foreground/40"
                                : isInProgress
                                ? "text-foreground"
                                : "text-foreground/70",
                        ].join(" ")}>
                            {task.name || "Task"}
                        </span>
                        {hasDetail && (
                            <ChevronRight
                                size={11}
                                className={[
                                    "text-muted-foreground/30 transition-transform shrink-0",
                                    expanded ? "rotate-90" : "",
                                ].join(" ")}
                            />
                        )}
                    </div>
                    {task.goal && (
                        <p className={[
                            "text-[11px] leading-snug mt-0.5",
                            isDone
                                ? "text-muted-foreground/25"
                                : "text-muted-foreground/55",
                        ].join(" ")}>
                            {task.goal}
                        </p>
                    )}
                </div>
            </button>

            {/* Expandable detail */}
            {expanded && hasDetail && (
                <div className="ml-9 mr-2 mb-1 px-3 py-2.5 rounded-lg bg-secondary/20 border border-border/20 space-y-2">
                    {task.description && (
                        <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
                            {task.description}
                        </p>
                    )}
                    {task.result && (
                        <p className={[
                            "text-[12px] text-foreground/65 leading-relaxed italic",
                            task.description ? "border-t border-border/20 pt-2" : "",
                        ].join(" ")}>
                            {task.result}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function buildTaskRows(tasks: PlanningTask[]) {
    if (!tasks.length) return [];

    const childrenMap = new Map<string, PlanningTask[]>();
    const knownIds    = new Set(tasks.map(t => t.taskId).filter(Boolean));

    tasks.forEach(task => {
        const parentId = task.parentId && knownIds.has(task.parentId) ? task.parentId : "root";
        const siblings = childrenMap.get(parentId) ?? [];
        siblings.push(task);
        childrenMap.set(parentId, siblings);
    });

    const rows: { task: PlanningTask; depth: number; key: string }[] = [];

    const walk = (parentId: string, depth: number) => {
        (childrenMap.get(parentId) ?? []).forEach((child, i) => {
            rows.push({ task: child, depth, key: child.taskId ?? `${parentId}-${i}` });
            if (child.taskId) walk(child.taskId, depth + 1);
        });
    };

    walk("root", 0);
    return rows;
}
```

**Step 2: Verify visually**

Run the dev server:
```bash
npm run dev
```

Send a message to an agent that uses planning tools. Confirm:
- Card looks like a document: title, status badge, goal text, thin progress bar, task list
- Active task has a left border accent and pulsing dot
- Completed tasks are dimmed with strikethrough
- Clicking a completed task expands to show result
- Goal text appears under each task name in muted style
- No "Snapshot Sync", no action badge, no Plan ID clutter

**Step 3: Commit**

```bash
git add components/PlanningMessage.tsx
git commit -m "feat: redesign planning card to document-style with task goal display"
```

---

## Final Verification

After both tasks are committed, do an end-to-end check with the reference SSE stream events from the design doc:

1. `create_plan` → card appears, all tasks listed as "To Do"
2. `start_task` → first task becomes "In Progress" (NOT a new phantom row)
3. `complete_task` → first task becomes "Completed", result accessible on click
4. Repeat for remaining tasks through `view_plan` and `finish_plan`
5. Plan status badge transitions: To Do → In Progress → Completed

---

## Notes

- No test infrastructure exists in this project; verification is manual via the dev server
- `adapters/aguiAdapter.ts` and `app/agents/[id]/page.tsx` require no changes
- The `update_task_info` blank-guard is already handled correctly by `mergeTasks` via `getString()`
- `view_plan` already does a full replace (handled correctly); no changes needed
