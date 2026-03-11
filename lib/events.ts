import { AgentEvent } from "@/models/Events";

/**
 * Reconstructs the full state of agent events from a sequential stream.
 * Specifically handles merging ToolArgsUpdate into ToolCallStarted.
 */
export function reconstructEvents(events: AgentEvent[]): AgentEvent[] {
    const result: AgentEvent[] = [];
    const pendingToolArgs: Record<string, string> = {};
    
    for (const ev of events) {
        if (ev.type === "ToolArgsUpdate") {
            const toolCall = result.find(e => e.type === "ToolCallStarted" && e.toolCallId === ev.toolCallId);
            if (toolCall && toolCall.type === "ToolCallStarted") {
                toolCall.arguments = (toolCall.arguments || "") + ev.argumentsDelta;
            } else if (ev.toolCallId) {
                pendingToolArgs[ev.toolCallId] = (pendingToolArgs[ev.toolCallId] || "") + ev.argumentsDelta;
            }
            // We don't push ToolArgsUpdate to the final list as it's merged
            continue;
        }

        if (ev.type === "ToolCallStarted" && ev.toolCallId && pendingToolArgs[ev.toolCallId]) {
            const bufferedArgs = pendingToolArgs[ev.toolCallId];
            result.push({ ...ev, arguments: (ev.arguments || "") + bufferedArgs });
            delete pendingToolArgs[ev.toolCallId];
            continue;
        }

        // Add other event types normally
        result.push({ ...ev });
    }
    
    return result;
}
