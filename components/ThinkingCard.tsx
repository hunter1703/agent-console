"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ThinkingCardProps {
    thoughts: string[];
    isStreaming?: boolean;
    startedAt?: number; // timestamp when thinking started
}

export default function ThinkingCard({
    thoughts,
    isStreaming,
    startedAt,
}: ThinkingCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [durationSecs, setDurationSecs] = useState<number | null>(null);

    // Auto-collapse when done streaming. Record how long it took.
    useEffect(() => {
        if (!isStreaming && thoughts.length > 0) {
            if (startedAt) {
                setDurationSecs(Math.round((Date.now() - startedAt) / 1000));
            }
            const t = setTimeout(() => setIsExpanded(false), 600);
            return () => clearTimeout(t);
        } else {
            setIsExpanded(true);
        }
    }, [isStreaming, thoughts.length, startedAt]);

    if (thoughts.length === 0 && !isStreaming) return null;

    const allThoughts = thoughts.join("\n\n---\n\n");

    return (
        <div className="message-enter w-full">
            {/* Header — always visible */}
            <button
                onClick={() => setIsExpanded((v) => !v)}
                className="flex items-center gap-2 mb-1.5 text-left group/thinking"
                aria-expanded={isExpanded}
            >
                {/* Animated thinking dot */}
                <span
                    className={[
                        "w-[6px] h-[6px] rounded-full bg-primary shrink-0",
                        isStreaming ? "thinking-dot" : "opacity-30",
                    ].join(" ")}
                />

                <span className="text-[13px] font-medium text-muted transition-colors group-hover/thinking:text-foreground">
                    {isStreaming
                        ? "Thinking…"
                        : durationSecs !== null && durationSecs > 0
                        ? `Thought for ${durationSecs}s`
                        : "Thought"}
                </span>

                {!isStreaming && thoughts.length > 0 && (
                    <ChevronDown
                        size={13}
                        className={[
                            "text-muted-foreground transition-transform",
                            isExpanded ? "rotate-0" : "-rotate-90",
                        ].join(" ")}
                    />
                )}
            </button>

            {/* Content — collapsible */}
            {isExpanded && (
                <div
                    className={[
                        "rounded-[var(--radius-lg)] overflow-hidden",
                        "border-l-[3px] border-primary",
                        "bg-accent-surface px-4 py-3",
                    ].join(" ")}
                >
                    {isStreaming && thoughts.length === 0 ? (
                        <p className="text-[14px] text-muted italic">Formulating…</p>
                    ) : (
                        <div className="text-[14px] leading-relaxed text-foreground/80">
                            <MarkdownRenderer content={allThoughts} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
