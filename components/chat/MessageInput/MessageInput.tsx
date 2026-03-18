"use client";

import { useState, useRef, useEffect } from "react";
import SendButton from "./SendButton";
import StopButton from "./StopButton";
import AttachFileButton from "./AttachFileButton";

const MAX_HEIGHT = 140; // ~5 lines

interface MessageInputProps {
    onSend: (text: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    placeholder?: string;
    onAttachFile?: () => void;
}

export default function MessageInput({
    onSend,
    onStop,
    isStreaming,
    placeholder = "Message…",
    onAttachFile,
}: MessageInputProps) {
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Grow textarea to content, capped at MAX_HEIGHT
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";
    }, [text]);

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;
        onSend(trimmed);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = text.trim().length > 0 && !isStreaming;

    return (
        <div
            className="shrink-0 w-full px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
            style={{ background: "var(--background)" }}
            data-testid="message-input-shell"
        >
            <div className="max-w-[980px] mx-auto">
                <div
                    className={[
                        "flex items-end gap-2 rounded-[var(--radius-md)] px-3 py-2",
                        "bg-surface border transition-colors",
                        "focus-within:border-primary/40",
                    ].join(" ")}
                    style={{ borderColor: "var(--border)" }}
                >
                    {/* File attachment button (optional) */}
                    {onAttachFile && (
                        <AttachFileButton
                            onClick={onAttachFile}
                            disabled={isStreaming}
                        />
                    )}

                    {/* Text input */}
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={placeholder}
                        className={[
                            "flex-1 bg-transparent text-[15px] text-foreground",
                            "placeholder:text-muted-foreground",
                            "resize-none focus:outline-none leading-relaxed",
                            "scrollbar-hide",
                        ].join(" ")}
                        style={{ minHeight: "28px", maxHeight: `${MAX_HEIGHT}px` }}
                    />

                    {/* Send/Stop button */}
                    {isStreaming ? (
                        <StopButton onClick={onStop} />
                    ) : (
                        <SendButton onClick={handleSend} disabled={!canSend} />
                    )}
                </div>

                {/* Affordance hint - shown only when textarea has focus */}
                <p className="mt-1.5 text-[11px] text-muted-foreground text-center select-none">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
