"use client";

import { useState, useEffect } from "react";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface ThinkingMessageProps {
    thoughts: string[];
    isStreaming?: boolean;
    stepName?: string;
    durationSecs?: number;
}

export default function ThinkingMessage({
    thoughts,
    isStreaming = false,
    stepName = "Thought",
    durationSecs,
}: ThinkingMessageProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Auto-collapse when streaming finishes
    useEffect(() => {
        if (!isStreaming) {
            const timer = setTimeout(() => setIsExpanded(false), 500);
            return () => clearTimeout(timer);
        } else {
            setIsExpanded(true);
        }
    }, [isStreaming]);

    if (thoughts.length === 0 && !isStreaming) return null;

    return (
        <div className="flex flex-col items-start w-full transition-all duration-500 ease-in-out">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-6 h-6 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                    <Brain
                        size={12}
                        className={
                            isStreaming
                                ? "text-primary animate-pulse"
                                : "text-muted-foreground/60"
                        }
                    />
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Collapse thoughts" : "Expand thoughts"}
                >
                    {isStreaming ? "Thinking..." : stepName}
                    {!isStreaming && (
                        <span className="text-[9px] opacity-60">
                            {isExpanded ? "Collapse" : "Expand"}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp size={10} />
                    ) : (
                        <ChevronDown size={10} />
                    )}
                </button>
                {durationSecs && !isStreaming && (
                    <span className="text-[9px] text-muted-foreground/40">
                        ({durationSecs}s)
                    </span>
                )}
            </div>

            <div
                onClick={() => !isExpanded && setIsExpanded(true)}
                className={`w-full max-w-[90%] transition-all duration-500 origin-top cursor-pointer ${
                    isExpanded
                        ? "opacity-100 scale-100 mb-2"
                        : "opacity-40 scale-[0.98] h-10 overflow-hidden mb-1"
                }`}
            >
                <div
                    className={`relative bg-surface/30 backdrop-blur-xl border border-border/40 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden ${
                        isStreaming
                            ? "shadow-[0_0_20px_rgba(0,113,227,0.1)] border-primary/20"
                            : ""
                    }`}
                >
                    {/* Artistic Glow */}
                    {isStreaming && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 animate-pulse" />
                    )}

                    <div className="relative space-y-4">
                        {thoughts.map((t, i) => (
                            <div
                                key={i}
                                className={`text-[14px] leading-relaxed text-foreground/80 font-medium tracking-tight ${
                                    i > 0
                                        ? "pt-4 border-t border-border/20"
                                        : ""
                                } transition-all duration-500`}
                            >
                                <MarkdownRenderer content={t} />
                            </div>
                        ))}

                        {isStreaming && thoughts.length === 0 && (
                            <div className="text-[14px] text-muted-foreground/40 italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                Formulating reasoning...
                            </div>
                        )}
                    </div>

                    {/* Shimmer Effect */}
                    {isStreaming && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
                    )}
                </div>
            </div>
        </div>
    );
}
