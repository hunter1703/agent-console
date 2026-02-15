import { AgentConfig } from "@/models/Agent";
import Link from "next/link";
import { Bot, ArrowRight, ArrowUpRight } from "lucide-react";

export default function AgentCard({ agent }: { agent: AgentConfig }) {
    return (
        <div className="bg-secondary border border-border rounded-[32px] p-10 flex flex-col gap-8 transition-all duration-700 hover:bg-muted/50 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] group hover:-translate-y-1">

            {/* Minimalist Header */}
            <div className="flex flex-col gap-6">
                <div className="w-16 h-16 rounded-[22px] bg-background border border-border flex items-center justify-center text-3xl group-hover:scale-105 transition-all duration-500 shadow-sm">
                    {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover rounded-[22px]" />
                    ) : (
                        <Bot size={32} strokeWidth={1} className="text-muted-foreground/60 group-hover:text-primary/80 transition-colors" />
                    )}
                </div>

                <div>
                    <h3 className="text-[20px] font-semibold tracking-tight text-foreground mb-1.5 group-hover:text-primary transition-colors duration-500">
                        {agent.name}
                    </h3>
                    <p className="text-[14px] text-muted-foreground/70 font-medium uppercase tracking-[0.1em]">
                        Ready to assist
                    </p>
                </div>
            </div>

            <p className="text-[15px] text-muted-foreground/80 leading-relaxed line-clamp-2 min-h-[3rem]">
                {agent.description}
            </p>

            <Link
                href={`/agents/${agent.id}`}
                className="inline-flex items-center justify-center h-12 px-8 bg-background hover:bg-primary border border-border hover:border-primary text-foreground hover:text-white text-[14px] font-semibold rounded-2xl transition-all duration-500 group/btn"
            >
                Start Session
                <ArrowRight size={16} className="ml-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
            </Link>
        </div>
    );
}
