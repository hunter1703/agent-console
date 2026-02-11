"use client";

import { useEffect, useState } from "react";
import { AgentConfig } from "@/models/Agent";
import { fetchAgents } from "@/lib/api";
import AgentCard from "@/components/AgentCard";
import Link from "next/link";

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
        <header className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Available Agents</h2>
          <p className="text-muted">Select an agent to start a new console session.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}

            {agents.length === 0 ? (
              <div className="col-span-full py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] mx-auto flex items-center justify-center mb-8 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <span className="text-5xl">✦</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome to Agent Console</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                  Your workspace is ready. To get started, connect your first AI agent via the admin interface or API.
                </p>
                <Link
                  href="/admin/agents"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                >
                  <span className="text-lg">+</span>
                  Configure Your First Agent
                </Link>
              </div>
            ) : (
              <Link
                href="/admin/agents"
                className="glass border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all group rounded-3xl p-8 min-h-[200px]"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">+</span>
                <span className="text-sm font-semibold tracking-wide">Configure New Agent</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
