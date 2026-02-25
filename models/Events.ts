export type EventType =
    | "SessionAssigned"
    | "RunStarted"
    | "AssistantTextDelta"
    | "AssistantTextSync"
    | "AssistantTextFinal"
    | "ThinkingStart"
    | "ThinkingUpdate"
    | "ThinkingEnd"
    | "ToolCallStarted"
    | "ToolArgsUpdate"
    | "ToolCallEnded"
    | "ToolResult"
    | "StreamEnd"
    | "ErrorEvent";

export interface BaseAgentEvent {
    type: EventType;
    timestamp?: number;
    runId?: string;
}

export interface SessionAssignedEvent extends BaseAgentEvent {
    type: "SessionAssigned";
    threadId: string;
}

export interface RunStartedEvent extends BaseAgentEvent {
    type: "RunStarted";
    runId?: string;
    threadId?: string;
}

export interface AssistantTextDeltaEvent extends BaseAgentEvent {
    type: "AssistantTextDelta";
    content: string;
    messageId?: string;
}

export interface AssistantTextSyncEvent extends BaseAgentEvent {
    type: "AssistantTextSync";
    content: string;
    messageId?: string;
}

export interface AssistantTextFinalEvent extends BaseAgentEvent {
    type: "AssistantTextFinal";
    messageId?: string;
}

export interface ThinkingEvent extends BaseAgentEvent {
    type: "ThinkingStart" | "ThinkingUpdate" | "ThinkingEnd";
    stepName?: string;
    content?: string;
}

export interface ToolCallEvent extends BaseAgentEvent {
    type: "ToolCallStarted" | "ToolCallEnded";
    toolName: string;
    toolCallId?: string;
    arguments?: string;
}

export interface ToolArgsUpdateEvent extends BaseAgentEvent {
    type: "ToolArgsUpdate";
    toolCallId: string;
    argumentsDelta: string;
}

export interface ToolResultEvent extends BaseAgentEvent {
    type: "ToolResult";
    toolName: string;
    content: string;
    toolCallId?: string;
}

export interface StreamEndEvent extends BaseAgentEvent {
    type: "StreamEnd";
}

export interface ErrorEvent extends BaseAgentEvent {
    type: "ErrorEvent";
    error: string;
    code?: string;
    details?: any;
}

export type AgentEvent =
    | SessionAssignedEvent
    | RunStartedEvent
    | AssistantTextDeltaEvent
    | AssistantTextSyncEvent
    | AssistantTextFinalEvent
    | ThinkingEvent
    | ToolCallEvent
    | ToolArgsUpdateEvent
    | ToolResultEvent
    | StreamEndEvent
    | ErrorEvent;
