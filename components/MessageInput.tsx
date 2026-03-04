"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

const MAX_HEIGHT = 140; // ~5 lines

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

    // Grow textarea to content, capped at MAX_HEIGHT
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
    }, [text]);

    const send = () => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;
        onSend(trimmed);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const canSend = text.trim().length > 0 && !isStreaming;

    return (
        <div
            className="shrink-0 w-full px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
            style={{ background: "var(--background)" }}
        >
            <div className="max-w-[720px] mx-auto">
                <div
                    className={[
                        "flex items-end gap-2 rounded-[var(--radius-md)] px-3 py-2",
                        "bg-surface border transition-colors",
                        "focus-within:border-primary/40",
                    ].join(" ")}
                    style={{ borderColor: "var(--border)" }}
                >
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Message…"
                        className={[
                            "flex-1 bg-transparent text-[15px] text-foreground",
                            "placeholder:text-muted-foreground",
                            "resize-none focus:outline-none leading-relaxed",
                            "scrollbar-hide",
                        ].join(" ")}
                        style={{ minHeight: "28px", maxHeight: `${MAX_HEIGHT}px` }}
                    />

                    {isStreaming ? (
                        <button
                            onClick={onStop}
                            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-foreground/10 hover:bg-foreground/20 text-foreground mb-0.5"
                            title="Stop"
                            aria-label="Stop generating"
                        >
                            <Square size={12} fill="currentColor" strokeWidth={0} />
                        </button>
                    ) : (
                        <button
                            onClick={send}
                            disabled={!canSend}
                            className={[
                                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors mb-0.5",
                                canSend
                                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                                    : "bg-surface-active text-muted-foreground cursor-not-allowed",
                            ].join(" ")}
                            title="Send"
                            aria-label="Send message"
                        >
                            <ArrowUp size={15} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                {/* Affordance hint — shown only when textarea has focus */}
                <p className="mt-1.5 text-[11px] text-muted-foreground text-center select-none">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
