"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAgents, fetchSessions, SessionSummary } from "@/lib/api";
import { AgentConfig } from "@/models/Agent";
import { Plus, ArrowRight } from "lucide-react";

const AGENT_PAGE_SIZE = 12;

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning.";
    if (hour < 17) return "Good afternoon.";
    return "Good evening.";
}

function getAgentInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


function formatRelativeTime(ts: number): string {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function HomePage() {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [hasMoreAgents, setHasMoreAgents] = useState(false);
    const [loadingMoreAgents, setLoadingMoreAgents] = useState(false);
    const [recentSessions, setRecentSessions] = useState<(SessionSummary & { agentName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const agentOffsetRef = useRef(0);

    useEffect(() => {
        Promise.all([fetchAgents({ offset: 0, limit: AGENT_PAGE_SIZE }), fetchSessions({ limit: 5 })])
            .then(([agentPage, sessionPage]) => {
                setAgents(agentPage.agents);
                setHasMoreAgents(agentPage.hasMore);
                agentOffsetRef.current = 0;
                const agentMap: Record<string, string> = {};
                agentPage.agents.forEach((a) => { agentMap[a.id] = a.name; });
                setRecentSessions(
                    sessionPage.sessions.map((s) => ({ ...s, agentName: agentMap[s.agentId] || "Agent" }))
                );
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadMoreAgents = async () => {
        if (loadingMoreAgents || !hasMoreAgents) return;
        setLoadingMoreAgents(true);
        const nextOffset = agentOffsetRef.current + AGENT_PAGE_SIZE;
        try {
            const page = await fetchAgents({ offset: nextOffset, limit: AGENT_PAGE_SIZE });
            agentOffsetRef.current = nextOffset;
            setAgents((prev) => [...prev, ...page.agents]);
            setHasMoreAgents(page.hasMore);
        } catch {
            // keep existing agents
        } finally {
            setLoadingMoreAgents(false);
        }
    };

    const startNewChat = (agentId: string) => {
        router.push(`/chat/${agentId}`);
    };

    return (
        <div className="min-h-full px-4 py-12 sm:py-16">
            <div className="app-shell-regular flex w-full flex-col gap-10">

                {/* Greeting */}
                <div className="slide-up" style={{ animationDelay: "0ms" }}>
                    <h1
                        className="text-[28px] font-bold tracking-tight text-foreground"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        {getGreeting()}
                    </h1>
                    <p className="mt-1 text-[15px] text-muted">
                        What would you like to explore?
                    </p>
                </div>

                {/* Agent row */}
                <div className="slide-up" style={{ animationDelay: "40ms" }}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-semibold text-muted uppercase tracking-wide">
                            Agents
                        </span>
                        <Link
                            href="/settings/agents/new"
                            className="flex items-center gap-1 text-[13px] text-primary hover:text-primary/80 transition-colors"
                        >
                            <Plus size={13} />
                            New
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex gap-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-[72px] w-[120px] rounded-xl bg-surface animate-pulse"
                                />
                            ))}
                        </div>
                    ) : agents.length === 0 ? (
                        <Link
                            href="/settings/agents/new"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border text-[14px] text-muted hover:text-foreground hover:border-primary/30 transition-colors"
                        >
                            <Plus size={16} />
                            Configure your first agent
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3 flex-wrap">
                                {agents.map((agent) => (
                                    <button
                                        key={agent.id}
                                        onClick={() => startNewChat(agent.id)}
                                        className="group flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface-hover transition-all text-left min-w-[100px]"
                                    >
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-accent-surface border border-primary/20 flex items-center justify-center text-[13px] font-semibold text-primary overflow-hidden">
                                            {agent.avatar ? (
                                                <img
                                                    src={agent.avatar}
                                                    alt={agent.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                getAgentInitials(agent.name)
                                            )}
                                        </div>
                                        <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors leading-tight text-center">
                                            {agent.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {hasMoreAgents && (
                                <button
                                    onClick={loadMoreAgents}
                                    disabled={loadingMoreAgents}
                                    className="self-start text-[13px] text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                >
                                    {loadingMoreAgents ? "Loading…" : "More agents"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent sessions */}
                {!loading && recentSessions.length > 0 && (
                    <div className="slide-up" style={{ animationDelay: "80ms" }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-semibold text-muted uppercase tracking-wide">
                                Recent
                            </span>
                            <Link
                                href="/history"
                                className="flex items-center gap-1 text-[13px] text-primary hover:text-primary/80 transition-colors"
                            >
                                All history
                                <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                            {recentSessions.map((session) => (
                                <Link
                                    key={session.id}
                                    href={`/chat/${session.agentId}?sessionId=${session.id}`}
                                    className="flex items-center gap-3 px-4 py-3 bg-background hover:bg-surface transition-colors group"
                                >
                                    {/* Agent initial dot */}
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-accent-surface border border-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                                        {getAgentInitials(session.agentName)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[14px] font-medium text-foreground leading-tight">
                                                {session.title || "Conversation"}
                                            </span>
                                            <span className="text-[12px] text-muted-foreground shrink-0">
                                                {formatRelativeTime(session.lastActiveAt)}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-muted mt-0.5 truncate">
                                            {session.agentName}
                                        </p>
                                    </div>

                                    <ArrowRight
                                        size={14}
                                        className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
