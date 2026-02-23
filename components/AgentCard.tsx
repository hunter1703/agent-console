import { AgentConfig } from "@/models/Agent";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function AgentCard({ agent }: { agent: AgentConfig }) {
    return (
        <div className="physical-card p-8 flex flex-col gap-6 group relative overflow-hidden">
            {/* Minimalist Header */}
            <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                    {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        <Bot size={28} strokeWidth={1.5} className="text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary" />
                    )}
                </div>

                <div className="flex flex-col pt-1">
                    <h3 className="text-[18px] font-bold tracking-tight text-foreground mb-0.5 transition-colors duration-300 group-hover:text-primary">
                        {agent.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                        Ready
                    </div>
                </div>
            </div>

            <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {agent.description}
            </p>

            <div className="mt-2 text-right">
                <Link
                    href={`/agents/${agent.id}`}
                    /* Tactile feedback on click, explicit signifier of action */
                    className="inline-flex items-center justify-center h-10 px-5 bg-background hover:bg-primary border border-border hover:border-transparent text-foreground hover:text-primary-foreground text-[13px] font-bold tracking-wide rounded-xl tactile-button group/btn shadow-sm hover:shadow-md"
                >
                    Start Session
                    <ArrowRight size={14} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
