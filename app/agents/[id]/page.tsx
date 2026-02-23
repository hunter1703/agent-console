"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AgentConfig } from "@/models/Agent";
import { AgentEvent } from "@/models/Events";
import { fetchAgentConfig, getResourceById } from "@/lib/api";
import { mockStreamResponse } from "@/lib/mock";
import { fetchSseStream } from "@/lib/stream";
import { translateAguiEvent } from "@/adapters/aguiAdapter";
import ChatWindow, { Message } from "@/components/ChatWindow";
import EventTimeline from "@/components/EventTimeline";
import MessageInput from "@/components/MessageInput";
import { ChatSession } from "@/models/Session";
import { AgentSessionDTO } from "@/models/ApiSchemas";
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
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const currentRunId = useRef<string | null>(null);

    // 1. Fetch Agent Metadata - Always needed for the shell UI
    useEffect(() => {
        if (!id) return;
        const loadAgent = async () => {
            try {
                const config = await fetchAgentConfig(id as string);
                setAgent(config);
            } catch (e) {
                console.error("Failed to load agent", e);
            }
        };
        loadAgent();
    }, [id]);

    // 2. Initialize Session State
    useEffect(() => {
        if (!id) return;

        const initSession = async () => {
            const newSessionRequested = searchParams.get("newSession") === "true";
            const currentSid = searchParams.get("sessionId");

            // Handle Reset Navigation
            if (newSessionRequested) {
                setSessionId(null);
                setMessages([]);
                setThreadId(null);
                setEvents([]);
                router.replace(`/agents/${id}`);
                return;
            }

            // Handle Fresh Navigation (No Session)
            if (!currentSid) {
                setSessionId(null);
                setMessages([]);
                setThreadId(null);
                setEvents([]);
                return;
            }

            // Avoid re-initialization if already on this session
            if (currentSid === sessionId) return;

            setSessionId(currentSid);

            // Load Session Data
            let backendThreadId = null;
            try {
                const stored = localStorage.getItem(`session_${currentSid}`);
                if (stored) {
                    try {
                        const session: ChatSession = JSON.parse(stored);
                        setMessages(session.messages);
                        backendThreadId = session.threadId || null;
                        setThreadId(backendThreadId);
                    } catch (e) {
                        console.error("Failed to parse session", e);
                    }
                } else {
                    setMessages([]);
                    setThreadId(null);
                }
            } catch (e) {
                console.error("localStorage not available", e);
                setMessages([]);
                setThreadId(null);
            }

            // Fetch Historic Events
            if (backendThreadId) {
                try {
                    const sessionDto: AgentSessionDTO = await getResourceById('session', backendThreadId, { includeEvents: true });
                    if (sessionDto.events && Array.isArray(sessionDto.events)) {
                        const translatedEvents = sessionDto.events.flatMap(ev => translateAguiEvent(ev));
                        setEvents(translatedEvents);
                    }
                } catch (e) {
                    console.error("Failed to fetch historic events", e);
                }
            } else {
                setEvents([]);
            }
        };

        initSession();
    }, [id, searchParams, router, sessionId]);

    // Persist Session
    useEffect(() => {
        if (sessionId && agent) {
            const sidToStore = threadId || sessionId;
            const sessionData: ChatSession = {
                id: sidToStore,
                agentId: agent.id,
                title: messages.length > 0 ? messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? "..." : "") : "New Chat",
                createdAt: parseInt(sidToStore) || Date.now(),
                lastActiveAt: Date.now(),
                messages: messages,
                threadId: threadId || undefined
            };
            try {
                localStorage.setItem(`session_${sidToStore}`, JSON.stringify(sessionData));
            } catch (e) {
                console.error("Failed to persist session (storage may be full)", e);
            }
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

        const eventWithRunId = {
            ...ev,
            timestamp: ev.timestamp || Date.now(),
            runId: ev.runId || currentRunId.current || undefined
        };

        setEvents((prev) => {
            let nextPrev = prev;

            // 1. Remap if this is RunStarted
            // We search the entire list for ANY "pending_" IDs to remap them to the real one.
            // This is safer than relying on currentRunId.current which might have changed or stayed behind.
            if (ev.type === "RunStarted" && ev.runId) {
                const hasPending = nextPrev.some(e => e.runId?.toString().startsWith("pending_"));
                if (hasPending) {
                    nextPrev = nextPrev.map(e => (e.runId?.toString().startsWith("pending_")) ? { ...e, runId: ev.runId } : e);
                }
            }

            // 2. Identify placeholders for merging
            const runIdToCheck = eventWithRunId.runId;
            let lastPlaceholder = nextPrev.filter(e => 
                e.runId === runIdToCheck && 
                e.type === "ThinkingStart" && 
                (e as any).isPlaceholder
            ).pop();

            // Fallback: If no exact runId match (maybe remapping hasn't happened yet in this state view),
            // look for the most recent pending placeholder.
            if (!lastPlaceholder && ev.type === "ThinkingStart" && !(ev as any).isPlaceholder) {
                lastPlaceholder = nextPrev.filter(e => 
                    e.runId?.toString().startsWith("pending_") && 
                    e.type === "ThinkingStart" && 
                    (e as any).isPlaceholder
                ).pop();
            }

            // 3. Deduplicate: if we have a placeholder and the server sends a real one, merge them.
            if (ev.type === "ThinkingStart" && !(ev as any).isPlaceholder && lastPlaceholder) {
                const globalIndex = nextPrev.lastIndexOf(lastPlaceholder);
                if (globalIndex !== -1) {
                    const result = [...nextPrev];
                    result[globalIndex] = eventWithRunId as AgentEvent;
                    return result;
                }
            }

            return [...nextPrev, eventWithRunId as AgentEvent];
        });

        if (ev.type === "SessionAssigned") {
            setThreadId(ev.threadId);
        }

        if (ev.type === "RunStarted" && ev.threadId) {
            setThreadId(ev.threadId);
            currentRunId.current = ev.runId || null;

            // If we don't have a sessionId yet, this must be the first response of a new chat
            if (!sessionId) {
                setSessionId(ev.threadId);
                // Update URL to reflect server-generated session ID without page reload
                window.history.replaceState(null, "", `/agents/${id}?sessionId=${ev.threadId}`);
            }
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

        if (ev.type === "ToolResult") {
            // After a tool result, the agent is thinking about the next step
            setEvents(prev => [...prev, {
                type: "ThinkingStart",
                timestamp: Date.now() + 1, // Slightly after the result
                runId: eventWithRunId.runId,
                isPlaceholder: true
            } as any]);
        }

        if (ev.type === "ErrorEvent") setIsStreaming(false);
        if (ev.type === "StreamEnd") setIsStreaming(false);
    }, []);


    const handleSend = async (text: string) => {
        if (!text.trim() || isStreaming) return;

        setIsStreaming(true);
        currentRunId.current = `pending_${Date.now()}`;
        const controller = new AbortController();
        setAbortController(controller);

        try {
            // 1. Add user message locally
            const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
            setMessages((prev) => [...prev, userMsg]);

            // 2. Add immediate thinking state in timeline
            const pendingRunId = currentRunId.current;
            setEvents(prev => [...prev, {
                type: "ThinkingStart",
                timestamp: Date.now(),
                runId: pendingRunId || undefined,
                isPlaceholder: true
            } as any]);

            // 3. We no longer generate a sessionId on the client.
            // We rely on the server to return a threadId/sessionId in the first response.
            let currentSid = sessionId;

            if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
                const mockStream = mockStreamResponse(text);
                for await (const ev of mockStream) {
                    if (controller.signal.aborted) break;
                    handleAgentEvent(ev);
                }
            } else {
                // 3. Start SSE stream
                const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
                const url = `${API_BASE}/v1/events`;
                
                // Use threadId as sessionId. If missing (first message), the server generates it.
                const body = {
                    type: "agent",
                    agentId: id,
                    sessionId: threadId || undefined, 
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
        // Stop any active AI runs
        if (abortController) {
            abortController.abort();
            setAbortController(null);
        }
        setIsStreaming(false);

        // Immediate State Clear
        setSessionId(null);
        setThreadId(null);
        setMessages([]);
        setEvents([]);
        currentRunId.current = null;
        
        // Finalize state via navigation which triggers clean initSession
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
                <EventTimeline events={events} />
            </div>
        </div>
    );
}
