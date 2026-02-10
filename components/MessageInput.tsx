"use client";

import { useState, useRef, useEffect } from "react";

export default function MessageInput({
    onSend,
    onStop,
    isStreaming,
}: {
    onSend: (text: string) => void;
    onStop: () => void;
    isStreaming: boolean;
}) {
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    }, [text]);

    const handleSend = () => {
        if (text.trim() && !isStreaming) {
            onSend(text.trim());
            setText("");
            // Reset height
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="absolute bottom-6 left-64 right-0 px-6 pointer-events-none z-30">
            <div className="max-w-3xl mx-auto pointer-events-auto relative">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-[32px] blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative flex items-end gap-2 bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 pr-2 shadow-2xl">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent pl-5 py-3.5 max-h-[120px] text-[15px] placeholder:text-muted-foreground/50 focus:outline-none resize-none text-foreground leading-relaxed"
                            placeholder="Message Agent..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />

                        {isStreaming ? (
                            <button
                                onClick={onStop}
                                className="w-10 h-10 mb-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200"
                            >
                                <div className="w-3 h-3 bg-current rounded-[2px]" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!text.trim()}
                                className="w-10 h-10 mb-1 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 19V5" />
                                    <path d="M5 12l7-7 7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-center mt-2 text-[10px] text-muted-foreground font-medium opacity-50">
                    Agent can make mistakes. Check important info.
                </div>
            </div>
        </div>
    );
}
