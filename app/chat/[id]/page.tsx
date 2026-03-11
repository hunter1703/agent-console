"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AgentConfig } from "@/models/Agent";
import { AgentEvent } from "@/models/Events";
import { ChatSession } from "@/models/Session";
import { AgentSessionDTO } from "@/models/ApiSchemas";
import { fetchAgentConfig, fetchSessions, getResourceById, SessionSummary } from "@/lib/api";
import { mockStreamResponse } from "@/lib/mock";
import { fetchSseStream } from "@/lib/stream";
import { translateAguiEvent } from "@/adapters/aguiAdapter";
import { reconstructEvents } from "@/lib/events";
import {
    buildPlanningMessage,
    isPlanningTool,
    mergePlanningData,
    PlanningMessageData,
} from "@/lib/planning";
import MessageInput from "@/components/MessageInput";
import ThinkingCard from "@/components/ThinkingCard";
import PlanningCard from "@/components/PlanningCard";
import ToolDetails from "@/components/ToolDetails";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SessionsPanel from "@/components/SessionsPanel";
import { ArrowLeft, Settings, AlignLeft, Copy, Check, SquarePen } from "lucide-react";

/* ── Message types ─────────────────────────────────────────────────────────── */
export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    kind?: "text" | "planning" | "thought";
    planning?: PlanningMessageData;
    isStreaming?: boolean;
    thoughts?: string[];
    thinkingDurationSecs?: number;
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

/* ── User message bubble ───────────────────────────────────────────────────── */
function UserBubble({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(content).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group flex flex-col items-end gap-1 message-enter">
            <div
                className="max-w-[72%] px-4 py-2.5 text-[15px] text-white leading-relaxed whitespace-pre-wrap"
                style={{
                    background: "var(--primary)",
                    borderRadius: "14px 14px 4px 14px",
                }}
            >
                {content}
            </div>
            <button
                onClick={copy}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted opacity-0 focus:opacity-100 group-hover:opacity-100 transition-opacity"
            >
                {copied ? (
                    <><Check size={10} className="text-green" /> Copied</>
                ) : (
                    <><Copy size={10} /> Copy</>
                )}
            </button>
        </div>
    );
}

/* ── Assistant text bubble ─────────────────────────────────────────────────── */
function AssistantBubble({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);
    const [rawMode, setRawMode] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(content).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-start gap-1 message-enter group">
            <div className="text-[15px] text-foreground leading-relaxed w-full">
                {rawMode ? (
                    <pre className="font-mono text-[13px] text-muted-foreground whitespace-pre-wrap bg-surface border border-border rounded-[var(--radius-sm)] p-3 overflow-x-auto">
                        {content || "No content"}
                    </pre>
                ) : (
                    <MarkdownRenderer content={content} />
                )}
            </div>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={copy}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted transition-colors"
                >
                    {copied ? (
                        <><Check size={10} className="text-green" /> Copied</>
                    ) : (
                        <><Copy size={10} /> Copy</>
                    )}
                </button>
                <button
                    onClick={() => setRawMode((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted transition-colors"
                >
                    <AlignLeft size={10} />
                    {rawMode ? "Rendered" : "Raw"}
                </button>
            </div>
        </div>
    );
}

/* ── Main Studio page ──────────────────────────────────────────────────────── */
export default function StudioPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [agent, setAgent] = useState<AgentConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [pauseInfo, setPauseInfo] = useState<PauseInfo | null>(null);
    const [sessionsPanelOpen, setSessionsPanelOpen] = useState(false);
    const [agentSessions, setAgentSessions] = useState<SessionSummary[]>([]);

    const currentRunId = useRef<string | null>(null);
    const toolArgsRef = useRef<Record<string, { toolName: string; args: string }>>({});
    const isMessagingRef = useRef(false);
    const messageSentAtRef = useRef<number>(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAutoScroll = useRef(true);
    // Ref so handleAgentEvent (stable useCallback) always sees current sessionId
    const sessionIdRef = useRef<string | null>(null);

    // onWheel fires before the scroll event, letting us cut off auto-scroll
    // before the next React effect runs. onScroll re-enables when back at bottom.
    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY < 0) isAutoScroll.current = false;
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop - clientHeight <= 60) isAutoScroll.current = true;
    };

    useEffect(() => {
        if (scrollRef.current && isAutoScroll.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Keep sessionIdRef current so the stable handleAgentEvent callback can read it
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    // 1. Load agent metadata
    useEffect(() => {
        if (!id) return;
        fetchAgentConfig(id as string)
            .then(setAgent)
            .catch((e) => console.error("Failed to load agent", e));
    }, [id]);

    // 2. Load agent sessions for the panel from backend API
    useEffect(() => {
        if (!id) return;
        fetchSessions({ agentId: id as string, limit: 50 })
            .then(({ sessions }) => setAgentSessions(sessions))
            .catch(() => setAgentSessions([]));
    }, [id, sessionId]); // Refresh when session changes

    // 3. Initialize session from URL params
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
                    const session: ChatSession = JSON.parse(stored);
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

            // Fetch historic events from backend. Fall back to URL sessionId when
            // no local cache exists so direct links still hydrate pause/history.
            backendThreadId = backendThreadId || currentSid;
            if (backendThreadId) {
                try {
                    const dto: AgentSessionDTO = await getResourceById(
                        "session",
                        backendThreadId,
                        { includeEvents: true }
                    );
                    if (active && dto.events && Array.isArray(dto.events)) {
                        const translated = dto.events.flatMap((ev) =>
                            translateAguiEvent(ev)
                        );
                        setEvents(reconstructEvents(translated));
                    }
                    if (active) {
                        setPauseInfo(normalizePauseInfo((dto as any).pause));
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

    // 4. Persist session to localStorage
    useEffect(() => {
        if (sessionId && agent) {
            const sidToStore = threadId || sessionId;
            const sessionData: ChatSession = {
                id: sidToStore,
                agentId: agent.id,
                title:
                    messages.length > 0
                        ? messages[0].content.slice(0, 60) +
                          (messages[0].content.length > 60 ? "…" : "")
                        : "New Chat",
                createdAt: parseInt(sidToStore) || Date.now(),
                lastActiveAt: Date.now(),
                messages: messages as any,
                threadId: threadId || undefined,
            };
            try {
                localStorage.setItem(`session_${sidToStore}`, JSON.stringify(sessionData));
            } catch {
                /* storage full */
            }
        }
    }, [messages, sessionId, agent, threadId]);

    /* ── Event handler — preserved exactly from agents/[id]/page.tsx ──────── */
    const handleAgentEvent = useCallback((ev: AgentEvent) => {
        if (ev.type === "ThinkingStart") {
            setMessages((prev) => {
                const lastIdx = [...prev].reverse().findIndex((m) => m.kind === "thought");
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx !== -1) {
                    const next = [...prev];
                    next[idx] = { ...prev[idx], isStreaming: true };
                    return next;
                }
                return prev;
            });
        }

        if (ev.type === "ThinkingMessageStart") {
            setMessages((prev) => {
                const lastIdx = [...prev]
                    .reverse()
                    .findIndex((m) => m.kind === "thought");
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx !== -1) {
                    const last = prev[idx];
                    const thoughts = [...(last.thoughts || [])];
                    if (thoughts.length > 0 && thoughts[thoughts.length - 1] !== "") {
                        thoughts.push("");
                    } else if (thoughts.length === 0) {
                        thoughts.push("");
                    }
                    const next = [...prev];
                    next[idx] = { ...last, isStreaming: true, thoughts };
                    return next;
                }
                return prev;
            });
        }

        if (ev.type === "ThinkingUpdate") {
            setMessages((prev) => {
                const lastIdx = [...prev]
                    .reverse()
                    .findIndex((m) => m.kind === "thought");
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx !== -1) {
                    const last = prev[idx];
                    const next = [...prev];
                    const thoughts = [...(last.thoughts || [""])];
                    if (ev.isSync) {
                        thoughts[thoughts.length - 1] = ev.content || "";
                    } else {
                        thoughts[thoughts.length - 1] += ev.content;
                    }
                    next[idx] = { ...last, thoughts };
                    return next;
                }
                return prev;
            });
        }

        if (ev.type === "ThinkingEnd") {
            // One thought block finished — filter empty strings but keep isStreaming: true
            // because more thought blocks may follow. AssistantTextStart closes the phase.
            setMessages((prev) => {
                const lastIdx = [...prev]
                    .reverse()
                    .findIndex((m) => m.kind === "thought");
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx !== -1) {
                    const last = prev[idx];
                    const filteredThoughts = (last.thoughts || [])
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);
                    const next = [...prev];
                    next[idx] = { ...last, thoughts: filteredThoughts };
                    return next;
                }
                return prev;
            });
        }

        if (ev.type === "AssistantTextStart") {
            isMessagingRef.current = true;
            const durationSecs = messageSentAtRef.current
                ? Math.ceil((Date.now() - messageSentAtRef.current) / 1000)
                : undefined;
            // Close the thinking phase — always keep the thought message (never remove)
            setMessages((prev) => {
                const lastIdx = [...prev]
                    .reverse()
                    .findIndex((m) => m.kind === "thought" && m.isStreaming);
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx === -1) return prev;
                const last = prev[idx];
                const filtered = (last.thoughts || [])
                    .map((t: string) => t.trim())
                    .filter((t: string) => t.length > 0);
                const next = [...prev];
                next[idx] = { ...last, isStreaming: false, thoughts: filtered, thinkingDurationSecs: durationSecs };
                return next;
            });
        }
        if (ev.type === "AssistantTextFinal") isMessagingRef.current = false;

        if (ev.type === "ToolCallStarted" && ev.toolCallId) {
            const existing = toolArgsRef.current[ev.toolCallId];
            toolArgsRef.current[ev.toolCallId] = {
                toolName: ev.toolName || existing?.toolName || "",
                args: ev.arguments || existing?.args || "",
            };
        }

        if (ev.type === "ToolArgsUpdate") {
            const existing = toolArgsRef.current[ev.toolCallId];
            toolArgsRef.current[ev.toolCallId] = {
                toolName: existing?.toolName || "",
                args: (existing?.args || "") + ev.argumentsDelta,
            };
            setEvents((prev) =>
                prev.map((e) => {
                    if (e.type === "ToolCallStarted" && e.toolCallId === ev.toolCallId) {
                        return {
                            ...e,
                            arguments: (e.arguments || "") + ev.argumentsDelta,
                        };
                    }
                    return e;
                })
            );
            return;
        }

        const eventWithRunId = {
            ...ev,
            timestamp: ev.timestamp || Date.now(),
            runId: ev.runId || currentRunId.current || undefined,
        };

        setEvents((prev) => {
            let nextPrev = prev;

            if (ev.type === "RunStarted" && ev.runId) {
                const hasPending = nextPrev.some((e) =>
                    e.runId?.toString().startsWith("pending_")
                );
                if (hasPending) {
                    nextPrev = nextPrev.map((e) =>
                        e.runId?.toString().startsWith("pending_")
                            ? { ...e, runId: ev.runId }
                            : e
                    );
                }
            }

            const runIdToCheck = eventWithRunId.runId;
            let lastPlaceholder = nextPrev
                .filter(
                    (e) =>
                        e.runId === runIdToCheck &&
                        e.type === "ThinkingStart" &&
                        (e as any).isPlaceholder
                )
                .pop();

            if (!lastPlaceholder && ev.type === "ThinkingStart" && !(ev as any).isPlaceholder) {
                lastPlaceholder = nextPrev
                    .filter(
                        (e) =>
                            e.runId?.toString().startsWith("pending_") &&
                            e.type === "ThinkingStart" &&
                            (e as any).isPlaceholder
                    )
                    .pop();
            }

            if (
                ev.type === "ThinkingStart" &&
                !(ev as any).isPlaceholder &&
                lastPlaceholder
            ) {
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
            setPauseInfo(null);
            if (!sessionIdRef.current) {
                sessionIdRef.current = ev.threadId;
                setSessionId(ev.threadId);
                window.history.replaceState(
                    null,
                    "",
                    `/chat/${id}?sessionId=${ev.threadId}`
                );
            }
        }

        if (ev.type === "AssistantTextDelta") {
            if (!isMessagingRef.current) {
                setMessages((prev) => {
                    const lastIdx = [...prev]
                        .reverse()
                        .findIndex((m) => m.kind === "thought");
                    const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                    if (idx !== -1) {
                        const last = prev[idx];
                        const next = [...prev];
                        const thoughts = [...(last.thoughts || [""])];
                        thoughts[thoughts.length - 1] += ev.content;
                        next[idx] = { ...last, thoughts };
                        return next;
                    }
                    return prev;
                });
                return;
            }

            setMessages((prev) => {
                const mid = ev.messageId || "legacy";
                const existingIndex = prev.findIndex((m) => m.id === mid);

                if (existingIndex !== -1) {
                    const existing = prev[existingIndex];
                    const next = [...prev];
                    next[existingIndex] = {
                        ...existing,
                        content: existing.content + ev.content,
                    };
                    return next;
                }

                const last = prev[prev.length - 1];
                if (
                    mid === "legacy" &&
                    last &&
                    last.role === "assistant" &&
                    (last.kind || "text") === "text"
                ) {
                    return [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + ev.content },
                    ];
                }
                return [
                    ...prev,
                    { id: mid, role: "assistant", content: ev.content },
                ];
            });
        }

        if (ev.type === "AssistantTextSync") {
            if (!isMessagingRef.current) {
                setMessages((prev) => {
                    const lastIdx = [...prev]
                        .reverse()
                        .findIndex((m) => m.kind === "thought");
                    const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                    if (idx !== -1) {
                        const last = prev[idx];
                        const next = [...prev];
                        const thoughts = [...(last.thoughts || [""])];
                        thoughts[thoughts.length - 1] = ev.content;
                        next[idx] = { ...last, thoughts };
                        return next;
                    }
                    return prev;
                });
                return;
            }

            setMessages((prev) => {
                const mid = ev.messageId;
                if (!mid) return prev;
                const existingIndex = prev.findIndex((m) => m.id === mid);
                if (existingIndex !== -1) {
                    const next = [...prev];
                    next[existingIndex] = {
                        ...prev[existingIndex],
                        content: ev.content,
                    };
                    return next;
                }
                return [
                    ...prev,
                    { id: mid, role: "assistant", content: ev.content },
                ];
            });
        }

        if (ev.type === "ToolResult") {
            const storedTool = ev.toolCallId
                ? toolArgsRef.current[ev.toolCallId]
                : undefined;
            const toolName = isPlanningTool(ev.toolName)
                ? ev.toolName
                : storedTool?.toolName;

            if (toolName && isPlanningTool(toolName)) {
                const toolArgs = storedTool?.args;
                const planningMessage = buildPlanningMessage(
                    toolName,
                    ev.content,
                    toolArgs
                );
                if (planningMessage && !planningMessage.error) {
                    const raw = planningMessage.raw || ev.content || toolArgs || "";
                    setMessages((prev) => {
                        const newPlanId = planningMessage.plan?.planId;
                        let existingIdx = -1;
                        if (newPlanId) {
                            existingIdx = prev.findLastIndex(
                                (m) =>
                                    m.kind === "planning" &&
                                    m.planning?.plan?.planId === newPlanId
                            );
                        }
                        if (existingIdx === -1) {
                            existingIdx = prev.findLastIndex(
                                (m) => m.kind === "planning"
                            );
                        }
                        if (
                            existingIdx !== -1 &&
                            planningMessage.action !== "create"
                        ) {
                            const existing = prev[existingIdx];
                            const mergedData = mergePlanningData(
                                existing.planning!,
                                planningMessage
                            );
                            const next = [...prev];
                            next[existingIdx] = {
                                ...existing,
                                content: raw,
                                planning: mergedData,
                            };
                            return next;
                        }
                        return [
                            ...prev,
                            {
                                id: `${Date.now()}-${Math.random()}`,
                                role: "assistant",
                                content: raw,
                                kind: "planning",
                                planning: planningMessage,
                            },
                        ];
                    });
                }
            }

            if (ev.toolCallId) delete toolArgsRef.current[ev.toolCallId];

            setEvents((prev) => [
                ...prev,
                {
                    type: "ThinkingStart",
                    timestamp: Date.now() + 1,
                    runId: eventWithRunId.runId,
                    isPlaceholder: true,
                } as any,
            ]);
        }

        if (ev.type === "ErrorEvent" || ev.type === "StreamEnd") {
            setIsStreaming(false);
            // Close any still-open streaming thought bubble
            setMessages((prev) => {
                const lastIdx = [...prev]
                    .reverse()
                    .findIndex((m) => m.kind === "thought" && m.isStreaming);
                const idx = lastIdx === -1 ? -1 : prev.length - 1 - lastIdx;
                if (idx === -1) return prev;
                const last = prev[idx];
                const durationSecs = messageSentAtRef.current
                    ? Math.ceil((Date.now() - messageSentAtRef.current) / 1000)
                    : undefined;
                const filtered = (last.thoughts || []).map((t) => t.trim()).filter((t) => t.length > 0);
                const next = [...prev];
                next[idx] = { ...last, isStreaming: false, thoughts: filtered, thinkingDurationSecs: durationSecs };
                return next;
            });
        }

        if (ev.type === "CorrectionEvent") {
            setMessages((prev) => [
                ...prev,
                {
                    id: `correction-${Date.now()}-${Math.random()}`,
                    role: "assistant",
                    content: `Policy feedback: ${ev.message}`,
                    kind: "text",
                },
            ]);
        }
    }, []);

    /* ── Send message ──────────────────────────────────────────────────────── */
    const handleSend = async (text: string) => {
        if (!text.trim() || isStreaming) return;

        setIsStreaming(true);
        messageSentAtRef.current = Date.now();
        currentRunId.current = `pending_${Date.now()}`;
        const controller = new AbortController();
        setAbortController(controller);

        try {
            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                content: text,
            };
            const thoughtMsg: Message = {
                id: `thought-${Date.now()}`,
                role: "assistant",
                content: "",
                kind: "thought",
                isStreaming: true,
                thoughts: [],
            };
            setMessages((prev) => [...prev, userMsg, thoughtMsg]);

            const pendingRunId = currentRunId.current;
            setEvents((prev) => [
                ...prev,
                {
                    type: "ThinkingStart",
                    timestamp: Date.now(),
                    runId: pendingRunId || undefined,
                    isPlaceholder: true,
                } as any,
            ]);

            if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
                const mockStream = mockStreamResponse(text);
                for await (const ev of mockStream) {
                    if (controller.signal.aborted) break;
                    handleAgentEvent(ev);
                }
            } else {
                const API_BASE =
                    process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
                const activeSessionId = threadId || sessionId;
                const isResumeRequest = !!(pauseInfo?.paused && activeSessionId);
                const url = isResumeRequest
                    ? `${API_BASE}/v1/agent/session/${activeSessionId}/resume/events`
                    : `${API_BASE}/v1/events`;
                const body = isResumeRequest
                    ? { message: text }
                    : {
                        type: "agent",
                        agentId: id,
                        sessionId: activeSessionId || undefined,
                        message: text,
                    };

                const stream = fetchSseStream(url, {
                    method: "POST",
                    body: JSON.stringify(body),
                    signal: controller.signal,
                    headers: { "Content-Type": "application/json" },
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
        abortController?.abort();
        setAbortController(null);
        setIsStreaming(false);
        setSessionId(null);
        setThreadId(null);
        setMessages([]);
        setEvents([]);
        setPauseInfo(null);
        currentRunId.current = null;
        sessionIdRef.current = null;
        router.replace(`/chat/${id}`);
    };

    const handleSelectSession = (sid: string) => {
        router.push(`/chat/${id}?sessionId=${sid}`);
    };

    /* ── Non-planning tool events for ToolDetails (last run only) ────────── */
    const lastRunId = currentRunId.current;
    const toolEvents = events.filter(
        (ev) =>
            (ev.type === "ToolCallStarted" || ev.type === "ToolResult") &&
            !isPlanningTool((ev as any).toolName || "") &&
            (lastRunId ? ev.runId === lastRunId : true)
    );

    /* ── Render ───────────────────────────────────────────────────────────── */
    if (!agent) {
        return (
            <div className="h-dvh flex items-center justify-center text-muted text-[14px]">
                Loading…
            </div>
        );
    }

    return (
        <div className="h-dvh flex flex-col overflow-hidden bg-background">
            {/* ── Studio header ─────────────────────────────────────────────── */}
            <header className="h-12 shrink-0 flex items-center gap-2 px-4 border-b border-border bg-background z-10">
                <Link
                    href="/"
                    className="flex items-center gap-1 text-[13px] text-muted hover:text-foreground transition-colors mr-1"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={15} />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                {/* Agent name — center */}
                <span
                    className="flex-1 text-[15px] font-semibold text-foreground text-center truncate"
                    style={{ letterSpacing: "-0.01em" }}
                >
                    {agent.name}
                </span>

                {/* Right actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={resetSession}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                        aria-label="New conversation"
                        title="New conversation"
                    >
                        <SquarePen size={15} />
                    </button>
                    <button
                        onClick={() => setSessionsPanelOpen(true)}
                        className="h-8 px-3 rounded-md text-[13px] font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                    >
                        Sessions
                    </button>
                    <Link
                        href={`/settings`}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                        aria-label="Settings"
                    >
                        <Settings size={15} />
                    </Link>
                </div>
            </header>

            {/* ── Message scroll area ────────────────────────────────────────── */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onWheel={handleWheel}
                className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
            >
                <div className="w-full max-w-[980px] mx-auto px-4 py-8 flex flex-col gap-6">
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 fade-enter">
                            <div className="w-10 h-10 rounded-full bg-accent-surface border border-primary/20 flex items-center justify-center text-[16px] font-semibold text-primary">
                                {agent.name[0]?.toUpperCase()}
                            </div>
                            <div className="text-center">
                                <p className="text-[15px] font-medium text-foreground">
                                    {agent.name}
                                </p>
                                <p className="text-[13px] text-muted mt-0.5">
                                    {agent.description || "Send a message to begin."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map((m) => {
                        if (m.kind === "thought") {
                            return (
                                <ThinkingCard
                                    key={m.id}
                                    thoughts={m.thoughts || []}
                                    isStreaming={m.isStreaming}
                                    durationSecs={m.thinkingDurationSecs}
                                />
                            );
                        }

                        if (m.kind === "planning" && m.planning) {
                            return (
                                <PlanningCard key={m.id} data={m.planning} />
                            );
                        }

                        if (m.role === "user") {
                            return <UserBubble key={m.id} content={m.content} />;
                        }

                        return (
                            <AssistantBubble key={m.id} content={m.content} />
                        );
                    })}

                    {/* Tool details — below the conversation, collapsed by default */}
                    {toolEvents.length > 0 && (
                        <ToolDetails events={toolEvents} />
                    )}
                </div>
            </div>

            {pauseInfo?.paused && (
                <div className="shrink-0 border-t border-border bg-surface/40 px-4 py-3">
                    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-2 rounded-[var(--radius-md)] border border-primary/20 bg-background px-3 py-3">
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-primary">
                            Session paused
                        </p>
                        <p className="text-[13px] text-foreground">
                            {pauseInfo.prompt || "A clarification or confirmation is required before continuing."}
                        </p>
                        {pauseInfo.reason && (
                            <p className="text-[12px] text-muted">
                                Reason: {pauseInfo.reason}
                            </p>
                        )}
                        {pauseInfo.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {pauseInfo.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleSend(option)}
                                        disabled={isStreaming}
                                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] text-primary hover:bg-primary/15 disabled:opacity-60"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Message input ──────────────────────────────────────────────── */}
            <MessageInput
                onSend={handleSend}
                onStop={handleStop}
                isStreaming={isStreaming}
            />

            {/* ── Sessions panel ─────────────────────────────────────────────── */}
            <SessionsPanel
                isOpen={sessionsPanelOpen}
                onClose={() => setSessionsPanelOpen(false)}
                sessions={agentSessions}
                activeSessionId={threadId || sessionId}
                agentId={id as string}
                onSelectSession={handleSelectSession}
                onNewSession={resetSession}
            />
        </div>
    );
}
