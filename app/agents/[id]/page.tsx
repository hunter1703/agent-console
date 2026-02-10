"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { AgentConfig } from "@/models/Agent";
import { AgentEvent } from "@/models/Events";
import { fetchAgentConfig } from "@/lib/api";
import { mockStreamResponse } from "@/lib/mock";
import { fetchSseStream } from "@/lib/stream";
import { translateAguiEvent } from "@/adapters/aguiAdapter";
import ChatWindow, { Message } from "@/components/ChatWindow";
import EventTimeline from "@/components/EventTimeline";
import MessageInput from "@/components/MessageInput";

export default function AgentChatPage() {
    const { id } = useParams();
    const [agent, setAgent] = useState<AgentConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [showThoughts, setShowThoughts] = useState(true);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    useEffect(() => {
        if (id) {
            fetchAgentConfig(id as string).then(setAgent);
            const savedThreadId = localStorage.getItem(`threadId_${id}`);
            if (savedThreadId) setThreadId(savedThreadId);

            const savedMessages = localStorage.getItem(`history_${id}`);
            if (savedMessages) setMessages(JSON.parse(savedMessages));
        }
    }, [id]);

    useEffect(() => {
        if (id && messages.length > 0) {
            localStorage.setItem(`history_${id}`, JSON.stringify(messages));
        }
    }, [id, messages]);

    const handleAgentEvent = useCallback((ev: AgentEvent) => {
        setEvents((prev) => [...prev, { ...ev, timestamp: Date.now() }]);

        if (ev.type === "SessionAssigned") {
            setThreadId(ev.threadId);
            localStorage.setItem(`threadId_${id}`, ev.threadId);
        }

        if (ev.type === "AssistantTextDelta") {
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "assistant") {
                    const updated = [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + ev.content },
                    ];
                    return updated;
                } else {
                    return [
                        ...prev,
                        { id: Date.now().toString(), role: "assistant", content: ev.content },
                    ];
                }
            });
        }

        if (ev.type === "ErrorEvent") {
            setIsStreaming(false);
        }

        if (ev.type === "StreamEnd") {
            setIsStreaming(false);
        }
    }, [id]);

    const handleSend = async (text: string) => {
        const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
        setMessages((prev) => [...prev, userMessage]);
        setIsStreaming(true);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
                const mockStream = mockStreamResponse(text);
                for await (const ev of mockStream) {
                    if (controller.signal.aborted) break;
                    handleAgentEvent(ev);
                }
            } else {
                const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                const url = `${API_BASE}/v1/events`;
                const body = {
                    type: "agent",
                    agentId: id,
                    sessionId: threadId,
                    message: text,
                };

                const stream = fetchSseStream(url, {
                    method: "POST",
                    body: JSON.stringify(body),
                    signal: controller.signal,
                    headers: { "Content-Type": "application/json" }
                });

                for await (const sse of stream) {
                    const rawEvents = translateAguiEvent(JSON.parse(sse.data));
                    rawEvents.forEach(handleAgentEvent);
                }
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                handleAgentEvent({ type: "ErrorEvent", error: String(err) });
            }
        } finally {
            setIsStreaming(false);
            setAbortController(null);
        }
    };

    const handleStop = () => {
        abortController?.abort();
        setIsStreaming(false);
    };

    const resetSession = () => {
        setThreadId(null);
        localStorage.removeItem(`threadId_${id}`);
        localStorage.removeItem(`history_${id}`);
        setMessages([]);
        setEvents([]);
    };

    if (!agent) return <div className="p-8 text-center text-muted">Loading agent console...</div>;

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="p-4 border-b border-border flex justify-between items-center bg-background">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-lg">{agent.name}</h2>
                        <div className="text-[10px] text-muted font-mono flex items-center gap-2">
                            SESSION: {threadId || "NEW"}
                            {threadId && (
                                <button onClick={resetSession} className="text-accent hover:underline px-1 bg-accent/10 rounded">
                                    RESET
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer hover:text-foreground transition-colors">
                            <input
                                type="checkbox"
                                checked={showThoughts}
                                onChange={(e) => setShowThoughts(e.target.checked)}
                                className="accent-primary"
                            />
                            Show Thoughts
                        </label>
                    </div>
                </header>

                <ChatWindow messages={messages} agentAvatar={agent.avatar} />
                <MessageInput onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} />
            </div>

            {/* Sidebar Timeline */}
            <div className="w-80 hidden lg:flex flex-col border-l border-border">
                <EventTimeline events={events} showThoughts={showThoughts} />
            </div>
        </div>
    );
}
