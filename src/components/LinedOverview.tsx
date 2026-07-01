import type { ReactNode } from 'react'

interface LinedOverviewProps {
  title: string
  children: ReactNode
}

export function LinedOverview({ title, children }: LinedOverviewProps) {
  return (
    <div className="inspect-item case-details-notebook">
      <div className="case-details-lines">
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  )
}
