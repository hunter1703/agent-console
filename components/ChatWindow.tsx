"use client";

import { useEffect, useRef } from "react";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatWindow({ messages, agentAvatar }: { messages: Message[], agentAvatar?: string }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 pb-24">
                {messages.length === 0 && (
                    <div className="mt-32 text-center text-muted-foreground animate-in fade-in duration-700">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-6 backdrop-blur-sm">
                            <span className="text-3xl grayscale opacity-50">💬</span>
                        </div>
                        <p className="text-sm font-medium">No messages yet.</p>
                        <p className="text-xs opacity-50 mt-1">Start a conversation to begin.</p>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex gap-3 max-w-[85%] animate-slide-up ${m.role === "user" ? "self-end flex-row-reverse" : "self-start"
                            }`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-sm overflow-hidden ${m.role === "user"
                            ? "bg-primary text-white"
                            : "bg-gradient-to-br from-gray-700 to-gray-600 text-white"
                            }`}>
                            {m.role === "assistant" && agentAvatar ? (
                                <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover" />
                            ) : (
                                m.role === "user" ? "U" : "A"
                            )}
                        </div>

                        {/* Bubble */}
                        <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm backdrop-blur-sm border ${m.role === "user"
                            ? "bg-primary text-white border-primary rounded-tr-sm"
                            : "bg-secondary/80 text-foreground border-white/5 rounded-tl-sm"
                            }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
}
