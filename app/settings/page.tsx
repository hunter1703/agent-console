"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AgentConfig } from "@/models/Agent";
import { ModelConfig } from "@/models/Model";
import {
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    fetchSchema,
    fetchAgentConfig,
} from "@/lib/api";
import {
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
    fetchModelConfig,
} from "@/lib/modelApi";
import JsonForm from "@/components/JsonForm";
import { useToast } from "@/components/Toast";
import { Plus, Pencil, Trash2, X, Bot, BrainCircuit, Loader2 } from "lucide-react";

type Tab = "agents" | "models";

/* ── Shared form sheet ─────────────────────────────────────────────────────── */
interface FormSheetProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    isSaving: boolean;
    children: React.ReactNode;
}

function FormSheet({
    title,
    isOpen,
    onClose,
    onSave,
    isSaving,
    children,
}: FormSheetProps) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={[
                    "fixed right-0 top-0 bottom-0 z-50",
                    "w-full sm:w-[480px] md:w-[560px]",
                    "flex flex-col bg-background border-l border-border",
                    "shadow-[var(--shadow-lg)] panel-enter",
                ].join(" ")}
                role="dialog"
                aria-label={title}
            >
                {/* Sheet header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <h2 className="text-[15px] font-semibold text-foreground">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Form content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

                {/* Footer actions */}
                <div className="shrink-0 px-5 py-4 border-t border-border flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className={[
                            "flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)]",
                            "text-[13px] font-medium text-primary-foreground",
                            "bg-primary hover:bg-primary-hover transition-colors",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                        ].join(" ")}
                    >
                        {isSaving && <Loader2 size={13} className="animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}

const AGENT_PAGE_SIZE = 20;
const MODEL_PAGE_SIZE = 20;

/* ── Agents tab ────────────────────────────────────────────────────────────── */
function AgentsTab() {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [schema, setSchema] = useState<any>(null);
    const [layout, setLayout] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const offsetRef = useRef(0);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        offsetRef.current = 0;
        try {
            const [agentsPage, schemaResp] = await Promise.all([
                fetchAgents({ offset: 0, limit: AGENT_PAGE_SIZE }),
                fetchSchema("agent"),
            ]);
            setAgents(agentsPage.agents);
            setHasMore(agentsPage.hasMore);
            setTotal(agentsPage.total);
            if (schemaResp) {
                setSchema(schemaResp.schema);
                setLayout(schemaResp.layout);
            }
        } catch {
            toast.error("Failed to load agents.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextOffset = offsetRef.current + AGENT_PAGE_SIZE;
        try {
            const page = await fetchAgents({ offset: nextOffset, limit: AGENT_PAGE_SIZE });
            offsetRef.current = nextOffset;
            setAgents((prev) => [...prev, ...page.agents]);
            setHasMore(page.hasMore);
        } catch {
            // keep existing agents
        } finally {
            setLoadingMore(false);
        }
    };

    const handleEdit = async (agent: AgentConfig) => {
        setEditingAgent({ ...agent });
        setIsCreating(false);
        try {
            const full = await fetchAgentConfig(agent.id!);
            setEditingAgent(full);
        } catch {
            /* use partial data */
        }
    };

    const handleNew = () => {
        setEditingAgent({} as AgentConfig);
        setIsCreating(true);
    };

    const handleSave = async () => {
        if (!editingAgent || Object.keys(formErrors).length > 0) return;
        setIsSaving(true);
        try {
            if (isCreating) {
                const created = await createAgent(editingAgent);
                setAgents((prev) => [...prev, created]);
                setTotal((t) => t + 1);
                toast.success(`Agent "${created.name}" created.`);
            } else {
                const updated = await updateAgent(editingAgent.id!, editingAgent);
                setAgents((prev) =>
                    prev.map((a) => (a.id === updated.id ? updated : a))
                );
                toast.success(`Agent "${updated.name}" saved.`);
            }
            setEditingAgent(null);
        } catch {
            toast.error("Failed to save agent.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (agent: AgentConfig) => {
        if (deletingId !== agent.id) {
            setDeletingId(agent.id!);
            return;
        }
        try {
            await deleteAgent(agent.id!);
            setAgents((prev) => prev.filter((a) => a.id !== agent.id));
            setTotal((t) => t - 1);
            toast.success("Agent deleted.");
        } catch {
            toast.error("Failed to delete agent.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] text-muted">
                    {total} {total === 1 ? "agent" : "agents"}
                </span>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[13px] font-medium text-primary hover:bg-primary/[0.06] transition-colors"
                >
                    <Plus size={14} />
                    New agent
                </button>
            </div>

            {agents.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <Bot size={24} className="text-muted-foreground opacity-40" />
                    <p className="text-[14px] text-muted">No agents configured yet.</p>
                    <button
                        onClick={handleNew}
                        className="text-[13px] text-primary hover:text-primary/80 transition-colors"
                    >
                        Create your first agent →
                    </button>
                </div>
            ) : (
                <>
                <div className="rounded-[var(--radius-lg)] border border-border overflow-hidden divide-y divide-border mb-3">
                    {agents.map((agent) => {
                        const isConfirmingDelete = deletingId === agent.id;

                        return (
                            <div
                                key={agent.id}
                                className="group flex items-center gap-3 px-4 py-3 bg-background hover:bg-surface transition-colors"
                            >
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-accent-surface border border-primary/15 flex items-center justify-center text-[12px] font-semibold text-primary shrink-0 overflow-hidden">
                                    {agent.avatar ? (
                                        <img
                                            src={agent.avatar}
                                            alt={agent.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        (agent.name?.[0] || "A").toUpperCase()
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-foreground truncate">
                                        {agent.name || "Unnamed Agent"}
                                    </p>
                                    {agent.description && (
                                        <p className="text-[12px] text-muted-foreground truncate">
                                            {agent.description}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {isConfirmingDelete ? (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[12px] text-muted-foreground">
                                            Delete?
                                        </span>
                                        <button
                                            onClick={() => handleDelete(agent)}
                                            className="text-[12px] font-medium text-red hover:text-red/80 transition-colors"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="text-[12px] text-muted hover:text-foreground transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            onClick={() => handleEdit(agent)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-active transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(agent)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red hover:bg-red/5 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full py-2 text-[13px] text-muted hover:text-foreground border border-border rounded-[var(--radius-md)] bg-surface transition-colors disabled:opacity-50"
                    >
                        {loadingMore ? "Loading…" : "Load more"}
                    </button>
                )}
                </>
            )}

            {/* Edit/Create sheet */}
            <FormSheet
                title={isCreating ? "New Agent" : "Edit Agent"}
                isOpen={!!editingAgent}
                onClose={() => setEditingAgent(null)}
                onSave={handleSave}
                isSaving={isSaving}
            >
                {editingAgent && schema && (
                    <JsonForm
                        schema={schema}
                        layout={layout}
                        data={editingAgent}
                        onChange={setEditingAgent}
                        onErrorsChange={setFormErrors}
                    />
                )}
                {editingAgent && !schema && (
                    <p className="text-[14px] text-muted">Loading form schema…</p>
                )}
            </FormSheet>
        </>
    );
}

/* ── Models tab ────────────────────────────────────────────────────────────── */
function ModelsTab() {
    const [models, setModels] = useState<ModelConfig[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [schema, setSchema] = useState<any>(null);
    const [layout, setLayout] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const offsetRef = useRef(0);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        offsetRef.current = 0;
        try {
            const [modelsPage, schemaResp] = await Promise.all([
                fetchModels({ offset: 0, limit: MODEL_PAGE_SIZE }),
                fetchSchema("model"),
            ]);
            setModels(modelsPage.models);
            setHasMore(modelsPage.hasMore);
            setTotal(modelsPage.total);
            if (schemaResp) {
                setSchema(schemaResp.schema);
                setLayout(schemaResp.layout);
            }
        } catch {
            toast.error("Failed to load models.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextOffset = offsetRef.current + MODEL_PAGE_SIZE;
        try {
            const page = await fetchModels({ offset: nextOffset, limit: MODEL_PAGE_SIZE });
            offsetRef.current = nextOffset;
            setModels((prev) => [...prev, ...page.models]);
            setHasMore(page.hasMore);
        } catch {
            // keep existing models
        } finally {
            setLoadingMore(false);
        }
    };

    const handleEdit = async (model: ModelConfig) => {
        setEditingModel({ ...model });
        setIsCreating(false);
        try {
            const full = await fetchModelConfig(model.id);
            setEditingModel(full);
        } catch {
            /* use partial data */
        }
    };

    const handleNew = () => {
        setEditingModel({} as ModelConfig);
        setIsCreating(true);
    };

    const handleSave = async () => {
        if (!editingModel || Object.keys(formErrors).length > 0) return;
        setIsSaving(true);
        try {
            if (isCreating) {
                const created = await createModel(editingModel);
                setModels((prev) => [...prev, created]);
                setTotal((t) => t + 1);
                toast.success(`Model "${created.name}" registered.`);
            } else {
                const updated = await updateModel(editingModel.id, editingModel);
                setModels((prev) =>
                    prev.map((m) => (m.id === updated.id ? updated : m))
                );
                toast.success(`Model "${updated.name}" saved.`);
            }
            setEditingModel(null);
        } catch {
            toast.error("Failed to save model.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (model: ModelConfig) => {
        if (deletingId !== model.id) {
            setDeletingId(model.id);
            return;
        }
        try {
            await deleteModel(model.id);
            setModels((prev) => prev.filter((m) => m.id !== model.id));
            setTotal((t) => t - 1);
            toast.success("Model deleted.");
        } catch {
            toast.error("Failed to delete model.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] text-muted">
                    {total} {total === 1 ? "model" : "models"}
                </span>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[13px] font-medium text-primary hover:bg-primary/[0.06] transition-colors"
                >
                    <Plus size={14} />
                    New model
                </button>
            </div>

            {models.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <BrainCircuit size={24} className="text-muted-foreground opacity-40" />
                    <p className="text-[14px] text-muted">No models configured yet.</p>
                    <button
                        onClick={handleNew}
                        className="text-[13px] text-primary hover:text-primary/80 transition-colors"
                    >
                        Register your first model →
                    </button>
                </div>
            ) : (
                <>
                <div className="rounded-[var(--radius-lg)] border border-border overflow-hidden divide-y divide-border mb-3">
                    {models.map((model) => {
                        const isConfirmingDelete = deletingId === model.id;
                        return (
                            <div
                                key={model.id}
                                className="group flex items-center gap-3 px-4 py-3 bg-background hover:bg-surface transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-medium text-foreground truncate">
                                        {model.name || "Unnamed Model"}
                                    </p>
                                    <p className="text-[12px] text-muted-foreground truncate">
                                        {model.model || model.type || ""}
                                    </p>
                                </div>

                                {isConfirmingDelete ? (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[12px] text-muted-foreground">
                                            Delete?
                                        </span>
                                        <button
                                            onClick={() => handleDelete(model)}
                                            className="text-[12px] font-medium text-red hover:text-red/80 transition-colors"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="text-[12px] text-muted hover:text-foreground transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            onClick={() => handleEdit(model)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-active transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(model)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red hover:bg-red/5 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="w-full py-2 text-[13px] text-muted hover:text-foreground border border-border rounded-[var(--radius-md)] bg-surface transition-colors disabled:opacity-50"
                    >
                        {loadingMore ? "Loading…" : "Load more"}
                    </button>
                )}
                </>
            )}

            {/* Edit/Create sheet */}
            <FormSheet
                title={isCreating ? "New Model" : "Edit Model"}
                isOpen={!!editingModel}
                onClose={() => setEditingModel(null)}
                onSave={handleSave}
                isSaving={isSaving}
            >
                {editingModel && schema && (
                    <JsonForm
                        schema={schema}
                        layout={layout}
                        data={editingModel}
                        onChange={setEditingModel}
                        onErrorsChange={setFormErrors}
                    />
                )}
                {editingModel && !schema && (
                    <p className="text-[14px] text-muted">Loading form schema…</p>
                )}
            </FormSheet>
        </>
    );
}

/* ── Settings page ─────────────────────────────────────────────────────────── */
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("agents");

    return (
        <div className="min-h-full px-4 py-10 sm:py-14">
            <div className="max-w-[680px] mx-auto w-full flex flex-col gap-8">

                {/* Header */}
                <div className="slide-up">
                    <h1
                        className="text-[22px] font-bold text-foreground"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        Settings
                    </h1>
                </div>

                {/* Tabs */}
                <div className="slide-up" style={{ animationDelay: "20ms" }}>
                    <div className="flex gap-1 border-b border-border">
                        {(["agents", "models"] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    "relative px-4 py-2.5 text-[14px] font-medium transition-colors capitalize",
                                    activeTab === tab
                                        ? "text-foreground"
                                        : "text-muted hover:text-foreground",
                                ].join(" ")}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="slide-up" style={{ animationDelay: "40ms" }}>
                    {activeTab === "agents" ? <AgentsTab /> : <ModelsTab />}
                </div>
            </div>
        </div>
    );
}
