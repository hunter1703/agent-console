"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ThinkingCardProps {
    thoughts: string[];
    isStreaming?: boolean;
    durationSecs?: number;
}

export default function ThinkingCard({
    thoughts,
    isStreaming,
    durationSecs,
}: ThinkingCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasContent = thoughts.some((t) => t.trim().length > 0);

    // Auto-collapse when done streaming and there's content to collapse.
    useEffect(() => {
        if (!isStreaming && hasContent) {
            const t = setTimeout(() => setIsExpanded(false), 600);
            return () => clearTimeout(t);
        }
    }, [isStreaming, hasContent]);

    const allThoughts = thoughts.join("\n\n---\n\n");
    // Show content block while streaming (Formulating… or actual thoughts) or when has content
    const showContent = isStreaming || hasContent;
    const expanded = isStreaming ? true : isExpanded;

    return (
        <div className="message-enter w-full">
            {/* Header — always visible */}
            <button
                onClick={() => hasContent ? setIsExpanded((v) => !v) : undefined}
                className={[
                    "flex items-center gap-2 mb-1.5 text-left group/thinking",
                    hasContent ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
                aria-expanded={hasContent ? isExpanded : undefined}
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
                        : durationSecs !== undefined
                        ? `Thought for ${durationSecs}s`
                        : "Thought"}
                </span>

                {!isStreaming && hasContent && (
                    <ChevronDown
                        size={13}
                        className={[
                            "text-muted-foreground transition-transform",
                            expanded ? "rotate-0" : "-rotate-90",
                        ].join(" ")}
                    />
                )}
            </button>

            {/* Content — collapsible, only shown when streaming or has real content */}
            {expanded && showContent && (
                <div
                    className={[
                        "rounded-[var(--radius-lg)] overflow-hidden",
                        "border-l-[3px] border-primary",
                        "bg-accent-surface px-4 py-3",
                    ].join(" ")}
                >
                    {isStreaming && !hasContent ? (
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
