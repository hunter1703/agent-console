"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none 
                       prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                       prose-p:text-foreground/90 prose-p:leading-relaxed
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-foreground prose-strong:font-bold
                       prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                       prose-pre:bg-surface prose-pre:border prose-pre:border-border/50 prose-pre:shadow-sm prose-pre:rounded-xl prose-pre:p-0
                       prose-ul:text-foreground/80 prose-ol:text-foreground/80
                       prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                            <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed prose-pre:bg-transparent">
                                {children}
                            </div>
                        ) : (
                            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[0.9em]" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
    const [copied, setCopied] = useState(false);

    const extractText = (node: any): string => {
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node?.props?.children) return extractText(node.props.children);
        return "";
    };

    const handleCopy = () => {
        const text = extractText(children);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group/code">
            <button
                onClick={handleCopy}
                className="absolute right-3 top-3 p-2 rounded-lg bg-surface border border-border/50 text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover/code:opacity-100 backdrop-blur-md"
            >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            {children}
        </div>
    );
}
