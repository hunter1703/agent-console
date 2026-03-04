"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, CircleDot, AlertTriangle } from "lucide-react";
import { PlanningMessageData, PlanningTask } from "@/lib/planning";

/** Build a flat, depth-annotated list of tasks for hierarchical rendering. */
function buildTaskRows(tasks: PlanningTask[]) {
    if (!tasks.length) return [];

    const childrenMap = new Map<string, PlanningTask[]>();
    const knownIds = new Set(tasks.map((t) => t.taskId).filter(Boolean));

    tasks.forEach((task) => {
        const parentId =
            task.parentId && knownIds.has(task.parentId) ? task.parentId : "root";
        const siblings = childrenMap.get(parentId) ?? [];
        siblings.push(task);
        childrenMap.set(parentId, siblings);
    });

    const rows: { task: PlanningTask; depth: number; key: string }[] = [];

    const walk = (parentId: string, depth: number) => {
        (childrenMap.get(parentId) ?? []).forEach((child, i) => {
            rows.push({
                task: child,
                depth,
                key:
                    child.taskId ??
                    (child.name ? `name:${child.name}` : `${parentId}-${i}`),
            });
            if (child.taskId) walk(child.taskId, depth + 1);
        });
    };

    walk("root", 0);
    return rows;
}

export default function PlanningCard({ data }: { data: PlanningMessageData }) {
    const plan = data.plan;
    const task = data.task;

    const planTitle = plan?.title || "Plan";
    const planGoal = plan?.goal;

    const tasks = useMemo(
        () => plan?.tasks ?? (task ? [task] : []),
        [plan?.tasks, task]
    );
    const rows = useMemo(() => buildTaskRows(tasks), [tasks]);

    const doneCount = tasks.filter((t) => t.status === "done").length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

    return (
        <div
            className={[
                "message-enter w-full rounded-[var(--radius-lg)] overflow-hidden",
                "bg-surface border border-border",
                "shadow-[var(--shadow-sm)]",
            ].join(" ")}
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
                <h3
                    className="text-[15px] font-semibold text-foreground leading-snug"
                    style={{ letterSpacing: "-0.01em" }}
                >
                    {planTitle}
                </h3>

                {planGoal && (
                    <p className="mt-1 text-[13px] text-muted leading-relaxed">
                        {planGoal}
                    </p>
                )}

                {data.error && (
                    <div className="mt-2 flex items-start gap-2 text-[12px] text-red px-3 py-2 bg-red/5 border border-red/15 rounded-[var(--radius-sm)]">
                        <AlertTriangle size={12} className="mt-px shrink-0" />
                        {data.error}
                    </div>
                )}

                {/* Progress bar — only when there are tasks */}
                {totalCount > 0 && (
                    <div className="mt-3">
                        <div className="h-[3px] bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {doneCount} / {totalCount}
                        </p>
                    </div>
                )}
            </div>

            {/* Task list */}
            {rows.length > 0 && (
                <>
                    <div className="h-px bg-border mx-4" />
                    <ul className="px-3 py-2 flex flex-col gap-0.5">
                        {rows.map(({ task: t, depth, key }) => (
                            <TaskRow
                                key={key}
                                task={t}
                                depth={depth}
                                isActive={!!t.taskId && t.taskId === data.taskId}
                            />
                        ))}
                    </ul>
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
    const isDone = task.status === "done";
    const isInProgress = task.status === "in_progress";

    return (
        <li
            className={[
                "flex items-start gap-2.5 px-2 py-1.5 rounded-[var(--radius-sm)]",
                isInProgress ? "bg-primary/[0.06]" : "",
                "fade-enter",
            ].join(" ")}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
            {/* Status icon */}
            <span className="mt-[3px] shrink-0">
                {isDone ? (
                    <CheckCircle2 size={13} className="text-green" />
                ) : isInProgress ? (
                    <CircleDot size={13} className="text-primary animate-pulse" />
                ) : (
                    <Circle size={13} className="text-border" />
                )}
            </span>

            {/* Task name + goal */}
            <div className="flex-1 min-w-0">
                <span
                    className={[
                        "text-[13px] font-medium leading-snug",
                        isDone
                            ? "line-through text-muted-foreground"
                            : isInProgress
                            ? "text-primary font-semibold"
                            : "text-foreground/75",
                    ].join(" ")}
                >
                    {task.name || "Task"}
                </span>

                {task.goal && !isDone && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {task.goal}
                    </p>
                )}
            </div>
        </li>
    );
}
