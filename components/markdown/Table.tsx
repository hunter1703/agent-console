import { cn } from '@/lib/utils'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-400px)] rounded-xl border border-border-subtle my-4">
      <table
        className={`
          w-full
          rounded-xl
          ${className}
        `}
      >
        {children}
      </table>
    </div>
  )
}

interface TableHeadProps {
  children: React.ReactNode
}

export function TableHead({ children }: TableHeadProps) {
  return (
    <thead className="bg-surface-elevated [&_tr:first-child_th:first-child]:rounded-tl-xl [&_tr:first-child_th:last-child]:rounded-tr-xl">
      {children}
    </thead>
  )
}

interface TableBodyProps {
  children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function TableRow({ children, onClick, className }: TableRowProps) {
  return (
    <tr 
      className={cn(
        "border-b border-border-subtle last:border-b-0",
        "hover:bg-surface-hover transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableHeaderCellProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
}

export function TableHeaderCell({ children, align = 'left', sticky = false }: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        "px-4 py-3",
        "text-sm font-semibold",
        "text-text-secondary",
        "border-b border-border-subtle",
        `text-${align}`,
        sticky && "sticky left-0 z-10 bg-surface-elevated"
      )}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
}

export function TableCell({ children, align = 'left', sticky = false }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-4",
        "text-sm",
        "text-text-primary",
        `text-${align}`,
        sticky && "sticky left-0 z-10 bg-background group-hover:bg-surface-hover"
      )}
    >
      {children}
    </td>
  )
}
