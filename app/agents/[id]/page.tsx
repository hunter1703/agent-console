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
import { Bot, RefreshCcw, Sparkles } from "lucide-react";

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
                    setThreadId(session.threadId || null);
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
                messages: messages,
                threadId: threadId || undefined
            };
            localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
        }
    }, [messages, sessionId, agent, threadId]);

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

        if (ev.type === "RunStarted" && ev.threadId) {
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

    // Force height to match viewport minus layout overhead to prevent main scrollbar
    return (
        <div className="h-[calc(100vh)] flex overflow-hidden bg-background absolute inset-0">
            {/* Cinematic Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="h-20 px-10 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-xl shadow-sm">
                            {agent.avatar ? (
                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Bot size={20} className="text-muted-foreground/60" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-[17px] font-semibold text-foreground tracking-tight leading-none">{agent.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.5)]"></span>
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 mt-0.5">Active Session</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2.5 text-[13px] font-medium text-muted-foreground/60 cursor-pointer hover:text-foreground transition-all group">
                            <input
                                type="checkbox"
                                checked={showThoughts}
                                onChange={(e) => setShowThoughts(e.target.checked)}
                                className="w-4 h-4 rounded-md border-border bg-secondary checked:bg-primary checked:border-primary transition-all cursor-pointer"
                            />
                            Insights
                        </label>
                        <button
                            onClick={resetSession}
                            className="text-[13px] font-semibold text-primary/80 hover:text-primary px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-2xl transition-all flex items-center gap-2"
                        >
                            <RefreshCcw size={14} />
                            Reset
                        </button>
                    </div>
                </header>

                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <ChatWindow messages={messages} agentAvatar={agent.avatar} />
                    <MessageInput onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} />
                </div>
            </div>

            {/* Sidebar Timeline - Minimalist Layer */}
            <div className="w-[380px] hidden xl:flex flex-col border-l border-border bg-background/40 backdrop-blur-3xl">
                <EventTimeline events={events} showThoughts={showThoughts} />
            </div>
        </div>
    );
}
