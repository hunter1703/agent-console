"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AgentConfig } from "@/models/Agent";
import { AgentEvent } from "@/models/Events";
import { fetchAgentConfig, fetchSessions, getResourceById, SessionSummary } from "@/lib/api";
import { fetchSseStream } from "@/lib/apis/streaming";
import { AguiEventAdapter } from "@/adapters/aguiAdapter";
import { reconstructEvents } from "@/lib/events";
import { buildPlanningMessage, isPlanningTool, mergePlanningData, PlanningMessageData } from "@/lib/planning";
import { useChat, useUI } from "@/lib/stores";
import { MessageList, MessageInput } from "@/components/chat";
import ChatControls from "../ChatControls";
import PlanningCard from "@/components/PlanningCard";
import ToolDetails from "@/components/ToolDetails";
import SessionsPanel from "@/components/SessionsPanel";
import { SquarePen, AlignLeft } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    kind?: "text" | "planning" | "thought" | "correction";
    planning?: PlanningMessageData;
    isStreaming?: boolean;
    thoughts?: string[];
    thinkingDurationSecs?: number;
    corrections?: Array<{ correctionType: string; code: string; message: string }>;
}

interface PauseInfo {
    paused: boolean;
    reason?: string;
    prompt?: string;
    options: string[];
    requestedAt?: number;
}

function normalizePauseInfo(raw: any): PauseInfo | null {
    if (!raw || raw.paused !== true) {
        return null;
    }
    const options = Array.isArray(raw.options)
        ? raw.options.filter((value: any) => typeof value === "string" && value.trim().length > 0)
        : [];
    return {
        paused: true,
        reason: typeof raw.reason === "string" ? raw.reason : undefined,
        prompt: typeof raw.prompt === "string" ? raw.prompt : undefined,
        options,
        requestedAt: typeof raw.requestedAt === "number" ? raw.requestedAt : undefined,
    };
}

/* ── Main ChatWindow Component ─────────────────────────────────────────────── */

export default function ChatWindow() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State from centralized stores
    const {
        messages,
        events,
        isStreaming,
        isPaused,
        pauseInfo,
        currentRunId,
        abortController,
        addMessage,
        updateMessage,
        setMessages,
        addEvent,
        setEvents,
        setIsStreaming,
        setIsPaused,
        setPauseInfo,
        setCurrentRunId,
        setAbortController,
        clearMessages,
        clearEvents,
    } = useChat();

    const { addToast } = useUI();

    // Local state
    const [agent, setAgent] = useState<AgentConfig | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [sessionsPanelOpen, setSessionsPanelOpen] = useState(false);
    const [agentSessions, setAgentSessions] = useState<SessionSummary[]>([]);

    // Refs
    const currentRunIdRef = useRef<string | null>(null);
    const toolArgsRef = useRef<Record<string, { toolName: string; args: string }>>({});
    const isMessagingRef = useRef(false);
    const messageSentAtRef = useRef<number>(0);
    const sessionIdRef = useRef<string | null>(null);

    // Keep sessionIdRef current
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    /* ── Load agent metadata ───────────────────────────────────────────────── */
    useEffect(() => {
        if (!id) return;
        fetchAgentConfig(id as string)
            .then(setAgent)
            .catch((e) => {
                console.error("Failed to load agent", e);
                addToast({
                    type: "error",
                    message: "Failed to load agent configuration",
                });
            });
    }, [id]);

    /* ── Load agent sessions ───────────────────────────────────────────────── */
    useEffect(() => {
        if (!id) return;
        fetchSessions({ agentId: id as string, limit: 50 })
            .then(({ sessions }) => setAgentSessions(sessions))
            .catch(() => setAgentSessions([]));
    }, [id, sessionId]);

    /* ── Initialize session from URL params ────────────────────────────────── */
    useEffect(() => {
        if (!id) return;
        let active = true;

        const initSession = async () => {
            const newSessionRequested = searchParams.get("newSession") === "true";
            const currentSid = searchParams.get("sessionId");

            if (newSessionRequested) {
                if (active) {
                    setSessionId(null);
                    setMessages([]);
                    setThreadId(null);
                    setEvents([]);
                    setPauseInfo(null);
                    router.replace(`/chat/${id}`);
                }
                return;
            }

            if (!currentSid) {
                if (active) {
                    setSessionId(null);
                    setMessages([]);
                    setThreadId(null);
                    setEvents([]);
                    setPauseInfo(null);
                }
                return;
            }

            if (currentSid === sessionId) return;
            if (active) setSessionId(currentSid);

            // Load from localStorage
            let backendThreadId: string | null = null;
            try {
                const stored = localStorage.getItem(`session_${currentSid}`);
                if (stored && active) {
                    const session: any = JSON.parse(stored);
                    setMessages(session.messages as Message[]);
                    backendThreadId = session.threadId || null;
                    setThreadId(backendThreadId);
                } else if (active) {
                    setMessages([]);
                    setThreadId(null);
                }
            } catch {
                if (active) {
                    setMessages([]);
                    setThreadId(null);
                }
            }

            // Fetch historic events from backend
            backendThreadId = backendThreadId || currentSid;
            if (backendThreadId) {
                try {
                    const dto: any = await getResourceById(
                        "session",
                        backendThreadId,
                        { includeEvents: true }
                    );
                    if (active && dto.events && Array.isArray(dto.events)) {
                        const adapter = new AguiEventAdapter();
                        const translated = dto.events.flatMap((ev: any) =>
                            adapter.translate(ev)
                        );
                        setEvents(reconstructEvents(translated));
                    }
                    if (active) {
                        setPauseInfo(normalizePauseInfo(dto.pause));
                    }
                } catch {
                    /* backend events unavailable */
                }
            } else if (active) {
                setEvents([]);
                setPauseInfo(null);
            }
        };

        initSession();
        return () => {
            active = false;
        };
    }, [id, searchParams, router]);

    /* ── Send message handler ──────────────────────────────────────────────── */
    const handleSendMessage = useCallback(async (text: string) => {
        if (!id || !text.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
        };
        addMessage(userMessage);

        // Clear previous events for new turn
        clearEvents();
        setIsStreaming(true);
        messageSentAtRef.current = Date.now();

        // Create abort controller
        const controller = new AbortController();
        setAbortController(controller);

        // Local accumulators for building messages from stream events
        let assistantMsgId: string | null = null;
        let assistantContent = "";
        let thinkingMsgId: string | null = null;
        let thinkingStartedAt = 0;
        let thinkingBlocks: string[] = [];
        let thinkingCurrentBlock = "";
        let correctionsMessageId: string | null = null;
        let corrections: Array<{ correctionType: string; code: string; message: string }> = [];
        const adapter = new AguiEventAdapter();

        try {
            const url = `/api/v1/agent/${id}/chat`;
            const body = {
                message: text,
                sessionId: sessionId || undefined,
            };

            for await (const sseEvent of fetchSseStream(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            })) {
                try {
                    const rawEvent = JSON.parse(sseEvent.data);
                    const translatedEvents = adapter.translate(rawEvent);

                    for (const ev of translatedEvents) {
                        addEvent(ev);

                        if (ev.type === "AssistantTextStart") {
                            assistantMsgId = ev.messageId || `assistant-${Date.now()}`;
                            assistantContent = "";
                            addMessage({
                                id: assistantMsgId,
                                role: "assistant",
                                content: "",
                                kind: "text",
                                isStreaming: true,
                            });
                        } else if (ev.type === "AssistantTextDelta" && assistantMsgId) {
                            assistantContent += ev.content || "";
                            updateMessage(assistantMsgId, { content: assistantContent });
                        } else if (ev.type === "AssistantTextSync" && assistantMsgId) {
                            assistantContent = ev.content || "";
                            updateMessage(assistantMsgId, { content: assistantContent });
                        } else if (ev.type === "AssistantTextFinal" && assistantMsgId) {
                            updateMessage(assistantMsgId, { isStreaming: false });
                            assistantMsgId = null;
                        } else if (ev.type === "ThinkingStart" && !thinkingMsgId) {
                            thinkingMsgId = `thinking-${Date.now()}`;
                            thinkingStartedAt = ev.timestamp || Date.now();
                            thinkingBlocks = [];
                            thinkingCurrentBlock = "";
                            addMessage({
                                id: thinkingMsgId,
                                role: "assistant",
                                kind: "thought",
                                content: "",
                                thoughts: [],
                                isStreaming: true,
                            });
                        } else if (ev.type === "ThinkingMessageStart" && thinkingMsgId) {
                            thinkingCurrentBlock = "";
                            thinkingBlocks = [...thinkingBlocks, ""];
                        } else if (ev.type === "ThinkingUpdate" && thinkingMsgId) {
                            thinkingCurrentBlock += ev.content || "";
                            const updatedBlocks = thinkingBlocks.length > 0
                                ? [...thinkingBlocks.slice(0, -1), thinkingCurrentBlock]
                                : [thinkingCurrentBlock];
                            thinkingBlocks = updatedBlocks;
                            updateMessage(thinkingMsgId, { thoughts: updatedBlocks });
                        } else if (ev.type === "ThinkingEnd" && thinkingMsgId) {
                            const durationSecs = parseFloat(((Date.now() - thinkingStartedAt) / 1000).toFixed(1));
                            updateMessage(thinkingMsgId, { isStreaming: false, thinkingDurationSecs: durationSecs });
                            thinkingMsgId = null;
                        } else if (ev.type === "CorrectionEvent") {
                            corrections = [...corrections, {
                                correctionType: ev.correctionType,
                                code: ev.code,
                                message: ev.message,
                            }];
                            if (!correctionsMessageId) {
                                correctionsMessageId = `corrections-${Date.now()}`;
                                addMessage({
                                    id: correctionsMessageId,
                                    role: "assistant",
                                    kind: "correction",
                                    content: "",
                                    corrections,
                                });
                            } else {
                                updateMessage(correctionsMessageId, { corrections });
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to parse SSE event:", e);
                }
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("Stream error:", error);
                addToast({
                    type: "error",
                    message: error.message || "Failed to send message",
                });
            }
        } finally {
            // Ensure any in-progress message is marked done on abort or error
            if (assistantMsgId) {
                updateMessage(assistantMsgId, { isStreaming: false });
            }
            if (thinkingMsgId) {
                updateMessage(thinkingMsgId, { isStreaming: false });
            }
            setIsStreaming(false);
            setAbortController(null);
        }
    }, [id, sessionId, addMessage, updateMessage, addEvent, clearEvents, setIsStreaming, setAbortController, addToast]);

    /* ── Stop streaming handler ────────────────────────────────────────────── */
    const handleStop = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsStreaming(false);
        }
    }, [abortController, setAbortController, setIsStreaming]);

    /* ── New chat handler ──────────────────────────────────────────────────── */
    const handleNewChat = useCallback(() => {
        router.push(`/chat/${id}?newSession=true`);
    }, [id, router]);

    /* ── Delete session handler ────────────────────────────────────────────── */
    const handleDeleteSession = useCallback(async () => {
        if (!sessionId) return;
        try {
            await fetch(`/api/v1/agent/session/${sessionId}`, { method: "DELETE" });
            localStorage.removeItem(`session_${sessionId}`);
            addToast({
                type: "success",
                message: "Session deleted",
            });
            router.push(`/chat/${id}?newSession=true`);
        } catch {
            addToast({
                type: "error",
                message: "Failed to delete session",
            });
        }
    }, [sessionId, id, router, addToast]);

    /* ── Export session handler ────────────────────────────────────────────── */
    const handleExport = useCallback(() => {
        if (!sessionId) return;
        const stored = localStorage.getItem(`session_${sessionId}`);
        if (!stored) return;

        const blob = new Blob([stored], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-${sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);

        addToast({
            type: "success",
            message: "Session exported",
        });
    }, [sessionId, addToast]);

    /* ── Share session handler ─────────────────────────────────────────────── */
    const handleShare = useCallback(() => {
        if (!sessionId) return;
        const url = `${window.location.origin}/chat?id=${sessionId}`;
        navigator.clipboard.writeText(url);
        addToast({
            type: "success",
            message: "Link copied to clipboard",
        });
    }, [sessionId, addToast]);

    return (
        <div className="flex flex-col h-dvh">
            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <MessageList
                    messages={messages}
                    events={events}
                    agentAvatar={agent?.avatar}
                    isStreaming={isStreaming}
                />

                {/* Input */}
                <MessageInput
                    onSend={handleSendMessage}
                    onStop={handleStop}
                    isStreaming={isStreaming}
                    placeholder={`Message ${agent?.name || "Agent"}...`}
                />
            </div>

            {/* Chat Controls (floating button + settings panel) */}
            <ChatControls
                agentId={id as string}
                agentName={agent?.name}
                modelName={agent?.model?.modelId}
                toolCount={agent?.tools?.enabled?.length || 0}
                sessionId={sessionId}
                onNewChat={handleNewChat}
                onDelete={handleDeleteSession}
                onExport={handleExport}
                onShare={handleShare}
            />

            {/* Sessions Panel (optional slide-in) */}
            {sessionsPanelOpen && (
                <SessionsPanel
                    isOpen={sessionsPanelOpen}
                    onClose={() => setSessionsPanelOpen(false)}
                    sessions={agentSessions}
                    activeSessionId={sessionId}
                    agentId={id as string}
                    onSelectSession={(sid: string) => {
                        router.push(`/chat/${id}?sessionId=${sid}`);
                    }}
                    onNewSession={handleNewChat}
                />
            )}
        </div>
    );
}
