'use client'

import { memo } from 'react'
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

export interface MarkdownContentProps {
  content: string
  className?: string
}

// Split out from MarkdownRenderer and lazy-loaded from there — ReactMarkdown, KaTeX, Shiki
// (via CodeBlock) and Mermaid are all real weight that a plain-text message shouldn't pay
// for on first paint.
export const MarkdownContent = memo(function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-[32px] font-bold text-text-primary mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[24px] font-semibold text-text-primary mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[20px] font-semibold text-text-primary mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h5>,
          h6: ({ children }) => <h6 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h6>,
          p: ({ children }) => <p className="text-[15px] leading-relaxed text-text-primary mb-3">{children}</p>,
          pre: ({ children }) => <div className="my-4">{children}</div>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-[15px] text-text-primary">{children}</li>,
          code: ({ inline, className, children, node, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : 'text'
            const code = String(children).replace(/\n$/, '')
            if (match && language === 'mermaid') return <MermaidDiagram chart={code} />
            if (inline || !match) return <InlineCode>{children}</InlineCode>
            return <CodeBlock code={code} language={language} />
          },
          blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
          a: ({ href, children }) => <Link href={href || '#'}>{children}</Link>,
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
          hr: () => <hr className="border-0 h-px bg-border-subtle my-6" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
