'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { CodeBlock } from './CodeBlock'
import { InlineCode } from './InlineCode'
import { Blockquote } from './Blockquote'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from './Table'
import { Link } from './Link'
import { MermaidDiagram } from './MermaidDiagram'
import { sanitizeHtml } from '@/lib/utils/sanitize'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Sanitize content before rendering
  const sanitizedContent = sanitizeHtml(content)

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-[32px] font-bold text-text-primary mt-6 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[24px] font-semibold text-text-primary mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[20px] font-semibold text-text-primary mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[17px] font-medium text-text-primary mt-3 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-[17px] font-medium text-text-primary mt-3 mb-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-[17px] font-medium text-text-primary mt-3 mb-2">
              {children}
            </h6>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-[15px] leading-relaxed text-text-primary mb-3">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-3 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-3 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] text-text-primary">
              {children}
            </li>
          ),
          
          // Code blocks
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : 'text'
            const code = String(children).replace(/\n$/, '')

            // Check if it's a Mermaid diagram
            if (language === 'mermaid') {
              return <MermaidDiagram chart={code} />
            }

            // Inline code
            if (inline) {
              return <InlineCode>{children}</InlineCode>
            }

            // Code block
            return <CodeBlock code={code} language={language} />
          },
          
          // Blockquote
          blockquote: ({ children }) => (
            <Blockquote>{children}</Blockquote>
          ),
          
          // Links
          a: ({ href, children }) => (
            <Link href={href || '#'}>{children}</Link>
          ),
          
          // Tables
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children, style }) => {
            const align = style?.textAlign as 'left' | 'center' | 'right' | undefined
            return <TableHeaderCell align={align}>{children}</TableHeaderCell>
          },
          td: ({ children, style }) => {
            const align = style?.textAlign as 'left' | 'center' | 'right' | undefined
            return <TableCell align={align}>{children}</TableCell>
          },
          
          // Horizontal rule
          hr: () => (
            <hr className="border-0 h-px bg-border-subtle my-6" />
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  )
}
