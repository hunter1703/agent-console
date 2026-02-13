"use client";

import { useEffect, useState } from "react";
import { ModelConfig } from "@/models/Model";
import { fetchModels, createModel, updateModel, deleteModel } from "@/lib/modelApi";
import { fetchCatalogList, CatalogItem, fetchSchema } from "@/lib/api";
import JsonForm from "@/components/JsonForm";

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

  const handleEdit = (model: ModelConfig) => {
    setEditingModel({ ...model });
    setIsCreating(false);
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
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Model Management</h2>
            <p className="text-muted text-sm">Configure and manage your AI models.</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            + Create Model
          </button>
        </header>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex items-center gap-3 text-muted italic animate-pulse">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Loading models...
            </div>
          ) : (
            models.map((model) => (
              <div key={model.id} className="glass p-5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                    🧠
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{model.name}</div>
                    <div className="text-[10px] text-muted font-mono tracking-tighter uppercase">
                      {model.type}
                      {model.model ? ` | ${model.model}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(model)}
                    className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="px-4 py-2 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {editingModel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="glass w-full max-w-2xl p-8 flex flex-col gap-6 shadow-2xl border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {isCreating ? "Create New Model" : "Edit Model Configuration"}
                </h3>
                <div className="text-[10px] text-muted font-mono bg-white/5 px-2 py-1 rounded uppercase">
                  ID: {editingModel.id || "new"}
                </div>
              </div>

              <div className="flex flex-col gap-6">
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

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setEditingModel(null)}
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