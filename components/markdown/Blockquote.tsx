interface BlockquoteProps {
  children: React.ReactNode
  className?: string
}

export function Blockquote({ children, className = '' }: BlockquoteProps) {
  return (
    <blockquote
      className={`
        border-l-2 border-primary
        pl-4 pr-4 py-3
        my-4
        rounded-lg
        bg-surface
        text-[15px] italic
        text-text-secondary
        ${className}
      `}
    >
      {children}
    </blockquote>
  )
}
