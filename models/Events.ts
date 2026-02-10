export type EventType =
    | "SessionAssigned"
    | "AssistantTextDelta"
    | "AssistantTextFinal"
    | "ThinkingStart"
    | "ThinkingUpdate"
    | "ThinkingEnd"
    | "ToolCallStarted"
    | "ToolCallEnded"
    | "ToolResult"
    | "StreamEnd"
    | "ErrorEvent";

export interface BaseAgentEvent {
    type: EventType;
    timestamp?: number;
}

export interface SessionAssignedEvent extends BaseAgentEvent {
    type: "SessionAssigned";
    threadId: string;
}

export interface AssistantTextDeltaEvent extends BaseAgentEvent {
    type: "AssistantTextDelta";
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
    | AssistantTextDeltaEvent
    | AssistantTextFinalEvent
    | ThinkingEvent
    | ToolCallEvent
    | ToolResultEvent
    | StreamEndEvent
    | ErrorEvent;
