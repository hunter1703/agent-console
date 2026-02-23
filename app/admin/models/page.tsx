"use client";

import { useEffect, useState } from "react";
import { ModelConfig } from "@/models/Model";
import { fetchModels, createModel, updateModel, deleteModel, fetchModelConfig } from "@/lib/modelApi";
import { fetchCatalogList, CatalogItem, fetchSchema } from "@/lib/api";
import JsonForm from "@/components/JsonForm";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { BrainCircuit, Settings, Trash2, X, Loader2 } from "lucide-react";

export default function ModelAdminPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelSchema, setModelSchema] = useState<any>(null);
  const [modelLayout, setModelLayout] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const [modelsData, schemaResponse] = await Promise.all([
        fetchModels(),
        fetchSchema('model')
      ]);
      setModels(modelsData);
      if (schemaResponse) {
        setModelSchema(schemaResponse.schema);
        setModelLayout(schemaResponse.layout);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (model: ModelConfig) => {
    // Optimistically set what we have
    setEditingModel({ ...model });
    setIsCreating(false);

    // Fetch full details
    try {
      const fullConfig = await fetchModelConfig(model.id);
      setEditingModel(fullConfig);
    } catch (err) {
      console.error("Failed to fetch full model details", err);
      toast.error("Could not load full model details. Showing partial data.");
    }
  };

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleSave = async () => {
    if (!editingModel) return;

    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        const created = await createModel(editingModel);
        setModels(prev => [...prev, created]);
        toast.success(`Model "${created.name}" registered successfully.`);
      } else {
        const updated = await updateModel(editingModel.id, editingModel);
        setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
        toast.success("Model updated successfully.");
      }
      setEditingModel(null);
      setIsCreating(false);
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Model",
      message: "This model configuration will be permanently removed. Agents using this model may stop working.",
      confirmLabel: "Delete",
      destructive: true,
    });

    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteModel(id);
      setModels(prev => prev.filter(m => m.id !== id));
      toast.success("Model deleted successfully.");
    } catch (err) {
      toast.error(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = () => {
    const newModel: ModelConfig = {
      id: "",
      name: "",
      baseUrl: "",
      type: "OPEN_AI_COMPATIBLE",
      model: "",
      temperature: undefined as any,
      topK: undefined as any,
      topP: undefined as any,
      repeatPenalty: undefined as any,
      numPredict: undefined as any,
      maxContextLength: undefined as any,
      stopTokens: [],
      responseFormat: "",
      apiKey: "",
      toolCallingEnabled: false,
      toolCallingSupported: false,
      contextManagerConfig: { type: "last_n", keepLast: undefined as any },
      serverCommand: "",
      serverArgs: [],
      serverWorkdir: ""
    };
    setEditingModel(newModel);
    setIsCreating(true);
  };


  return (
    <div className="flex-1 bg-background">
      <div className="max-w-[1200px] mx-auto px-10 pt-20 pb-40">
        <header className="flex justify-between items-end mb-16 border-b border-border pb-10">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">Management</p>
            <h2 className="text-[34px] font-semibold tracking-tight text-foreground">Models</h2>
            <p className="text-[16px] text-muted-foreground/80 leading-relaxed max-w-md">
              Configure and manage your intelligence providers.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-8 py-3 bg-primary text-white text-[15px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98]"
          >
            New Model
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
              Synchronizing models...
            </div>
          ) : models.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center mb-2 opacity-40">
                <BrainCircuit size={32} strokeWidth={1} />
              </div>
              <p className="text-muted-foreground/60 text-[15px] italic">No models registered in this console.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {models.map((model) => (
                <div key={model.id} className="py-8 flex justify-between items-center group transition-all duration-500 hover:px-2">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[20px] bg-secondary border border-border flex items-center justify-center group-hover:scale-105 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/20 text-muted-foreground group-hover:text-primary/80">
                      <BrainCircuit size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-[17px] font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-300 tracking-tight">{model.name}</div>
                      <div className="text-[12px] text-muted-foreground/50 font-mono tracking-tighter uppercase tabular-nums">
                        {model.type}
                        {model.model ? ` — ${model.model}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => handleEdit(model)}
                      className="h-11 px-5 text-[14px] font-semibold bg-secondary hover:bg-secondary/80 text-foreground/70 hover:text-foreground rounded-2xl border border-border transition-all flex items-center gap-2"
                    >
                      <Settings size={14} strokeWidth={2} />
                      Configure
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      disabled={deletingId === model.id}
                      className="h-11 px-5 text-[14px] font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {deletingId === model.id ? (
                        <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} strokeWidth={2} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingModel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-end justify-center z-50 animate-in fade-in duration-700">
            <div className="bg-background w-full max-w-4xl h-[92vh] rounded-t-[40px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.5)] border-t border-border flex flex-col animate-in slide-in-from-bottom-full duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex justify-between items-center p-10 pb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[22px] font-semibold text-foreground tracking-tight">
                    {isCreating ? "New Intelligence Provider" : "Model Configuration"}
                  </h3>
                  {!isCreating && (
                    <div className="text-[12px] font-mono text-muted-foreground/40 uppercase tracking-tighter">
                      ID: {editingModel.id}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setEditingModel(null)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
                {modelSchema && (
                  <JsonForm
                    schema={modelSchema}
                    data={editingModel}
                    onChange={setEditingModel}
                    isNew={isCreating}
                    layout={modelLayout}
                    onErrorsChange={setFormErrors}
                  />
                )}
              </div>

              <div className="p-8 px-10 border-t border-border bg-background/80 backdrop-blur-md flex justify-end gap-6 items-center">
                <button
                  onClick={() => setEditingModel(null)}
                  className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={Object.keys(formErrors).length > 0 || isSaving}
                  className={`px-10 py-3.5 bg-primary text-white text-[15px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98] inline-flex items-center gap-2 ${(Object.keys(formErrors).length > 0 || isSaving) ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isCreating ? "Register Model" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}