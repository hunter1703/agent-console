"use client";

import { useEffect, useRef } from "react";
import { Sparkles, Bot } from "lucide-react";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatWindow({ messages, agentAvatar }: { messages: Message[], agentAvatar?: string }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current?.parentElement) {
            bottomRef.current.parentElement.scrollTop = bottomRef.current.parentElement.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-10 pt-10 pb-40 scroll-smooth custom-scrollbar">
            <div className="max-w-[800px] mx-auto w-full flex flex-col gap-12">
                {messages.length === 0 && (
                    <div className="mt-40 text-center flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="w-20 h-20 rounded-[40px] bg-secondary border border-border flex items-center justify-center shadow-2xl shadow-black/5 dark:shadow-black/20">
                            <Sparkles size={40} strokeWidth={1} className="text-muted-foreground/40" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[17px] font-semibold text-foreground/80 tracking-tight">System Ready</p>
                            <p className="text-[15px] text-muted-foreground/60 font-medium">Initialize the session with a message.</p>
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${m.role === "user" ? "items-end" : "items-start"
                            }`}
                    >
                        {/* Typographic Message (No Bubbles for Assistant) */}
                        <div className={`flex flex-col gap-3 max-w-[90%] w-full ${m.role === "user" ? "items-end" : "items-start"}`}>
                            {m.role === "assistant" && (
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                        {agentAvatar ? <img src={agentAvatar} className="w-full h-full object-cover" /> : <Bot size={14} className="text-muted-foreground/60" />}
                                    </div>
                                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Assistant</span>
                                </div>
                            )}

                            <div className={`${m.role === "user"
                                ? "bg-secondary px-6 py-4 rounded-[24px] rounded-tr-none border border-border text-foreground/90"
                                : "text-foreground/95 leading-[1.65] text-[17px] font-normal"
                                }`}>
                                <p className="whitespace-pre-wrap tracking-[-0.01em]">{m.content}</p>
                            </div>

                            {m.role === "user" && (
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50 mr-2 mt-1">You</span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
}
