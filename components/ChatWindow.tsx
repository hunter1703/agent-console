"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Bot, Code, Eye, Copy, Check } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import PlanningMessage from "./PlanningMessage";
import { PlanningMessageData } from "@/lib/planning";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    kind?: "text" | "planning" | "thought";
    planning?: PlanningMessageData;
    isStreaming?: boolean;
    thoughts?: string[];
}

export default function ChatWindow({ messages, agentAvatar }: { messages: Message[], agentAvatar?: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [viewModes, setViewModes] = useState<Record<string, "rendered" | "raw">>({});
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const isAutoScroll = useRef(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // If user is within 50px of the bottom, keep auto-scrolling
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        isAutoScroll.current = distanceToBottom <= 50;
    };

    useEffect(() => {
        if (scrollRef.current && isAutoScroll.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleViewMode = (messageId: string) => {
        setViewModes(prev => ({
            ...prev,
            [messageId]: prev[messageId] === "raw" ? "rendered" : "raw"
        }));
    };

    const handleCopy = async (messageId: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyingId(messageId);
            setTimeout(() => setCopyingId(null), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div 
            ref={scrollRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 md:px-10 pt-10 pb-8 scroll-smooth custom-scrollbar"
        >
            <div className="max-w-[800px] mx-auto w-full flex flex-col gap-10">
                {messages.length === 0 && (
                    <div className="mt-40 text-center flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center shadow-lg">
                            <Sparkles size={36} strokeWidth={1.5} className="text-primary" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[18px] font-bold text-foreground tracking-tight">Ready</p>
                            <p className="text-[14px] text-muted-foreground font-medium">Send a message to begin.</p>
                        </div>
                    </div>
                )}

                {messages.map((m) => {
                    const mode = viewModes[m.id] || "rendered";
                    const isCopying = copyingId === m.id;
                    const messageKind = m.kind || "text";
                    const planningData = messageKind === "planning" ? m.planning : undefined;
                    
                    if (messageKind === "thought") {
                        return <ThoughtBubble key={m.id} thoughts={m.thoughts || []} isStreaming={m.isStreaming} />;
                    }

                    return (
                        <div
                            key={m.id}
                            className={`flex flex-col group ${
                                m.role === "user" ? "items-end spring-bounce-user" : "items-start spring-bounce-assistant"
                            }`}
                        >
                            <div className={`flex flex-col max-w-[85%] min-w-[120px] w-fit ${m.role === "user" ? "items-end" : "items-start"}`}>
                                {m.role === "assistant" ? (
                                    <div className="flex items-center justify-between w-full mb-2 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shadow-sm">
                                                {agentAvatar ? <img src={agentAvatar} className="w-full h-full object-cover" /> : <Bot size={16} className="text-primary" />}
                                            </div>
                                            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Assistant</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(m.id, m.content)}
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border/40 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/70 hover:text-primary hover:border-primary/30 transition-colors"
                                            >
                                                {isCopying ? <><Check size={11} className="text-emerald-500" /> Copied</> : <><Copy size={11} /> Copy</>}
                                            </button>
                                            <button
                                                onClick={() => toggleViewMode(m.id)}
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border/40 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/70 hover:text-primary hover:border-primary/30 transition-colors"
                                            >
                                                {mode === "rendered" ? (
                                                    <><Code size={11} /> Raw</>
                                                ) : (
                                                    <><Eye size={11} /> Preview</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end w-full mb-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity h-7">
                                        <button
                                            onClick={() => handleCopy(m.id, m.content)}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface/50 border border-border/40 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/70 hover:text-primary hover:border-primary/30 transition-colors"
                                        >
                                            {isCopying ? <><Check size={11} className="text-emerald-500" /> Copied</> : <><Copy size={11} /> Copy</>}
                                        </button>
                                    </div>
                                )}

                                {/* Bubble Design Map */}
                                <div className={`${
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground px-5 py-3.5 rounded-3xl rounded-tr-lg shadow-md"
                                        : "bg-surface text-foreground px-6 py-4 rounded-3xl rounded-tl-lg shadow-sm border border-border/50 backdrop-blur-md w-full"
                                    }`}
                                >
                                    {m.role === "user" ? (
                                        <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">
                                            {m.content}
                                        </p>
                                    ) : (
                                        <div className={mode === "raw" ? "font-mono text-[13px] text-muted-foreground whitespace-pre-wrap bg-primary/5 p-4 rounded-xl border border-primary/10" : ""}>
                                            {mode === "rendered" ? (
                                                planningData ? (
                                                    <PlanningMessage data={planningData} />
                                                ) : (
                                                    <MarkdownRenderer content={m.content} />
                                                )
                                            ) : (
                                                m.content || "No raw payload available."
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ThoughtBubble({ thoughts, isStreaming }: { thoughts: string[], isStreaming?: boolean }) {
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
                    <Brain size={12} className={isStreaming ? "text-primary animate-pulse" : "text-muted-foreground/60"} />
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2"
                >
                    {isStreaming ? "Thinking..." : "Thought Connection"}
                    {!isStreaming && (
                        <span className="text-[9px] opacity-60">
                            {isExpanded ? "Collapse" : "Expand"}
                        </span>
                    )}
                </button>
            </div>

            <div 
                onClick={() => !isExpanded && setIsExpanded(true)}
                className={`
                    w-full max-w-[90%] transition-all duration-500 origin-top cursor-pointer
                    ${isExpanded ? "opacity-100 scale-100 mb-2" : "opacity-40 scale-[0.98] h-10 overflow-hidden mb-1"}
                `}
            >
                <div className={`
                    relative bg-surface/30 backdrop-blur-xl border border-border/40 rounded-3xl p-5
                    shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden
                    ${isStreaming ? "shadow-[0_0_20px_rgba(0,113,227,0.1)] border-primary/20" : ""}
                `}>
                    {/* Artistic Glow */}
                    {isStreaming && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 animate-pulse" />
                    )}

                    <div className="relative space-y-4">
                        {thoughts.map((t, i) => (
                            <div key={i} className={`
                                text-[14px] leading-relaxed text-foreground/80 font-medium tracking-tight
                                ${i > 0 ? "pt-4 border-t border-border/20" : ""}
                                transition-all duration-500
                            `}>
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

import { Brain } from "lucide-react";
