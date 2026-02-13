"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AgentConfig } from "@/models/Agent";
import { AgentEvent } from "@/models/Events";
import { fetchAgentConfig } from "@/lib/api";
import { mockStreamResponse } from "@/lib/mock";
import { fetchSseStream } from "@/lib/stream";
import { translateAguiEvent } from "@/adapters/aguiAdapter";
import ChatWindow, { Message } from "@/components/ChatWindow";
import EventTimeline from "@/components/EventTimeline";
import MessageInput from "@/components/MessageInput";
import { ChatSession } from "@/models/Session";

export default function AgentChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [agent, setAgent] = useState<AgentConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null); // Local unique ID for storage
    const [threadId, setThreadId] = useState<string | null>(null);   // Backend thread ID
    const [isStreaming, setIsStreaming] = useState(false);
    const [showThoughts, setShowThoughts] = useState(true);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Initialize Session
    useEffect(() => {
        if (!id) return;

        const initSession = async () => {
            // 1. Load Agent Config
            try {
                const config = await fetchAgentConfig(id as string);
                setAgent(config);
            } catch (e) {
                console.error("Failed to load agent", e);
                return;
            }

            // 2. Determine Session ID
            const newSessionRequested = searchParams.get("newSession") === "true";
            let currentSid = searchParams.get("sessionId");

            if (newSessionRequested || !currentSid) {
                // Generate new session if requested OR if no session provided
                // If it's a "fresh" visit without params, we might want to load last session?
                // For now, let's honor the user request: "Start Chat" -> new session.

                if (newSessionRequested) {
                    currentSid = Date.now().toString();
                    // Clean URL
                    router.replace(`/agents/${id}?sessionId=${currentSid}`);
                } else {
                    // If simply navigating to /agents/id, generate new session for now (simplest "Start Chat" behavior)
                    // unless a specific sessionId is in URL.
                    currentSid = Date.now().toString();
                    // router.replace(`/agents/${id}?sessionId=${currentSid}`); // strict mode
                }
            }

            setSessionId(currentSid);

            // 3. Load Session Data
            const stored = localStorage.getItem(`session_${currentSid}`);
            if (stored) {
                try {
                    const session: ChatSession = JSON.parse(stored);
                    setMessages(session.messages);
                } catch (e) {
                    console.error("Failed to parse session", e);
                }
            } else {
                setMessages([]);
            }
        };

        if (id) initSession();
    }, [id, searchParams, router]);

    // Persist Session
    useEffect(() => {
        if (sessionId && agent) {
            const sessionData: ChatSession = {
                id: sessionId,
                agentId: agent.id,
                title: messages.length > 0 ? messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? "..." : "") : "New Chat",
                createdAt: parseInt(sessionId) || Date.now(), // approximation if using Date.now() as ID
                lastActiveAt: Date.now(),
                messages: messages
            };
            localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
        }
    }, [messages, sessionId, agent]);

    const handleAgentEvent = useCallback((ev: AgentEvent) => {
        if (ev.type === "ToolArgsUpdate") {
            setEvents(prev => prev.map(e => {
                if (e.type === "ToolCallStarted" && e.toolCallId === ev.toolCallId) {
                    return { ...e, arguments: (e.arguments || "") + ev.argumentsDelta };
                }
                return e;
            }));
            return;
        }

        setEvents((prev) => [...prev, { ...ev, timestamp: Date.now() }]);

        if (ev.type === "SessionAssigned") {
            setThreadId(ev.threadId);
        }

        if (ev.type === "AssistantTextDelta") {
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "assistant") {
                    return [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + ev.content },
                    ];
                } else {
                    return [
                        ...prev,
                        { id: Date.now().toString(), role: "assistant", content: ev.content },
                    ];
                }
            });
        }

        if (ev.type === "ErrorEvent") setIsStreaming(false);
        if (ev.type === "StreamEnd") setIsStreaming(false);
    }, []);


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
                const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
                const url = `${API_BASE}/v1/events`;
                // Use backend threadId if we have one for this session, otherwise undefined (new thread)
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
        // Clear session to start fresh. ID will be assigned by server on first message.
        setSessionId(null);
        setThreadId(null);
        setMessages([]);
        setEvents([]);
        router.replace(`/agents/${id}`);
    };

    if (!agent) return <div className="p-8 text-center text-muted">Loading agent console...</div>;

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="p-4 border-b border-border flex justify-between items-center bg-background">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-lg">{agent.name}</h2>
                        <div className="text-[10px] text-muted font-mono flex items-center gap-2">
                            SESSION: {threadId || "NEW"}
                            <button onClick={resetSession} className="text-accent hover:underline px-1 bg-accent/10 rounded ml-2">
                                NEW CHAT
                            </button>
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
