"use client";

import { AgentEvent } from "@/models/Events";
import { useEffect, useRef } from "react";
import { Terminal, Wrench, Play, Brain, CheckCircle2 } from "lucide-react";

export default function EventTimeline({
    events,
}: {
    events: AgentEvent[];
}) {
    const listRef = useRef<HTMLDivElement>(null);

    const isAutoScroll = useRef(true);
    const lastScrollHeight = useRef(0);

    const handleScroll = () => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        // If user is within 50px of the bottom, keep auto-scrolling
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        isAutoScroll.current = distanceToBottom <= 50;
    };

    useEffect(() => {
        if (listRef.current && isAutoScroll.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [events]);

    // Filter events to only show relevant ones
    const filteredEvents = events.filter((ev) => {
        if (ev.type === "ToolCallEnded") return false;
        if (ev.type === "RunStarted") return false;
        if (ev.type === "ToolArgsUpdate") return false;
        return true;
    });

    // Group events by runId
    const groups = filteredEvents.reduce((acc, ev) => {
        const runId = ev.runId || "session";
        if (!acc[runId]) acc[runId] = [];
        acc[runId].push(ev);
        return acc;
    }, {} as Record<string, AgentEvent[]>);

    // Filter out groups that have no VISIBLE events after filtering
    const sortedRuns = Object.keys(groups)
        .filter(runId => groups[runId].length > 0)
        .sort((a, b) => {
            const timeA = groups[a][0]?.timestamp || 0;
            const timeB = groups[b][0]?.timestamp || 0;
            return timeA - timeB;
        });

    const runTurns = sortedRuns.filter(r => r !== "session");

    return (
        <div className="flex-1 flex flex-col font-mono text-xs overflow-hidden bg-background">
            <div className="h-[72px] flex items-center justify-between px-8 border-b border-border bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Terminal size={14} className="text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-foreground">Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase">
                        {runTurns.length} {runTurns.length === 1 ? 'TURN' : 'TURNS'}
                    </span>
                </div>
            </div>

            <div 
                className="flex-1 overflow-y-auto px-8 py-8 space-y-12 custom-scrollbar" 
                ref={listRef}
                onScroll={handleScroll}
            >
                {sortedRuns.length === 0 && (
                    <div className="text-muted-foreground/40 text-[12px] text-center mt-20 flex flex-col items-center gap-3">
                        <Terminal size={24} className="opacity-20" />
                        Waiting for events...
                    </div>
                )}
                
                {sortedRuns.map((runId) => {
                    let label = "";
                    if (runId === "session") {
                        label = "SESSION INITIALIZED";
                    } else {
                        const runIdx = runTurns.indexOf(runId);
                        label = `INTERACTION ${String(runIdx + 1).padStart(2, '0')}`;
                    }

                    const processedItems: { key: string, timestamp: number, content: React.ReactNode }[] = [];
                    let currentThought: { start: AgentEvent, updates: AgentEvent[], end?: AgentEvent } | null = null;

                    const flushThought = () => {
                        if (currentThought) {
                            processedItems.push({
                                key: `thought-${currentThought.start.timestamp}-${Math.random()}`,
                                timestamp: currentThought.start.timestamp || Date.now(),
                                content: renderThought(currentThought)
                            });
                            currentThought = null;
                        }
                    };

                    groups[runId].forEach((ev, i) => {
                        if (ev.type === "ThinkingStart") {
                            if (currentThought && !currentThought.end) currentThought.end = ev;
                            flushThought();
                            currentThought = { start: ev, updates: [] };
                        } else if (ev.type === "ThinkingUpdate") {
                            if (currentThought) {
                                currentThought.updates.push(ev);
                            }
                        } else if (ev.type === "ThinkingEnd") {
                            // If we already closed the thought due to an interruption, we can ignore this.
                            if (currentThought && !currentThought.end) {
                                currentThought.end = ev;
                                flushThought();
                            }
                        } else {
                            // Interrupting event! Close the thought if it's open.
                            if (currentThought && !currentThought.end) {
                                currentThought.end = ev;
                                flushThought();
                            } else {
                                flushThought();
                            }
                            const rendered = renderEvent(ev);
                            if (rendered) {
                                processedItems.push({
                                    key: `ev-${i}-${ev.type}`,
                                    timestamp: ev.timestamp || Date.now(),
                                    content: rendered
                                });
                            }
                        }
                    });
                    
                    // Add a tiny delay to give streaming a chance, but if it ends stream without ThinkingEnd, flush it.
                    // Wait, this is synchronous render, so just flush whatever is left.
                    flushThought();

                    if (processedItems.length === 0) return null;

                    return (
                        <div key={runId} className="space-y-6 relative mt-2">
                            {/* Subtle Separator or Session Header */}
                            {label === "SESSION INITIALIZED" ? (
                                <div className="flex items-center gap-4 mb-6 relative">
                                    <div className="absolute left-0 w-1 h-4 bg-primary rounded-r-sm" />
                                    <span className="ml-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80 bg-surface px-3 py-1 rounded-sm border border-border shrink-0 shadow-sm">
                                        {label}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                                </div>
                            ) : (
                                <div className="flex items-center mb-6 mt-4 relative opacity-40">
                                    <div className="absolute left-[3px] w-[2px] h-[2px] bg-foreground rounded-full" />
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
                                </div>
                            )}

                            {processedItems.map((item, i) => (
                                <div key={item.key} className="relative pl-9 group">
                                    {/* Precision Connector Line */}
                                    <div className="absolute left-[3.5px] top-[24px] bottom-[-24px] w-[1px] bg-border transition-colors group-hover:bg-primary/50" />
                                    
                                    {/* Data Node Point */}
                                    <div className="absolute left-[0px] top-[14px] w-[8px] h-[8px] rounded-sm bg-surface border border-primary/50 z-10 transition-all shadow-[0_0_8px_rgba(0,113,227,0.2)] group-hover:bg-primary group-hover:scale-110" />

                                    <div className="flex flex-col mb-[2px]">
                                        <span className="text-[9px] text-muted-foreground/50 tracking-widest pl-1 mb-1">
                                            [{new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}]
                                        </span>
                                    </div>

                                    <div className="text-[13px] leading-relaxed pb-3">
                                        {item.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function renderThought(thought: { start: AgentEvent, updates: AgentEvent[], end?: AgentEvent }) {
    if (!thought.end) {
        return (
            <div className="flex flex-col">
                <div className="text-primary font-semibold flex items-center gap-3">
                    <div className="ai-core-orb shrink-0" />
                    Thinking...
                </div>
                {thought.updates.length > 0 && (
                    <div className="mt-2 text-muted-foreground pl-4 border-l-[3px] border-primary/20 py-1 leading-relaxed text-[12px] bg-surface/30 pr-2 whitespace-pre-wrap">
                        {thought.updates.map(u => (u as any).content).join("")}
                    </div>
                )}
            </div>
        );
    } else {
        const durationMs = Math.max(0, (thought.end.timestamp || Date.now()) - (thought.start.timestamp || Date.now()));
        const durationStr = (durationMs / 1000).toFixed(2) + "s";
        return (
            <div className="flex flex-col">
                <div className="text-[11px] font-bold tracking-[0.1em] text-foreground/80 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" /> 
                    <span>Thought <span className="text-muted-foreground/60 font-normal">({durationStr})</span></span>
                </div>
                {thought.updates.length > 0 && (
                    <div className="mt-2 text-muted-foreground/80 pl-4 border-l-[3px] border-emerald-500/20 py-1 leading-relaxed text-[12px] bg-surface/10 pr-2 whitespace-pre-wrap">
                        {thought.updates.map(u => (u as any).content).join("")}
                    </div>
                )}
            </div>
        );
    }
}

function renderEvent(ev: AgentEvent) {
    switch (ev.type) {
        case "SessionAssigned":
            return (
                <div className="text-foreground font-bold flex items-center gap-2 tracking-tight">
                    <Play size={10} className="text-emerald-500" /> SESSION CONNECTED
                </div>
            );
        case "ToolCallStarted":
            return (
                <div className="flex flex-col gap-2 mt-1">
                    <div className="text-foreground font-bold flex items-center gap-2 tracking-tight">
                        <span className="p-1.5 bg-primary/10 rounded-sm text-primary border border-primary/20"><Wrench size={10} /></span> 
                        Invoking <span className="text-primary">{ev.toolName}</span>
                    </div>
                    {ev.arguments && (
                        <div className="text-[11px] bg-[#1C1C1E] dark:bg-[#000000] border border-border rounded-lg p-4 text-[#F5F5F7] break-all whitespace-pre-wrap leading-tight shadow-inner mt-2">
                            {ev.arguments}
                        </div>
                    )}
                </div>
            );
        case "ToolResult":
            return (
                <div className="mt-4 flex flex-col gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
                        <Terminal size={10} /> RESULT
                    </div>
                    <div className="text-[11px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-border rounded-lg p-4 text-foreground/80 overflow-hidden leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                        {(ev as any).content}
                    </div>
                </div>
            );
        case "ErrorEvent":
            return (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-red-500 font-bold my-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Error: {(ev as any).error}</span>
                </div>
            );
        default:
            return null;
    }
}
