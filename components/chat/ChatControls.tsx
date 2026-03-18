"use client";

import { useState, useRef, useEffect } from "react";
import {
    Settings2,
    ChevronDown,
    ChevronUp,
    X,
    RefreshCw,
    Trash2,
    Share,
    Download,
    MessageSquarePlus,
    Bot,
    Cpu,
    Wrench,
    Clock,
} from "lucide-react";
import { useUI } from "@/lib/stores";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

interface ChatControlsProps {
    agentId?: string;
    agentName?: string;
    modelName?: string;
    toolCount?: number;
    sessionId?: string | null;
    onNewChat?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onExport?: () => void;
    onShare?: () => void;
}

export default function ChatControls({
    agentId,
    agentName = "Agent",
    modelName,
    toolCount = 0,
    sessionId,
    onNewChat,
    onRename,
    onDelete,
    onExport,
    onShare,
}: ChatControlsProps) {
    const { showSettings, setShowSettings } = useUI();
    const [isExpanded, setIsExpanded] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [topP, setTopP] = useState(0.9);

    return (
        <>
            {/* Floating Controls Button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="fixed bottom-24 right-6 z-30 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Toggle chat settings"
                aria-expanded={showSettings}
            >
                <Settings2 size={20} />
            </button>

            {/* Settings Panel */}
            {showSettings && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setShowSettings(false)}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-0 right-0 md:bottom-24 md:right-6 md:top-auto z-40 w-full md:w-80 max-h-[80vh] md:max-h-none overflow-y-auto bg-background md:rounded-2xl shadow-2xl border border-border animate-slide-in-right">
                        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <h2 className="text-[15px] font-semibold text-foreground">
                                Chat Settings
                            </h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                                aria-label="Close settings"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Agent Info */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Bot size={16} className="text-primary" />
                                    <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
                                        Agent
                                    </h3>
                                </div>
                                <div className="p-3 rounded-lg bg-surface border border-border">
                                    <div className="text-[14px] font-medium text-foreground">
                                        {agentName}
                                    </div>
                                    {modelName && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Cpu size={12} className="text-muted-foreground" />
                                            <span className="text-[12px] text-muted-foreground">
                                                {modelName}
                                            </span>
                                        </div>
                                    )}
                                    {toolCount > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Wrench size={12} className="text-muted-foreground" />
                                            <span className="text-[12px] text-muted-foreground">
                                                {toolCount} tool{toolCount > 1 ? 's' : ''} enabled
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Model Parameters */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Cpu size={16} className="text-primary" />
                                    <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
                                        Model Parameters
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {/* Temperature */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[13px] text-foreground/80">
                                                Temperature
                                            </label>
                                            <span className="text-[12px] text-muted-foreground font-mono">
                                                {temperature.toFixed(1)}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer
                                                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                                                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                                       [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                                            <span>Precise</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>

                                    {/* Top P */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[13px] text-foreground/80">
                                                Top P
                                            </label>
                                            <span className="text-[12px] text-muted-foreground font-mono">
                                                {topP.toFixed(2)}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={topP}
                                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer
                                                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                                                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                                       [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                    </div>

                                    {/* Max Tokens */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[13px] text-foreground/80">
                                                Max Tokens
                                            </label>
                                            <span className="text-[12px] text-muted-foreground font-mono">
                                                {maxTokens}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="256"
                                            max="8192"
                                            step="256"
                                            value={maxTokens}
                                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer
                                                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
                                                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                                       [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                    </div>

                                    {/* Reset button */}
                                    <button
                                        onClick={() => {
                                            setTemperature(0.7);
                                            setMaxTokens(2048);
                                            setTopP(0.9);
                                        }}
                                        className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <RefreshCw size={12} />
                                        Reset to defaults
                                    </button>
                                </div>
                            </section>

                            {/* Session Actions */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={16} className="text-primary" />
                                    <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">
                                        Session
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        icon={<MessageSquarePlus size={14} />}
                                        onClick={onNewChat}
                                    >
                                        New Chat
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        icon={<Share size={14} />}
                                        onClick={onShare}
                                        disabled={!sessionId}
                                    >
                                        Share
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                        icon={<Download size={14} />}
                                        onClick={onExport}
                                        disabled={!sessionId}
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        fullWidth
                                        icon={<Trash2 size={14} />}
                                        onClick={onDelete}
                                        disabled={!sessionId}
                                    >
                                        Delete Session
                                    </Button>
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
