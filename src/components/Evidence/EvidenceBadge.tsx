import type { ClueAxis, EvidenceBadgeData } from '../../game/caseModel'

interface EvidenceBadgeProps {
  text?: string | null
  type?: string | null
  clueType?: ClueAxis | string | null
  fallback?: string | null
}

interface EvidenceBadgeListProps {
  badges?: EvidenceBadgeData[] | null
  fallback?: string | null
  className?: string
  clueType?: ClueAxis | string | null
}

const toClassToken = (value?: string | null): string | null => (
  value ? value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() : null
)

const getBadgeClueType = (text: string, clueType?: ClueAxis | string | null): string | null => {
  if (clueType && clueType !== 'scene') return toClassToken(clueType)
  if (text.startsWith('Height:')) return 'height'
  if (text.startsWith('Weight:')) return 'weight'
  if (text.startsWith('Strength:')) return 'highest-stat'
  if (text.startsWith('Weakness:')) return 'lowest-stat'
  if (text.startsWith('Weak to') || text.startsWith('Strong to')) return 'type-affectedness'
  if (text.startsWith('Region:')) return 'region'
  if (text.startsWith('Evolution:')) return 'evolution-chain'
  return null
}

export function EvidenceBadge({ text, type, clueType, fallback }: EvidenceBadgeProps) {
  const badgeText = text ?? fallback
  if (!badgeText) return null

  const separatorIndex = badgeText.indexOf(':')
  const badgeLabel = separatorIndex > 0 ? badgeText.slice(0, separatorIndex) : null
  const badgeValue = badgeLabel ? badgeText.slice(separatorIndex + 1).trim() : badgeText
  const clueTypeClass = getBadgeClueType(badgeText, clueType)

  return (
    <span className={`evidence-badge ${clueTypeClass ? `evidence-badge--clue-${clueTypeClass}` : ''} ${type ? `evidence-badge--type-${type}` : ''}`}>
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

export function EvidenceBadgeList({ badges, fallback, className, clueType }: EvidenceBadgeListProps) {
  if (badges?.length) {
    return (
      <span className={`evidence-badge-list${className ? ` ${className}` : ''}`}>
        {badges.map((badge, index) => (
          <EvidenceBadge key={`${badge.text}-${index}`} text={badge.text} type={badge.type} clueType={badge.hintType ?? clueType} />
        ))}
      </span>
    )
  }

  return <EvidenceBadge fallback={fallback} clueType={clueType} />
}
