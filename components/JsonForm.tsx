"use client";

import {
  BuilderMode,
  LayoutDynamicSchema,
  LayoutField,
  deepMerge,
  getByPath,
  getFieldScope,
  getLayoutFieldEntry,
  getPresetPatch,
  isFieldReadOnly,
  isFieldRequired,
  isFieldVisible,
  parseJsonPointer,
  toDotPath,
} from "@/lib/schemaBuilder";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface JsonSchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  help?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  $ref?: string;
  allOf?: Array<Record<string, unknown>>;
  oneOf?: Array<Record<string, unknown>>;
  discriminator?: {
    propertyName?: string;
  };
  [key: string]: unknown;
}

interface JsonSchema extends JsonSchemaProperty {
  $defs?: Record<string, JsonSchemaProperty>;
  definitions?: Record<string, JsonSchemaProperty>;
}

interface ScopeToken {
  step?: string;
  section?: string;
}

interface JsonFormProps {
  schema: JsonSchema;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  className?: string;
  rootSchema?: JsonSchema;
  isNew?: boolean;
  layout?: Record<string, LayoutField>;
  layoutFields?: Record<string, LayoutField>;
  onErrorsChange?: (errors: Record<string, string>) => void;
  rootData?: Record<string, unknown>;
  parentData?: Record<string, unknown>;
  mode?: BuilderMode;
  scopeStepId?: string;
  scopeSectionId?: string;
  pathSegments?: string[];
  inheritedScope?: ScopeToken;
  scopeStack?: Array<Record<string, unknown> | undefined>;
}

interface LookupPickerProps {
  assetType: string;
  multiSelect: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  className: string;
  placeholder: string;
}

interface DynamicSchemaFieldProps {
  fieldKey: string;
  label: string;
  description?: string;
  required: boolean;
  fieldError?: string;
  layoutField: LayoutField;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  rootSchema: JsonSchema;
  rootData: Record<string, unknown>;
  scopeStack: Array<Record<string, unknown> | undefined>;
  mode: BuilderMode;
  isNew?: boolean;
  onErrorsChange?: (errors: Record<string, string>) => void;
}

interface ResolvedSchema {
  props: Record<string, JsonSchemaProperty>;
  order: string[];
  required: string[];
}

const LATE_ORDER = Number.MAX_SAFE_INTEGER;
const DYNAMIC_SCHEMA_CACHE = new Map<
  string,
  {
    schema?: JsonSchema;
    layoutFields?: Record<string, LayoutField>;
  }
>();
const DYNAMIC_SCHEMA_INFLIGHT = new Map<
  string,
  Promise<
    | {
        schema?: JsonSchema;
        layoutFields?: Record<string, LayoutField>;
      }
    | null
  >
>();

function toApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `/api${normalized}`;
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function normalizeLayoutMap(
  layoutFields?: Record<string, LayoutField>,
  layout?: Record<string, LayoutField>,
): Record<string, LayoutField> | undefined {
  if (layoutFields && typeof layoutFields === "object") {
    return layoutFields;
  }
  if (!layout || typeof layout !== "object") {
    return undefined;
  }
  const keys = Object.keys(layout);
  if (!keys.length) {
    return undefined;
  }
  return keys.every((key) => key.startsWith("/")) ? layout : undefined;
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isArrayIndexSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function isPointerPrefix(pointer: string, prefixSegments: string[]): boolean {
  const pointerSegments = parseJsonPointer(pointer);
  if (pointerSegments.length < prefixSegments.length) {
    return false;
  }
  for (let index = 0; index < prefixSegments.length; index += 1) {
    const expected = prefixSegments[index];
    const candidate = pointerSegments[index];
    if (candidate === expected) {
      continue;
    }
    if (candidate === "*" && isArrayIndexSegment(expected)) {
      continue;
    }
    return false;
  }
  return true;
}

function resolveTemplateExpressions(
  value: unknown,
  context: {
    rootData: Record<string, unknown>;
    itemData?: Record<string, unknown>;
    localData?: Record<string, unknown>;
    parentData?: Record<string, unknown>;
  },
): { value: unknown; complete: boolean } {
  if (typeof value === "string") {
    if (value.startsWith("$item.")) {
      const resolved = getByPath(context.itemData, value.slice(6));
      return { value: resolved, complete: resolved !== undefined };
    }
    if (value.startsWith("$.")) {
      const resolved = getByPath(context.rootData, value.slice(2));
      return { value: resolved, complete: resolved !== undefined };
    }
    if (value.startsWith("$^.")) {
      const resolved = getByPath(context.parentData, value.slice(3));
      return { value: resolved, complete: resolved !== undefined };
    }
    if (value.startsWith("$local.")) {
      const resolved = getByPath(context.localData, value.slice(7));
      return { value: resolved, complete: resolved !== undefined };
    }
    return { value, complete: true };
  }

  if (Array.isArray(value)) {
    const items = value.map((entry) => resolveTemplateExpressions(entry, context));
    return {
      value: items.map((entry) => entry.value),
      complete: items.every((entry) => entry.complete),
    };
  }

  if (!isObjectLike(value)) {
    return { value, complete: true };
  }

  const output: Record<string, unknown> = {};
  let complete = true;
  Object.entries(value).forEach(([key, innerValue]) => {
    const resolved = resolveTemplateExpressions(innerValue, context);
    output[key] = resolved.value;
    if (!resolved.complete) {
      complete = false;
    }
  });
  return { value: output, complete };
}

function mergeNestedErrors(
  existing: Record<string, string>,
  prefix: string,
  nestedErrors: Record<string, string>,
): Record<string, string> {
  const next: Record<string, string> = {};
  Object.entries(existing).forEach(([key, value]) => {
    if (!key.startsWith(`${prefix}.`)) {
      next[key] = value;
    }
  });
  Object.entries(nestedErrors).forEach(([key, value]) => {
    next[`${prefix}.${key}`] = value;
  });
  return next;
}

function fieldOrderKey(field: LayoutField | undefined, fallbackIndex: number): number {
  if (typeof field?.order === "number") {
    return field.order;
  }
  return LATE_ORDER + fallbackIndex;
}

function coerceArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => String(entry));
}

function isRenderableDynamicSchema(schema: JsonSchema | undefined): boolean {
  if (!schema || typeof schema !== "object") {
    return false;
  }
  if (schema.$ref) {
    return true;
  }
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return true;
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    return true;
  }
  if (schema.items) {
    return true;
  }
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    return true;
  }
  if (typeof schema.type === "string" && schema.type !== "object") {
    return true;
  }
  return false;
}

function LookupPicker({
  assetType,
  multiSelect,
  value,
  onChange,
  disabled,
  className,
  placeholder,
}: LookupPickerProps) {
  const [options, setOptions] = useState<Array<{ id: string; name?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/v1/catalog/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetType,
            query: {
              page: {
                offset: 0,
                limit: 200,
              },
            },
          }),
        });
        if (!response.ok || canceled) {
          return;
        }
        const payload = (await response.json()) as {
          items?: Array<{ id: string; name?: string }>;
        };
        if (!canceled) {
          setOptions(Array.isArray(payload.items) ? payload.items : []);
        }
      } catch {
        if (!canceled) {
          setOptions([]);
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [assetType]);

  if (multiSelect) {
    const selected = new Set(coerceArrayOfStrings(value));
    return (
      <div className="space-y-2">
        <div className="grid max-h-48 gap-2 overflow-auto rounded-[var(--radius-sm)] border border-border bg-secondary/20 p-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-[13px] text-foreground"
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected.has(option.id)}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.currentTarget.checked) {
                    next.add(option.id);
                  } else {
                    next.delete(option.id);
                  }
                  onChange(Array.from(next));
                }}
              />
              <span>{option.name || option.id}</span>
            </label>
          ))}
          {options.length === 0 && !loading && (
            <div className="px-2 py-1 text-[12px] text-muted">No options found.</div>
          )}
          {loading && <div className="px-2 py-1 text-[12px] text-muted">Loading options...</div>}
        </div>
      </div>
    );
  }

  return (
    <select
      className={className}
      value={typeof value === "string" ? value : ""}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.value || undefined)}
    >
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name || option.id}
        </option>
      ))}
    </select>
  );
}

function DynamicSchemaField({
  fieldKey,
  label,
  description,
  required,
  fieldError,
  layoutField,
  value,
  onChange,
  rootSchema,
  rootData,
  scopeStack,
  mode,
  isNew,
  onErrorsChange,
}: DynamicSchemaFieldProps) {
  const [resolved, setResolved] = useState<{
    schema?: JsonSchema;
    layoutFields?: Record<string, LayoutField>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const dynamicSchema = layoutField.dynamicSchema as LayoutDynamicSchema | undefined;
  const localData = scopeStack[0];
  const parentData = scopeStack[1];
  const itemData = localData;
  const endpoint = dynamicSchema?.url ? toApiUrl(dynamicSchema.url) : "";
  const method = (dynamicSchema?.method || "POST").toUpperCase();

  const resolvedBody = useMemo(() => {
    if (!dynamicSchema?.body) {
      return { body: {}, complete: false };
    }
    const result = resolveTemplateExpressions(dynamicSchema.body, {
      rootData,
      itemData,
      localData,
      parentData,
    });
    return {
      body: result.value,
      complete: result.complete,
    };
  }, [dynamicSchema?.body, itemData, localData, parentData, rootData]);
  const resolvedBodyJson = useMemo(() => JSON.stringify(resolvedBody.body || {}), [resolvedBody.body]);
  const requestSignature = useMemo(
    () => (endpoint ? `${method} ${endpoint} ${resolvedBodyJson}` : ""),
    [endpoint, method, resolvedBodyJson],
  );
  const canRenderSchema = useMemo(
    () => isRenderableDynamicSchema(resolved?.schema),
    [resolved?.schema],
  );

  useEffect(() => {
    if (!endpoint || !resolvedBody.complete) {
      setResolved(null);
      return;
    }
    const cached = DYNAMIC_SCHEMA_CACHE.get(requestSignature);
    if (cached) {
      setResolved(cached);
      return;
    }

    let canceled = false;
    const load = async () => {
      setLoading(true);
      try {
        const existingPromise = DYNAMIC_SCHEMA_INFLIGHT.get(requestSignature);
        const fetchPromise =
          existingPromise ||
          (async () => {
            const response = await fetch(endpoint, {
              method,
              headers: { "Content-Type": "application/json" },
              body: resolvedBodyJson,
            });
            if (!response.ok) {
              return null;
            }
            const payload = (await response.json()) as
              | JsonSchema
              | {
                  schema?: JsonSchema;
                  layout?: {
                    fields?: Record<string, LayoutField>;
                  };
                };
            const schema = isObjectLike(payload) && "schema" in payload
              ? (payload.schema as JsonSchema | undefined)
              : (payload as JsonSchema);
            const layout = isObjectLike(payload) && "layout" in payload
              ? (payload.layout as { fields?: Record<string, LayoutField> } | undefined)
              : undefined;
            return {
              schema,
              layoutFields: layout?.fields,
            };
          })();

        if (!existingPromise) {
          DYNAMIC_SCHEMA_INFLIGHT.set(requestSignature, fetchPromise);
        }

        const nextResolved = await fetchPromise;
        if (!existingPromise && DYNAMIC_SCHEMA_INFLIGHT.get(requestSignature) === fetchPromise) {
          DYNAMIC_SCHEMA_INFLIGHT.delete(requestSignature);
        }

        if (!nextResolved || canceled) {
          return;
        }

        if (!canceled) {
          DYNAMIC_SCHEMA_CACHE.set(requestSignature, nextResolved);
          setResolved(nextResolved);
        }
      } catch {
        DYNAMIC_SCHEMA_INFLIGHT.delete(requestSignature);
        if (!canceled) {
          setResolved(null);
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [endpoint, method, requestSignature, resolvedBody.complete, resolvedBodyJson]);

  useEffect(() => {
    if (!resolvedBody.complete || !canRenderSchema) {
      onErrorsChange?.({});
    }
  }, [canRenderSchema, onErrorsChange, resolvedBody.complete]);

  if (!dynamicSchema?.url) {
    return null;
  }

  if (!resolvedBody.complete) {
    return (
      <div className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-2 text-[12px] text-muted">
        Configure required fields to load this dynamic schema.
      </div>
    );
  }

  if (loading) {
    return (
      <div key={fieldKey} className="space-y-1.5">
        <div className="px-0.5">
          <label className="text-[12px] font-semibold uppercase tracking-wide text-muted">
            {label}
            {required && <span className="ml-1 text-primary">*</span>}
          </label>
          {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
        </div>
        <div className="rounded-[var(--radius-sm)] border border-border bg-secondary/20 px-3 py-2 text-[12px] text-muted">
          Loading dynamic configuration...
        </div>
      </div>
    );
  }

  if (!canRenderSchema) {
    return null;
  }

  const schemaToRender = resolved?.schema as JsonSchema;

  return (
    <div key={fieldKey} className="space-y-1.5">
      <div className="px-0.5">
        <label className="text-[12px] font-semibold uppercase tracking-wide text-muted">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
        {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
      </div>
      <div className="rounded-[var(--radius-sm)] border border-border bg-secondary/15 p-3">
        <JsonForm
          schema={schemaToRender}
          data={isObjectLike(value) ? value : {}}
          onChange={onChange}
          rootSchema={rootSchema}
          rootData={rootData}
          layoutFields={resolved?.layoutFields}
          mode={mode}
          isNew={isNew}
          onErrorsChange={onErrorsChange}
        />
      </div>
      {fieldError && <p className="text-[11px] text-red">{fieldError}</p>}
    </div>
  );
}

export default function JsonForm({
  schema,
  data,
  onChange,
  className = "",
  rootSchema,
  isNew,
  layout,
  layoutFields,
  onErrorsChange,
  rootData,
  parentData,
  mode = "create",
  scopeStepId,
  scopeSectionId,
  pathSegments = [],
  inheritedScope,
  scopeStack,
}: JsonFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const lastReportedErrors = useRef<string>("");

  const normalizedLayout = useMemo(
    () => normalizeLayoutMap(layoutFields, layout),
    [layoutFields, layout],
  );
  const effectiveRootSchema = rootSchema || schema;
  const effectiveRootData = rootData || data;
  const effectiveScopeStack = useMemo(
    () =>
      scopeStack && scopeStack.length > 0
        ? scopeStack
        : [data, parentData, effectiveRootData].filter(Boolean) as Array<Record<string, unknown>>,
    [scopeStack, data, parentData, effectiveRootData],
  );

  const scopeMap = useMemo(() => {
    const map = new Map<string, ScopeToken>();
    Object.keys(normalizedLayout || {}).forEach((pointer) => {
      map.set(pointer, getFieldScope(normalizedLayout, pointer));
    });
    return map;
  }, [normalizedLayout]);

  useEffect(() => {
    const serialized = JSON.stringify(fieldErrors);
    if (onErrorsChange && lastReportedErrors.current !== serialized) {
      lastReportedErrors.current = serialized;
      onErrorsChange(fieldErrors);
    }
  }, [fieldErrors, onErrorsChange]);

  const resolveRef = useCallback(
    (ref: string): JsonSchemaProperty | null => {
      if (!ref.startsWith("#/")) {
        return null;
      }
      const parts = ref.split("/").slice(1);
      let current: unknown = effectiveRootSchema;
      for (const part of parts) {
        if (!current || typeof current !== "object") {
          return null;
        }
        current = (current as Record<string, unknown>)[part];
      }
      return current as JsonSchemaProperty;
    },
    [effectiveRootSchema],
  );

  const getProperty = useCallback(
    (property: JsonSchemaProperty): JsonSchemaProperty => {
      if (!property.$ref) {
        return property;
      }
      const resolved = resolveRef(property.$ref);
      if (!resolved) {
        return property;
      }
      return {
        ...resolved,
        ...property,
        properties:
          resolved.properties || property.properties
            ? { ...(resolved.properties || {}), ...(property.properties || {}) }
            : undefined,
        required: Array.from(new Set([...(resolved.required || []), ...(property.required || [])])),
      };
    },
    [resolveRef],
  );

  const mergeProps = useCallback(
    (
      base: Record<string, JsonSchemaProperty>,
      extension: Record<string, JsonSchemaProperty>,
      orderTracker: string[],
    ): Record<string, JsonSchemaProperty> => {
      const result = { ...base };
      Object.entries(extension).forEach(([key, prop]) => {
        if (result[key]) {
          result[key] = { ...result[key], ...prop };
          return;
        }
        result[key] = prop;
        orderTracker.push(key);
      });
      return result;
    },
    [],
  );

  const evaluateSchema = useCallback(
    (currentSchema: JsonSchema, currentData: Record<string, unknown>): ResolvedSchema => {
      let resolvedSchema = currentSchema;
      if (currentSchema.$ref) {
        const resolved = resolveRef(currentSchema.$ref);
        if (resolved) {
          resolvedSchema = { ...resolved, ...currentSchema };
        }
      }

      const baseProps = resolvedSchema.properties || {};
      const conditionalKeys = new Set<string>();
      (resolvedSchema.allOf || []).forEach((branch) => {
        const thenBranch = branch.then as { properties?: Record<string, JsonSchemaProperty> } | undefined;
        if (!thenBranch?.properties) {
          return;
        }
        Object.keys(thenBranch.properties).forEach((key) => conditionalKeys.add(key));
      });

      let props: Record<string, JsonSchemaProperty> = {};
      const order: string[] = [];
      const requiredSet = new Set<string>(resolvedSchema.required || []);

      Object.entries(baseProps).forEach(([key, prop]) => {
        if (conditionalKeys.has(key)) {
          return;
        }
        props[key] = prop;
        order.push(key);
      });

      if (resolvedSchema.oneOf && resolvedSchema.discriminator?.propertyName) {
        const discriminator = resolvedSchema.discriminator.propertyName;
        const discriminatorValue = currentData?.[discriminator];
        const matchingBranch = resolvedSchema.oneOf.find((branch) => {
          const branchRef =
            isObjectLike(branch) && typeof (branch as { $ref?: unknown }).$ref === "string"
              ? ((branch as { $ref: string }).$ref as string)
              : undefined;
          const candidate = branchRef ? resolveRef(branchRef) : (branch as JsonSchemaProperty);
          if (!candidate?.properties?.[discriminator]) {
            return false;
          }
          const token = candidate.properties[discriminator];
          if ((token as JsonSchemaProperty).const !== undefined) {
            return (token as JsonSchemaProperty).const === discriminatorValue;
          }
          if (Array.isArray((token as JsonSchemaProperty).enum)) {
            return ((token as JsonSchemaProperty).enum || []).includes(discriminatorValue);
          }
          return false;
        });
        if (matchingBranch) {
          const matchingRef =
            isObjectLike(matchingBranch) &&
            typeof (matchingBranch as { $ref?: unknown }).$ref === "string"
              ? ((matchingBranch as { $ref: string }).$ref as string)
              : undefined;
          const resolvedBranch = matchingRef
            ? resolveRef(matchingRef)
            : (matchingBranch as JsonSchemaProperty);
          if (resolvedBranch?.properties) {
            props = mergeProps(props, resolvedBranch.properties, order);
          }
          (resolvedBranch?.required || []).forEach((key) => requiredSet.add(key));
        }
      }

      (resolvedSchema.allOf || []).forEach((branch) => {
        const branchState = branch as { if?: unknown; then?: unknown };
        const branchRef =
          isObjectLike(branch) && typeof (branch as { $ref?: unknown }).$ref === "string"
            ? ((branch as { $ref: string }).$ref as string)
            : undefined;
        const resolvedBranch = branchRef ? resolveRef(branchRef) : (branch as JsonSchemaProperty);
        if (resolvedBranch?.properties && !branchState.if) {
          props = mergeProps(props, resolvedBranch.properties, order);
          (resolvedBranch.required || []).forEach((key) => requiredSet.add(key));
        }

        const ifBranch = branchState.if as { properties?: Record<string, JsonSchemaProperty> } | undefined;
        const thenBranch = branchState.then as JsonSchemaProperty | undefined;
        if (!ifBranch?.properties || !thenBranch) {
          return;
        }
        const matches = Object.entries(ifBranch.properties as Record<string, JsonSchemaProperty>).every(
          ([key, condition]) => {
            const currentValue = currentData?.[key];
            if (condition.const !== undefined) {
              return currentValue === condition.const;
            }
            if (Array.isArray(condition.enum)) {
              return condition.enum.includes(currentValue as never);
            }
            return false;
          },
        );
        if (!matches) {
          return;
        }
        const thenRef =
          isObjectLike(thenBranch) && typeof (thenBranch as { $ref?: unknown }).$ref === "string"
            ? ((thenBranch as { $ref: string }).$ref as string)
            : undefined;
        const thenResolved = thenRef ? resolveRef(thenRef) : (thenBranch as JsonSchemaProperty);
        if (thenResolved?.properties) {
          props = mergeProps(props, thenResolved.properties, order);
        }
        (thenResolved?.required || []).forEach((key) => requiredSet.add(key));
      });

      return {
        props,
        order,
        required: Array.from(requiredSet),
      };
    },
    [mergeProps, resolveRef],
  );

  const resolvedSchema = useMemo(
    () => evaluateSchema(schema, data || {}),
    [schema, data, evaluateSchema],
  );

  const hasScopeFilter = Boolean(scopeStepId && scopeSectionId);

  const matchesCurrentScope = useCallback(
    (scope: ScopeToken | undefined): boolean => {
      if (!hasScopeFilter) {
        return true;
      }
      if (!scope?.step || !scope?.section) {
        return false;
      }
      return scope.step === scopeStepId && scope.section === scopeSectionId;
    },
    [hasScopeFilter, scopeSectionId, scopeStepId],
  );

  const hasScopedDescendants = useCallback(
    (segments: string[]): boolean => {
      if (!hasScopeFilter || !normalizedLayout) {
        return false;
      }
      return Object.keys(normalizedLayout).some((pointer) => {
        if (!isPointerPrefix(pointer, segments)) {
          return false;
        }
        return matchesCurrentScope(scopeMap.get(pointer));
      });
    },
    [hasScopeFilter, matchesCurrentScope, normalizedLayout, scopeMap],
  );

  const validateField = useCallback(
    (
      key: string,
      value: unknown,
      property: JsonSchemaProperty,
      required: boolean,
      label: string,
    ): string | null => {
      if (required && (value === undefined || value === null || value === "")) {
        return `${label || key} is required`;
      }
      if (value === undefined || value === null || value === "") {
        return null;
      }
      if ((property.type === "integer" || property.type === "number") && typeof value === "number") {
        if (property.minimum !== undefined && value < property.minimum) {
          return `${label || key} must be at least ${property.minimum}`;
        }
        if (property.maximum !== undefined && value > property.maximum) {
          return `${label || key} must be at most ${property.maximum}`;
        }
      }
      if (property.type === "string" && typeof value === "string") {
        if (property.minLength !== undefined && value.length < property.minLength) {
          return `${label || key} must be at least ${property.minLength} characters`;
        }
        if (property.maxLength !== undefined && value.length > property.maxLength) {
          return `${label || key} must be at most ${property.maxLength} characters`;
        }
        if (property.pattern) {
          try {
            const regex = new RegExp(property.pattern);
            if (!regex.test(value)) {
              return `${label || key} format is invalid`;
            }
          } catch {
            return null;
          }
        }
      }
      return null;
    },
    [],
  );

  const handleFieldChange = useCallback(
    (
      key: string,
      value: unknown,
      property: JsonSchemaProperty,
      required: boolean,
      label: string,
    ) => {
      const error = validateField(key, value, property, required, label);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[key] = error;
        } else {
          delete next[key];
        }
        return next;
      });
      onChange({
        ...(data || {}),
        [key]: value,
      });
    },
    [data, onChange, validateField],
  );

  const commonInputClass =
    "w-full rounded-[var(--radius-md)] border border-border/80 bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition hover:border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

  const sortedKeys = useMemo(() => {
    const indexed = resolvedSchema.order.map((key, index) => ({ key, index }));
    return indexed
      .sort((a, b) => {
        const aEntry = getLayoutFieldEntry(normalizedLayout, [...pathSegments, a.key]);
        const bEntry = getLayoutFieldEntry(normalizedLayout, [...pathSegments, b.key]);
        const aOrder = fieldOrderKey(aEntry?.field, a.index);
        const bOrder = fieldOrderKey(bEntry?.field, b.index);
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.index - b.index;
      })
      .map((entry) => entry.key);
  }, [normalizedLayout, pathSegments, resolvedSchema.order]);

  const renderField = (key: string) => {
    const rawProperty = resolvedSchema.props[key];
    const property = getProperty(rawProperty);
    const fieldPath = [...pathSegments, key];
    const entry = getLayoutFieldEntry(normalizedLayout, fieldPath);
    const layoutField = entry?.field;
    const pointer = entry?.pointer;
    const fieldScope = pointer ? scopeMap.get(pointer) : inheritedScope;

    if (isNew && key === "id" && pathSegments.length === 0) {
      return null;
    }

    const visible = isFieldVisible(layoutField, mode, {
      rootData: effectiveRootData,
      scopeStack: effectiveScopeStack,
    });
    if (!visible) {
      return null;
    }

    const inScope = matchesCurrentScope(fieldScope);
    const descendantMatch = hasScopedDescendants(fieldPath);
    if (hasScopeFilter && !inScope && !descendantMatch) {
      return null;
    }

    const label = layoutField?.label || property.title || humanize(key);
    const description = property.description;
    const helpText = property.help;
    const required = resolvedSchema.required.includes(key) || isFieldRequired(layoutField, mode);
    const readOnly =
      isFieldReadOnly(layoutField, mode) ||
      (property.readOnly as boolean | undefined) === true ||
      (property.const !== undefined && !property.enum);
    const widget = (layoutField?.widget || "").toUpperCase();
    const value = data?.[key];
    const error = fieldErrors[key];

    const onNestedErrors = (nestedErrors: Record<string, string>) => {
      setFieldErrors((prev) => mergeNestedErrors(prev, key, nestedErrors));
    };

    let input: React.ReactNode;

    if (widget === "DYNAMIC_SCHEMA" && layoutField?.dynamicSchema) {
      return (
        <DynamicSchemaField
          key={toDotPath(fieldPath)}
          fieldKey={key}
          label={label}
          description={description}
          required={required}
          fieldError={error}
          layoutField={layoutField}
          value={isObjectLike(value) ? value : {}}
          onChange={(nextValue) => handleFieldChange(key, nextValue, property, required, label)}
          rootSchema={effectiveRootSchema}
          rootData={effectiveRootData}
          scopeStack={effectiveScopeStack}
          mode={mode}
          isNew={isNew}
          onErrorsChange={onNestedErrors}
        />
      );
    } else if (
      widget === "LOOKUP" &&
      layoutField?.lookup?.assetType &&
      (layoutField.lookup.multiSelect || property.type !== "array")
    ) {
      input = (
        <LookupPicker
          assetType={layoutField.lookup.assetType}
          multiSelect={Boolean(layoutField.lookup.multiSelect)}
          value={value}
          onChange={(nextValue) => handleFieldChange(key, nextValue, property, required, label)}
          disabled={readOnly}
          className={commonInputClass}
          placeholder={`Select ${label}`}
        />
      );
    } else if (property.type === "object" || property.properties || property.$ref) {
      const nestedValue = isObjectLike(value) ? value : {};
      input = (
        <div className="space-y-3 rounded-[var(--radius-sm)] border border-border bg-secondary/10 p-3">
          {layoutField?.presets && layoutField.presets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {layoutField.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
                  onClick={() => {
                    const patch = getPresetPatch(preset);
                    handleFieldChange(
                      key,
                      deepMerge(nestedValue, patch) as Record<string, unknown>,
                      property,
                      required,
                      label,
                    );
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <JsonForm
            schema={property as JsonSchema}
            data={nestedValue}
            onChange={(nextValue) => handleFieldChange(key, nextValue, property, required, label)}
            rootSchema={effectiveRootSchema}
            rootData={effectiveRootData}
            parentData={data}
            layoutFields={normalizedLayout}
            mode={mode}
            scopeStepId={scopeStepId}
            scopeSectionId={scopeSectionId}
            pathSegments={fieldPath}
            inheritedScope={fieldScope || inheritedScope}
            scopeStack={[nestedValue, ...effectiveScopeStack]}
            onErrorsChange={onNestedErrors}
            isNew={isNew}
          />
        </div>
      );
    } else if (property.type === "array" && property.items?.type === "object") {
      const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
      input = (
        <div className="space-y-3 rounded-[var(--radius-sm)] border border-border bg-secondary/10 p-3">
          {items.map((item, index) => {
            const itemValue = isObjectLike(item) ? item : {};
            const itemPath = [...fieldPath, String(index)];
            return (
              <div
                key={`${key}-${index}`}
                className="space-y-3 rounded-[var(--radius-sm)] border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-muted">Item {index + 1}</span>
                  <button
                    type="button"
                    className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[11px] text-muted hover:text-foreground"
                    onClick={() => {
                      const next = [...items];
                      next.splice(index, 1);
                      handleFieldChange(key, next, property, required, label);
                    }}
                    disabled={readOnly}
                  >
                    Remove
                  </button>
                </div>
                <JsonForm
                  schema={property.items as JsonSchema}
                  data={itemValue}
                  onChange={(nextItem) => {
                    const next = [...items];
                    next[index] = nextItem;
                    handleFieldChange(key, next, property, required, label);
                  }}
                  rootSchema={effectiveRootSchema}
                  rootData={effectiveRootData}
                  parentData={data}
                  layoutFields={normalizedLayout}
                  mode={mode}
                  scopeStepId={scopeStepId}
                  scopeSectionId={scopeSectionId}
                  pathSegments={itemPath}
                  inheritedScope={fieldScope || inheritedScope}
                  scopeStack={[itemValue, ...effectiveScopeStack]}
                  onErrorsChange={(nestedErrors) =>
                    setFieldErrors((prev) => mergeNestedErrors(prev, `${key}.${index}`, nestedErrors))
                  }
                  isNew={isNew}
                />
              </div>
            );
          })}
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-[12px] text-muted hover:text-foreground"
            onClick={() => handleFieldChange(key, [...items, {}], property, required, label)}
            disabled={readOnly}
          >
            Add Item
          </button>
        </div>
      );
    } else if (property.type === "array") {
      const items = Array.isArray(value) ? value : [];
      input = (
        <div className="space-y-2">
          {(items as unknown[]).map((item, index) => (
            <div key={`${key}-${index}`} className="flex items-center gap-2">
              <input
                className={commonInputClass}
                value={String(item ?? "")}
                onChange={(event) => {
                  const next = [...(items as unknown[])];
                  next[index] = event.currentTarget.value;
                  handleFieldChange(key, next, property, required, label);
                }}
                disabled={readOnly}
              />
              <button
                type="button"
                className="rounded-[var(--radius-sm)] border border-border px-2 py-1 text-[11px] text-muted hover:text-foreground"
                onClick={() => {
                  const next = [...(items as unknown[])];
                  next.splice(index, 1);
                  handleFieldChange(key, next, property, required, label);
                }}
                disabled={readOnly}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-[12px] text-muted hover:text-foreground"
            onClick={() => handleFieldChange(key, [...(items as unknown[]), ""], property, required, label)}
            disabled={readOnly}
          >
            Add Value
          </button>
        </div>
      );
    } else if (widget === "SWITCH" || property.type === "boolean") {
      input = (
        <label className="flex items-center gap-2 text-[14px] text-foreground">
          <input
            type="checkbox"
            checked={Boolean(value ?? property.default ?? false)}
            onChange={(event) =>
              handleFieldChange(key, event.currentTarget.checked, property, required, label)
            }
            disabled={readOnly}
          />
          <span>{description || label}</span>
        </label>
      );
    } else if (widget === "SELECT" || Array.isArray(property.enum) || Array.isArray(layoutField?.options)) {
      const options = (layoutField?.options || property.enum || []).map((option) => String(option));
      input = (
        <select
          className={commonInputClass}
          value={typeof value === "string" ? value : ""}
          disabled={readOnly}
          onChange={(event) =>
            handleFieldChange(key, event.currentTarget.value || undefined, property, required, label)
          }
        >
          <option value="">{helpText || `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (widget === "NUMBER" || property.type === "number" || property.type === "integer") {
      const isInteger = layoutField?.numberType === "integer" || property.type === "integer";
      input = (
        <input
          type="number"
          step={isInteger ? "1" : "0.01"}
          min={property.minimum}
          max={property.maximum}
          className={commonInputClass}
          value={typeof value === "number" ? value : ""}
          placeholder={helpText || description || label}
          disabled={readOnly}
          onChange={(event) => {
            if (!event.currentTarget.value) {
              handleFieldChange(key, undefined, property, required, label);
              return;
            }
            const parsed = isInteger
              ? parseInt(event.currentTarget.value, 10)
              : parseFloat(event.currentTarget.value);
            handleFieldChange(key, Number.isFinite(parsed) ? parsed : undefined, property, required, label);
          }}
        />
      );
    } else if (widget === "TEXTAREA" || layoutField?.multiline) {
      input = (
        <textarea
          className={`${commonInputClass} min-h-[100px]`}
          rows={typeof layoutField?.rows === "number" ? layoutField.rows : 4}
          value={typeof value === "string" ? value : ""}
          placeholder={helpText || description || `Enter ${label}`}
          disabled={readOnly}
          onChange={(event) => handleFieldChange(key, event.currentTarget.value, property, required, label)}
        />
      );
    } else if (property.const !== undefined && !property.enum) {
      input = <div className={`${commonInputClass} opacity-70`}>{String(property.const)}</div>;
    } else {
      const inputType =
        property.format === "password" || layoutField?.sensitive || key.toLowerCase().includes("key")
          ? "password"
          : "text";
      input = (
        <input
          type={inputType}
          className={commonInputClass}
          value={typeof value === "string" ? value : ""}
          placeholder={helpText || description || `Enter ${label}`}
          disabled={readOnly}
          onChange={(event) => handleFieldChange(key, event.currentTarget.value, property, required, label)}
        />
      );
    }

    return (
      <div
        key={toDotPath(fieldPath)}
        className="group space-y-1.5 rounded-[var(--radius-md)] border border-transparent bg-surface/45 p-2.5 transition-colors focus-within:border-primary/35 focus-within:bg-primary/[0.04]"
      >
        {(widget !== "SWITCH" && property.type !== "boolean") && (
          <div className="px-0.5">
            <label className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              {label}
              {required && <span className="ml-1 text-primary">*</span>}
            </label>
            {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
          </div>
        )}
        {input}
        {error && <p className="text-[11px] text-red">{error}</p>}
      </div>
    );
  };

  const renderedFields = sortedKeys.map((key) => renderField(key)).filter(Boolean);

  if (renderedFields.length === 0) {
    return null;
  }

  return <div className={`grid grid-cols-1 gap-5 ${className}`}>{renderedFields}</div>;
}
