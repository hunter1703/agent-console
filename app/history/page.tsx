"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAgentConfig } from "@/lib/api";
import { AgentConfig } from "@/models/Agent";
import { Message } from "@/components/ChatWindow";

interface SessionSummary {
    agentId: string;
    agentName: string;
    lastMessage: string;
    messageCount: number;
    timestamp: number; // We don't have this yet, but we can approximate or add it
}

export default function HistoryPage() {
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const items: SessionSummary[] = [];

        // Iterate through all keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("history_")) {
                const agentId = key.replace("history_", "");
                try {
                    const messages: Message[] = JSON.parse(localStorage.getItem(key) || "[]");
                    if (messages.length === 0) continue;

                    let agentName = agentId;
                    try {
                        const config = await fetchAgentConfig(agentId);
                        agentName = config.name;
                    } catch (e) {
                        // Keep ID if fetch fails (e.g. deleted agent)
                    }

                    const lastMsg = messages[messages.length - 1];

                    items.push({
                        agentId,
                        agentName,
                        lastMessage: lastMsg.content,
                        messageCount: messages.length,
                        timestamp: parseInt(lastMsg.id) || Date.now() // Fallback if ID isn't timestamp
                    });
                } catch (e) {
                    console.error("Failed to parse history", e);
                }
            }
        }

        // Sort by newest first
        items.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(items);
        setLoading(false);
    };

    const clearHistory = (agentId: string) => {
        if (!confirm("Are you sure you want to delete this conversation?")) return;
        localStorage.removeItem(`history_${agentId}`);
        localStorage.removeItem(`threadId_${agentId}`);
        loadHistory(); // Reload list
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
                            <div key={session.agentId} className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                                <Link href={`/agents/${session.agentId}`} className="flex-1 min-w-0 pr-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                                            {session.agentName}
                                        </h3>
                                        <span className="text-xs text-muted font-mono">
                                            {new Date(session.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {session.lastMessage}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-muted-foreground">
                                            {session.messageCount} messages
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => clearHistory(session.agentId)}
                                    className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete History"
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
