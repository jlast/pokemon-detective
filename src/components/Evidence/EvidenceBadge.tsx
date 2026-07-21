import type { EvidenceBadgeData } from '../../game/caseModel'

interface EvidenceBadgeProps {
  text?: string | null
  type?: string | null
  fallback?: string | null
}

interface EvidenceBadgeListProps {
  badges?: EvidenceBadgeData[] | null
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

export function EvidenceBadgeList({ badges, fallback }: EvidenceBadgeListProps) {
  if (badges?.length) {
    return (
      <span className="evidence-badge-list">
        {badges.map((badge, index) => (
          <EvidenceBadge key={`${badge.text}-${index}`} text={badge.text} type={badge.type} />
        ))}
      </span>
    )
  }

  return <EvidenceBadge fallback={fallback} />
}
