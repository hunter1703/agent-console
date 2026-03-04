"use client";

import { useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { ChatSession } from "@/models/Session";

interface SessionsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    agentId: string;
    onSelectSession: (sessionId: string) => void;
    onNewSession: () => void;
}

function formatTime(ts: number): string {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (diff < 60_000) return "just now";
    if (hours < 1) return `${Math.floor(diff / 60_000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function SessionsPanel({
    isOpen,
    onClose,
    sessions,
    activeSessionId,
    agentId,
    onSelectSession,
    onNewSession,
}: SessionsPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={[
                    "fixed right-0 top-0 bottom-0 z-50 w-[280px] sm:w-[320px]",
                    "flex flex-col bg-background border-l border-border",
                    "shadow-[var(--shadow-lg)] panel-enter",
                ].join(" ")}
                role="dialog"
                aria-label="Session history"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-[14px] font-semibold text-foreground">
                        Sessions
                    </span>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* New session button */}
                <div className="px-3 pt-3">
                    <button
                        onClick={() => {
                            onNewSession();
                            onClose();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-primary hover:bg-primary/[0.06] transition-colors"
                    >
                        <Plus size={14} />
                        New conversation
                    </button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
                    {sessions.length === 0 ? (
                        <p className="py-6 text-center text-[13px] text-muted-foreground">
                            No previous sessions
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-0.5">
                            {sessions.map((session) => {
                                const isActive =
                                    session.id === activeSessionId ||
                                    session.threadId === activeSessionId;
                                const preview =
                                    session.title ||
                                    session.messages[0]?.content?.slice(0, 60) ||
                                    "Session";

                                return (
                                    <li key={session.id}>
                                        <button
                                            onClick={() => {
                                                onSelectSession(session.id);
                                                onClose();
                                            }}
                                            className={[
                                                "w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] transition-colors",
                                                isActive
                                                    ? "bg-primary/[0.08] text-primary"
                                                    : "hover:bg-surface-hover text-foreground",
                                            ].join(" ")}
                                        >
                                            <p className="text-[13px] font-medium leading-snug truncate">
                                                {preview}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {formatTime(session.lastActiveAt)}
                                            </p>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
