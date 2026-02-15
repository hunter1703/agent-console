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
}

interface LookupFieldProps {
    value: any;
    onChange: (value: any) => void;
    layout: any;
    className: string;
    label: string;
    disabled?: boolean;
    helpText?: string;
}

function LookupField({ value, onChange, layout, className, label, disabled, helpText }: LookupFieldProps) {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [fetchingMore, setFetchingMore] = useState(false);
    const limit = 50;

    const fetchPage = useCallback(async (currentOffset: number) => {
        const req = layout.lookupRequest;
        if (!req) return;

        const isInitial = currentOffset === 0;
        if (isInitial) setLoading(true);
        else setFetchingMore(true);

        try {
            // Prepend base URL if it's relative
            const url = req.url.startsWith('http') ? req.url : `/api/v1${req.url.startsWith('/') ? '' : '/'}${req.url}`;

            // Build body according to spec: AssetType and pagination
            const body = {
                ...(req.body || {}),
                query: {
                    ...(req.body?.query || {}),
                    page: {
                        offset: currentOffset,
                        limit
                    }
                }
            };

            const response = await fetch(url, {
                method: req.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
            }
        } catch (error) {
            console.error("Lookup failed:", error);
        } finally {
            if (isInitial) setLoading(false);
            else setFetchingMore(false);
        }
    }, [layout.lookupRequest]);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        fetchPage(0);
        setOffset(0);
    }, [fetchPage]);

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

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Trigger if close to bottom
        if (hasMore && !fetchingMore && scrollHeight - scrollTop <= clientHeight + 50) {
            const nextOffset = offset + limit;
            setOffset(nextOffset);
            fetchPage(nextOffset);
        }
    };

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                className={`${className} flex justify-between items-center text-left min-h-[48px] group px-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <div className="flex flex-col">
                    <span className={!value ? "text-muted-foreground/50 text-[15px] italic" : "text-white/90 font-medium text-[15px] tracking-tight"}>
                        {selectedOption?.name || value || helpText || `-- Select ${label} --`}
                    </span>
                </div>
                <div className={`transition-all duration-500 transform ${isOpen ? "rotate-90 text-primary" : "text-muted-foreground/30 group-hover:text-white/50"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto bg-[#121212]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 hide-scrollbar overscroll-contain"
                    onScroll={handleScroll}
                    style={{ scrollbarWidth: 'none' }}
                >
                    <div className="p-2 flex flex-col gap-1">
                        {options.length === 0 && !loading && (
                            <div className="p-4 text-center text-xs text-muted-foreground italic">No results found</div>
                        )}

                        {options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`px-4 py-3 text-sm cursor-pointer rounded-xl transition-all duration-200 flex flex-col gap-0.5 ${value === opt.id
                                    ? "bg-primary/20 border border-primary/20 text-white font-semibold"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
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

export default function JsonForm({ schema, data, onChange, className = "", rootSchema, isNew, layout, onErrorsChange }: JsonFormProps) {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const lastReportedErrors = useRef<string>("");

    useEffect(() => {
        const errorsStr = JSON.stringify(fieldErrors);
        if (onErrorsChange && lastReportedErrors.current !== errorsStr) {
            lastReportedErrors.current = errorsStr;
            onErrorsChange(fieldErrors);
        }
    }, [fieldErrors, onErrorsChange]);

    const effectiveRootSchema = rootSchema || schema;

    const validateField = useCallback((key: string, value: any, property: JsonSchemaProperty): string | null => {
        const isRequired = schema.required?.includes(key);

        if (isRequired && (value === undefined || value === null || value === "")) {
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

    const mergeProps = useCallback((base: { [key: string]: JsonSchemaProperty }, extension: { [key: string]: JsonSchemaProperty }) => {
        const result = { ...base };
        Object.entries(extension).forEach(([key, prop]) => {
            if (result[key]) {
                // Merge individual property metadata (like enum and const)
                result[key] = { ...result[key], ...prop };
            } else {
                result[key] = prop;
            }
        });
        return result;
    }, []);

    const evaluateSchema = useCallback((currentSchema: JsonSchema, currentData: any) => {
        const baseProps = currentSchema.properties || {};

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
            }
        });

        // Handle oneOf with discriminator
        if (currentSchema.oneOf && currentSchema.discriminator) {
            const propName = currentSchema.discriminator.propertyName;
            const value = currentData?.[propName];
            if (value) {
                const branch = currentSchema.oneOf.find(s => {
                    const resolved = s.$ref ? resolveRef(s.$ref) : s;
                    if (resolved?.properties?.[propName]?.const === value) return true;
                    if (resolved?.properties?.[propName]?.enum?.includes(value)) return true;
                    return false;
                });

                if (branch) {
                    const resolvedBranch = branch.$ref ? resolveRef(branch.$ref) : branch;
                    if (resolvedBranch?.properties) {
                        resolvedProps = mergeProps(resolvedProps, resolvedBranch.properties);
                    }
                }
            }
        }

        // Handle allOf/if/then logic
        if (currentSchema.allOf) {
            currentSchema.allOf.forEach((branch) => {
                // Static merges (no if/then)
                const innerProps = branch.properties || (branch.$ref ? resolveRef(branch.$ref)?.properties : null);
                if (innerProps && !branch.if) {
                    resolvedProps = mergeProps(resolvedProps, innerProps);
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
                        resolvedProps = mergeProps(resolvedProps, thenProps);
                    }
                }
            });
        }

        return resolvedProps;
    }, [resolveRef]);

    const activeProperties = useMemo(() => {
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
        // Special case for 'id' field
        if (key === 'id' && isNew) {
            return null;
        }

        const property = getProperty(rawProperty);
        const label = property.title || key;
        const description = property.description;
        const helpText = property.help;
        const isRequired = schema.required?.includes(key);
        // Only read-only if it's a const AND doesn't have an enum (which means it's a discriminator or toggle)
        const isReadOnly = (key === 'id' && !isNew) || !!property.readOnly || (property.const !== undefined && !property.enum);

        const fieldLayout = layout?.[key];
        const widget = fieldLayout?.widget;

        const fieldError = fieldErrors[key];

        const commonClass = `bg-white/[0.03] border ${fieldError ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/5 focus:border-primary/50'} rounded-2xl p-4 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none transition-all w-full leading-relaxed ${isReadOnly ? "opacity-40 cursor-default bg-black/10 select-none" : "focus:ring-4 focus:ring-primary/5 hover:border-white/10 cursor-text"
            }`;

        const dropdownClass = `bg-white/[0.03] border ${fieldError ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/5 focus:border-primary/50'} rounded-2xl p-4 text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none transition-all w-full leading-relaxed cursor-pointer appearance-none ${isReadOnly ? "opacity-40 cursor-default bg-black/10 select-none" : "focus:ring-4 focus:ring-primary/5 hover:border-white/10"
            }`;

        // Handle nested objects
        if (property.type === 'object' || property.properties || property.$ref) {
            // Check if it's explicitly a nested object or just a ref to one
            const isObject = property.type === 'object' || !!property.properties;

            if (isObject) {
                return (
                    <div key={key} className="flex flex-col gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mt-2">
                        <div className="flex flex-col gap-1 px-1">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">{label}</h5>
                            {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
                        </div>
                        <JsonForm
                            schema={property}
                            data={value || {}}
                            onChange={(nestedData) => handleFieldChange(key, nestedData, property)}
                            rootSchema={effectiveRootSchema}
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30 group-hover:text-white/50 transition-colors">
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
                    <label htmlFor={`field-${key}`} className="text-sm text-white">{description || label}</label>
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
                            {label} {isRequired && <span className="text-primary/70 ml-0.5">*</span>}
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
            {Object.entries(activeProperties).map(([key, prop]) => renderField(key, prop, data[key]))}
        </div>
    );
}
