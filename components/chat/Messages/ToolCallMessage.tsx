"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Wrench, Check, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface ToolCallMessageProps {
    toolName: string;
    arguments?: string;
    result?: string;
    status?: "pending" | "running" | "completed" | "error";
    toolCallId?: string;
}

export default function ToolCallMessage({
    toolName,
    arguments: args,
    result,
    status = "pending",
    toolCallId,
}: ToolCallMessageProps) {
    // Auto-expand when running or when result arrives
    const [isExpanded, setIsExpanded] = useState(status === "running" || status === "completed");
    const [copied, setCopied] = useState(false);
    
    // Update expanded state when status changes
    useEffect(() => {
        if (status === "running" || status === "completed") {
            setIsExpanded(true);
        }
    }, [status]);

    const handleCopy = async () => {
        const content = result || args || "";
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "pending":
                return "text-muted-foreground";
            case "running":
                return "text-primary animate-pulse";
            case "completed":
                return "text-green";
            case "error":
                return "text-red";
            default:
                return "text-muted-foreground";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "pending":
            case "running":
                return (
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                        Running
                    </span>
                );
            case "completed":
                return "✓";
            case "error":
                return "✗";
            default:
                return "•";
        }
    };

    const formatContent = (content?: string) => {
        if (!content) return null;
        try {
            // Try to parse as JSON for pretty printing
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return content;
        }
    };

    return (
        <div className="my-2 border border-border rounded-lg overflow-hidden bg-surface/50">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface transition-colors"
                aria-expanded={isExpanded}
            >
                <Wrench size={14} className={getStatusColor()} />
                <span className="text-[13px] font-medium text-foreground">
                    {toolName}
                </span>
                <span className={`text-[11px] ${getStatusColor()}`}>
                    {getStatusIcon()}
                </span>
                {isExpanded ? (
                    <ChevronUp size={12} className="ml-auto text-muted-foreground" />
                ) : (
                    <ChevronDown size={12} className="ml-auto text-muted-foreground" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-border">
                    {/* Arguments */}
                    {args && (
                        <div className="p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Arguments
                            </div>
                            <pre className="text-[12px] text-foreground bg-surface rounded p-2 overflow-x-auto font-mono">
                                {formatContent(args)}
                            </pre>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="p-3 border-t border-border">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Result
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-muted transition-colors"
                                    aria-label={copied ? "Copied" : "Copy result"}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={9} className="text-green" /> Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={9} /> Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <pre className="text-[12px] text-foreground bg-surface rounded p-2 overflow-x-auto font-mono max-h-[300px] overflow-y-auto">
                                {formatContent(result)}
                            </pre>
                        </div>
                    )}

                    {/* Tool Call ID (for debugging) */}
                    {toolCallId && (
                        <div className="px-3 pb-2">
                            <div className="text-[9px] text-muted-foreground/50 font-mono">
                                ID: {toolCallId}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
