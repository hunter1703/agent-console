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

    switch (toolName) {
        case "create_plan": {
            const plan = normalizePlan(argsPayload) || {};
            if (!plan.status) {
                plan.status = "in_progress";
            }
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
            const status = normalizeStatus(argsPayload?.status || resultPayload?.final_state);
            const plan = normalizePlan(argsPayload) || {};
            if (status) {
                plan.status = status;
            }
            if (argsPayload?.result && !plan.result) {
                plan.result = getString(argsPayload?.result);
            }
            return {
                toolName,
                action: "finish",
                plan,
                status,
                result: plan.result,
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

export function mergePlanningData(
    oldData: PlanningMessageData,
    newData: PlanningMessageData
): PlanningMessageData {
    // If it's a create_plan, we start fresh
    if (newData.action === "create") return newData;

    // Deep merge plan and task
    const mergedPlan: PlanningPlan = {
        ...(oldData.plan || {}),
        ...(newData.plan || {})
    };

    const taskMap = new Map<string, PlanningTask>();
    
    // Seed with old tasks
    if (oldData.plan?.tasks) {
        oldData.plan.tasks.forEach(t => { if (t.taskId) taskMap.set(t.taskId, t); });
    }

    // Update with new tasks from the new plan (if any)
    if (newData.plan?.tasks) {
        newData.plan.tasks.forEach(t => { if (t.taskId) taskMap.set(t.taskId, { ...taskMap.get(t.taskId), ...t }); });
    }

    // Update with the single task update (if any)
    const activeTask = newData.task || (newData.taskId ? { taskId: newData.taskId, status: newData.status, result: newData.result } : undefined);
    if (activeTask?.taskId) {
        const existing = taskMap.get(activeTask.taskId);
        taskMap.set(activeTask.taskId, { ...(existing || {}), ...activeTask });
    }

    if (taskMap.size > 0) {
        mergedPlan.tasks = Array.from(taskMap.values());
    }

    const mergedTask: PlanningTask | undefined = activeTask?.taskId
        ? taskMap.get(activeTask.taskId)
        : (newData.task || oldData.task);

    const isPassiveView = newData.action === "view";

    return {
        ...newData,
        action: isPassiveView ? oldData.action : newData.action,
        plan: Object.keys(mergedPlan).length > 0 ? mergedPlan : undefined,
        task: mergedTask,
        taskId: isPassiveView ? oldData.taskId : (activeTask?.taskId || newData.taskId || oldData.taskId),
        status: isPassiveView ? oldData.status : (newData.status || oldData.status),
        result: isPassiveView ? oldData.result : (newData.result || oldData.result)
    };
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
              .filter((task): task is PlanningTask => Boolean(task && hasTaskContent(task)))
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
