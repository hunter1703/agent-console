export type EventType =
    | "SessionAssigned"
    | "RunStarted"
    | "AssistantTextStart"
    | "AssistantTextDelta"
    | "AssistantTextSync"
    | "AssistantTextFinal"
    | "ThinkingStart"
    | "ThinkingUpdate"
    | "ThinkingMessageStart"
    | "ThinkingEnd"
    | "ToolCallStarted"
    | "ToolArgsUpdate"
    | "ToolCallEnded"
    | "ToolResult"
    | "StreamEnd"
    | "ErrorEvent"
    | "CorrectionEvent";

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

export interface AssistantTextStartEvent extends BaseAgentEvent {
    type: "AssistantTextStart";
    messageId?: string;
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
    type: "ThinkingStart" | "ThinkingUpdate" | "ThinkingMessageStart" | "ThinkingEnd";
    stepName?: string;
    content?: string;
    isSync?: boolean;
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

export interface CorrectionEvent extends BaseAgentEvent {
    type: "CorrectionEvent";
    correctionType: string;
    code: string;
    message: string;
}

export type AgentEvent =
    | SessionAssignedEvent
    | RunStartedEvent
    | AssistantTextStartEvent
    | AssistantTextDeltaEvent
    | AssistantTextSyncEvent
    | AssistantTextFinalEvent
    | ThinkingEvent
    | ToolCallEvent
    | ToolArgsUpdateEvent
    | ToolResultEvent
    | StreamEndEvent
    | ErrorEvent
    | CorrectionEvent;
