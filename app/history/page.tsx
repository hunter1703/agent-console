"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAgentConfig } from "@/lib/api";
import { ChatSession } from "@/models/Session";

export default function HistoryPage() {
    const [sessions, setSessions] = useState<(ChatSession & { agentName: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const items: (ChatSession & { agentName: string })[] = [];

        // Iterate through all keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("session_")) {
                try {
                    const session: ChatSession = JSON.parse(localStorage.getItem(key) || "{}");
                    if (!session.id || !session.messages || session.messages.length === 0) continue;

                    let agentName = session.agentId;
                    try {
                        const config = await fetchAgentConfig(session.agentId);
                        agentName = config.name;
                    } catch (e) {
                        // Keep ID if fetch fails
                    }

                    items.push({ ...session, agentName });
                } catch (e) {
                    console.error("Failed to parse session", e);
                }
            }
        }

        // Sort by last active (newest first)
        items.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
        setSessions(items);
        setLoading(false);
    };

    const deleteSession = (sessionId: string) => {
        localStorage.removeItem(`session_${sessionId}`);
        loadHistory();
    };

    const formatTime = (ts: number) => {
        if (!ts) return "Unknown";
        return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h2 className="text-3xl font-bold mb-2">Chat History</h2>
                    <p className="text-muted">Resume your previous conversations.</p>
                </header>

                {loading ? (
                    <div className="text-muted italic animate-pulse">Scanning local history...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-white/5 rounded-3xl border border-white/5">
                        <div className="text-4xl mb-4 opacity-50">🕰️</div>
                        <p>No conversation history found on this device.</p>
                        <Link href="/" className="inline-block mt-4 text-primary hover:underline">
                            Start a new chat
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                                <Link href={`/agents/${session.agentId}?sessionId=${session.id}`} className="flex-1 min-w-0 pr-4">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate pr-4">
                                            {session.title || "Untitled Session"}
                                        </h3>
                                        <span className="text-xs text-muted font-mono whitespace-nowrap">
                                            {formatTime(session.lastActiveAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                                            {session.agentName}
                                        </div>
                                        <span>•</span>
                                        <span>Started {formatTime(session.createdAt)}</span>
                                        <span>•</span>
                                        <span>{session.messages.length} messages</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => deleteSession(session.id)}
                                    className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Session"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
