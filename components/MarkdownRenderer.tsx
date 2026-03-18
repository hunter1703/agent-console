"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { createHighlighter, Highlighter } from "shiki";
import { Copy, Check, ChevronDown, ChevronUp, Play } from "lucide-react";
import "katex/dist/katex.min.css";

// Initialize shiki highlighter (lazy loaded)
let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () => {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ["github-dark", "github-light"],
            langs: [
                "javascript",
                "typescript",
                "python",
                "java",
                "go",
                "rust",
                "bash",
                "shell",
                "json",
                "yaml",
                "html",
                "css",
                "sql",
                "markdown",
                "tsx",
                "jsx",
            ],
        });
    }
    return highlighterPromise;
};

interface MarkdownRendererProps {
    content: string;
    className?: string;
    enableMermaid?: boolean;
    enableLatex?: boolean;
}

export default function MarkdownRenderer({
    content,
    className = "",
    enableMermaid = true,
    enableLatex = true,
}: MarkdownRendererProps) {
    return (
        <div
            className={`markdown-content prose-custom ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[
                    remarkGfm,
                    ...(enableLatex ? [remarkMath] : []),
                ]}
                rehypePlugins={[
                    rehypeSlug,
                    ...(enableLatex ? [rehypeKatex] : []),
                ]}
                components={{
                    pre: ((props: any) => (
                        <CodeBlock enableMermaid={enableMermaid} {...props} />
                    )) as any,
                    code: CodeInline as any,
                    h1: ((props: any) => <Heading level={1} {...props} />) as any,
                    h2: ((props: any) => <Heading level={2} {...props} />) as any,
                    h3: ((props: any) => <Heading level={3} {...props} />) as any,
                    h4: ((props: any) => <Heading level={4} {...props} />) as any,
                    a: Link as any,
                    blockquote: Blockquote as any,
                    table: Table as any,
                    img: Image as any,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// ============================================================================
// Code Block with Syntax Highlighting
// ============================================================================

function CodeBlock({
    children,
    node,
    enableMermaid = true,
}: {
    children: React.ReactNode;
    node?: any;
    enableMermaid?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);
    const [mermaidSvg, setMermaidSvg] = useState<string | null>(null);
    const [mermaidError, setMermaidError] = useState<string | null>(null);

    const extractText = (node: any): string => {
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node?.props?.children) return extractText(node.props.children);
        return "";
    };

    const codeText = extractText(children);

    // Check if this is a mermaid diagram
    const isMermaid = node?.properties?.className?.includes("language-mermaid");

    useEffect(() => {
        if (isMermaid && enableMermaid && codeText.trim()) {
            renderMermaid(codeText);
        } else if (node?.properties?.className) {
            highlightCode(codeText, node.properties.className);
        }
    }, [codeText, isMermaid, enableMermaid]);

    const renderMermaid = async (code: string) => {
        try {
            const { default: mermaid } = await import("mermaid");
            mermaid.initialize({
                startOnLoad: false,
                theme: "default",
                securityLevel: "loose",
            });
            const { svg } = await mermaid.render(
                `mermaid-${Math.random().toString(36).substring(7)}`,
                code
            );
            setMermaidSvg(svg);
            setMermaidError(null);
        } catch (error) {
            setMermaidError(
                error instanceof Error ? error.message : "Failed to render diagram"
            );
            setMermaidSvg(null);
        }
    };

    const highlightCode = async (code: string, classNames: string[]) => {
        const langMatch = classNames.find((c) => c.startsWith("language-"));
        const lang = langMatch?.replace("language-", "") || "text";

        try {
            const highlighter = await getHighlighter();
            const html = highlighter.codeToHtml(code, {
                lang,
                theme: "github-dark",
            });
            setHighlighted(html);
        } catch {
            setHighlighted(null);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Render Mermaid diagram
    if (isMermaid && enableMermaid) {
        return (
            <div className="my-4 rounded-xl border border-border overflow-hidden bg-surface">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/50">
                    <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                        Diagram
                    </span>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp size={14} /> Collapse
                            </>
                        ) : (
                            <>
                                <ChevronDown size={14} /> Expand
                            </>
                        )}
                    </button>
                </div>
                {expanded && (
                    <div className="p-4">
                        {mermaidSvg ? (
                            <div
                                className="mermaid flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                            />
                        ) : mermaidError ? (
                            <div className="text-[13px] text-red font-mono bg-red/10 p-3 rounded-lg">
                                {mermaidError}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Rendering diagram...
                            </div>
                        )}
                        {/* Raw code toggle */}
                        <details className="mt-4">
                            <summary className="text-[12px] text-muted-foreground cursor-pointer hover:text-foreground">
                                Show raw code
                            </summary>
                            <pre className="mt-2 p-3 bg-surface border border-border rounded-lg overflow-x-auto">
                                <code className="text-[12px] font-mono">{codeText}</code>
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        );
    }

    // Render syntax-highlighted code
    return (
        <div className="my-4 rounded-xl border border-border overflow-hidden bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        {node?.properties?.className
                            ?.find((c: string) => c.startsWith("language-"))
                            ?.replace("language-", "") || "Code"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-[11px]"
                    >
                        {copied ? (
                            <>
                                <Check size={12} className="text-emerald-500" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy size={12} /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                {highlighted ? (
                    <div
                        className="text-[13px] font-mono leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                ) : (
                    <pre className="p-4 text-[13px] font-mono leading-relaxed text-gray-300 overflow-x-auto">
                        <code>{codeText}</code>
                    </pre>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Inline Code
// ============================================================================

function CodeInline({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
}) {
    return (
        <code
            className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[0.9em]"
            {...props}
        >
            {children}
        </code>
    );
}

// ============================================================================
// Headings with Anchor Links
// ============================================================================

function Heading({
    level,
    children,
    id,
    ...props
}: {
    level: number;
    children: React.ReactNode;
    id?: string;
    [key: string]: any;
}) {
    const sizeClasses: Record<number, string> = {
        1: "text-[24px] font-bold mt-8 mb-4",
        2: "text-[20px] font-bold mt-6 mb-3",
        3: "text-[18px] font-semibold mt-4 mb-2",
        4: "text-[16px] font-semibold mt-3 mb-1",
    };

    const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';

    return (
        <Tag
            id={id}
            className={`${sizeClasses[level as keyof typeof sizeClasses]} text-foreground tracking-tight group`}
            {...props}
        >
            {id && (
                <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary no-underline ml-2"
                >
                    #
                </a>
            )}
            {children}
        </Tag>
    );
}

// ============================================================================
// Link
// ============================================================================

function Link({
    children,
    href,
    ...props
}: {
    children: React.ReactNode;
    href?: string;
    [key: string]: any;
}) {
    const isExternal = href?.startsWith("http") || href?.startsWith("//");

    return (
        <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-primary hover:underline transition-colors"
            {...props}
        >
            {children}
        </a>
    );
}

// ============================================================================
// Blockquote
// ============================================================================

function Blockquote({
    children,
    ...props
}: {
    children: React.ReactNode;
    [key: string]: any;
}) {
    return (
        <blockquote
            className="border-l-3 border-primary pl-4 my-4 text-muted-foreground italic"
            {...props}
        >
            {children}
        </blockquote>
    );
}

// ============================================================================
// Table
// ============================================================================

function Table({
    children,
    ...props
}: {
    children: React.ReactNode;
    [key: string]: any;
}) {
    return (
        <div className="my-4 overflow-x-auto rounded-xl border border-border">
            <table
                className="w-full border-collapse text-[14px]"
                {...props}
            >
                {children}
            </table>
        </div>
    );
}

function TableRow({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
    return (
        <tr className="border-b border-border last:border-0" {...props}>
            {children}
        </tr>
    );
}

function TableHeader({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
    return (
        <th
            className="px-3 py-2 text-left font-semibold text-foreground bg-surface"
            {...props}
        >
            {children}
        </th>
    );
}

function TableCell({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
    return (
        <td className="px-3 py-2 text-foreground/80" {...props}>
            {children}
        </td>
    );
}

// Override table components
Table.displayName = "Table";
TableRow.displayName = "TableRow";
TableHeader.displayName = "TableHeader";
TableCell.displayName = "TableCell";

// ============================================================================
// Image with Lazy Loading
// ============================================================================

function Image({
    src,
    alt,
    ...props
}: {
    src?: string;
    alt?: string;
    [key: string]: any;
}) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-border bg-surface">
            {!loaded && !error && (
                <div className="aspect-video flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {error ? (
                <div className="aspect-video flex items-center justify-center text-muted-foreground">
                    Failed to load image
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-auto transition-opacity duration-300 ${
                        loaded ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                    {...props}
                />
            )}
            {alt && (
                <p className="px-3 py-2 text-[12px] text-muted-foreground text-center border-t border-border">
                    {alt}
                </p>
            )}
        </div>
    );
}
