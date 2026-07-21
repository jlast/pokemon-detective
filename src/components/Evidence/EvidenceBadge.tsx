interface EvidenceBadgeProps {
  text?: string | null
  type?: string | null
  fallback?: string | null
}

export function EvidenceBadge({ text, type, fallback }: EvidenceBadgeProps) {
  const badgeText = text ?? fallback
  if (!badgeText) return null

  return (
    <span className={`evidence-badge ${type ? `evidence-badge--type-${type}` : ''}`}>
      {badgeText}
    </span>
  )
}
