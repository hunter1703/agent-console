import { AgentEvent } from "@/models/Events";

export interface AguiRawEvent {
    type: string;
    thread_id?: string;
    run_id?: string;
    message_id?: string;
    delta?: string;
    content?: string;
    role?: string;
    step_name?: string;
    tool_call_id?: string;
    tool_call_name?: string;
    error?: string;
    message?: string;
    timestamp?: number;
    created_at?: number;
    name?: string;
    value?: string;
    [key: string]: any;
}

/**
 * Stateful adapter for translating AGUI raw events into typed AgentEvents.
 *
 * Must be instantiated once per stream or replay session so that tool call
 * state (toolCallId → toolName) is tracked across the event sequence.
 * TOOL_CALL_START registers the name; subsequent TOOL_CALL_RESULT and
 * TOOL_CALL_END look it up by ID rather than expecting it to be repeated.
 */
export class AguiEventAdapter {
    private readonly toolCallNames = new Map<string, string>();

    translate(raw: AguiRawEvent): AgentEvent[] {
        const events: AgentEvent[] = [];
        const type = raw.type;
        const timestamp = normalizeTimestamp(raw.timestamp || raw.created_at);
        const runId = raw.runId || raw.run_id || raw.threadId || raw.thread_id;

        switch (type) {
            case "RUN_STARTED":
                events.push({
                    type: "RunStarted",
                    runId: runId || "unknown",
                    threadId: raw.threadId || raw.thread_id,
                    timestamp
                });
                break;

            case "TEXT_MESSAGE_CHUNK":
                events.push({
                    type: "AssistantTextDelta",
                    content: raw.delta || "",
                    messageId: raw.messageId || raw.message_id,
                    runId,
                    timestamp
                });
                break;

            case "TEXT_MESSAGE_CONTENT":
                events.push({
                    type: "AssistantTextSync",
                    content: raw.delta || raw.content || "",
                    messageId: raw.messageId || raw.message_id,
                    runId,
                    timestamp
                });
                break;

            case "TEXT_MESSAGE_START":
                events.push({
                    type: "AssistantTextStart",
                    messageId: raw.messageId || raw.message_id,
                    runId,
                    timestamp
                });
                break;

            case "TEXT_MESSAGE_END":
                events.push({
                    type: "AssistantTextFinal",
                    messageId: raw.messageId || raw.message_id,
                    runId,
                    timestamp
                });
                break;

            case "THINKING_END":
                events.push({
                    type: "ThinkingEnd",
                    stepName: raw.stepName || raw.step_name || "Thought",
                    runId,
                    timestamp
                });
                break;

            case "THINKING_START":
                events.push({
                    type: "ThinkingStart",
                    stepName: raw.stepName || raw.step_name || "Thought",
                    runId,
                    timestamp
                });
                break;

            case "STEP_STARTED":
            case "STEP_FINISHED":
                break;

            case "TOOL_CALL_START": {
                const toolCallId = raw.toolCallId || raw.tool_call_id;
                const toolName = raw.toolCallName || raw.tool_call_name || raw.rawEvent?.toolCallName || raw.rawEvent?.tool_call_name || raw.step_name || "Tool Call";
                if (toolCallId) this.toolCallNames.set(toolCallId, toolName);
                events.push({
                    type: "ToolCallStarted",
                    toolName,
                    toolCallId,
                    arguments: raw.arguments || raw.args || raw.parameters || "",
                    runId,
                    timestamp
                });
                break;
            }

            case "TOOL_CALL_ARGS":
                events.push({
                    type: "ToolArgsUpdate",
                    toolCallId: raw.toolCallId || raw.tool_call_id || "",
                    argumentsDelta: raw.delta || "",
                    runId,
                    timestamp
                });
                break;

            case "TOOL_CALL_RESULT": {
                const toolCallId = raw.toolCallId || raw.tool_call_id;
                events.push({
                    type: "ToolResult",
                    toolName: this.toolCallNames.get(toolCallId ?? "") ?? "Tool",
                    content: raw.content || raw.rawEvent?.content || "",
                    toolCallId,
                    runId,
                    timestamp
                });
                break;
            }

            case "TOOL_CALL_END": {
                const toolCallId = raw.toolCallId || raw.tool_call_id;
                events.push({
                    type: "ToolCallEnded",
                    toolName: this.toolCallNames.get(toolCallId ?? "") ?? "Tool",
                    toolCallId,
                    runId,
                    timestamp
                });
                this.toolCallNames.delete(toolCallId ?? "");
                break;
            }

            case "RUN_FINISHED":
                events.push({ type: "StreamEnd", runId, timestamp });
                break;

            case "RUN_ERROR":
                events.push({
                    type: "ErrorEvent",
                    error: raw.message || raw.error || "Unknown agent error",
                    runId,
                    timestamp
                });
                break;

            case "CUSTOM":
                if (raw.eventType === "correction") {
                    events.push({
                        type: "CorrectionEvent",
                        correctionType: raw.correctionType || "Unknown",
                        code: raw.code || "Unknown",
                        message: raw.message || "Correction required",
                        runId,
                        timestamp
                    });
                }
                break;

            case "THINKING_TEXT_MESSAGE_START":
                events.push({
                    type: "ThinkingMessageStart",
                    runId,
                    timestamp
                });
                break;

            case "THINKING_TEXT_MESSAGE_CONTENT":
                events.push({
                    type: "ThinkingUpdate",
                    content: raw.delta || "",
                    runId,
                    timestamp
                });
                break;

            // THINKING_TEXT_MESSAGE_END signals the end of one thought block only.
            // The agent remains in thinking state until THINKING_END.
            // No event emitted — the next THINKING_TEXT_MESSAGE_START will open the next block.
            case "THINKING_TEXT_MESSAGE_END":
                break;
        }

        return events;
    }
}

function normalizeTimestamp(value?: number) {
    if (!value || !Number.isFinite(value)) {
        return Date.now();
    }
    return value < 1_000_000_000_000 ? value * 1000 : value;
}
