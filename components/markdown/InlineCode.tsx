interface InlineCodeProps {
  children: React.ReactNode
  className?: string
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  return (
    <code
      className={`
        inline-block
        px-1.5 py-0.5
        rounded
        bg-surface
        border border-border-subtle
        font-mono text-[13px]
        text-text-primary
        ${className}
      `}
    >
      {children}
    </code>
  )
}
