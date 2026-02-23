"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAgents } from "@/lib/api";
import { AgentConfig } from "@/models/Agent";
import { ChatSession } from "@/models/Session";
import { Clock, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

export default function HistoryPage() {
    const [sessions, setSessions] = useState<(ChatSession & { agentName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const confirm = useConfirm();
    const toast = useToast();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        // 1. Collect all sessions from localStorage
        const rawSessions: ChatSession[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("session_")) {
                    try {
                        const session: ChatSession = JSON.parse(localStorage.getItem(key) || "{}");
                        if (!session.id || !session.messages || session.messages.length === 0) continue;
                        rawSessions.push(session);
                    } catch (e) {
                        console.error("Failed to parse session", e);
                    }
                }
            }
        } catch (e) {
            console.error("localStorage not available", e);
        }

        // 2. Fetch all agents ONCE and build a name lookup map
        let agentNameMap: Record<string, string> = {};
        try {
            const agents: AgentConfig[] = await fetchAgents();
            agentNameMap = agents.reduce((map, agent) => {
                map[agent.id] = agent.name;
                return map;
            }, {} as Record<string, string>);
        } catch (e) {
            console.error("Failed to fetch agents for name lookup", e);
        }

        // 3. Map sessions with agent names
        const items = rawSessions.map((session) => ({
            ...session,
            agentName: agentNameMap[session.agentId] || session.agentId,
        }));

        // Sort by last active (newest first)
        items.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
        setSessions(items);
        setLoading(false);
    };

    const deleteSession = async (sessionId: string) => {
        const confirmed = await confirm({
            title: "Delete Conversation",
            message: "This conversation will be removed from your local history. This cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
        });

        if (!confirmed) return;

        try {
            localStorage.removeItem(`session_${sessionId}`);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            toast.success("Conversation removed from history.");
        } catch (e) {
            toast.error("Failed to delete conversation.");
        }
    };

    const formatTime = (ts: number) => {
        if (!ts) return "Unknown";
        return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 bg-background">
            <div className="max-w-[1200px] mx-auto px-10 pt-20 pb-40">
                <header className="flex justify-between items-end mb-16 border-b border-border pb-10">
                    <div className="flex flex-col gap-2">
                        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">Activity</p>
                        <h2 className="text-[34px] font-semibold tracking-tight text-foreground px-0.5">History</h2>
                        <p className="text-[16px] text-muted-foreground/80 leading-relaxed max-w-md">
                            Review and resume your previous intelligence sessions.
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center gap-4 text-muted-foreground/50 text-[15px] font-medium animate-pulse py-10">
                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        Retrieving your past conversations...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-6 animate-in fade-in duration-700">
                        <div className="w-20 h-20 rounded-[40px] bg-secondary border border-border flex items-center justify-center mb-2 opacity-40">
                            <Clock size={32} strokeWidth={1} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-muted-foreground/60 text-[17px] italic">No conversation history found on this device.</p>
                            <Link href="/" className="text-primary font-medium hover:underline text-[15px]">
                                Start a new session
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-border/30">
                        {sessions.map((session) => (
                            <div key={session.id} className="py-10 flex items-center justify-between group transition-all duration-500 hover:px-2">
                                <Link
                                    href={`/agents/${session.agentId}?sessionId=${session.id}`}
                                    className="flex-1 min-w-0 pr-10 flex flex-col gap-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[19px] font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-300 tracking-tight truncate">
                                                {session.title || "Untitled Session"}
                                            </h3>
                                            <span className="text-[12px] text-muted-foreground/60 font-mono tracking-tighter uppercase tabular-nums pt-1">
                                                {formatTime(session.lastActiveAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[13px] font-medium">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground/80 group-hover:text-foreground transition-colors duration-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                                            {session.agentName}
                                        </div>
                                        <span className="text-muted-foreground/40 leading-none">/</span>
                                        <span className="text-muted-foreground/70">{session.messages.length} messages</span>
                                        <span className="text-muted-foreground/40 leading-none">/</span>
                                        <span className="text-muted-foreground/70">Started {formatTime(session.createdAt)}</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => deleteSession(session.id)}
                                    className="w-11 h-11 flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                    title="Delete Session"
                                    aria-label="Delete session"
                                >
                                    <Trash2 size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
