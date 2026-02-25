"use client";

import { PlanningMessageData, PlanningTask } from "@/lib/planning";
import {
    ClipboardList,
    Eye,
    PlusCircle,
    RefreshCcw,
    ListChecks,
    Flag,
    AlertTriangle
} from "lucide-react";

const ACTION_META = {
    create: { label: "Plan Created", icon: ClipboardList },
    update: { label: "Plan Updated", icon: RefreshCcw },
    view: { label: "Plan Overview", icon: Eye },
    add_task: { label: "Task Added", icon: PlusCircle },
    update_task: { label: "Task Updated", icon: ListChecks },
    finish: { label: "Plan Finished", icon: Flag }
} as const;

const STATUS_LABELS: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    abandoned: "Abandoned",
    unknown: "Unknown"
};

const STATUS_STYLES: Record<string, string> = {
    todo: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    in_progress: "bg-primary/15 text-primary",
    done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    abandoned: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    unknown: "bg-muted/15 text-muted-foreground"
};

const TASK_LIMIT = 6;

export default function PlanningMessage({ data }: { data: PlanningMessageData }) {
    const meta = ACTION_META[data.action];
    const Icon = meta.icon;
    const plan = data.plan;
    const task = data.task;
    const mainTitle = data.action === "add_task" || data.action === "update_task"
        ? task?.name || "Task"
        : plan?.title || "Plan";
    const subtitle = data.action === "add_task" || data.action === "update_task"
        ? task?.goal
        : plan?.goal;
    const status = plan?.status || task?.status || data.status;
    const tasks = plan?.tasks || (task ? [task] : []);
    const taskRows = buildTaskRows(tasks);
    const maxTasks = data.action === "view" || data.action === "create" ? TASK_LIMIT : 1;
    const limitedTasks = taskRows.slice(0, maxTasks);
    const remainingCount = Math.max(0, taskRows.length - maxTasks);
    const planId = plan?.planId;
    const taskId = task?.taskId || data.taskId;
    const parentId = task?.parentId;
    const result = data.result || plan?.result || task?.result;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Icon size={14} />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/70">
                            {meta.label}
                        </span>
                        <span className="text-[14px] font-semibold text-foreground mt-1">
                            {mainTitle}
                        </span>
                    </div>
                </div>
                {status && <StatusBadge status={status} />}
            </div>

            {data.error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-500">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>{data.error}</span>
                </div>
            )}

            {subtitle && (
                <div className="text-[12px] text-muted-foreground leading-relaxed">
                    {subtitle}
                </div>
            )}

            {(planId || taskId || parentId) && (
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                    {planId && (
                        <span className="px-2.5 py-1 rounded-full bg-surface/80 border border-border/60">
                            Plan <span className="font-mono normal-case">{planId}</span>
                        </span>
                    )}
                    {taskId && (
                        <span className="px-2.5 py-1 rounded-full bg-surface/80 border border-border/60">
                            Task <span className="font-mono normal-case">{taskId}</span>
                        </span>
                    )}
                    {parentId && (
                        <span className="px-2.5 py-1 rounded-full bg-surface/80 border border-border/60">
                            Parent <span className="font-mono normal-case">{parentId}</span>
                        </span>
                    )}
                </div>
            )}

            {result && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-600 dark:text-emerald-400">
                    {result}
                </div>
            )}

            {limitedTasks.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                        Tasks
                    </span>
                    <div className="flex flex-col gap-2">
                        {limitedTasks.map(({ task, depth, key }) => (
                            <TaskRow key={key} task={task} depth={depth} />
                        ))}
                    </div>
                    {remainingCount > 0 && (
                        <span className="text-[11px] text-muted-foreground/60">
                            +{remainingCount} more tasks
                        </span>
                    )}
                </div>
            )}

            {data.taskCount !== undefined && data.action === "create" && (
                <div className="text-[11px] text-muted-foreground/70">
                    {data.taskCount} tasks in this plan
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.trim().toLowerCase();
    const label = STATUS_LABELS[normalized] || status;
    const style = STATUS_STYLES[normalized] || STATUS_STYLES.unknown;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${style}`}>
            {label}
        </span>
    );
}

function TaskRow({ task, depth }: { task: PlanningTask; depth: number }) {
    const status = task.status;
    return (
        <div className="flex items-start gap-2" style={{ paddingLeft: depth * 14 }}>
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-semibold text-foreground">
                        {task.name || "Untitled task"}
                    </span>
                    {status && <StatusBadge status={status} />}
                </div>
                {task.goal && (
                    <span className="text-[11px] text-muted-foreground/80 leading-relaxed">
                        {task.goal}
                    </span>
                )}
                {task.result && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        {task.result}
                    </span>
                )}
            </div>
        </div>
    );
}

function buildTaskRows(tasks: PlanningTask[]) {
    if (!tasks.length) return [];
    const childrenMap = new Map<string, PlanningTask[]>();
    const knownIds = new Set<string>();

    tasks.forEach(task => {
        if (task.taskId) {
            knownIds.add(task.taskId);
        }
    });

    tasks.forEach(task => {
        const parentId = task.parentId && knownIds.has(task.parentId) ? task.parentId : "root";
        const siblings = childrenMap.get(parentId) || [];
        siblings.push(task);
        childrenMap.set(parentId, siblings);
    });

    const rows: { task: PlanningTask; depth: number; key: string }[] = [];

    const walk = (parentId: string, depth: number) => {
        const children = childrenMap.get(parentId) || [];
        children.forEach((child, index) => {
            const key = child.taskId || `${parentId}-${index}`;
            rows.push({ task: child, depth, key });
            if (child.taskId && childrenMap.has(child.taskId)) {
                walk(child.taskId, depth + 1);
            }
        });
    };

    walk("root", 0);
    return rows;
}
