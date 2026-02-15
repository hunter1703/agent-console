"use client";

import { AgentEvent } from "@/models/Events";
import { useEffect, useRef } from "react";
import { Terminal, Wrench, Play, Brain, CheckCircle2 } from "lucide-react";

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
        if (ev.type === "ToolCallEnded") return false;
        if (ev.type === "AssistantTextDelta") return false;
        if (ev.type === "AssistantTextFinal") return false;
        if (ev.type === "RunStarted") return false;
        if (ev.type === "ToolArgsUpdate") return false;
        return true;
    });

    return (
        <div className="flex-1 flex flex-col font-sans text-xs overflow-hidden">
            <div className="h-20 flex items-center justify-between px-8 border-b border-border">
                <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Timeline</span>
                <div className="text-[11px] font-mono text-muted-foreground/60 tabular-nums">
                    {filteredEvents.length} ACTIVITIES
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 custom-scrollbar" ref={listRef}>
                {filteredEvents.length === 0 && (
                    <div className="text-muted-foreground/50 italic text-[14px] text-center mt-20 font-medium">Listening for events...</div>
                )}
                {filteredEvents.map((ev, i) => (
                    <div key={i} className="relative pl-8 border-l border-border py-1 transition-all duration-500 hover:border-border/80 group">
                        <div className="absolute -left-[5px] top-2.5 w-2 h-2 rounded-full bg-secondary border border-border group-hover:bg-primary/40 transition-all duration-500 shadow-sm" />

                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] text-muted-foreground/60 tracking-tighter tabular-nums">
                                {new Date(ev.timestamp || Date.now()).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        <div className="text-[14px] leading-relaxed">
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
                <div className="text-foreground/80 font-semibold flex items-center gap-2 tracking-tight">
                    <Play size={10} fill="currentColor" /> Session Initialized
                </div>
            );
        case "RunStarted":
            return null;
        case "ThinkingStart":
            return <div className="text-foreground/60 italic font-medium flex items-center gap-2"><Brain size={10} /> Analyzing...</div>;
        case "ThinkingUpdate":
            return <div className="text-muted-foreground/60 pl-4 border-l border-border my-2 leading-relaxed">{ev.content}</div>;
        case "ThinkingEnd":
            return <div className="text-[11px] font-bold uppercase tracking-widest text-primary/60 mt-1 flex items-center gap-1.5"><CheckCircle2 size={10} /> Processed</div>;
        case "ToolCallStarted":
            return (
                <div className="flex flex-col gap-2">
                    <div className="text-foreground font-bold flex items-center gap-2 tracking-tight">
                        <span className="text-primary"><Wrench size={10} /></span> Invoking {ev.toolName}
                    </div>
                    {ev.arguments && (
                        <div className="text-[12px] bg-secondary border border-border rounded-2xl p-4 font-mono text-muted-foreground/60 break-all whitespace-pre-wrap leading-relaxed">
                            {ev.arguments}
                        </div>
                    )}
                </div>
            );
        case "ToolResult":
            return (
                <div className="mt-3 flex flex-col gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1 flex items-center gap-1.5">
                        <Terminal size={10} /> {ev.toolName} Result
                    </div>
                    <div className="text-[12px] bg-secondary border border-border rounded-[20px] p-4 font-mono text-foreground/80 overflow-hidden leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                        {ev.content}
                    </div>
                </div>
            );
        case "ErrorEvent":
            return <span className="text-red-400 font-semibold bg-red-400/5 px-3 py-1.5 rounded-xl border border-red-400/10">Fault: {ev.error}</span>;
        case "StreamEnd":
            return <div className="h-px bg-border w-full my-4" />;
        default:
            return null;
    }
}
