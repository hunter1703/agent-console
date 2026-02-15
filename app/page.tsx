"use client";

import { useEffect, useState } from "react";
import { AgentConfig } from "@/models/Agent";
import { fetchAgents } from "@/lib/api";
import AgentCard from "@/components/AgentCard";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20 border-b border-white/[0.03] pb-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">Discovery</p>
          <h2 className="text-[34px] font-semibold tracking-tight text-white mb-3">Explore Agents</h2>
          <p className="text-[17px] text-muted-foreground/60 leading-relaxed max-w-2xl">
            Select an specialized intelligence to begin a new console session.
          </p>
        </header>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="console-box h-48 animate-pulse bg-secondary/50" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-500 rounded">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}

            {agents.length === 0 ? (
              <div className="col-span-full py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] mx-auto flex items-center justify-center mb-8 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <Sparkles size={48} strokeWidth={1} className="text-primary/60" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome to Agent Console</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                  Your workspace is ready. To get started, connect your first AI agent via the admin interface or API.
                </p>
                <Link
                  href="/admin/agents"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Configure Your First Agent
                </Link>
              </div>
            ) : (
              <Link
                href="/admin/agents"
                className="bg-white/[0.02] border border-dashed border-white/5 flex flex-col items-center justify-center text-muted-foreground/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-500 rounded-[32px] p-8 min-h-[280px] group"
              >
                <Plus size={32} strokeWidth={1.5} className="mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-[14px] font-semibold tracking-tight">Add Agent</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
