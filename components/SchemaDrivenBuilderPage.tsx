"use client";

import JsonForm from "@/components/JsonForm";
import SchemaSectionRenderer from "@/components/SchemaSectionRenderer";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { createAgent, fetchAgentConfig, fetchSchema, updateAgent } from "@/lib/api";
import { createModel, fetchModelConfig, updateModel } from "@/lib/modelApi";
import {
  BuilderLayout,
  BuilderMode,
  BuilderPreset,
  deepMerge,
  deriveLayoutNavigation,
  evaluateLayoutValidations,
  getPresetPatch,
  normalizeLayout,
} from "@/lib/schemaBuilder";
import { ArrowLeft, Check, ChevronRight, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type AssetType = "agent" | "model";

interface SchemaDrivenBuilderPageProps {
  assetType: AssetType;
  assetId?: string;
}

interface SchemaEnvelope {
  schema: Record<string, unknown>;
  layout?: BuilderLayout | Record<string, unknown>;
}

function draftKey(assetType: AssetType, assetId?: string): string {
  return `schema-builder:draft:${assetType}:${assetId || "new"}`;
}

function resolveDefaultPreset(presets?: BuilderPreset[]): BuilderPreset | undefined {
  if (!presets?.length) {
    return undefined;
  }
  return presets.find((preset) => preset.isDefault) || presets[0];
}

export default function SchemaDrivenBuilderPage({
  assetType,
  assetId,
}: SchemaDrivenBuilderPageProps) {
  const isEdit = Boolean(assetId);
  const mode: BuilderMode = isEdit ? "edit" : "create";
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const [schemaEnvelope, setSchemaEnvelope] = useState<SchemaEnvelope | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [baselineData, setBaselineData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<string, Record<string, string>>>({});
  const draftLoadedRef = useRef(false);

  const layout = useMemo(() => normalizeLayout(schemaEnvelope?.layout), [schemaEnvelope?.layout]);
  const layoutFields = layout.fields;
  const presets = layout.presets || [];
  const actions = layout.actions || {};

  const navigation = useMemo(() => deriveLayoutNavigation(layoutFields), [layoutFields]);
  const steps = navigation.steps;
  const hasExplicitGrouping = useMemo(
    () =>
      Object.values(layoutFields || {}).some(
        (field) => typeof field.step === "string" || typeof field.section === "string",
      ),
    [layoutFields],
  );
  const canUseWizard = hasExplicitGrouping && steps.length > 0;
  const activeStep = canUseWizard ? steps[Math.min(activeStepIndex, steps.length - 1)] : undefined;

  const crossValidationErrors = useMemo(
    () => evaluateLayoutValidations(formData, layout.validations),
    [formData, layout.validations],
  );

  const mergedErrors = useMemo(() => {
    const aggregate = { ...formErrors, ...crossValidationErrors };
    Object.values(sectionErrors).forEach((errorMap) => {
      Object.entries(errorMap).forEach(([key, value]) => {
        aggregate[key] = value;
      });
    });
    return aggregate;
  }, [crossValidationErrors, formErrors, sectionErrors]);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(baselineData),
    [baselineData, formData],
  );

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [schemaResponse, existing] = await Promise.all([
          fetchSchema(assetType, mode),
          isEdit
            ? assetType === "agent"
              ? fetchAgentConfig(assetId!)
              : fetchModelConfig(assetId!)
            : Promise.resolve({}),
        ]);
        if (!schemaResponse?.schema) {
          throw new Error(`Missing schema for ${assetType}`);
        }

        setSchemaEnvelope(schemaResponse);
        const baseData = (existing || {}) as Record<string, unknown>;

        let nextData = baseData;
        const nextLayout = normalizeLayout(schemaResponse.layout);
        const defaultPreset = resolveDefaultPreset(nextLayout.presets);
        if (!isEdit && defaultPreset) {
          const patch = getPresetPatch(defaultPreset);
          if (Object.keys(patch).length > 0) {
            nextData = deepMerge(baseData, patch) as Record<string, unknown>;
          }
          setSelectedPresetId(defaultPreset.id);
        }

        setBaselineData(nextData);
        setFormData(nextData);
      } catch (error) {
        console.error(error);
        toast.error(`Failed to load ${assetType} builder.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assetId, assetType, isEdit, mode]);

  useEffect(() => {
    if (loading || draftLoadedRef.current) {
      return;
    }
    draftLoadedRef.current = true;
    try {
      const raw = localStorage.getItem(draftKey(assetType, assetId));
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { data?: Record<string, unknown> };
      if (!parsed?.data) {
        return;
      }
      const baselineSerialized = JSON.stringify(baselineData || {});
      const draftSerialized = JSON.stringify(parsed.data || {});
      if (baselineSerialized === draftSerialized) {
        localStorage.removeItem(draftKey(assetType, assetId));
        return;
      }

      confirm({
        title: "Restore draft?",
        message:
          "A local draft was found for this builder. Restore it now? You can discard it and continue with the loaded configuration.",
        confirmLabel: "Restore",
        cancelLabel: "Discard",
      }).then((accepted) => {
        if (accepted) {
          setFormData(parsed.data || {});
          toast.info("Draft restored.");
          return;
        }
        localStorage.removeItem(draftKey(assetType, assetId));
      });
    } catch (error) {
      console.error("Failed to read builder draft:", error);
    }
  }, [assetId, assetType, baselineData, confirm, loading]);

  useEffect(() => {
    if (loading) {
      return;
    }
    const timerId = window.setTimeout(() => {
      try {
        if (!isDirty) {
          localStorage.removeItem(draftKey(assetType, assetId));
          return;
        }
        localStorage.setItem(
          draftKey(assetType, assetId),
          JSON.stringify({
            data: formData,
            updatedAt: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Failed to persist builder draft:", error);
      }
    }, 400);
    return () => window.clearTimeout(timerId);
  }, [assetId, assetType, formData, isDirty, loading]);

  useEffect(() => {
    if (!activeStep && activeStepIndex !== 0) {
      setActiveStepIndex(0);
    }
  }, [activeStep, activeStepIndex]);

  const handlePresetApply = (preset: BuilderPreset) => {
    const patch = getPresetPatch(preset);
    setSelectedPresetId(preset.id);
    setFormData((previous) => deepMerge(previous, patch) as Record<string, unknown>);
  };

  const handleCancel = async () => {
    if (isDirty) {
      const accepted = await confirm({
        title: "Discard unsaved changes?",
        message:
          actions.unsavedChangesWarning ||
          "You have unsaved changes in this builder. Leaving now will discard local changes from this session.",
        confirmLabel: "Discard",
        cancelLabel: "Stay",
        destructive: true,
      });
      if (!accepted) {
        return;
      }
    }
    router.push("/settings");
  };

  const handleSave = async () => {
    if (Object.keys(mergedErrors).length > 0) {
      toast.error("Resolve validation errors before saving.");
      return;
    }
    setSaving(true);
    try {
      if (assetType === "agent") {
        if (isEdit) {
          await updateAgent(assetId!, formData);
          toast.success("Agent updated.");
        } else {
          const created = await createAgent(formData);
          toast.success("Agent created.");
          localStorage.removeItem(draftKey(assetType, assetId));
          router.push(`/settings/agents/${created.id}`);
          return;
        }
      } else if (isEdit) {
        await updateModel(assetId!, formData as Parameters<typeof updateModel>[1]);
        toast.success("Model updated.");
      } else {
        const created = await createModel(formData as Parameters<typeof createModel>[0]);
        toast.success("Model created.");
        localStorage.removeItem(draftKey(assetType, assetId));
        router.push(`/settings/models/${created.id}`);
        return;
      }
      setBaselineData(formData);
      localStorage.removeItem(draftKey(assetType, assetId));
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save ${assetType}.`);
    } finally {
      setSaving(false);
    }
  };

  const onLastStep = !canUseWizard || activeStepIndex >= steps.length - 1;
  const totalSteps = canUseWizard ? steps.length : 1;
  const completedSteps = canUseWizard ? Math.min(activeStepIndex + 1, steps.length) : 1;
  const completionPercent = Math.round((completedSteps / Math.max(totalSteps, 1)) * 100);
  const previewJson = useMemo(() => JSON.stringify(formData, null, 2), [formData]);
  const previewBytes = useMemo(() => new TextEncoder().encode(previewJson).length, [previewJson]);

  if (loading) {
    return (
      <div className="min-h-full px-4 py-8 sm:px-6 sm:py-10">
        <div className="app-shell-builder">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-surface" />
          <div className="mt-4 h-72 animate-pulse rounded-[var(--radius-lg)] bg-surface" />
        </div>
      </div>
    );
  }

  if (!schemaEnvelope?.schema) {
    return (
      <div className="min-h-full px-4 py-8 sm:px-6 sm:py-10">
        <div className="app-shell-regular rounded-[var(--radius-lg)] border border-red/30 bg-red/10 p-4 text-[14px] text-red">
          Failed to load schema for {assetType}.
        </div>
      </div>
    );
  }

  return (
    <div
      className="studio-canvas min-h-full px-4 py-8 sm:px-6 sm:py-10"
      data-testid={`${assetType}-builder`}
    >
      <div className="app-shell-builder flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border/80 bg-background/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={handleCancel}
              className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-sm)] border border-border px-3 text-[13px] text-muted hover:text-foreground"
              data-testid="builder-back"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-bold tracking-tight text-foreground">
                {isEdit ? `Edit ${assetType}` : `New ${assetType}`}
              </h1>
              <p className="text-[13px] text-muted">Schema contract driven builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber">
                Unsaved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(mergedErrors).length > 0}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
              data-testid="builder-save"
            >
              <Save size={13} />
              {saving ? "Saving..." : actions.saveLabel || "Save"}
            </button>
          </div>
        </div>

        {canUseWizard && (
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-background/90 px-4 py-3 shadow-sm">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles size={12} />
                Builder Flow
              </div>
              <p className="text-[12px] font-medium text-muted">
                {completedSteps} / {totalSteps} steps completed
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full border border-border bg-surface">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-[width] duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((step, index) => (
                <span
                  key={`chip-${step.id}`}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    index <= activeStepIndex
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  {index + 1}. {step.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {presets.length > 0 && (
          <div className="rounded-[var(--radius-lg)] border border-border/80 bg-surface p-3 shadow-sm">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              Presets (from backend layout)
            </p>
            <div className="flex flex-wrap gap-2" data-testid="builder-presets">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetApply(preset)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] ${
                    selectedPresetId === preset.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                  data-testid={`preset-${preset.id}`}
                >
                  {selectedPresetId === preset.id && <Check size={12} />}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[250px_minmax(680px,1fr)_320px] 2xl:grid-cols-[270px_minmax(760px,1fr)_340px]">
          {canUseWizard && (
            <aside className="rounded-[var(--radius-lg)] border border-border/80 bg-gradient-to-b from-surface to-background p-3 shadow-sm xl:sticky xl:top-4 xl:h-fit">
              <ol className="space-y-1" data-testid="builder-steps">
                {steps.map((step, index) => (
                  <li key={step.id}>
                    <button
                      onClick={() => setActiveStepIndex(index)}
                      className={`w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors ${
                        index === activeStepIndex
                          ? "border-primary/35 bg-primary/10 text-primary shadow-sm"
                          : "border-transparent text-muted hover:border-border hover:bg-background hover:text-foreground"
                      }`}
                      data-testid={`step-${step.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{step.title}</span>
                          <span className="mt-0.5 block text-[10px] uppercase tracking-wide opacity-75">
                            {step.sections.length} section{step.sections.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <span className="text-[11px]">{index + 1}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <main className="space-y-4">
            {!canUseWizard && (
              <div
                className="rounded-[var(--radius-sm)] border border-amber/30 bg-amber/10 px-3 py-2 text-[12px] text-amber"
                data-testid="basic-mode-banner"
              >
                Layout fields do not define step/section grouping; rendering the complete schema form.
              </div>
            )}

            {canUseWizard && activeStep ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{activeStep.title}</h2>
                  <p className="text-[12px] text-muted">
                    Shape this step with schema-aware fields and presets.
                  </p>
                </div>

                {activeStep.sections.map((section) => (
                  <SchemaSectionRenderer
                    key={`${section.stepId}:${section.id}`}
                    rootSchema={schemaEnvelope.schema}
                    rootData={formData}
                    layoutFields={layoutFields}
                    section={section}
                    mode={mode}
                    isNew={!isEdit}
                    onChange={setFormData}
                    onErrorsChange={(errors) =>
                      setSectionErrors((previous) => ({
                        ...previous,
                        [`${section.stepId}:${section.id}`]: errors,
                      }))
                    }
                  />
                ))}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveStepIndex((previous) => Math.max(0, previous - 1))}
                    disabled={activeStepIndex === 0}
                    className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-border px-3 text-[13px] text-muted hover:text-foreground disabled:opacity-40"
                    data-testid="builder-prev-step"
                  >
                    {actions.backLabel || "Back"}
                  </button>
                  <button
                    onClick={() => {
                      if (onLastStep) {
                        handleSave();
                        return;
                      }
                      if (Object.keys(mergedErrors).length > 0) {
                        toast.error("Resolve validation errors before continuing.");
                        return;
                      }
                      setActiveStepIndex((previous) => Math.min(steps.length - 1, previous + 1));
                    }}
                    className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-sm)] bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
                    data-testid="builder-next-step"
                  >
                    {onLastStep ? actions.saveLabel || "Save" : actions.nextLabel || "Continue"}
                    {!onLastStep && <ChevronRight size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <JsonForm
                schema={schemaEnvelope.schema}
                rootSchema={schemaEnvelope.schema}
                data={formData}
                rootData={formData}
                onChange={setFormData}
                layoutFields={layoutFields}
                mode={mode}
                isNew={!isEdit}
                onErrorsChange={setFormErrors}
              />
            )}

            {Object.keys(mergedErrors).length > 0 && (
              <div
                className="rounded-[var(--radius-lg)] border border-red/30 bg-red/10 px-4 py-3"
                data-testid="builder-errors"
              >
                <p className="text-[13px] font-semibold text-red">Validation issues</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-red/90">
                  {Object.entries(mergedErrors).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>

          <aside className="rounded-[var(--radius-lg)] border border-border/80 bg-gradient-to-b from-surface to-background p-3 shadow-sm xl:sticky xl:top-4 xl:h-fit">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-foreground">Read-only JSON</h3>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted">
                {previewBytes} bytes
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">Live payload generated from schema and layout.</p>
            <pre
              className="mt-3 max-h-[70vh] overflow-auto rounded-[var(--radius-sm)] border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground"
              data-testid="builder-json-preview"
            >
              {previewJson}
            </pre>
          </aside>
        </div>
      </div>
    </div>
  );
}
