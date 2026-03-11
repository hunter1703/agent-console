export type BuilderMode = "create" | "edit" | "view";

export type UiAccessLevel = "HIDDEN" | "READ_ONLY" | "EDITABLE" | "REQUIRED";

export interface LayoutAccessPolicy {
  create?: UiAccessLevel;
  edit?: UiAccessLevel;
  view?: UiAccessLevel;
}

export interface LayoutFieldRule {
  effect?: string;
  expr?: unknown;
}

export interface LayoutLookup {
  assetType?: string;
  multiSelect?: boolean;
}

export interface LayoutDynamicSchema {
  url?: string;
  method?: string;
  body?: Record<string, unknown>;
}

export interface BuilderPreset {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
  patch?: Record<string, unknown>;
  preset?: Record<string, unknown>;
}

export interface LayoutField {
  label?: string;
  widget?: string;
  step?: string;
  section?: string;
  order?: number;
  access?: LayoutAccessPolicy;
  currentAccess?: UiAccessLevel;
  collection?: boolean;
  multiline?: boolean;
  rows?: number;
  numberType?: "integer" | "decimal" | string;
  advanced?: boolean;
  options?: Array<string | number | boolean>;
  rules?: LayoutFieldRule[];
  lookup?: LayoutLookup;
  presets?: BuilderPreset[];
  dynamicSchema?: LayoutDynamicSchema;
  sensitive?: boolean;
}

export interface BuilderValidationRule {
  id: string;
  type: "lt" | "lte" | "gt" | "gte" | "eq" | "neq" | "required_if";
  message: string;
  left?: string;
  right?: string;
  target?: string;
  conditionPath?: string;
  conditionEquals?: unknown;
}

export interface BuilderActions {
  saveLabel?: string;
  cancelLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  unsavedChangesWarning?: string;
}

export interface BuilderLayout {
  fields?: Record<string, LayoutField>;
  presets?: BuilderPreset[];
  validations?: BuilderValidationRule[];
  actions?: BuilderActions;
  [key: string]: unknown;
}

export interface BuilderSection {
  id: string;
  title: string;
  stepId: string;
  stepTitle: string;
  order: number;
}

export interface BuilderStep {
  id: string;
  title: string;
  order: number;
  sections: BuilderSection[];
}

export interface LayoutNavigation {
  steps: BuilderStep[];
}

interface ScopedValue {
  step: string;
  section: string;
}

interface JsonLogicContext {
  rootData: Record<string, unknown>;
  scopeStack: Array<Record<string, unknown> | undefined>;
}

const DEFAULT_LATE_ORDER = Number.MAX_SAFE_INTEGER;

const ACCESS_LEVELS = new Set<UiAccessLevel>(["HIDDEN", "READ_ONLY", "EDITABLE", "REQUIRED"]);

export function normalizeLayout(rawLayout: unknown): BuilderLayout {
  if (!rawLayout || typeof rawLayout !== "object") {
    return {};
  }
  const asLayout = rawLayout as BuilderLayout;
  if (asLayout.fields && typeof asLayout.fields === "object") {
    return asLayout;
  }
  return {
    fields: asLayout as Record<string, LayoutField>,
  };
}

export function getByPath(obj: unknown, path?: string): unknown {
  if (!path) {
    return obj;
  }
  if (path.startsWith("/")) {
    return resolvePointerValue(obj, path);
  }
  return path
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]), obj);
}

export function setByPath(
  source: Record<string, unknown>,
  path: string | undefined,
  value: unknown,
): Record<string, unknown> {
  if (!path) {
    return (value ?? {}) as Record<string, unknown>;
  }
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) {
    return (value ?? {}) as Record<string, unknown>;
  }
  const root = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor: Record<string, unknown> = root as Record<string, unknown>;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const part = segments[i];
    const current = cursor[part];
    cursor[part] = Array.isArray(current) ? [...current] : { ...(current || {}) };
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
  return root as Record<string, unknown>;
}

export function deepMerge(target: unknown, patch: unknown): unknown {
  if (patch == null) {
    return target;
  }
  if (Array.isArray(patch)) {
    return [...patch];
  }
  if (typeof patch !== "object") {
    return patch;
  }
  const base =
    target && typeof target === "object" && !Array.isArray(target)
      ? { ...(target as Record<string, unknown>) }
      : {};
  Object.entries(patch as Record<string, unknown>).forEach(([key, value]) => {
    base[key] = deepMerge(base[key], value);
  });
  return base;
}

export function getPresetPatch(preset?: BuilderPreset): Record<string, unknown> {
  if (!preset) {
    return {};
  }
  const patch = preset.patch ?? preset.preset;
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return {};
  }
  return patch;
}

export function parseJsonPointer(pointer: string): string[] {
  if (!pointer || pointer === "/" || pointer === "#") {
    return [];
  }
  const normalized = pointer.startsWith("#/") ? pointer.slice(2) : pointer.slice(1);
  if (!normalized) {
    return [];
  }
  return normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
}

export function toJsonPointer(segments: string[]): string {
  if (!segments.length) {
    return "/";
  }
  return `/${segments
    .map((segment) => segment.replace(/~/g, "~0").replace(/\//g, "~1"))
    .join("/")}`;
}

export function toDotPath(segments: string[]): string {
  return segments.join(".");
}

export function resolveJsonPointer(root: unknown, pointer?: string): unknown {
  if (!pointer || pointer === "#") {
    return root;
  }
  if (!pointer.startsWith("#/")) {
    return undefined;
  }
  const path = parseJsonPointer(pointer);
  return path.reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
    root,
  );
}

export function resolvePointerValue(root: unknown, pointer: string): unknown {
  const path = parseJsonPointer(pointer.startsWith("/") ? pointer : `/${pointer}`);
  return path.reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
    root,
  );
}

export function getLayoutField(
  layoutFields: Record<string, LayoutField> | undefined,
  pathSegments: string[],
): LayoutField | undefined {
  return getLayoutFieldEntry(layoutFields, pathSegments)?.field;
}

export function getLayoutFieldEntry(
  layoutFields: Record<string, LayoutField> | undefined,
  pathSegments: string[],
): { pointer: string; field: LayoutField } | undefined {
  if (!layoutFields) {
    return undefined;
  }
  const exactPointer = toJsonPointer(pathSegments);
  const exact = layoutFields[exactPointer];
  if (exact) {
    return { pointer: exactPointer, field: exact };
  }
  const wildcardPointer = toJsonPointer(pathSegments.map((seg) => (isArrayIndex(seg) ? "*" : seg)));
  const wildcard = layoutFields[wildcardPointer];
  if (wildcard) {
    return { pointer: wildcardPointer, field: wildcard };
  }
  return undefined;
}

export function getEffectiveAccess(field: LayoutField | undefined, mode: BuilderMode): UiAccessLevel {
  const current = normalizeAccess(field?.currentAccess);
  if (current) {
    return current;
  }
  const modeAccess = normalizeAccess(field?.access?.[mode]);
  if (modeAccess) {
    return modeAccess;
  }
  return "EDITABLE";
}

export function isFieldReadOnly(field: LayoutField | undefined, mode: BuilderMode): boolean {
  const access = getEffectiveAccess(field, mode);
  return mode === "view" || access === "READ_ONLY" || access === "HIDDEN";
}

export function isFieldRequired(field: LayoutField | undefined, mode: BuilderMode): boolean {
  return getEffectiveAccess(field, mode) === "REQUIRED";
}

export function isFieldVisible(
  field: LayoutField | undefined,
  mode: BuilderMode,
  context: JsonLogicContext,
): boolean {
  if (getEffectiveAccess(field, mode) === "HIDDEN") {
    return false;
  }
  if (!field?.rules?.length) {
    return true;
  }
  const visibleRules = field.rules.filter((rule) => (rule.effect || "").toUpperCase() === "VISIBLE");
  if (!visibleRules.length) {
    return true;
  }
  return visibleRules.every((rule) => truthy(evaluateJsonLogic(rule.expr, context)));
}

export function evaluateLayoutValidations(
  data: Record<string, unknown>,
  rules: BuilderValidationRule[] | undefined,
): Record<string, string> {
  if (!rules?.length) {
    return {};
  }
  const errors: Record<string, string> = {};
  rules.forEach((rule) => {
    const conditionMatches =
      rule.conditionPath == null
        ? true
        : getByPath(data, rule.conditionPath) === rule.conditionEquals;
    if (!conditionMatches) {
      return;
    }

    if (rule.type === "required_if" && rule.target) {
      const targetValue = getByPath(data, rule.target);
      if (targetValue == null || targetValue === "") {
        errors[rule.id] = rule.message;
      }
      return;
    }

    const left = rule.left ? getByPath(data, rule.left) : undefined;
    const right = rule.right ? getByPath(data, rule.right) : undefined;
    if (left == null || right == null || left === "" || right === "") {
      return;
    }

    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const isNumeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
    const lhs = isNumeric ? leftNumber : left;
    const rhs = isNumeric ? rightNumber : right;

    const failed =
      (rule.type === "lt" && !(lhs < rhs)) ||
      (rule.type === "lte" && !(lhs <= rhs)) ||
      (rule.type === "gt" && !(lhs > rhs)) ||
      (rule.type === "gte" && !(lhs >= rhs)) ||
      (rule.type === "eq" && lhs !== rhs) ||
      (rule.type === "neq" && lhs === rhs);
    if (failed) {
      errors[rule.id] = rule.message;
    }
  });
  return errors;
}

export function deriveLayoutNavigation(
  layoutFields: Record<string, LayoutField> | undefined,
): LayoutNavigation {
  if (!layoutFields) {
    return { steps: [] };
  }
  const stepMap = new Map<
    string,
    {
      id: string;
      title: string;
      order: number;
      seenAt: number;
      sections: Map<string, BuilderSection & { seenAt: number }>;
    }
  >();

  Object.entries(layoutFields).forEach(([pointer, field], index) => {
    const { step, section } = resolveScopedValue(layoutFields, pointer, field);
    if (!step || !section) {
      return;
    }
    const order = typeof field.order === "number" ? field.order : DEFAULT_LATE_ORDER;
    if (!stepMap.has(step)) {
      stepMap.set(step, {
        id: step,
        title: humanizeIdentifier(step),
        order,
        seenAt: index,
        sections: new Map(),
      });
    }
    const stepEntry = stepMap.get(step)!;
    if (order < stepEntry.order) {
      stepEntry.order = order;
    }

    if (!stepEntry.sections.has(section)) {
      stepEntry.sections.set(section, {
        id: section,
        title: humanizeIdentifier(section),
        stepId: step,
        stepTitle: stepEntry.title,
        order,
        seenAt: index,
      });
    }
    const sectionEntry = stepEntry.sections.get(section)!;
    if (order < sectionEntry.order) {
      sectionEntry.order = order;
    }
  });

  const steps: BuilderStep[] = Array.from(stepMap.values())
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.seenAt - b.seenAt;
    })
    .map((stepEntry) => ({
      id: stepEntry.id,
      title: stepEntry.title,
      order: stepEntry.order,
      sections: Array.from(stepEntry.sections.values())
        .sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.seenAt - b.seenAt;
        })
        .map((sectionEntry) => ({
          id: sectionEntry.id,
          title: sectionEntry.title,
          stepId: sectionEntry.stepId,
          stepTitle: sectionEntry.stepTitle,
          order: sectionEntry.order,
        })),
    }));

  return { steps };
}

export function getFieldScope(
  layoutFields: Record<string, LayoutField> | undefined,
  pointer: string,
): { step?: string; section?: string } {
  if (!layoutFields) {
    return {};
  }
  const field = layoutFields[pointer];
  if (!field) {
    return {};
  }
  const scoped = resolveScopedValue(layoutFields, pointer, field);
  return {
    step: scoped.step,
    section: scoped.section,
  };
}

export function hasScopeFields(
  layoutFields: Record<string, LayoutField> | undefined,
  stepId: string,
  sectionId: string,
): boolean {
  if (!layoutFields) {
    return false;
  }
  return Object.entries(layoutFields).some(([pointer, field]) => {
    const scope = resolveScopedValue(layoutFields, pointer, field);
    return scope.step === stepId && scope.section === sectionId;
  });
}

export function filterObjectSchema(
  schema: Record<string, unknown> | undefined,
  fields?: string[],
): Record<string, unknown> | undefined {
  if (!schema || !fields || fields.length === 0) {
    return schema;
  }
  const properties = (schema.properties || {}) as Record<string, unknown>;
  const filteredProperties: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (properties[field] !== undefined) {
      filteredProperties[field] = properties[field];
    }
  });
  const required = Array.isArray(schema.required)
    ? schema.required.filter((item: string) => fields.includes(item))
    : undefined;
  return {
    ...schema,
    properties: filteredProperties,
    required,
  };
}

function resolveScopedValue(
  layoutFields: Record<string, LayoutField>,
  pointer: string,
  field: LayoutField,
): ScopedValue {
  const inheritedStep = findInheritedScopeValue(layoutFields, pointer, "step");
  const ownStep = normalizeScopeToken(field.step);
  const resolvedStep = ownStep && ownStep !== "general" ? ownStep : inheritedStep || ownStep || "general";

  const inheritedSection = findInheritedScopeValue(layoutFields, pointer, "section");
  const ownSection = normalizeScopeToken(field.section);
  const resolvedSection =
    ownSection && ownSection !== "general" ? ownSection : inheritedSection || ownSection || resolvedStep;

  return {
    step: resolvedStep,
    section: resolvedSection,
  };
}

function findInheritedScopeValue(
  layoutFields: Record<string, LayoutField>,
  pointer: string,
  key: "step" | "section",
): string | undefined {
  const segments = parseJsonPointer(pointer);
  for (let len = segments.length - 1; len >= 1; len -= 1) {
    const ancestor = segments.slice(0, len);
    const candidate =
      layoutFields[toJsonPointer(ancestor)] ||
      layoutFields[toJsonPointer(ancestor.map((segment) => (isArrayIndex(segment) ? "*" : segment)))];
    const value = normalizeScopeToken(candidate?.[key]);
    if (value && value !== "general") {
      return value;
    }
  }
  return undefined;
}

function normalizeScopeToken(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.toLowerCase();
}

function normalizeAccess(value: unknown): UiAccessLevel | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toUpperCase() as UiAccessLevel;
  return ACCESS_LEVELS.has(normalized) ? normalized : undefined;
}

function evaluateJsonLogic(expression: unknown, context: JsonLogicContext): unknown {
  if (Array.isArray(expression)) {
    return expression.map((entry) => evaluateJsonLogic(entry, context));
  }
  if (expression == null || typeof expression !== "object") {
    return expression;
  }

  const entries = Object.entries(expression as Record<string, unknown>);
  if (entries.length !== 1) {
    const output: Record<string, unknown> = {};
    entries.forEach(([key, value]) => {
      output[key] = evaluateJsonLogic(value, context);
    });
    return output;
  }

  const [operator, rawArg] = entries[0];
  const args = Array.isArray(rawArg) ? rawArg : [rawArg];

  switch (operator) {
    case "var": {
      const evaluatedArgs = args.map((arg) => evaluateJsonLogic(arg, context));
      const variable = typeof evaluatedArgs[0] === "string" ? evaluatedArgs[0] : "";
      const fallback = evaluatedArgs[1];
      const resolved = resolveRuleVariable(variable, context);
      return resolved === undefined ? fallback : resolved;
    }
    case "!":
      return !truthy(evaluateJsonLogic(rawArg, context));
    case "and":
      return args.every((arg) => truthy(evaluateJsonLogic(arg, context)));
    case "or":
      return args.some((arg) => truthy(evaluateJsonLogic(arg, context)));
    case "===":
      return evaluateJsonLogic(args[0], context) === evaluateJsonLogic(args[1], context);
    case "!==":
      return evaluateJsonLogic(args[0], context) !== evaluateJsonLogic(args[1], context);
    case ">":
      return compareValues(evaluateJsonLogic(args[0], context), evaluateJsonLogic(args[1], context), ">");
    case ">=":
      return compareValues(evaluateJsonLogic(args[0], context), evaluateJsonLogic(args[1], context), ">=");
    case "<":
      return compareValues(evaluateJsonLogic(args[0], context), evaluateJsonLogic(args[1], context), "<");
    case "<=":
      return compareValues(evaluateJsonLogic(args[0], context), evaluateJsonLogic(args[1], context), "<=");
    case "in": {
      const needle = evaluateJsonLogic(args[0], context);
      const haystack = evaluateJsonLogic(args[1], context);
      if (Array.isArray(haystack)) {
        return haystack.includes(needle as never);
      }
      if (typeof haystack === "string") {
        return haystack.includes(String(needle ?? ""));
      }
      return false;
    }
    default:
      return expression;
  }
}

function resolveRuleVariable(path: string, context: JsonLogicContext): unknown {
  if (!path) {
    return context.scopeStack[0];
  }
  if (path.startsWith("$.")) {
    return getByPath(context.rootData, path.slice(2));
  }
  const normalizedPath = path.startsWith("/") ? path : path.replace(/^\$item\./, "");
  for (const scope of context.scopeStack) {
    const value = getByPath(scope, normalizedPath);
    if (value !== undefined) {
      return value;
    }
  }
  return getByPath(context.rootData, normalizedPath);
}

function humanizeIdentifier(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function isArrayIndex(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function truthy(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Boolean(value);
}

function compareValues(
  left: unknown,
  right: unknown,
  operator: ">" | ">=" | "<" | "<=",
): boolean {
  if (typeof left === "number" && typeof right === "number") {
    if (operator === ">") {
      return left > right;
    }
    if (operator === ">=") {
      return left >= right;
    }
    if (operator === "<") {
      return left < right;
    }
    return left <= right;
  }
  if (typeof left === "string" && typeof right === "string") {
    if (operator === ">") {
      return left > right;
    }
    if (operator === ">=") {
      return left >= right;
    }
    if (operator === "<") {
      return left < right;
    }
    return left <= right;
  }
  return false;
}
