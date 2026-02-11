"use client";

import { useEffect, useState } from "react";
import { AgentConfig } from "@/models/Agent";
import { fetchAgents, createAgent, updateAgent, deleteAgent, IS_MOCK } from "@/lib/api";

export default function AdminPage() {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setLoading(true);
        try {
            const data = await fetchAgents();
            setAgents(data);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (agent: AgentConfig) => {
        setEditingAgent({ ...agent });
    };

    const handleSave = async () => {
        if (!editingAgent) return;
        try {
            if (editingAgent.id.startsWith("new-")) {
                const created = await createAgent(editingAgent);
                setAgents(prev => [...prev, created]);
            } else {
                const updated = await updateAgent(editingAgent.id, editingAgent);
                setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
            }
            setEditingAgent(null);
        } catch (err) {
            alert(`Failed to save: ${err}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;
        try {
            await deleteAgent(id);
            setAgents(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert(`Failed to delete: ${err}`);
        }
    };

    const handleCreate = () => {
        const newAgent: AgentConfig = {
            id: "new-" + Math.random().toString(36).slice(2, 7),
            name: "New Agent",
            description: "",
            systemPrompt: "You are a helpful assistant.",
        };
        setEditingAgent(newAgent);
    };

    return (
        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Agent Management</h2>
                        <p className="text-muted text-sm">Configure and manage your AI agents.</p>
                        {!IS_MOCK && <span className="text-[10px] text-primary/70 font-mono mt-1 block tracking-wider uppercase">Connected Mode (Experimental)</span>}
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        + Create Agent
                    </button>
                </header>

                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6 text-sm">{error}</div>}

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="flex items-center gap-3 text-muted italic animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            Loading agents...
                        </div>
                    ) : (
                        agents.map((agent) => (
                            <div key={agent.id} className="glass p-5 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                                        🤖
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-primary transition-colors">{agent.name}</div>
                                        <div className="text-[10px] text-muted font-mono tracking-tighter uppercase">{agent.id}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`/agents/${agent.id}`}
                                        className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all flex items-center gap-2"
                                    >
                                        <span>💬</span> Test
                                    </a>
                                    <button
                                        onClick={() => handleEdit(agent)}
                                        className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(agent.id)}
                                        className="px-4 py-2 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {editingAgent && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                        <div className="glass w-full max-w-xl p-8 flex flex-col gap-6 shadow-2xl border-white/10">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {editingAgent.id.startsWith("new") ? "Create New Agent" : "Edit Agent Configuration"}
                                </h3>
                                <div className="text-[10px] text-muted font-mono bg-white/5 px-2 py-1 rounded uppercase">
                                    ID: {editingAgent.id}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Display Name</label>
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g., Stock Analyst"
                                        value={editingAgent.name}
                                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">Description</label>
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="Briefly describe what this agent does..."
                                        value={editingAgent.description}
                                        onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">System Prompt</label>
                                    <textarea
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all h-40 resize-none"
                                        placeholder="Define the agent's behavior and personality..."
                                        value={editingAgent.systemPrompt}
                                        onChange={e => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setEditingAgent(null)}
                                    className="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-white transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Confirm & Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

