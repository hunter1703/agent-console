"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Bot, Code, Eye, Copy, Check } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
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
                                                <MarkdownRenderer content={m.content} />
                                            ) : (
                                                m.content
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
