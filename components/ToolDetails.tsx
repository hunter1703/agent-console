"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AgentEvent } from "@/models/Events";

interface ToolDetailsProps {
    events: AgentEvent[];
}

interface ToolCall {
    id: string;
    name: string;
    args?: string;
    result?: string;
}

function buildToolCalls(events: AgentEvent[]): ToolCall[] {
    const calls: ToolCall[] = [];
    const resultsById: Record<string, string> = {};

    // Collect results first
    events.forEach((ev) => {
        if (ev.type === "ToolResult" && ev.toolCallId) {
            resultsById[ev.toolCallId] = ev.content || "";
        }
    });

    // Build call list
    events.forEach((ev) => {
        if (ev.type === "ToolCallStarted" && ev.toolCallId) {
            calls.push({
                id: ev.toolCallId,
                name: ev.toolName || "tool",
                args: ev.arguments,
                result: resultsById[ev.toolCallId],
            });
        }
    });

    return calls;
}

function truncate(str: string | undefined, max = 80): string {
    if (!str) return "";
    const cleaned = str.replace(/\s+/g, " ").trim();
    return cleaned.length > max ? cleaned.slice(0, max) + "…" : cleaned;
}

export default function ToolDetails({ events }: ToolDetailsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toolCalls = buildToolCalls(events);
    if (toolCalls.length === 0) return null;

    const n = toolCalls.length;

    return (
        <div className="w-full">
            <button
                onClick={() => setIsExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-muted transition-colors"
                aria-expanded={isExpanded}
            >
                <ChevronRight
                    size={13}
                    className={[
                        "transition-transform",
                        isExpanded ? "rotate-90" : "",
                    ].join(" ")}
                />
                {n} {n === 1 ? "tool" : "tools"} used
            </button>

            {isExpanded && (
                <ul className="mt-2 ml-4 flex flex-col gap-1.5 fade-enter">
                    {toolCalls.map((call) => (
                        <li key={call.id} className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-2">
                                <code className="text-[12px] font-mono text-primary">
                                    {call.name}
                                </code>
                                {call.args && (
                                    <span className="text-[12px] text-muted-foreground font-mono">
                                        ({truncate(call.args, 60)})
                                    </span>
                                )}
                            </div>
                            {call.result && (
                                <p className="text-[12px] text-muted-foreground pl-1 border-l border-border">
                                    {truncate(call.result, 100)}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
