"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface JsonSchemaProperty {
    type?: string;
    title?: string;
    description?: string;
    help?: string;
    default?: any;
    enum?: any[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    items?: JsonSchemaProperty;
    properties?: { [key: string]: JsonSchemaProperty };
    required?: string[];
    $ref?: string;
    allOf?: any[];
    oneOf?: any[];
    [key: string]: any;
}

interface JsonSchema extends JsonSchemaProperty {
    $defs?: { [key: string]: JsonSchemaProperty };
    definitions?: { [key: string]: JsonSchemaProperty };
}

interface JsonFormProps {
    schema: JsonSchema;
    data: any;
    onChange: (data: any) => void;
    className?: string;
    rootSchema?: JsonSchema; // Optional, defaults to schema
    isNew?: boolean;
    layout?: any;
    onErrorsChange?: (errors: { [key: string]: string }) => void;
    rootData?: any;
    parentData?: any; // Context for one level up
}

interface LookupFieldProps {
    value: any;
    onChange: (value: any) => void;
    layout: any;
    className: string;
    label: string;
    disabled?: boolean;
    helpText?: string;
    localData?: any;
    parentData?: any;
    rootData?: any;
}

function getNestedValue(obj: any, path: string): any {
    if (!path) return obj;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
}

function resolveVariables(obj: any, contexts: { local: any, parent: any, root: any }): any {
    if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string' && obj.startsWith('$')) {
            if (obj.startsWith('$^.')) {
                return getNestedValue(contexts.parent, obj.substring(3));
            } else if (obj.startsWith('$.')) {
                return getNestedValue(contexts.root, obj.substring(2));
            } else {
                return getNestedValue(contexts.local, obj.substring(1));
            }
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => resolveVariables(item, contexts));
    }

    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
        resolved[key] = resolveVariables(value, contexts);
    }
    return resolved;
}

function LookupField({ value, onChange, layout, className, label, disabled, helpText, localData, parentData, rootData }: LookupFieldProps) {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [fetchingMore, setFetchingMore] = useState(false);
    const limit = 50;

    // Stringify dependencies to use in useEffect
    const resolvedBody = useMemo(() => resolveVariables(layout.lookupRequest?.body || {}, {
        local: localData || {},
        parent: parentData || {},
        root: rootData || {}
    }), [layout.lookupRequest?.body, localData, parentData, rootData]);
    const resolvedBodyStr = JSON.stringify(resolvedBody);

    const fetchPage = useCallback(async (currentCursor: string | null, signal?: AbortSignal) => {
        const req = layout.lookupRequest;
        if (!req) return;

        const isInitial = !currentCursor;
        if (isInitial) setLoading(true);
        else setFetchingMore(true);

        try {
            const url = req.url.startsWith('http') ? req.url : `/api/v1${req.url.startsWith('/') ? '' : '/'}${req.url}`;

            const body = {
                ...resolvedBody,
                query: {
                    ...(resolvedBody.query || {}),
                    page: {
                        ...(currentCursor ? { cursor: currentCursor } : {}),
                        limit
                    }
                }
            };

            const response = await fetch(url, {
                method: req.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal
            });

            if (response.ok) {
                const data = await response.json();
                const items = Array.isArray(data) ? data : (data.items || []);
                const more = data.hasMore ?? false;

                if (isInitial) {
                    setOptions(items);
                } else {
                    setOptions(prev => [...prev, ...items]);
                }
                setHasMore(more);
                if (data.nextCursor) setCursor(data.nextCursor);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error("Lookup failed:", error);
        } finally {
            if (isInitial) setLoading(false);
            else setFetchingMore(false);
        }
    }, [layout.lookupRequest, resolvedBodyStr]); // Use stringified body as dependency

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const controller = new AbortController();
        fetchPage(null, controller.signal);
        setCursor(null);
        return () => controller.abort();
    }, [fetchPage, resolvedBodyStr]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Trigger if close to bottom
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (!loading && !fetchingMore && hasMore) {
                fetchPage(cursor);
            }
        }
    };

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                className={`${className} flex justify-between items-center text-left min-h-[48px] group px-4 rounded-2xl bg-secondary/30 border border-border hover:border-border/80 transition-all duration-300`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <div className="flex flex-col">
                    <span className={!value ? "text-muted-foreground/50 text-[15px] italic" : "text-foreground/90 font-medium text-[15px] tracking-tight"}>
                        {selectedOption?.name || value || helpText || `-- Select ${label} --`}
                    </span>
                </div>
                <div className={`transition-all duration-500 transform ${isOpen ? "rotate-90 text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto bg-background/95 border border-border rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 overscroll-contain"
                    onScroll={handleScroll}
                >
                    <div className="p-2 flex flex-col gap-1">
                        {options.length === 0 && !loading && (
                            <div className="p-4 text-center text-xs text-muted-foreground italic">No results found</div>
                        )}

                        {options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`px-4 py-3 text-sm cursor-pointer rounded-xl transition-all duration-200 flex flex-col gap-0.5 ${value === opt.id
                                    ? "bg-primary/20 border border-primary/20 text-foreground font-semibold"
                                    : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                                    }`}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="truncate">{opt.name || opt.id}</span>
                                {opt.name && opt.id !== opt.name && (
                                    <span className="text-[10px] opacity-50 font-mono tracking-tighter uppercase">{opt.id}</span>
                                )}
                            </div>
                        ))}

                        {(loading || fetchingMore) && (
                            <div className="p-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span>{fetchingMore ? "Loading more..." : "Initial load..."}</span>
                            </div>
                        )}

                        {hasMore && !fetchingMore && !loading && (
                            <div className="h-4 w-full" /> /* Trigger space */
                        )}

                        {!hasMore && options.length > 0 && (
                            <div className="p-3 text-center text-[9px] text-muted-foreground uppercase tracking-widest opacity-30 mt-1">
                                End of list
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SchemaLookupField({ value, onChange, layout, contextData, rootSchema, isNew, onErrorsChange, rootData, parentData, label, description }: any) {
    const [schema, setSchema] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const resolvedBody = useMemo(() => resolveVariables(layout.lookupRequest?.body || {}, contextData || {}), [layout.lookupRequest?.body, contextData]);
    const resolvedBodyStr = JSON.stringify(resolvedBody);

    useEffect(() => {
        const controller = new AbortController();

        const fetchSchemaData = async () => {
            const req = layout.lookupRequest;
            if (!req) return;

            // With generic layout dependencies, we trust that if this component is mounted,
            // its required dependencies are already satisfied.

            setLoading(true);
            try {
                const url = req.url.startsWith('http') ? req.url : `/api/v1${req.url.startsWith('/') ? '' : '/'}${req.url}`;

                const response = await fetch(url, {
                    method: req.method || 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resolvedBody),
                    signal: controller.signal
                });

                if (response.ok) {
                    const data = await response.json();
                    setSchema(data.schema || data);
                } else {
                    setSchema(null);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Schema lookup failed:", error);
                setSchema(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemaData();
        
        return () => controller.abort();
    }, [resolvedBodyStr, layout.lookupRequest]);

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center gap-3 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-xs text-muted-foreground font-medium animate-pulse">Loading dynamic configuration...</span>
            </div>
        );
    }

    if (!schema || (Object.keys(schema).length === 0 && (!schema.type || schema.type === 'object'))) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 p-6 rounded-[32px] bg-secondary/10 border border-border/50 mt-2">
            <div className="flex flex-col gap-1 px-2">
                <h5 className="text-[11px] font-bold text-foreground tracking-[0.05em]">{label}</h5>
                {description && <p className="text-[11px] text-muted-foreground/60">{description}</p>}
            </div>
            <JsonForm
                schema={schema}
                data={value || {}}
                onChange={onChange}
                rootSchema={rootSchema}
                rootData={rootData}
                parentData={parentData}
                isNew={isNew}
                onErrorsChange={onErrorsChange}
            />
        </div>
    );
}

export default function JsonForm({ schema, data, onChange, className = "", rootSchema, isNew, layout, onErrorsChange, rootData, parentData }: JsonFormProps) {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const lastReportedErrors = useRef<string>("");
    
    const effectiveRootData = rootData || data;

    useEffect(() => {
        const errorsStr = JSON.stringify(fieldErrors);
        if (onErrorsChange && lastReportedErrors.current !== errorsStr) {
            lastReportedErrors.current = errorsStr;
            onErrorsChange(fieldErrors);
        }
    }, [fieldErrors, onErrorsChange]);

    const effectiveRootSchema = rootSchema || schema;

    const validateField = useCallback((key: string, value: any, property: JsonSchemaProperty): string | null => {
        const isValidationRequired = schema.required?.includes(key);

        if (isValidationRequired && (value === undefined || value === null || value === "")) {
            return `${property.title || key} is required`;
        }

        if (value === undefined || value === null || value === "") {
            return null;
        }

        if (property.type === 'integer' || property.type === 'number') {
            if (property.minimum !== undefined && value < property.minimum) {
                return `${property.title || key} must be at least ${property.minimum}`;
            }
            if (property.maximum !== undefined && value > property.maximum) {
                return `${property.title || key} must be at most ${property.maximum}`;
            }
        }

        if (property.type === 'string') {
            if (property.minLength !== undefined && value.length < property.minLength) {
                return `${property.title || key} must be at least ${property.minLength} characters`;
            }
            if (property.maxLength !== undefined && value.length > property.maxLength) {
                return `${property.title || key} must be at most ${property.maxLength} characters`;
            }
            if (property.pattern) {
                const regex = new RegExp(property.pattern);
                if (!regex.test(value)) {
                    return `${property.title || key} format is invalid`;
                }
            }
        }

        return null;
    }, [schema.required]);

    const resolveRef = useCallback((ref: string): JsonSchemaProperty | null => {
        if (!ref.startsWith('#/')) return null;
        const parts = ref.split('/').slice(1);
        let current: any = effectiveRootSchema;
        for (const part of parts) {
            if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return null;
            }
        }
        return current;
    }, [effectiveRootSchema]);

    const getProperty = useCallback((prop: JsonSchemaProperty): JsonSchemaProperty => {
        if (prop.$ref) {
            const resolved = resolveRef(prop.$ref);
            if (resolved) {
                // Deep merge resolved with original to preserve metadata
                return {
                    ...resolved,
                    ...prop,
                    properties: resolved.properties || prop.properties ? { ...(resolved.properties || {}), ...(prop.properties || {}) } : undefined,
                    required: Array.from(new Set([...(resolved.required || []), ...(prop.required || [])]))
                };
            }
        }
        return prop;
    }, [resolveRef]);

    const mergeProps = useCallback((base: { [key: string]: JsonSchemaProperty }, extension: { [key: string]: JsonSchemaProperty }, orderTracker: string[]) => {
        const result = { ...base };
        Object.entries(extension).forEach(([key, prop]) => {
            if (result[key]) {
                // Merge individual property metadata (like enum and const)
                result[key] = { ...result[key], ...prop };
            } else {
                result[key] = prop;
                orderTracker.push(key); // Track new keys
            }
        });
        return result;
    }, []);

    const evaluateSchema = useCallback((currentSchema: JsonSchema, currentData: any): { props: { [key: string]: JsonSchemaProperty }, order: string[], required: string[] } => {
        // Resolve root schema if it's a ref
        let resolvedSchema = currentSchema;
        if (currentSchema.$ref) {
            const resolved = resolveRef(currentSchema.$ref);
            if (resolved) {
                resolvedSchema = { ...resolved, ...currentSchema };
            }
        }

        const baseProps = resolvedSchema.properties || {};

        // Track order explicitly
        const orderedKeys: string[] = [];
        
        // Track required explicitly
        const requiredKeys = new Set<string>(resolvedSchema.required || []);

        // Identify all properties that appear in any 'then' block
        // We will consider these "conditional" and hide them from the base list
        const conditionalKeys = new Set<string>();
        if (currentSchema.allOf) {
            currentSchema.allOf.forEach(branch => {
                if (branch.then) {
                    const thenProps = branch.then.properties || (branch.then.$ref ? resolveRef(branch.then.$ref)?.properties : null);
                    if (thenProps) {
                        Object.keys(thenProps).forEach(key => conditionalKeys.add(key));
                    }
                }
            });
        }

        // Start with base properties, filtering out the conditional ones
        let resolvedProps: { [key: string]: JsonSchemaProperty } = {};
        Object.entries(baseProps).forEach(([key, prop]) => {
            if (!conditionalKeys.has(key)) {
                resolvedProps[key] = prop;
                orderedKeys.push(key);
            }
        });

        // Handle oneOf with discriminator
        if (resolvedSchema.oneOf && resolvedSchema.discriminator) {
            const propName = resolvedSchema.discriminator.propertyName;
            const value = currentData?.[propName];
            if (value) {
                const branch = resolvedSchema.oneOf.find(s => {
                    const resolved = s.$ref ? resolveRef(s.$ref) : s;
                    if (resolved?.properties?.[propName]?.const === value) return true;
                    if (resolved?.properties?.[propName]?.enum?.includes(value)) return true;
                    return false;
                });

                if (branch) {
                    const resolvedBranch = branch.$ref ? resolveRef(branch.$ref) : branch;
                    if (resolvedBranch?.properties) {
                        resolvedProps = mergeProps(resolvedProps, resolvedBranch.properties, orderedKeys);
                    }
                    if (resolvedBranch?.required) {
                        resolvedBranch.required.forEach((k: string) => requiredKeys.add(k));
                    }
                }
            }
        }

        // Handle allOf/if/then logic
        if (resolvedSchema.allOf) {
            resolvedSchema.allOf.forEach((branch) => {
                // Static merges (no if/then)
                const innerProps = branch.properties || (branch.$ref ? resolveRef(branch.$ref)?.properties : null);
                if (innerProps && !branch.if) {
                    resolvedProps = mergeProps(resolvedProps, innerProps, orderedKeys);
                    if (branch.required) branch.required.forEach((k: string) => requiredKeys.add(k));
                }

                if (!branch.if || !branch.if.properties) return;

                const ifProps = branch.if.properties;
                const isMatch = Object.entries(ifProps).every(([key, condition]) => {
                    const val = currentData?.[key];
                    // Support basic const check
                    if ((condition as any).const !== undefined) {
                        return val === (condition as any).const;
                    }
                    // Support enum check
                    if ((condition as any).enum !== undefined) {
                        return (condition as any).enum.includes(val);
                    }
                    return false;
                });

                if (isMatch && branch.then) {
                    const thenProps = branch.then.properties || (branch.then.$ref ? resolveRef(branch.then.$ref)?.properties : null);
                    if (thenProps) {
                        resolvedProps = mergeProps(resolvedProps, thenProps, orderedKeys);
                    }
                    if (branch.then.required) {
                        branch.then.required.forEach((k: string) => requiredKeys.add(k));
                    }
                }
            });
        }

        return { props: resolvedProps, order: orderedKeys, required: Array.from(requiredKeys) };
    }, [resolveRef, mergeProps]);

    const activeSchemaData = useMemo(() => {
        return evaluateSchema(schema, data);
    }, [schema, data, evaluateSchema]);

    const handleFieldChange = (key: string, value: any, property: JsonSchemaProperty) => {
        const error = validateField(key, value, property);
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (error) newErrors[key] = error;
            else delete newErrors[key];
            return newErrors;
        });
        onChange({ ...data, [key]: value });
    };

    const renderField = (key: string, rawProperty: JsonSchemaProperty, value: any) => {
        const isThisFieldRequired = activeSchemaData.required.includes(key);
        // Special case for 'id' field: hide it if it's new (server-generated)
        if (key === 'id' && isNew) {
            return null;
        }

        const property = getProperty(rawProperty);
        const label = property.title || key;
        const description = property.description;
        const helpText = property.help;
        // Only read-only if it's a const AND doesn't have an enum (which means it's a discriminator or toggle)
        const isReadOnly = (key === 'id' && !isNew) || !!property.readOnly || (property.const !== undefined && !property.enum);

        const fieldLayout = layout?.[key];
        const widget = fieldLayout?.widget;

        // Process generic dependencies
        if (fieldLayout?.dependencies) {
            const deps = Array.isArray(fieldLayout.dependencies) ? fieldLayout.dependencies : [fieldLayout.dependencies];
            const allDepsSatisfied = deps.every((dep: any) => {
                if (typeof dep === 'string' && dep.startsWith('$')) {
                    let val;
                    if (dep.startsWith('$^.')) val = getNestedValue(parentData, dep.substring(3));
                    else if (dep.startsWith('$.')) val = getNestedValue(effectiveRootData, dep.substring(2));
                    else val = getNestedValue(data, dep.substring(1));
                    return val !== undefined && val !== "" && val !== null;
                }
                return true;
            });

            if (!allDepsSatisfied) {
                return null; // Don't render the field at all if dependencies are not met
            }
        }

        const fieldError = fieldErrors[key];

        const commonClass = `bg-secondary/30 border ${fieldError ? 'border-red-500/40 focus:border-red-500/60' : 'border-border focus:border-primary/50'} rounded-2xl p-4 text-[15px] text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none transition-all w-full leading-relaxed ${isReadOnly ? "opacity-40 cursor-default bg-muted/30 select-none" : "focus:ring-4 focus:ring-primary/5 hover:border-border/80 cursor-text"
            }`;

        const dropdownClass = `bg-secondary/30 border ${fieldError ? 'border-red-500/40 focus:border-red-500/60' : 'border-border focus:border-primary/50'} rounded-2xl p-4 text-[15px] text-foreground/90 placeholder:text-muted-foreground/30 focus:outline-none transition-all w-full leading-relaxed cursor-pointer appearance-none ${isReadOnly ? "opacity-40 cursor-default bg-muted/30 select-none" : "focus:ring-4 focus:ring-primary/5 hover:border-border/80"
            }`;

        // Explicit Layout Overrides
        if (widget === 'SCHEMA_LOOKUP') {
            return (
                <SchemaLookupField
                    key={key}
                    value={value}
                    onChange={(val: any) => handleFieldChange(key, val, property)}
                    layout={fieldLayout}
                    contextData={{ local: data, parent: parentData, root: effectiveRootData }}
                    rootSchema={effectiveRootSchema}
                    rootData={effectiveRootData}
                    parentData={parentData}
                    isNew={isNew}
                    label={label}
                    description={description}
                    onErrorsChange={(nestedErrors: any) => {
                        setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            let changed = false;

                            Object.entries(nestedErrors as Record<string, string>).forEach(([k, v]) => {
                                const keyPath = `${key}.${k}`;
                                if (newErrors[keyPath] !== v) {
                                    newErrors[keyPath] = v;
                                    changed = true;
                                }
                            });

                            Object.keys(prev).forEach(k => {
                                if (k.startsWith(`${key}.`)) {
                                    const subKey = k.slice(key.length + 1);
                                    if (!(subKey in nestedErrors)) {
                                        delete newErrors[k];
                                        changed = true;
                                    }
                                }
                            });

                            return changed ? newErrors : prev;
                        });
                    }}
                />
            );
        }

        // Handle nested objects
        if (property.type === 'object' || property.properties || property.$ref) {
            // Check if it's explicitly a nested object or just a ref to one
            const isObject = property.type === 'object' || !!property.properties;

            if (isObject) {
                return (
                    <div key={key} className="flex flex-col gap-4 p-4 rounded-2xl bg-secondary/20 border border-border mt-2">
                        <div className="flex flex-col gap-1 px-1">
                            <h5 className="text-xs font-bold text-foreground">{label}</h5>
                            {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
                        </div>
                        <JsonForm
                            schema={property}
                            data={value || {}}
                            onChange={(nestedData) => handleFieldChange(key, nestedData, property)}
                            rootSchema={effectiveRootSchema}
                            rootData={effectiveRootData}
                            parentData={data} // This level is parent for nested
                            isNew={isNew}
                            layout={fieldLayout}
                            onErrorsChange={(nestedErrors) => {
                                setFieldErrors(prev => {
                                    const newErrors = { ...prev };
                                    let changed = false;

                                    // Check for new or changed errors
                                    Object.entries(nestedErrors).forEach(([k, v]) => {
                                        const keyPath = `${key}.${k}`;
                                        if (newErrors[keyPath] !== v) {
                                            newErrors[keyPath] = v;
                                            changed = true;
                                        }
                                    });

                                    // Check for removed errors
                                    Object.keys(prev).forEach(k => {
                                        if (k.startsWith(`${key}.`)) {
                                            const subKey = k.slice(key.length + 1);
                                            if (!(subKey in nestedErrors)) {
                                                delete newErrors[k];
                                                changed = true;
                                            }
                                        }
                                    });

                                    return changed ? newErrors : prev;
                                });
                            }}
                        />
                    </div>
                );
            }
        }

        // Handle arrays of objects
        if (property.type === 'array' && property.items && (property.items.type === 'object' || property.items.$ref)) {
            const items = Array.isArray(value) ? value : [];
            return (
                <div key={key} className="flex flex-col gap-6 p-6 rounded-[32px] bg-secondary/10 border border-border/50 mt-2">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col gap-1">
                            <h5 className="text-sm font-bold text-foreground uppercase tracking-[0.1em]">{label}</h5>
                            {description && <p className="text-xs text-muted-foreground/60">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleFieldChange(key, [...items, {}], property)}
                            className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all active:scale-95 group"
                            title={`Add ${label}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {items.length === 0 ? (
                            <div className="py-10 text-center border-2 border-dashed border-border/30 rounded-2xl bg-secondary/5">
                                <p className="text-xs text-muted-foreground italic">No items added yet</p>
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div key={index} className="relative group/item">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary/30 rounded-full opacity-0 group-hover/item:opacity-100 transition-all duration-300"></div>
                                    <div className="p-6 rounded-3xl bg-background/50 border border-border/60 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1 bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest rounded-lg">Item {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = [...items];
                                                    newItems.splice(index, 1);
                                                    handleFieldChange(key, newItems, property);
                                                }}
                                                className="p-2 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <JsonForm
                                            schema={property.items!}
                                            data={item}
                                            onChange={(updatedItem) => {
                                                const newItems = [...items];
                                                newItems[index] = updatedItem;
                                                handleFieldChange(key, newItems, property);
                                            }}
                                            rootSchema={effectiveRootSchema}
                                            rootData={effectiveRootData}
                                            parentData={data} // Current data is parent for array items
                                            isNew={isNew}
                                            layout={fieldLayout?.items}
                                            onErrorsChange={(nestedErrors: { [key: string]: string }) => {
                                                setFieldErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    let changed = false;
                                                    const prefix = `${key}.${index}`;

                                                    // Clear old errors for this index
                                                    Object.keys(prev).forEach(k => {
                                                        if (k.startsWith(`${prefix}.`)) {
                                                            delete newErrors[k];
                                                            changed = true;
                                                        }
                                                    });

                                                    // Add new errors
                                                    Object.entries(nestedErrors).forEach(([k, v]) => {
                                                        newErrors[`${prefix}.${k}`] = v;
                                                        changed = true;
                                                    });

                                                    return changed ? newErrors : prev;
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        let inputElement = null;

        if (widget === 'LOOKUP') {
            inputElement = (
                <LookupField
                    value={value}
                    onChange={(val) => handleFieldChange(key, val, property)}
                    layout={fieldLayout}
                    className={commonClass}
                    label={label}
                    disabled={isReadOnly}
                    helpText={helpText}
                    localData={data}
                    parentData={parentData}
                    rootData={effectiveRootData}
                />
            );
        } else if (property.enum) {
            const currentValue = value || property.default || "";

            inputElement = (
                <div className="relative group">
                    <select
                        value={currentValue}
                        onChange={(e) => handleFieldChange(key, e.target.value, property)}
                        className={dropdownClass}
                        disabled={isReadOnly}
                    >
                        <option value="" className="text-muted-foreground italic">{helpText ? helpText : `-- Select ${label} --`}</option>
                        {property.enum.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>
            );
        } else if (property.const !== undefined && !property.enum) {
            inputElement = (
                <div className={commonClass}>
                    {property.const}
                </div>
            );
        } else if (property.type === 'boolean') {
            inputElement = (
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id={`field-${key}`}
                        className="w-4 h-4 accent-primary"
                        checked={!!(value ?? property.default)}
                        onChange={(e) => handleFieldChange(key, e.target.checked, property)}
                        disabled={isReadOnly}
                    />
                    <label htmlFor={`field-${key}`} className="text-sm text-foreground">{description || label}</label>
                </div>
            );
        } else if (property.type === 'integer' || property.type === 'number') {
            inputElement = (
                <input
                    type="number"
                    step={property.type === 'number' ? "0.01" : "1"}
                    min={property.minimum}
                    max={property.maximum}
                    className={commonClass}
                    value={value ?? property.default ?? ""}
                    placeholder={helpText || property.default?.toString() || description}
                    onChange={(e) => handleFieldChange(key, e.target.value ? (property.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value)) : undefined, property)}
                    disabled={isReadOnly}
                />
            );
        } else if (property.type === 'array' && property.items?.type === 'string') {
            inputElement = (
                <input
                    className={commonClass}
                    placeholder={helpText || "Comma-separated values"}
                    value={Array.isArray(value) ? value.join(', ') : (property.default ? property.default.join(', ') : "")}
                    onChange={(e) => handleFieldChange(key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean), property)}
                    disabled={isReadOnly}
                />
            );
        } else {
            // Default to string/text
            inputElement = (
                <input
                    type={property.format === 'password' || key.toLowerCase().includes('key') ? 'password' : 'text'}
                    className={commonClass}
                    value={value || property.default || ""}
                    placeholder={helpText || description || `Enter ${label}...`}
                    onChange={(e) => handleFieldChange(key, e.target.value, property)}
                    disabled={isReadOnly}
                />
            );
        }

        return (
            <div key={key} className="flex flex-col gap-2.5">
                {property.type !== 'boolean' && (
                    <div className="flex flex-col gap-1.5 px-1">
                        <label className="text-[13px] text-muted-foreground font-semibold tracking-tight">
                            {label} {isThisFieldRequired && <span className="text-primary/70 ml-0.5">*</span>}
                        </label>
                        {description && <p className="text-[13px] text-muted-foreground/40 leading-relaxed font-normal">{description}</p>}
                    </div>
                )}
                {inputElement}
                {fieldError && (
                    <p className="text-[11px] text-red-400/80 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{fieldError}</p>
                )}
            </div>
        );
    };

    return (
        <div className={`grid grid-cols-1 gap-6 ${className}`}>
            {activeSchemaData.order.map((key) => renderField(key, activeSchemaData.props[key], data[key]))}
        </div>
    );
}
