"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface UserMessageProps {
    content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="group flex flex-col items-end gap-1 message-enter">
            <div
                className="max-w-[72%] px-4 py-2.5 text-[15px] text-white leading-relaxed whitespace-pre-wrap"
                style={{
                    background: "var(--primary)",
                    borderRadius: "14px 14px 4px 14px",
                }}
            >
                {content}
            </div>
            <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-muted opacity-0 focus:opacity-100 group-hover:opacity-100 transition-opacity"
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
        </div>
    );
}
