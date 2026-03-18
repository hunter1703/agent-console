"use client";

import { useState } from "react";
import { Copy, Check, AlignLeft, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface AssistantMessageProps {
    content: string;
    isStreaming?: boolean;
    showActions?: boolean;
}

export default function AssistantMessage({
    content,
    isStreaming = false,
    showActions = true,
}: AssistantMessageProps) {
    const [copied, setCopied] = useState(false);
    const [rawMode, setRawMode] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col items-start gap-1 message-enter group">
            <div className="text-[15px] text-foreground leading-relaxed w-full">
                {isStreaming && !content ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <span className="text-[14px]">Thinking...</span>
                    </div>
                ) : rawMode ? (
                    <pre className="font-mono text-[13px] text-muted-foreground whitespace-pre-wrap bg-surface border border-border rounded-[var(--radius-sm)] p-3 overflow-x-auto">
                        {content || "No content"}
                    </pre>
                ) : (
                    <MarkdownRenderer content={content} />
                )}
            </div>

            {/* Action buttons - visible on hover */}
            {showActions && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted transition-colors"
                        aria-label={copied ? "Copied" : "Copy message"}
                    >
                        {copied ? (
                            <>
                                <Check size={10} className="text-green" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy size={10} /> Copy
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setRawMode((v) => !v)}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted transition-colors"
                        aria-label={rawMode ? "Show rendered" : "Show raw"}
                    >
                        {rawMode ? (
                            <>
                                <Code2 size={10} /> Rendered
                            </>
                        ) : (
                            <>
                                <AlignLeft size={10} /> Raw
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
