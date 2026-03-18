"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";

interface Correction {
    correctionType: string;
    code: string;
    message: string;
}

interface CorrectionMessageProps {
    corrections: Correction[];
}

export default function CorrectionMessage({ corrections }: CorrectionMessageProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const count = corrections.length;
    const typesSummary = [...new Set(corrections.map((c) => c.correctionType))].join(" · ");

    return (
        <div className="rounded-xl overflow-hidden border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-transparent">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-500/5 transition-colors text-left"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center justify-center w-5 h-5 rounded bg-violet-500/10 border border-violet-500/20 shrink-0">
                    <Zap size={11} className="text-violet-500" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 shrink-0">
                        {count === 1 ? "1 correction" : `${count} corrections`}
                    </span>
                    {!isExpanded && typesSummary && (
                        <span className="text-[11px] text-muted-foreground/50 truncate">
                            {typesSummary}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp size={11} className="text-violet-400/50 shrink-0" />
                ) : (
                    <ChevronDown size={11} className="text-violet-400/50 shrink-0" />
                )}
            </button>

            {isExpanded && (
                <div className="border-t border-violet-500/10 divide-y divide-violet-500/10">
                    {corrections.map((c, i) => (
                        <div key={i} className="px-4 py-3 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded">
                                    {c.correctionType}
                                </span>
                                {c.code && c.code !== "Unknown" && (
                                    <span className="text-[10px] font-mono text-muted-foreground/50">
                                        {c.code}
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] text-foreground/80 leading-relaxed pl-1 border-l border-violet-500/20">
                                {c.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
