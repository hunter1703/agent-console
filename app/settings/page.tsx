"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bot, BrainCircuit, Pencil, Plus, Trash2 } from "lucide-react";
import { AgentConfig } from "@/models/Agent";
import { ModelConfig } from "@/models/Model";
import { deleteAgent, fetchAgents } from "@/lib/api";
import { deleteModel, fetchModels } from "@/lib/modelApi";
import { useToast } from "@/components/Toast";

type Tab = "agents" | "models";

const AGENT_PAGE_SIZE = 20;
const MODEL_PAGE_SIZE = 20;

function AgentsTab() {
  const toast = useToast();
  const [items, setItems] = useState<AgentConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const load = async () => {
    setLoading(true);
    offsetRef.current = 0;
    try {
      const page = await fetchAgents({ offset: 0, limit: AGENT_PAGE_SIZE });
      setItems(page.agents);
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch {
      toast.error("Failed to load agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Infinite scroll for agents
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const target = document.getElementById('agents-load-more-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loadingMore]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) {
      return;
    }
    setLoadingMore(true);
    const nextOffset = offsetRef.current + AGENT_PAGE_SIZE;
    try {
      const page = await fetchAgents({ offset: nextOffset, limit: AGENT_PAGE_SIZE });
      offsetRef.current = nextOffset;
      setItems((prev) => [...prev, ...page.agents]);
      setHasMore(page.hasMore);
    } catch {
      toast.error("Failed to load more agents.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (agent: AgentConfig) => {
    if (deletingId !== agent.id) {
      setDeletingId(agent.id);
      return;
    }
    try {
      await deleteAgent(agent.id);
      setItems((prev) => prev.filter((item) => item.id !== agent.id));
      setTotal((prev) => Math.max(0, prev - 1));
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
          <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-muted">
          {total} {total === 1 ? "agent" : "agents"}
        </span>
        <Link
          href="/settings/agents/new"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-primary/[0.06]"
          data-testid="settings-new-agent"
        >
          <Plus size={14} />
          New agent
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 flex justify-center">
            <Bot size={24} className="text-muted-foreground opacity-40" />
          </div>
          <p className="text-[14px] text-muted">No agents configured yet.</p>
          <Link href="/settings/agents/new" className="mt-2 inline-block text-[13px] text-primary">
            Create your first agent
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
            {items.map((agent) => {
              const confirmDelete = deletingId === agent.id;
              return (
                <div
                  key={agent.id}
                  className="group flex items-center gap-3 border-b border-border bg-background px-4 py-3 last:border-b-0 hover:bg-surface"
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/15 bg-accent-surface text-center text-[12px] font-semibold leading-8 text-primary">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
                    ) : (
                      (agent.name?.[0] || "A").toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-foreground">{agent.name || "Unnamed Agent"}</p>
                    {agent.description && (
                      <p className="truncate text-[12px] text-muted-foreground">{agent.description}</p>
                    )}
                  </div>

                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">Delete?</span>
                      <button onClick={() => handleDelete(agent)} className="text-[12px] font-medium text-red">
                        Confirm
                      </button>
                      <button onClick={() => setDeletingId(null)} className="text-[12px] text-muted">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/settings/agents/${agent.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-active hover:text-foreground"
                        aria-label="Edit agent"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-red/5 hover:text-red"
                        aria-label="Delete agent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div id="agents-load-more-trigger" className="h-10 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px]">Loading...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ModelsTab() {
  const toast = useToast();
  const [items, setItems] = useState<ModelConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const load = async () => {
    setLoading(true);
    offsetRef.current = 0;
    try {
      const page = await fetchModels({ offset: 0, limit: MODEL_PAGE_SIZE });
      setItems(page.models);
      setTotal(page.total);
      setHasMore(page.hasMore);
    } catch {
      toast.error("Failed to load models.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Infinite scroll for models
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const target = document.getElementById('models-load-more-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loadingMore]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) {
      return;
    }
    setLoadingMore(true);
    const nextOffset = offsetRef.current + MODEL_PAGE_SIZE;
    try {
      const page = await fetchModels({ offset: nextOffset, limit: MODEL_PAGE_SIZE });
      offsetRef.current = nextOffset;
      setItems((prev) => [...prev, ...page.models]);
      setHasMore(page.hasMore);
    } catch {
      toast.error("Failed to load more models.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (model: ModelConfig) => {
    if (deletingId !== model.id) {
      setDeletingId(model.id);
      return;
    }
    try {
      await deleteModel(model.id);
      setItems((prev) => prev.filter((item) => item.id !== model.id));
      setTotal((prev) => Math.max(0, prev - 1));
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-muted">
          {total} {total === 1 ? "model" : "models"}
        </span>
        <Link
          href="/settings/models/new"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-primary/[0.06]"
          data-testid="settings-new-model"
        >
          <Plus size={14} />
          New model
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 flex justify-center">
            <BrainCircuit size={24} className="text-muted-foreground opacity-40" />
          </div>
          <p className="text-[14px] text-muted">No models configured yet.</p>
          <Link href="/settings/models/new" className="mt-2 inline-block text-[13px] text-primary">
            Register your first model
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
            {items.map((model) => {
              const confirmDelete = deletingId === model.id;
              return (
                <div
                  key={model.id}
                  className="group flex items-center gap-3 border-b border-border bg-background px-4 py-3 last:border-b-0 hover:bg-surface"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-foreground">{model.name || "Unnamed Model"}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{model.model || model.type || ""}</p>
                  </div>

                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">Delete?</span>
                      <button onClick={() => handleDelete(model)} className="text-[12px] font-medium text-red">
                        Confirm
                      </button>
                      <button onClick={() => setDeletingId(null)} className="text-[12px] text-muted">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/settings/models/${model.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-active hover:text-foreground"
                        aria-label="Edit model"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => handleDelete(model)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-red/5 hover:text-red"
                        aria-label="Delete model"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div id="models-load-more-trigger" className="h-10 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px]">Loading...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("agents");

  return (
    <div className="min-h-full px-4 py-10 sm:py-14" data-testid="settings-page">
      <div className="app-shell-regular flex w-full flex-col gap-8">
        <div className="slide-up">
          <h1 className="text-[22px] font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Settings
          </h1>
        </div>

        <div className="slide-up" style={{ animationDelay: "20ms" }}>
          <div className="flex gap-1 border-b border-border">
            {(["agents", "models"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2.5 text-[14px] font-medium capitalize transition-colors ${
                  activeTab === tab ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="slide-up" style={{ animationDelay: "40ms" }}>
          {activeTab === "agents" ? <AgentsTab /> : <ModelsTab />}
        </div>
      </div>
    </div>
  );
}
