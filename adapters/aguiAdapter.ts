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
    timestamp?: number; // Added
    created_at?: number; // Added
    name?: string; // Added for CUSTOM type
    value?: string; // Added for CUSTOM type
    [key: string]: any;
}

export function translateAguiEvent(raw: AguiRawEvent): AgentEvent[] {
    const events: AgentEvent[] = [];
    const type = raw.type;
    const timestamp = normalizeTimestamp(raw.timestamp || raw.created_at);
    const runId = raw.runId || raw.run_id || raw.threadId || raw.thread_id; // Fallback to thread if run is missing

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

        case "TOOL_CALL_START":
            events.push({
                type: "ToolCallStarted",
                toolName: raw.toolCallName || raw.tool_call_name || raw.rawEvent?.toolCallName || raw.rawEvent?.tool_call_name || raw.step_name || "Tool Call",
                toolCallId: raw.toolCallId || raw.tool_call_id,
                arguments: raw.arguments || raw.args || raw.parameters || "", // Capture initial args if provided
                runId,
                timestamp
            });
            break;

        case "TOOL_CALL_ARGS":
            events.push({
                type: "ToolArgsUpdate",
                toolCallId: raw.toolCallId || raw.tool_call_id || "",
                argumentsDelta: raw.delta || "",
                runId,
                timestamp
            });
            break;

        case "TOOL_CALL_RESULT":
            events.push({
                type: "ToolResult",
                toolName: raw.toolCallName || raw.tool_call_name || raw.rawEvent?.toolCallName || raw.rawEvent?.tool_call_name || "Tool",
                content: raw.content || raw.rawEvent?.content || "",
                toolCallId: raw.toolCallId || raw.tool_call_id,
                runId,
                timestamp
            });
            break;

        case "TOOL_CALL_END":
            events.push({
                type: "ToolCallEnded",
                toolName: "unknown",
                toolCallId: raw.toolCallId || raw.tool_call_id,
                runId,
                timestamp
            });
            break;

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

        // Handle Custom events (Corrections, Thoughts)
        case "CUSTOM":
            if (raw.name === "THINK_DELTA") {
                events.push({
                    type: "ThinkingUpdate",
                    content: raw.value,
                    runId,
                    timestamp
                });
            } else if (raw.name === "CORRECTION" || raw.name === "correction") {
                events.push({
                    type: "CorrectionEvent",
                    correctionType: raw.correctionType || raw.rawEvent?.correctionType || "Unknown",
                    code: raw.code || raw.rawEvent?.code || "Unknown",
                    message: raw.message || raw.rawEvent?.message || "Correction required",
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
            const isPartial = raw.partial ?? raw.rawEvent?.partial ?? true;
            events.push({
                type: "ThinkingUpdate",
                content: raw.delta || raw.rawEvent?.delta || "",
                isSync: !isPartial,
                runId,
                timestamp
            });
            break;
    }

    return events;
}

function normalizeTimestamp(value?: number) {
    if (!value || !Number.isFinite(value)) {
        return Date.now();
    }
    return value < 1_000_000_000_000 ? value * 1000 : value;
}
