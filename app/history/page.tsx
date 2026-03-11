"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { fetchAgents, fetchSessions, searchSessions, deleteSession, SessionSummary } from "@/lib/api";
import { AgentConfig } from "@/models/Agent";
import { Trash2, ArrowUpRight, Clock } from "lucide-react";

type SessionWithAgent = SessionSummary & { agentName: string };

function groupByTime(sessions: SessionWithAgent[]): Record<string, SessionWithAgent[]> {
    const now = Date.now();
    const DAY = 86_400_000;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;

    const groups: Record<string, SessionWithAgent[]> = {
        Today: [],
        Yesterday: [],
        "This week": [],
        "Last month": [],
        Earlier: [],
    };

    sessions.forEach((s) => {
        const age = now - s.lastActiveAt;
        if (age < DAY) groups["Today"].push(s);
        else if (age < 2 * DAY) groups["Yesterday"].push(s);
        else if (age < WEEK) groups["This week"].push(s);
        else if (age < MONTH) groups["Last month"].push(s);
        else groups["Earlier"].push(s);
    });

    return Object.fromEntries(
        Object.entries(groups).filter(([, v]) => v.length > 0)
    );
}

function formatTime(ts: number): string {
    const now = Date.now();
    const age = now - ts;
    const DAY = 86_400_000;

    if (age < DAY) {
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

const PAGE_SIZE = 20;

export default function HistoryPage() {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [sessions, setSessions] = useState<SessionWithAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const agentMapRef = useRef<Record<string, string>>({});
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const offsetRef = useRef(0);

    function toSessionWithAgent(s: SessionSummary): SessionWithAgent {
        return { ...s, agentName: agentMapRef.current[s.agentId] || "Agent" };
    }

    // Load agents once — high limit so all agents appear as filter pills
    useEffect(() => {
        fetchAgents({ offset: 0, limit: 200 })
            .then(({ agents: data }) => {
                setAgents(data);
                const map: Record<string, string> = {};
                data.forEach((a) => { map[a.id] = a.name; });
                agentMapRef.current = map;
            })
            .catch(console.error);
    }, []);

    // Load/search sessions whenever query or agent filter changes (resets to page 1)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const run = async () => {
            setLoading(true);
            offsetRef.current = 0;
            try {
                const page = searchQuery.trim()
                    ? await searchSessions(searchQuery.trim(), selectedAgent ?? undefined, 0, PAGE_SIZE)
                    : await fetchSessions({ agentId: selectedAgent ?? undefined, offset: 0, limit: PAGE_SIZE });

                setSessions(page.sessions.map(toSessionWithAgent));
                setHasMore(page.hasMore);
            } catch {
                setSessions([]);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search input, run immediately for filter changes
        if (searchQuery.trim()) {
            debounceRef.current = setTimeout(run, 300);
        } else {
            run();
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, selectedAgent]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextOffset = offsetRef.current + PAGE_SIZE;
        try {
            const page = searchQuery.trim()
                ? await searchSessions(searchQuery.trim(), selectedAgent ?? undefined, nextOffset, PAGE_SIZE)
                : await fetchSessions({ agentId: selectedAgent ?? undefined, offset: nextOffset, limit: PAGE_SIZE });

            offsetRef.current = nextOffset;
            setSessions((prev) => [...prev, ...page.sessions.map(toSessionWithAgent)]);
            setHasMore(page.hasMore);
        } catch {
            // keep existing sessions
        } finally {
            setLoadingMore(false);
        }
    };

    const grouped = useMemo(() => groupByTime(sessions), [sessions]);

    const confirmDelete = async (sessionId: string) => {
        // Optimistic removal
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setDeletingId(null);
        // Backend delete + localStorage cleanup
        await deleteSession(sessionId);
        try { localStorage.removeItem(`session_${sessionId}`); } catch { /* ignore */ }
    };

    return (
        <div className="min-h-full px-4 py-10 sm:py-14">
            <div className="app-shell-regular flex w-full flex-col gap-8">

                {/* Header */}
                <div className="slide-up flex flex-col gap-1" style={{ animationDelay: "0ms" }}>
                    <h1
                        className="text-[22px] font-bold text-foreground"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        History
                    </h1>
                    <p className="text-[14px] text-muted">Your past conversations.</p>
                </div>

                {/* Search + filters */}
                <div className="slide-up flex flex-col gap-3" style={{ animationDelay: "30ms" }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sessions…"
                        className={[
                            "w-full px-4 py-2.5 rounded-[var(--radius-md)] text-[14px]",
                            "bg-surface border border-border",
                            "placeholder:text-muted-foreground text-foreground",
                            "focus:outline-none focus:border-primary/40",
                            "transition-colors",
                        ].join(" ")}
                    />

                    {agents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedAgent(null)}
                                className={[
                                    "px-3 py-1 rounded-full text-[12px] font-medium transition-colors",
                                    selectedAgent === null
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-surface text-muted hover:text-foreground border border-border",
                                ].join(" ")}
                            >
                                All
                            </button>
                            {agents.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() =>
                                        setSelectedAgent(selectedAgent === a.id ? null : a.id)
                                    }
                                    className={[
                                        "px-3 py-1 rounded-full text-[12px] font-medium transition-colors",
                                        selectedAgent === a.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface text-muted hover:text-foreground border border-border",
                                    ].join(" ")}
                                >
                                    {a.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Session list */}
                {loading ? (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center fade-enter">
                        <Clock size={28} className="text-muted-foreground opacity-40" />
                        <p className="text-[14px] text-muted">
                            {searchQuery || selectedAgent
                                ? "No sessions match your filters."
                                : "No conversation history yet."}
                        </p>
                        {!searchQuery && !selectedAgent && (
                            <Link
                                href="/"
                                className="text-[13px] text-primary hover:text-primary/80 transition-colors"
                            >
                                Start a conversation →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {Object.entries(grouped).map(([group, groupSessions]) => (
                            <div key={group} className="slide-up">
                                <h2 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    {group}
                                </h2>

                                <div className="rounded-[var(--radius-lg)] border border-border overflow-hidden divide-y divide-border">
                                    {groupSessions.map((session) => {
                                        const isDeleting = deletingId === session.id;

                                        return (
                                            <div
                                                key={session.id}
                                                className="group flex items-center gap-3 px-4 py-3 bg-background hover:bg-surface transition-colors"
                                            >
                                                {isDeleting ? (
                                                    <div className="flex-1 flex items-center gap-3">
                                                        <span className="text-[13px] text-foreground flex-1">
                                                            Delete this conversation?
                                                        </span>
                                                        <button
                                                            onClick={() => confirmDelete(session.id)}
                                                            className="text-[13px] font-medium text-red hover:text-red/80 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(null)}
                                                            className="text-[13px] text-muted hover:text-foreground transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={`/chat/${session.agentId}?sessionId=${session.id}`}
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-[14px] font-medium text-foreground truncate">
                                                                    {session.title || "Conversation"}
                                                                </span>
                                                                <span className="text-[12px] text-muted-foreground shrink-0">
                                                                    {formatTime(session.lastActiveAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] text-muted mt-0.5 truncate">
                                                                {session.agentName}
                                                            </p>
                                                        </Link>

                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <Link
                                                                href={`/chat/${session.agentId}?sessionId=${session.id}`}
                                                                className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-active transition-colors"
                                                                aria-label="Open session"
                                                            >
                                                                <ArrowUpRight size={14} />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeletingId(session.id)}
                                                                className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red hover:bg-red/5 transition-colors"
                                                                aria-label="Delete session"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="self-center px-4 py-2 rounded-[var(--radius-md)] text-[13px] text-muted hover:text-foreground border border-border hover:border-primary/30 bg-surface transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? "Loading…" : "Load more"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
