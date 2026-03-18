"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAgents, useUI } from "@/lib/stores";
import { fetchSessions, SessionSummary } from "@/lib/api";
import { PageHeader, Button, Skeleton, Card } from "@/components/common";
import { Plus, Clock, Grid3X3, List } from "lucide-react";
import { getGreeting, formatRelativeTime, getInitials } from "@/lib/utils";
import { AgentConfig } from "@/models/Agent";

export default function HomePage() {
    const router = useRouter();
    const { agents, agentsLoading, agentsHasMore, agentsTotal, setAgents, setAgentsLoading } = useAgents();
    const { setSidebarOpen } = useUI();
    
    const [recentSessions, setRecentSessions] = useState<(SessionSummary & { agentName?: string })[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [loadingMore, setLoadingMore] = useState(false);
    const agentOffsetRef = useRef(0);
    const loadingRef = useRef(false);
    const observerTargetRef = useRef<HTMLDivElement>(null);

    const AGENT_PAGE_SIZE = 12;

    // Load agents and sessions on mount
    useEffect(() => {
        const loadData = async () => {
            setAgentsLoading(true);
            setSessionsLoading(true);

            try {
                const [agentPage, sessionPage] = await Promise.all([
                    fetchAgents({ offset: 0, limit: AGENT_PAGE_SIZE }),
                    fetchSessions({ limit: 6 }),
                ]);

                setAgents(agentPage.agents, agentPage.hasMore, agentPage.total);
                agentOffsetRef.current = AGENT_PAGE_SIZE;
                
                // Enrich sessions with agent names
                const agentMap = new Map(agentPage.agents.map(a => [a.id, a.name]));
                setRecentSessions(
                    sessionPage.sessions.map(s => ({
                        ...s,
                        agentName: agentMap.get(s.agentId) || "Agent",
                    }))
                );
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setAgentsLoading(false);
                setSessionsLoading(false);
            }
        };

        loadData();
    }, []);

    // Load more agents when near bottom
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && agentsHasMore && !loadingRef.current && !loadingMore) {
                    loadMoreAgents();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = observerTargetRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [agentsHasMore, loadingMore]);

    const loadMoreAgents = async () => {
        if (loadingRef.current || !agentsHasMore) return;
        
        loadingRef.current = true;
        setLoadingMore(true);
        
        try {
            const page = await fetchAgents({ offset: agentOffsetRef.current, limit: AGENT_PAGE_SIZE });
            agentOffsetRef.current += AGENT_PAGE_SIZE;
            setAgents([...agents, ...page.agents], page.hasMore, page.total);
        } catch (error) {
            console.error("Failed to load more agents:", error);
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    };

    const handleNewAgent = () => {
        router.push("/settings/agents/new");
    };

    const handleAgentClick = (agentId: string) => {
        router.push(`/chat/${agentId}`);
    };

    const greeting = getGreeting();

    return (
        <div className="min-h-full">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b border-border">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                
                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                {greeting}
                            </h1>
                            <p className="text-[15px] text-muted-foreground max-w-xl">
                                Ready to explore? Select an agent or continue a recent conversation.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                icon={<Plus size={16} />}
                                onClick={handleNewAgent}
                            >
                                New Agent
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                
                {/* Agents Section */}
                <section>
                    <PageHeader
                        title="Agents"
                        description="Your AI agents and assistants"
                        actions={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-surface"
                                    }`}
                                    aria-label="Grid view"
                                >
                                    <Grid3X3 size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-colors ${
                                        viewMode === "list"
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-surface"
                                    }`}
                                    aria-label="List view"
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        }
                    />
                    
                    {agentsLoading ? (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton 
                                    key={i} 
                                    variant="rounded" 
                                    height={viewMode === "grid" ? 180 : 80} 
                                />
                            ))}
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No agents yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first agent to get started</p>
                            <Button variant="primary" icon={<Plus size={16} />} onClick={handleNewAgent}>
                                Create Agent
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Agent Grid/List */}
                            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                                {agents.map((agent) => (
                                    viewMode === "grid" ? (
                                        <button
                                            key={agent.id}
                                            onClick={() => handleAgentClick(agent.id)}
                                            className="group flex flex-col items-start p-4 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface-hover transition-all text-left"
                                        >
                                            <div className="flex items-start justify-between w-full mb-3">
                                                <div className="w-12 h-12 rounded-full bg-accent-surface border border-primary/20 flex items-center justify-center overflow-hidden">
                                                    {agent.avatar ? (
                                                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[15px] font-semibold text-primary">
                                                            {getInitials(agent.name)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors w-full">
                                                {agent.name}
                                            </h3>
                                            {agent.description && (
                                                <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 w-full">
                                                    {agent.description}
                                                </p>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            key={agent.id}
                                            onClick={() => handleAgentClick(agent.id)}
                                            className="group flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface-hover transition-all text-left w-full"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-accent-surface border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                                {agent.avatar ? (
                                                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[14px] font-semibold text-primary">
                                                        {getInitials(agent.name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {agent.name}
                                                </h3>
                                                {agent.description && (
                                                    <p className="text-[13px] text-muted-foreground truncate">
                                                        {agent.description}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    )
                                ))}
                            </div>
                            
                            {/* Infinite scroll trigger */}
                            <div ref={observerTargetRef} className="h-10 flex items-center justify-center">
                                {loadingMore && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[13px]">Loading more agents...</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Recent Sessions Section */}
                {recentSessions.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Clock size={16} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Recent Conversations</h2>
                                    <p className="text-[13px] text-muted-foreground">Pick up where you left off</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => router.push("/history")}
                                className="text-[14px] text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                            >
                                View all
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {sessionsLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={72} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentSessions.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => router.push(`/chat/${session.agentId}?sessionId=${session.id}`)}
                                        className="group flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-surface-hover transition-all text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-accent-surface border border-primary/20 flex items-center justify-center shrink-0">
                                            <span className="text-[13px] font-semibold text-primary">
                                                {getInitials(session.agentName || "Agent")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[14px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                {session.title || "Conversation"}
                                            </h3>
                                            <p className="text-[12px] text-muted-foreground truncate">
                                                {session.agentName}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                                                {formatRelativeTime(session.lastActiveAt)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

// Import fetchAgents from the new API
import { fetchAgents } from "@/lib/apis";
