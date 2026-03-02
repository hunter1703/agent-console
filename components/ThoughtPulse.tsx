"use client";

import { useEffect, useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface ThoughtPulseProps {
    content: string;
    isVisible: boolean;
}

export default function ThoughtPulse({ content, isVisible }: ThoughtPulseProps) {
    if (!isVisible && !content) return null;

    return (
        <div 
            className={`transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
            }`}
        >
            <div className="max-w-[800px] mx-auto w-full px-6 md:px-10 mb-8">
                <div className="relative group">
                    {/* Artistic Glow Background */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    
                    <div className="relative glass-panel bg-surface/40 backdrop-blur-2xl border border-primary/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                        {/* Animated Mesh Gradient Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,113,227,0.5),transparent)]"></div>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner overflow-hidden">
                                    <Brain size={20} className="relative z-10 animate-[pulse_3s_infinite]" />
                                    {/* Rotating scanner effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/30 to-transparent rotate-45 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles size={12} className="text-primary animate-bounce decoration-2" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
                                    Reasoning 
                                    <span className="flex gap-1">
                                        <span className="w-1 h-1 rounded-full bg-primary/40 animate-[bounce_1s_infinite_0ms]"></span>
                                        <span className="w-1 h-1 rounded-full bg-primary/40 animate-[bounce_1s_infinite_200ms]"></span>
                                        <span className="w-1 h-1 rounded-full bg-primary/40 animate-[bounce_1s_infinite_400ms]"></span>
                                    </span>
                                </h3>
                                <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide italic">Agent is analyzing the request and exploring solutions...</p>
                            </div>
                        </div>

                        {/* Thought Content Area */}
                        <div className="relative min-h-[40px] text-[15px] leading-relaxed text-foreground/80 font-medium tracking-tight">
                            <div className="opacity-70 transition-opacity duration-300">
                                <MarkdownRenderer content={content || "Gathering thoughts..."} />
                            </div>
                            
                            {/* Artistic stream indicator */}
                            <div className="mt-4 flex items-center gap-3 opacity-30">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/5"></div>
                                <span className="text-[9px] font-black tracking-[0.3em] uppercase whitespace-nowrap">Consciousness Stream</span>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/5 via-primary/30 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
