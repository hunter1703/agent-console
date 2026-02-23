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
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
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
        <div className="w-full px-6 md:px-10 py-6 shrink-0 bg-background z-30">
            <div className="max-w-[800px] mx-auto">
                <div className="magnetic-input glass-panel relative flex items-end gap-3 rounded-[28px] p-2 pr-3 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1)]">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent pl-5 py-3.5 max-h-[160px] text-[15px] font-medium placeholder:text-muted-foreground focus:outline-none resize-none text-foreground leading-relaxed custom-scrollbar"
                        placeholder="Message Agent..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ minHeight: "52px" }}
                    />

                    {isStreaming ? (
                        <button
                            onClick={onStop}
                            className="tactile-button shrink-0 w-11 h-11 mb-0.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent flex items-center justify-center shadow-sm"
                        >
                            <Square size={14} fill="currentColor" strokeWidth={0} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={!text.trim()}
                            className="tactile-button shrink-0 w-11 h-11 mb-0.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md disabled:opacity-40 disabled:scale-100"
                        >
                            <ArrowUp size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
