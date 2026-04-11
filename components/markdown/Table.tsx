interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto my-4">
      <table
        className={`
          w-full
          border border-border-subtle
          rounded-xl
          border-separate
          border-spacing-0
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
    <thead className="bg-surface">
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
}

export function TableRow({ children }: TableRowProps) {
  return (
    <tr className="hover:bg-surface-hover transition-colors">
      {children}
    </tr>
  )
}

interface TableHeaderCellProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export function TableHeaderCell({ children, align = 'left' }: TableHeaderCellProps) {
  return (
    <th
      className={`
        px-3 py-3
        text-[13px] font-semibold
        text-text-primary
        border-b border-border-subtle
        text-${align}
      `}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export function TableCell({ children, align = 'left' }: TableCellProps) {
  return (
    <td
      className={`
        px-3 py-3
        text-[15px]
        text-text-primary
        border-b border-border-subtle
        last:border-b-0
        text-${align}
      `}
    >
      {children}
    </td>
  )
}
