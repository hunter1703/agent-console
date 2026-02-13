"use client";

import { useEffect, useState } from "react";
import { AgentConfig } from "@/models/Agent";
import { ModelConfig } from "@/models/Model";
import { fetchAgents, createAgent, updateAgent, deleteAgent, IS_MOCK, fetchSchema } from "@/lib/api";
import { fetchModels } from "@/lib/modelApi";
import JsonForm from "@/components/JsonForm";

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

    const handleEdit = (agent: AgentConfig) => {
        setEditingAgent({ ...agent });
        setIsCreating(false);
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
                                        onClick={() => handleDelete(agent.id!)}
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
                        <div className="glass w-full max-w-3xl p-8 flex flex-col gap-6 shadow-2xl border-white/10 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {editingAgent.id?.startsWith("new") ? "Create New Agent" : "Edit Agent Configuration"}
                                </h3>
                                <div className="text-[10px] text-muted font-mono bg-white/5 px-2 py-1 rounded uppercase">
                                    ID: {editingAgent.id || "new"}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
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

