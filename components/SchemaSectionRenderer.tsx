"use client";

import JsonForm from "@/components/JsonForm";
import { BuilderMode, BuilderSection, LayoutField } from "@/lib/schemaBuilder";

interface SchemaSectionRendererProps {
  rootSchema: Record<string, unknown>;
  rootData: Record<string, unknown>;
  layoutFields: Record<string, LayoutField> | undefined;
  section: BuilderSection;
  mode: BuilderMode;
  isNew: boolean;
  onChange: (nextData: Record<string, unknown>) => void;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export default function SchemaSectionRenderer({
  rootSchema,
  rootData,
  layoutFields,
  section,
  mode,
  isNew,
  onChange,
  onErrorsChange,
}: SchemaSectionRendererProps) {
  if (!rootSchema) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/80 bg-background/95 px-4 py-4 shadow-sm sm:px-6 sm:py-5"
      data-testid={`builder-section-${section.id}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Section
          </span>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{section.stepTitle}</p>
        </div>
        <h3 className="mt-2 text-[17px] font-semibold tracking-tight text-foreground">{section.title}</h3>
      </div>

      <JsonForm
        schema={rootSchema}
        rootSchema={rootSchema}
        data={rootData}
        rootData={rootData}
        onChange={onChange}
        isNew={isNew}
        mode={mode}
        layoutFields={layoutFields}
        scopeStepId={section.stepId}
        scopeSectionId={section.id}
        onErrorsChange={onErrorsChange}
      />
    </div>
  );
}
