"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

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
        <div className="absolute bottom-10 left-0 right-0 px-10 pointer-events-none z-30">
            <div className="max-w-[800px] mx-auto pointer-events-auto">
                <div className="relative flex items-end gap-3 bg-background/80 backdrop-blur-3xl border border-border rounded-[32px] p-2 pr-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] group transition-all duration-500 hover:border-primary/20">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent pl-6 py-4 max-h-[160px] text-[16px] placeholder:text-muted-foreground/60 focus:outline-none resize-none text-foreground leading-relaxed custom-scrollbar"
                        placeholder="Describe your request..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    {isStreaming ? (
                        <button
                            onClick={onStop}
                            className="w-12 h-12 mb-1 rounded-[20px] bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white flex items-center justify-center transition-all duration-500 active:scale-90"
                        >
                            <Square size={14} fill="currentColor" strokeWidth={0} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={!text.trim()}
                            className="w-12 h-12 mb-1 rounded-[22px] bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-90 transition-all duration-500 shadow-2xl shadow-primary/20 disabled:opacity-10 disabled:grayscale disabled:scale-100 disabled:hover:scale-100"
                        >
                            <ArrowUp size={24} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
