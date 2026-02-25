"use client";

import { useState } from "react";
import { PlanningMessageData, PlanningTask } from "@/lib/planning";
import {
    ClipboardList,
    Eye,
    PlusCircle,
    RefreshCcw,
    ListChecks,
    Flag,
    AlertTriangle,
    PlayCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Target,
    FileText
} from "lucide-react";

const ACTION_META = {
    create: { label: "Plan Created", icon: ClipboardList },
    update: { label: "Plan Updated", icon: RefreshCcw },
    view: { label: "Plan Overview", icon: Eye },
    add_task: { label: "Task Added", icon: PlusCircle },
    update_task: { label: "Task Updated", icon: ListChecks },
    start_task: { label: "Task Started", icon: PlayCircle },
    complete_task: { label: "Task Completed", icon: CheckCircle2 },
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
    const [isExpanded, setIsExpanded] = useState(false);
    
    const meta = ACTION_META[data.action];
    const Icon = meta.icon;
    const plan = data.plan;
    const task = data.task;
    const mainTitle = data.action === "add_task" || data.action === "update_task" || data.action === "start_task" || data.action === "complete_task"
        ? task?.name || "Task"
        : plan?.title || "Plan";
    const subtitle = data.action === "add_task" || data.action === "update_task" || data.action === "start_task" || data.action === "complete_task"
        ? task?.goal
        : plan?.goal;
    const status = plan?.status || task?.status || data.status;
    const tasks = plan?.tasks || (task ? [task] : []);
    const taskRows = buildTaskRows(tasks);
    
    // In rich mode, we show 1 task in collapsed view, and everything in expanded view
    const maxTasks = isExpanded ? taskRows.length : 1;
    const limitedTasks = taskRows.slice(0, maxTasks);
    const remainingCount = Math.max(0, taskRows.length - maxTasks);
    
    const planId = plan?.planId;
    const taskId = task?.taskId || data.taskId;
    const parentId = task?.parentId;
    const result = data.result || plan?.result || task?.result;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                        <Icon size={18} />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                            {meta.label}
                        </span>
                        <span className="text-[16px] font-bold text-foreground tracking-tight">
                            {mainTitle}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {status && <StatusBadge status={status} />}
                </div>
            </div>

            {data.error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-500">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>{data.error}</span>
                </div>
            )}

            {isExpanded && plan?.goal && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/40">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        <Target size={12} /> Plan Goal
                    </div>
                    <div className="text-[13px] text-foreground leading-relaxed">
                        {plan.goal}
                    </div>
                </div>
            )}

            {subtitle && !isExpanded && (
                <div className="text-[13px] text-muted-foreground leading-relaxed italic px-1">
                    "{subtitle}"
                </div>
            )}

            {isExpanded && (planId || taskId || parentId) && (
                <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {planId && (
                        <span className="px-3 py-1 rounded-lg bg-surface/50 border border-border/40">
                            Plan <span className="font-mono text-primary/80">{planId}</span>
                        </span>
                    )}
                    {taskId && (
                        <span className="px-3 py-1 rounded-lg bg-surface/50 border border-border/40">
                            Task <span className="font-mono text-primary/80">{taskId}</span>
                        </span>
                    )}
                </div>
            )}

            {result && isExpanded && (
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[13px] text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
                        <CheckCircle2 size={12} /> Execution Result
                    </div>
                    <div className="leading-relaxed">
                        {result}
                    </div>
                </div>
            )}

            {(limitedTasks.length > 0 || isExpanded) && (
                <div className={`flex flex-col gap-3 ${isExpanded ? "mt-2" : ""}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            {isExpanded ? "Task Hierarchy" : "Current Step"}
                        </span>
                        
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[10px] font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-md"
                        >
                            {isExpanded ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> View Details</>}
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {limitedTasks.map(({ task, depth, key }) => (
                            <TaskRow key={key} task={task} depth={depth} isDetailed={isExpanded} />
                        ))}
                    </div>
                    
                    {!isExpanded && remainingCount > 0 && (
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors text-left pl-1 underline decoration-dotted"
                        >
                            + {remainingCount} more tasks in progress...
                        </button>
                    )}
                </div>
            )}

            {isExpanded && data.taskCount !== undefined && (
                <div className="text-[11px] text-muted-foreground/50 italic px-1">
                    Structure: {data.taskCount} discrete tasks identified.
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

function TaskRow({ task, depth, isDetailed }: { task: PlanningTask; depth: number; isDetailed?: boolean }) {
    const status = task.status;
    return (
        <div className="flex items-start gap-3 transition-all" style={{ paddingLeft: depth * 16 }}>
            <div className={`mt-2 w-1.5 h-1.5 rounded-full ${status === 'done' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[13px] font-bold tracking-tight ${status === 'done' ? 'text-muted-foreground line-through opacity-60' : 'text-foreground'}`}>
                        {task.name || "Untitled task"}
                    </span>
                    {status && <StatusBadge status={status} />}
                </div>
                
                {isDetailed && task.goal && (
                    <div className="flex items-start gap-2 text-[11px] text-muted-foreground/80 leading-relaxed bg-surface/30 p-2 rounded-lg border border-border/30">
                        <Target size={12} className="mt-0.5 opacity-50 shrink-0" />
                        <span>{task.goal}</span>
                    </div>
                )}

                {isDetailed && task.description && (
                    <div className="flex items-start gap-2 text-[11px] text-muted-foreground/70 leading-relaxed px-2">
                        <FileText size={12} className="mt-0.5 opacity-40 shrink-0" />
                        <span>{task.description}</span>
                    </div>
                )}

                {isDetailed && task.result && (
                    <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400 px-2 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        {task.result}
                    </div>
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
