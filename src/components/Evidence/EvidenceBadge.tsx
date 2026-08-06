import type { EvidenceBadgeData } from '../../game/caseModel'

interface EvidenceBadgeProps {
  text?: string | null
  type?: string | null
  fallback?: string | null
}

interface EvidenceBadgeListProps {
  badges?: EvidenceBadgeData[] | null
  fallback?: string | null
  className?: string
}

export function EvidenceBadge({ text, type, fallback }: EvidenceBadgeProps) {
  const badgeText = text ?? fallback
  if (!badgeText) return null

  const separatorIndex = badgeText.indexOf(':')
  const badgeLabel = separatorIndex > 0 ? badgeText.slice(0, separatorIndex) : null
  const badgeValue = badgeLabel ? badgeText.slice(separatorIndex + 1).trim() : badgeText

  return (
    <span className={`evidence-badge ${type ? `evidence-badge--type-${type}` : ''}`}>
      {type ? (
        <img
          className="evidence-badge-type-sprite"
          src={`/type-sprites/${type}.svg`}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {badgeLabel ? <span className="evidence-badge__label">{badgeLabel}</span> : null}
      <span className="evidence-badge__value">{badgeValue}</span>
    </span>
  )
}

export function EvidenceBadgeList({ badges, fallback, className }: EvidenceBadgeListProps) {
  if (badges?.length) {
    return (
      <span className={`evidence-badge-list${className ? ` ${className}` : ''}`}>
        {badges.map((badge, index) => (
          <EvidenceBadge key={`${badge.text}-${index}`} text={badge.text} type={badge.type} />
        ))}
      </span>
    )
  }

  return <EvidenceBadge fallback={fallback} />
}
