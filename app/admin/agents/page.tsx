"use client";

import { useEffect, useState } from "react";
import { AgentConfig } from "@/models/Agent";
import { ModelConfig } from "@/models/Model";
import { fetchAgents, createAgent, updateAgent, deleteAgent, IS_MOCK, fetchSchema, fetchAgentConfig } from "@/lib/api";
import { fetchModels } from "@/lib/modelApi";
import JsonForm from "@/components/JsonForm";
import { Bot, Play, Settings, Trash2, X } from "lucide-react";

export default function AdminPage() {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [models, setModels] = useState<ModelConfig[]>([]);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [agentSchema, setAgentSchema] = useState<any>(null);
    const [agentLayout, setAgentLayout] = useState<any>(null);

    useEffect(() => {
        loadAgentsAndModels();
    }, []);

    const loadAgentsAndModels = async () => {
        setLoading(true);
        try {
            const [agentsData, modelsData, schemaResponse] = await Promise.all([
                fetchAgents(),
                fetchModels(),
                fetchSchema('agent')
            ]);
            setAgents(agentsData);
            setModels(modelsData);
            if (schemaResponse) {
                setAgentSchema(schemaResponse.schema);
                setAgentLayout(schemaResponse.layout);
            }
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const data = await fetchAgents();
            setAgents(data);
        } catch (err) {
            setError(String(err));
        }
    };

    const handleEdit = async (agent: AgentConfig) => {
        // Optimistically set what we have
        setEditingAgent({ ...agent });
        setIsCreating(false);

        // Fetch full details
        try {
            const fullConfig = await fetchAgentConfig(agent.id!); // Use existing fetchAgentConfig
            setEditingAgent(fullConfig);
        } catch (err) {
            console.error("Failed to fetch full agent details", err);
            // We keep the partial data if fetch fails, or we could show an error
        }
    };

    const validateAgentConfig = (): string | null => {
        if (!editingAgent) return "No agent configuration to validate";

        // Validate required fields
        if (!isCreating && editingAgent.id && editingAgent.id.length > 255) {
            return "Agent ID must be 255 characters or less";
        }

        // Model ID is required for both new and existing agents
        if (!editingAgent.model || !editingAgent.model.modelId || editingAgent.model.modelId.trim() === "") {
            return "Model ID is required";
        }
        if (editingAgent.model.modelId.length > 255) {
            return "Model ID must be 255 characters or less";
        }

        if (!editingAgent.model.systemPrompt || editingAgent.model.systemPrompt.trim() === "") {
            return "System Prompt is required";
        }
        if (editingAgent.model.systemPrompt.length < 1) {
            return "System Prompt must be at least 1 character";
        }

        // Validate name length
        // Validate name length
        if (editingAgent.name && editingAgent.name.length > 255) {
            return "Name must be 255 characters or less";
        }

        // Validate description length
        if (editingAgent.description && editingAgent.description.length > 1000) {
            return "Description must be 1000 characters or less";
        }

        // Validate avatar length
        if (editingAgent.avatar && editingAgent.avatar.length > 500) {
            return "Avatar URL must be 500 characters or less";
        }

        // Validate role length
        if (editingAgent.model?.role && editingAgent.model.role.length > 255) {
            return "Role must be 255 characters or less";
        }

        // Validate context manager config
        if (editingAgent.model?.contextManagerConfig?.type === "last_n") {
            const keepLast = editingAgent.model.contextManagerConfig['keepLast'];
            if (keepLast !== undefined && (isNaN(keepLast) || keepLast < 1 || keepLast > 1000)) {
                return "Keep Last N Interactions must be between 1 and 1000";
            }
        }

        // Validate enabled tools
        if (editingAgent.model?.tools?.enabled) {
            for (const toolId of editingAgent.model.tools.enabled) {
                if (toolId.length < 1 || toolId.length > 255) {
                    return "Each enabled tool ID must be between 1 and 255 characters";
                }
            }
        }

        // Validate standard tools
        if (editingAgent.model?.tools?.standardTools) {
            for (const toolId of editingAgent.model.tools.standardTools) {
                if (toolId.length < 1 || toolId.length > 255) {
                    return "Each standard tool ID must be between 1 and 255 characters";
                }
            }
        }

        return null;
    };

    const handleSave = async () => {
        if (!editingAgent) return;

        const validationError = validateAgentConfig();
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            if (isCreating) {
                const created = await createAgent(editingAgent);
                setAgents(prev => [...prev, created]);
            } else {
                const updated = await updateAgent(editingAgent.id!, editingAgent);
                setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
            }
            setEditingAgent(null);
            setIsCreating(false);
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
            id: "",
            name: "",
            type: "assistant",
            description: "",
            avatar: "",
            model: {
                modelId: "",
                role: "",
                systemPrompt: "",
                tools: {
                    enabled: [],
                    configs: {},
                    standardTools: []
                },
                contextManagerConfig: {
                    type: "last_n",
                    keepLast: undefined as any
                },
                type: "OPEN_AI_COMPATIBLE"
            },
            sessionStore: {
                type: "memory"
            }
        };
        setEditingAgent(newAgent);
        setIsCreating(true);
    };



    return (
        <div className="flex-1 bg-background">
            <div className="max-w-[1200px] mx-auto px-10 pt-20 pb-40">
                <header className="flex justify-between items-end mb-16 border-b border-border pb-10">
                    <div className="flex flex-col gap-2">
                        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">Management</p>
                        <h2 className="text-[34px] font-semibold tracking-tight text-foreground">Agents</h2>
                        <p className="text-[16px] text-muted-foreground/80 leading-relaxed max-w-md">
                            Create and orchestrate your autonomous assistants.
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-8 py-3 bg-primary text-white text-[15px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98]"
                    >
                        New Agent
                    </button>
                </header>

                {error && (
                    <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-400 text-[13px] rounded-2xl mb-12 animate-in fade-in slide-in-from-top-2 duration-500">
                        {error}
                    </div>
                )}

                <div className="flex flex-col">
                    {loading ? (
                        <div className="flex items-center gap-4 text-muted-foreground/30 text-[15px] font-medium animate-pulse py-10">
                            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            Waking up your agents...
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2 opacity-20">
                                <Bot size={32} strokeWidth={1} />
                            </div>
                            <p className="text-muted-foreground/60 text-[15px] italic">No agents found in this workspace.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.03]">
                            {agents.map((agent) => (
                                <div key={agent.id} className="py-8 flex justify-between items-center group transition-all duration-500 hover:px-2">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-[20px] bg-secondary border border-border flex items-center justify-center group-hover:scale-105 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/20 text-muted-foreground group-hover:text-primary/80">
                                            <Bot size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-[17px] font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-300 tracking-tight">{agent.name}</div>
                                            <div className="text-[12px] text-muted-foreground/50 font-mono tracking-tighter uppercase tabular-nums">{agent.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                                        <a
                                            href={`/agents/${agent.id}`}
                                            className="h-11 px-5 text-[14px] font-semibold bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center gap-2"
                                        >
                                            <Play size={14} strokeWidth={2} />
                                            Test
                                        </a>
                                        <button
                                            onClick={() => handleEdit(agent)}
                                            className="h-11 px-5 text-[14px] font-semibold bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center gap-2"
                                        >
                                            <Settings size={14} strokeWidth={2} />
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => handleDelete(agent.id!)}
                                            className="h-11 px-5 text-[14px] font-semibold text-red-400/70 hover:text-red-400 bg-red-500/none hover:bg-red-500/5 rounded-2xl transition-all flex items-center gap-2"
                                        >
                                            <Trash2 size={14} strokeWidth={2} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editingAgent && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-end justify-center z-50 animate-in fade-in duration-700">
                        <div className="bg-[#141414] w-full max-w-4xl h-[92vh] rounded-t-[40px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.5)] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom-full duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                            <div className="flex justify-between items-center p-10 pb-6">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-[22px] font-semibold text-white tracking-tight">
                                        {isCreating ? "New Agent" : "Agent Configuration"}
                                    </h3>
                                    {!isCreating && (
                                        <div className="text-[12px] font-mono text-muted-foreground/40 uppercase tracking-tighter">
                                            ID: {editingAgent.id}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setEditingAgent(null)}
                                    className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
                                {agentSchema && (
                                    <JsonForm
                                        schema={agentSchema}
                                        data={editingAgent}
                                        onChange={setEditingAgent}
                                        isNew={isCreating}
                                        layout={agentLayout}
                                    />
                                )}
                            </div>

                            <div className="p-8 px-10 border-t border-white/5 bg-[#141414]/80 backdrop-blur-md flex justify-end gap-6 items-center">
                                <button
                                    onClick={() => setEditingAgent(null)}
                                    className="text-[15px] font-medium text-muted-foreground hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-10 py-3.5 bg-primary text-white text-[15px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98]"
                                >
                                    {isCreating ? "Create Agent" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

