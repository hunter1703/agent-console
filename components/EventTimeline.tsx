"use client";

import { AgentEvent } from "@/models/Events";
import { useEffect, useRef } from "react";

export default function EventTimeline({
    events,
    showThoughts,
}: {
    events: AgentEvent[];
    showThoughts: boolean;
}) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [events]);

    const filteredEvents = events.filter((ev) => {
        if (!showThoughts && ev.type.startsWith("Thinking")) return false;
        return true;
    });

    return (
        <div className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col font-sans text-xs z-10 transition-all duration-300">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
                <span className="font-semibold text-muted-foreground tracking-tight">Timeline</span>
                <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-muted-foreground">
                    {filteredEvents.length} events
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={listRef}>
                {filteredEvents.length === 0 && (
                    <div className="text-muted-foreground/40 italic text-center mt-10">Waiting for activity...</div>
                )}
                {filteredEvents.map((ev, i) => (
                    <div key={i} className="relative pl-4 border-l border-white/10 py-0.5 group hover:border-white/20 transition-colors">
                        <div className="absolute -left-[3px] top-2 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors ring-4 ring-black" />

                        <div className="flex items-center gap-2 mb-1 opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="font-mono text-[10px]">
                                {new Date(ev.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        <div className="text-sm">
                            {renderEvent(ev)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function renderEvent(ev: AgentEvent) {
    switch (ev.type) {
        case "SessionAssigned":
            return (
                <div className="text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Session Started
                </div>
            );
        case "ThinkingStart":
            return <div className="text-muted-foreground italic">Thinking...</div>;
        case "ThinkingUpdate":
            return <div className="text-muted-foreground/60 pl-2 border-l-2 border-white/5 my-1">{ev.content}</div>;
        case "ThinkingEnd":
            return <div className="text-muted-foreground/60 text-[10px] uppercase tracking-wider">Analysis Complete</div>;
        case "ToolCallStarted":
            return (
                <div className="text-orange-400 font-medium flex items-center gap-1.5">
                    <span>🛠</span> Calling: {ev.toolName}
                </div>
            );
        case "ToolResult":
            return (
                <div className="mt-2 text-xs bg-white/5 border border-white/5 rounded-lg p-2 font-mono text-emerald-400/90 overflow-hidden">
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Output</div>
                    {ev.content}
                </div>
            );
        case "ToolCallEnded":
            return null; // Skip end event to reduce noise
        case "AssistantTextDelta":
            return <span className="text-white/30 text-[10px] font-mono leading-none">T</span>;
        case "ErrorEvent":
            return <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">Error: {ev.error}</span>;
        case "StreamEnd":
            return <div className="h-px bg-white/10 w-full my-2" />;
        default:
            return <span className="text-muted-foreground">{ev.type}</span>;
    }
}
