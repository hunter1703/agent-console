export type PlanningToolName =
    | "create_plan"
    | "update_plan"
    | "add_task"
    | "update_task"
    | "start_task"
    | "complete_task"
    | "update_task_info"
    | "update_task_status"
    | "finish_plan"
    | "view_plan";

export type PlanningAction =
    | "create"
    | "update"
    | "view"
    | "add_task"
    | "update_task"
    | "start_task"
    | "complete_task"
    | "finish";

export interface PlanningTask {
    taskId?: string;
    parentId?: string;
    name?: string;
    goal?: string;
    description?: string;
    status?: string;
    result?: string;
}

export interface PlanningPlan {
    planId?: string;
    title?: string;
    goal?: string;
    status?: string;
    result?: string;
    tasks?: PlanningTask[];
}

export interface PlanningMessageData {
    toolName: PlanningToolName;
    action: PlanningAction;
    plan?: PlanningPlan;
    task?: PlanningTask;
    taskId?: string;
    taskCount?: number;
    status?: string;
    result?: string;
    error?: string;
    raw?: string;
}

const PLANNING_TOOL_NAMES = new Set<PlanningToolName>([
    "create_plan",
    "update_plan",
    "add_task",
    "update_task",
    "start_task",
    "complete_task",
    "update_task_info",
    "update_task_status",
    "finish_plan",
    "view_plan"
]);

export function isPlanningTool(toolName: string): toolName is PlanningToolName {
    return PLANNING_TOOL_NAMES.has(toolName as PlanningToolName);
}

export function buildPlanningMessage(
    toolName: string,
    resultContent: string,
    argsContent?: string
): PlanningMessageData | null {
    if (!isPlanningTool(toolName)) return null;

    const resultPayload = parseJson(resultContent);
    const argsPayload = parseJson(argsContent);
    const error = getError(resultPayload);
    const raw = resultContent || argsContent || "";
    const planId = getString(argsPayload?.plan_id || argsPayload?.planId || resultPayload?.plan_id || resultPayload?.planId);

    // Heuristic: Extract Name-ID mappings from common result strings
    const discoveredTasks = extractDiscoveredTasks(resultContent) || [];

    switch (toolName) {
        case "create_plan": {
            const plan = normalizePlan(argsPayload) || {};
            plan.status = "todo"; 
            if (planId && !plan.planId) {
                plan.planId = planId;
            }
            const taskCount = getNumber(resultPayload?.task_count) ?? plan.tasks?.length;
            return {
                toolName,
                action: "create",
                plan,
                taskCount,
                error,
                raw
            };
        }
        case "update_plan": {
            const plan = normalizePlan(argsPayload) || {};
            if (planId && !plan.planId) {
                plan.planId = planId;
            }
            return {
                toolName,
                action: "update",
                plan,
                error,
                raw
            };
        }
        case "add_task": {
            const task = normalizeTask(argsPayload) || {};
            const taskId = getString(resultPayload?.task_id || resultPayload?.taskId) || task.taskId;
            if (taskId) {
                task.taskId = taskId;
            }
            if (!task.status) {
                task.status = "todo";
            }
            return {
                toolName,
                action: "add_task",
                task,
                taskId,
                error,
                raw
            };
        }
        case "update_task":
        case "update_task_info":
        case "update_task_status": {
            const task = normalizeTask(argsPayload) || {};
            const taskId = getString(argsPayload?.task_id || argsPayload?.taskId || resultPayload?.task_id || resultPayload?.taskId) || task.taskId;
            if (taskId) {
                task.taskId = taskId;
            }
            const status = normalizeStatus(argsPayload?.status) || normalizeStatus(resultPayload?.status);
            if (status) {
                task.status = status;
            }
            if (argsPayload?.result && !task.result) {
                task.result = getString(argsPayload?.result);
            }
            // Check discovered tasks to see if we can find a name for this ID
            const discovered = discoveredTasks.find(dt => dt.taskId === taskId);
            if (discovered?.name && !task.name) {
                task.name = discovered.name;
            }

            return {
                toolName,
                action: "update_task",
                task,
                taskId,
                status,
                error,
                raw
            };
        }
        case "start_task": {
            const task = normalizeTask(argsPayload) || {};
            const taskId = getString(argsPayload?.task_id || argsPayload?.taskId || resultPayload?.task_id || resultPayload?.taskId) || task.taskId;
            if (taskId) {
                task.taskId = taskId;
            }
            const status = normalizeStatus(argsPayload?.status) || normalizeStatus(resultPayload?.status) || "in_progress";
            
            const discovered = discoveredTasks.find(dt => dt.taskId === taskId);
            if (discovered?.name && !task.name) {
                task.name = discovered.name;
            }

            task.status = status;
            return {
                toolName,
                action: "start_task",
                task,
                taskId,
                status,
                error,
                raw
            };
        }
        case "complete_task": {
            const task = normalizeTask(argsPayload) || {};
            const taskId = getString(argsPayload?.task_id || argsPayload?.taskId || resultPayload?.task_id || resultPayload?.taskId) || task.taskId;
            if (taskId) {
                task.taskId = taskId;
            }
            const status = normalizeStatus(argsPayload?.status) || normalizeStatus(resultPayload?.status) || "done";
            if (argsPayload?.result && !task.result) {
                task.result = getString(argsPayload?.result);
            }

            const discovered = discoveredTasks.find(dt => dt.taskId === taskId);
            if (discovered?.name && !task.name) {
                task.name = discovered.name;
            }

            task.status = status;
            return {
                toolName,
                action: "complete_task",
                task,
                taskId,
                status,
                error,
                raw
            };
        }
        case "finish_plan": {
            const plan = normalizePlan(argsPayload) || {};
            const status = "done"; 
            plan.status = status;
            if (argsPayload?.result && !plan.result) {
                plan.result = getString(argsPayload?.result);
            }
            return {
                toolName,
                action: "finish",
                plan,
                status,
                // Result removed to prevent redundant standalone messages
                error,
                raw
            };
        }
        case "view_plan": {
            const plan = normalizePlan(resultPayload);
            if (plan && planId && !plan.planId) {
                plan.planId = planId;
            }
            const derivedError = error || (!plan && !resultPayload ? "No active plan found" : undefined);
            return {
                toolName,
                action: "view",
                plan,
                error: derivedError,
                raw
            };
        }
        default:
            return null;
    }
}

/**
 * Robust task merging that handles Name -> ID promotions.
 * Fixes duplication where name-only tasks are treated as separate from ID-only updates.
 */
export function mergePlanningData(
    oldData: PlanningMessageData,
    newData: PlanningMessageData
): PlanningMessageData {
    if (newData.action === "create") return newData;

    if (newData.action === "view" && newData.plan) {
        return newData;
    }

    const oldPlan = oldData.plan || {};
    const newPlan = newData.plan || {};
    const taskMap = new Map<string, PlanningTask>();
    
    // 1. Seed with old tasks
    (oldPlan.tasks || []).forEach(t => {
        const id = t.taskId || `name:${t.name}`;
        taskMap.set(id, t);
    });

    // 2. Local recursive merge helper
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

            // SEQUENTIAL PROMOTION: Only valid for start_task / complete_task.
            // add_task inserts a brand-new record — never promote a placeholder.
            if (!existing) {
                const action = newData.action;
                if (action === 'start_task' || action === 'complete_task') {
                    const entries = Array.from(taskMap.entries());
                    let toPromote: [string, PlanningTask] | undefined;
                    if (action === 'complete_task') {
                        // Promote the first in_progress placeholder (no fallback to todo).
                        toPromote = entries.find(
                            ([k, v]) => k.startsWith('name:') && v.status === 'in_progress'
                        );
                    } else {
                        // start_task: promote first todo / no-status placeholder.
                        toPromote = entries.find(
                            ([k, v]) => k.startsWith('name:') && (!v.status || v.status === 'todo')
                        );
                    }
                    if (toPromote) {
                        const [promoteKey, promoteTask] = toPromote;
                        existing = promoteTask;
                        existingKey = promoteKey;
                        // Remove old name-keyed slot; will be re-inserted under the server-assigned ID below.
                        taskMap.delete(promoteKey);
                    }
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

    // 3. Process new plan tasks
    (newPlan.tasks || []).forEach(applyUpdate);

    // 4. Process individual task update
    const activeUpdate = newData.task || (newData.taskId ? { taskId: newData.taskId, status: newData.status, result: newData.result } : undefined);
    if (activeUpdate) {
        applyUpdate(activeUpdate);
    }

    const mergedTasks = Array.from(taskMap.values());
    
    // 5. Build merged metadata
    const mergedPlan: PlanningPlan = {
        ...oldPlan,
        ...newPlan,
        title: newPlan.title || oldPlan.title,
        goal: newPlan.goal || oldPlan.goal,
        status: newPlan.status || oldPlan.status,
        tasks: mergedTasks
    };

    // 6. Plan status transitions
    const hasProgress = mergedTasks.some(t => t.status === 'in_progress' || t.status === 'done');
    if (mergedPlan.status === 'todo' && hasProgress) {
        mergedPlan.status = 'in_progress';
    }
    if (newData.action === "finish") {
        mergedPlan.status = "done";
    }

    const mergedTask = activeUpdate?.taskId 
        ? taskMap.get(activeUpdate.taskId) 
        : (activeUpdate || oldData.task);

    return {
        ...newData,
        plan: mergedPlan,
        task: mergedTask,
        taskId: activeUpdate?.taskId || newData.taskId || oldData.taskId,
        status: newData.status || oldData.status,
        result: newData.result || oldData.result
    };
}

function mergeTasks(existing: PlanningTask | undefined, update: PlanningTask): PlanningTask {
    if (!existing) return update;
    return {
        ...existing,
        ...update,
        name: getString(update.name) || existing.name,
        goal: getString(update.goal) || existing.goal,
        description: getString(update.description) || existing.description,
        status: update.status || existing.status,
        result: getString(update.result) || existing.result,
    };
}

/**
 * Extracts Name-ID pairs from strings like "[UUID] (Name)" or "task UUID (Name)"
 */
function extractDiscoveredTasks(content: string): PlanningTask[] | undefined {
    if (!content) return undefined;
    const tasks: PlanningTask[] = [];
    
    // Match [UUID] (Name) or task UUID (Name)
    const matches = content.matchAll(/[\[\s]([a-f0-9-]{36})[\]\s]\s*\(([^)]+)\)/gi);
    for (const match of matches) {
        tasks.push({
            taskId: match[1],
            name: match[2]
        });
    }

    return tasks.length > 0 ? tasks : undefined;
}

function parseJson(value?: string) {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
}

function normalizePlan(value: any): PlanningPlan | undefined {
    if (!value || typeof value !== "object") return undefined;
    const tasks = Array.isArray(value.tasks)
        ? value.tasks
        .map(normalizeTask)
        .filter((task: PlanningTask | undefined): task is PlanningTask => Boolean(task && hasTaskContent(task)))
        : undefined;
    return {
        planId: getString(value.planId || value.plan_id || value.id),
        title: getString(value.title),
        goal: getString(value.goal),
        status: normalizeStatus(value.status),
        result: getString(value.result),
        tasks: tasks && tasks.length > 0 ? tasks : undefined
    };
}

function normalizeTask(value: any): PlanningTask | undefined {
    if (!value || typeof value !== "object") return undefined;
    return {
        taskId: getString(value.taskId || value.task_id || value.id),
        parentId: getString(value.parentId || value.parent_id || value.parent),
        name: getString(value.name),
        goal: getString(value.goal),
        description: getString(value.description || value.desc),
        status: normalizeStatus(value.status),
        result: getString(value.result)
    };
}

function normalizeStatus(value?: string) {
    if (!value || typeof value !== "string") return undefined;
    return value.trim().toLowerCase();
}

function getError(value: any) {
    if (!value || typeof value !== "object") return undefined;
    return typeof value.error === "string" ? value.error : undefined;
}

function getString(value: any) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
}

function getNumber(value: any) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function hasTaskContent(task: PlanningTask) {
    return Boolean(task.taskId || task.name || task.goal || task.status || task.result);
}

function sortPlanningTasks(tasks: PlanningTask[]) {
    return [...tasks].sort((a, b) => {
        const aKey = a.taskId ?? "";
        const bKey = b.taskId ?? "";
        if (aKey && bKey) return aKey.localeCompare(bKey);
        if (aKey) return -1;
        if (bKey) return 1;
        return 0;
    });
}
