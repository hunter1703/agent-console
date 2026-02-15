"use client";

import { useEffect, useState } from "react";
import { ModelConfig } from "@/models/Model";
import { fetchModels, createModel, updateModel, deleteModel, fetchModelConfig } from "@/lib/modelApi";
import { fetchCatalogList, CatalogItem, fetchSchema } from "@/lib/api";
import JsonForm from "@/components/JsonForm";
import { BrainCircuit, Settings, Trash2, X } from "lucide-react";

export default function ModelAdminPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelSchema, setModelSchema] = useState<any>(null);
  const [modelLayout, setModelLayout] = useState<any>(null);

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
      // We keep the partial data if fetch fails
    }
  };

  const handleSave = async () => {
    if (!editingModel) return;
    try {
      if (isCreating) {
        const created = await createModel(editingModel);
        setModels(prev => [...prev, created]);
      } else {
        const updated = await updateModel(editingModel.id, editingModel);
        setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
      setEditingModel(null);
      setIsCreating(false);
    } catch (err) {
      alert(`Failed to save: ${err}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await deleteModel(id);
      setModels(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err}`);
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
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-2 opacity-20">
                <BrainCircuit size={32} strokeWidth={1} />
              </div>
              <p className="text-muted-foreground/60 text-[15px] italic">No models registered in this console.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
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
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => handleEdit(model)}
                      className="h-11 px-5 text-[14px] font-semibold bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center gap-2"
                    >
                      <Settings size={14} strokeWidth={2} />
                      Configure
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
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

        {editingModel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-end justify-center z-50 animate-in fade-in duration-700">
            <div className="bg-[#141414] w-full max-w-4xl h-[92vh] rounded-t-[40px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.5)] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom-full duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex justify-between items-center p-10 pb-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[22px] font-semibold text-white tracking-tight">
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
                  className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.1] transition-all"
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
                  />
                )}
              </div>

              <div className="p-8 px-10 border-t border-white/5 bg-[#141414]/80 backdrop-blur-md flex justify-end gap-6 items-center">
                <button
                  onClick={() => setEditingModel(null)}
                  className="text-[15px] font-medium text-muted-foreground hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-10 py-3.5 bg-primary text-white text-[15px] font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98]"
                >
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