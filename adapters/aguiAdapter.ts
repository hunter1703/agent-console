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
    [key: string]: any;
}

export function translateAguiEvent(raw: AguiRawEvent): AgentEvent[] {
    const events: AgentEvent[] = [];
    const type = raw.type;

    switch (type) {
        case "RUN_STARTED":
            events.push({
                type: "RunStarted",
                runId: raw.runId || raw.run_id || "unknown",
                threadId: raw.threadId || raw.thread_id
            });
            break;

        case "TEXT_MESSAGE_CHUNK":
            events.push({
                type: "AssistantTextDelta",
                content: raw.delta || "",
                messageId: raw.messageId || raw.message_id,
            });
            break;

        case "TEXT_MESSAGE_END":
            events.push({
                type: "AssistantTextFinal",
                messageId: raw.messageId || raw.message_id,
            });
            break;

        case "STEP_STARTED":
            events.push({
                type: "ThinkingStart",
                stepName: raw.stepName || raw.step_name || "Thought",
            });
            break;

        case "STEP_FINISHED":
            events.push({
                type: "ThinkingEnd",
                stepName: raw.stepName || raw.step_name || "Thought",
            });
            break;

        case "TOOL_CALL_START":
            events.push({
                type: "ToolCallStarted",
                toolName: raw.toolCallName || raw.tool_call_name || raw.step_name || raw.stepName || "Tool Call",
                toolCallId: raw.toolCallId || raw.tool_call_id,
                arguments: "" // Initialize empty
            });
            break;

        case "TOOL_CALL_ARGS":
            events.push({
                type: "ToolArgsUpdate",
                toolCallId: raw.toolCallId || raw.tool_call_id || "",
                argumentsDelta: raw.delta || ""
            });
            break;

        case "TOOL_CALL_RESULT":
            events.push({
                type: "ToolResult",
                toolName: raw.toolCallName || raw.tool_call_name || "Tool",
                content: raw.content || "",
                toolCallId: raw.toolCallId || raw.tool_call_id,
            });
            break;

        case "TOOL_CALL_END":
            events.push({
                type: "ToolCallEnded",
                toolName: "unknown",
                toolCallId: raw.toolCallId || raw.tool_call_id,
            });
            break;

        case "RUN_FINISHED":
            events.push({ type: "StreamEnd" });
            break;

        case "RUN_ERROR":
            events.push({
                type: "ErrorEvent",
                error: raw.message || raw.error || "Unknown agent error",
            });
            break;

        // Handle Custom Thinking events if applicable
        case "CUSTOM":
            if (raw.name === "THINK_DELTA") {
                events.push({
                    type: "ThinkingUpdate",
                    content: raw.value
                });
            }
            break;
    }

    return events;
}
