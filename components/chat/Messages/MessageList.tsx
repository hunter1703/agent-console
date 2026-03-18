"use client";

import { useRef, useEffect, useCallback } from "react";
import { Message } from "@/lib/stores";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import ThinkingMessage from "./ThinkingMessage";
import ToolCallMessage from "./ToolCallMessage";
import CorrectionMessage from "./CorrectionMessage";
import { AgentEvent } from "@/models/Events";

interface MessageListProps {
    messages: Message[];
    events: AgentEvent[];
    agentAvatar?: string;
    isStreaming?: boolean;
}

export default function MessageList({
    messages,
    events,
    agentAvatar,
    isStreaming = false,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAutoScroll = useRef(true);

    // Handle scroll events for auto-scroll behavior
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // If user is within 50px of the bottom, keep auto-scrolling
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        isAutoScroll.current = distanceToBottom <= 50;
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current && isAutoScroll.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Build a unified timeline of messages and tool calls based on timestamps
    const buildTimeline = () => {
        // Track tool calls by ID with their start timestamp
        const toolCalls: Record<string, { name: string; args?: string; result?: string; status: "pending" | "running" | "completed" | "error"; startTimestamp: number; endTimestamp?: number }> = {};

        // First pass: collect all tool call events with timestamps
        events.forEach((event) => {
            if (event.type === "ToolCallStarted" && event.toolCallId) {
                toolCalls[event.toolCallId] = {
                    name: event.toolName,
                    args: event.arguments,
                    status: "running",
                    startTimestamp: event.timestamp || Date.now(),
                };
            } else if (event.type === "ToolArgsUpdate" && event.toolCallId) {
                if (!toolCalls[event.toolCallId]) {
                    toolCalls[event.toolCallId] = {
                        name: "tool",
                        args: event.argumentsDelta,
                        status: "running",
                        startTimestamp: event.timestamp || Date.now(),
                    };
                } else {
                    const existing = toolCalls[event.toolCallId];
                    existing.args = (existing.args || "") + event.argumentsDelta;
                }
            } else if (event.type === "ToolResult" && event.toolCallId) {
                if (toolCalls[event.toolCallId]) {
                    toolCalls[event.toolCallId].result = event.content;
                    toolCalls[event.toolCallId].status = "completed";
                    toolCalls[event.toolCallId].endTimestamp = event.timestamp || Date.now();
                } else {
                    toolCalls[event.toolCallId] = {
                        name: event.toolName || "tool",
                        result: event.content,
                        status: "completed",
                        startTimestamp: event.timestamp || Date.now(),
                        endTimestamp: event.timestamp || Date.now(),
                    };
                }
            }
        });

        // Create a map of message IDs to their timestamps (use AssistantTextStart time)
        const messageTimestamps: Record<string, number> = {};
        
        events.forEach((event) => {
            if (event.type === "AssistantTextStart" && event.messageId) {
                messageTimestamps[event.messageId] = event.timestamp || Date.now();
            }
        });

        // Build timeline by interleaving messages and tool calls
        const result: Array<{ type: "message"; message: Message } | { type: "tool"; toolCallId: string; name: string; args?: string; result?: string; status: "pending" | "running" | "completed" | "error" }> = [];
        
        // Track which tool calls have been added
        const addedToolCalls = new Set<string>();
        
        // If no messages yet, just show tool calls
        if (messages.length === 0) {
            Object.entries(toolCalls).forEach(([toolCallId, data]) => {
                result.push({
                    type: "tool",
                    toolCallId,
                    name: data.name,
                    args: data.args,
                    result: data.result,
                    status: data.status,
                });
            });
            return result;
        }

        // Process messages in order and interleave tool calls
        messages.forEach((message, msgIndex) => {
            const msgTimestamp = messageTimestamps[message.id];
            
            // Add any tool calls that should appear before this message
            Object.entries(toolCalls).forEach(([toolCallId, data]) => {
                if (!addedToolCalls.has(toolCallId)) {
                    // Insert tool call before this message if:
                    // 1. Tool started before this message started, OR
                    // 2. We don't have a timestamp for this message and it's not the first message
                    const shouldInsertBefore = msgTimestamp 
                        ? data.startTimestamp < msgTimestamp
                        : msgIndex > 0;
                    
                    if (shouldInsertBefore) {
                        result.push({
                            type: "tool",
                            toolCallId,
                            name: data.name,
                            args: data.args,
                            result: data.result,
                            status: data.status,
                        });
                        addedToolCalls.add(toolCallId);
                    }
                }
            });
            
            // Add this message
            result.push({ type: "message", message });
        });
        
        // Add any remaining tool calls at the end
        Object.entries(toolCalls).forEach(([toolCallId, data]) => {
            if (!addedToolCalls.has(toolCallId)) {
                result.push({
                    type: "tool",
                    toolCallId,
                    name: data.name,
                    args: data.args,
                    result: data.result,
                    status: data.status,
                });
            }
        });

        return result;
    };

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            onWheel={(e) => {
                // Cut off auto-scroll when user scrolls up
                if (e.deltaY < 0) isAutoScroll.current = false;
            }}
            className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pt-8 sm:pt-10 pb-8 scroll-smooth custom-scrollbar"
        >
            <div className="max-w-[800px] mx-auto w-full flex flex-col gap-10">
                {messages.length === 0 && !isStreaming && (
                    <div className="mt-40 text-center flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center shadow-lg">
                            <svg
                                className="w-10 h-10 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[18px] font-bold text-foreground tracking-tight">
                                Ready
                            </p>
                            <p className="text-[14px] text-muted-foreground font-medium">
                                Send a message to begin.
                            </p>
                        </div>
                    </div>
                )}

                {buildTimeline().map((entry) => {
                    const key = entry.type === "message" ? `msg-${entry.message.id}` : `tool-${entry.toolCallId}`;
                    
                    if (entry.type === "message") {
                        const message = entry.message;

                        // Render thought messages
                        if (message.kind === "thought") {
                            return (
                                <ThinkingMessage
                                    key={key}
                                    thoughts={message.thoughts || []}
                                    isStreaming={message.isStreaming}
                                    durationSecs={message.thinkingDurationSecs}
                                />
                            );
                        }

                        // Render correction messages
                        if (message.kind === "correction") {
                            return (
                                <CorrectionMessage
                                    key={key}
                                    corrections={message.corrections || []}
                                />
                            );
                        }

                        // Render user messages
                        if (message.role === "user") {
                            return (
                                <UserMessage
                                    key={key}
                                    content={message.content}
                                />
                            );
                        }

                        // Render assistant messages
                        return (
                            <div
                                key={key}
                                className="flex flex-col group spring-bounce-assistant"
                            >
                                {/* Assistant header with avatar */}
                                <div className="flex items-center justify-between w-full mb-2 px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shadow-sm">
                                            {agentAvatar ? (
                                                <img
                                                    src={agentAvatar}
                                                    alt="Agent"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg
                                                    className="w-4 h-4 text-primary"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                                            Assistant
                                        </span>
                                    </div>
                                </div>

                                {/* Message bubble */}
                                <AssistantMessage
                                    content={message.content}
                                    isStreaming={message.isStreaming}
                                />
                            </div>
                        );
                    } else if (entry.type === "tool") {
                        // Render tool call at this position in the timeline
                        return (
                            <ToolCallMessage
                                key={key}
                                toolName={entry.name}
                                arguments={entry.args}
                                result={entry.result}
                                status={entry.status}
                                toolCallId={entry.toolCallId}
                            />
                        );
                    }
                    return null;
                })}

                {/* Streaming indicator */}
                {isStreaming && messages.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                )}
            </div>
        </div>
    );
}
