import { AgentConfig } from "@/models/Agent";
import Link from "next/link";

export default function AgentCard({ agent }: { agent: AgentConfig }) {
    return (
        <div className="glass rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:bg-white/5 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-2xl">↗</span>
            </div>

            {/* Avatar Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden glass border border-white/10 flex-shrink-0 shadow-inner">
                    {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-xl font-bold">
                            {agent.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white mb-0.5">
                        {agent.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Ready</span>
                    </div>
                </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3 pr-4">
                {agent.description}
            </p>

            <Link
                href={`/agents/${agent.id}`}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-md flex items-center justify-center gap-2 group-hover:bg-primary group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20"
            >
                <span className="text-lg">💬</span>
                Start Chat
            </Link>
        </div>
    );
}
