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
  if (text.startsWith('Color:')) return 'color'
  if (text.startsWith('Capture:')) return 'capture'
  if (text.startsWith('Evolution:')) return 'evolution-chain'
  return null
}

const getColorGroupClass = (text: string): string | null => {
  if (!text.startsWith('Color:')) return null
  const normalizedText = text.toLowerCase()
  if (normalizedText.includes('warm colors')) return 'evidence-badge--color-warm'
  if (normalizedText.includes('cool colors')) return 'evidence-badge--color-cool'
  if (normalizedText.includes('neutral colors')) return 'evidence-badge--color-neutral'
  return null
}

// Explain partitions when rendering so saved cases receive the same definitions.
const partitionDefinitions: Record<string, Record<string, string>> = {
  Capture: {
    Elusive: '≤45 Catch Rate',
    Guarded: '>45–120 Catch Rate',
    Easygoing: '>120 Catch Rate',
  },
  Height: {
    Small: '≤0.6 m',
    Short: '≤0.6 m',
    Medium: '>0.6 m and <1.4 m',
    Tall: '≥1.4 m',
  },
  Weight: {
    Light: '≤12 kg',
    Medium: '>12 kg and <45 kg',
    Heavy: '≥45 kg',
  },
  Color: {
    'Warm colors': 'red, yellow, pink',
    'Cool colors': 'blue, green, purple',
    'Neutral colors': 'black, white, gray, brown',
  },
}

function explainPartitionedClue(text: string): string {
  const match = /^([^:]+):\s*([^()]+?)(?:\s*\([^)]*\))?$/.exec(text)
  if (!match) return text
  const [, label, value] = match
  const definition = partitionDefinitions[label]?.[value.trim()]
  return definition ? `${label}: ${value.trim()} (${definition})` : text
}

export function EvidenceBadge({ text, type, clueType, fallback }: EvidenceBadgeProps) {
  const rawText = text ?? fallback
  if (!rawText) return null
  const badgeText = explainPartitionedClue(rawText)

  const separatorIndex = badgeText.indexOf(':')
  const badgeLabel = separatorIndex > 0 ? badgeText.slice(0, separatorIndex) : null
  const badgeValue = badgeLabel ? badgeText.slice(separatorIndex + 1).trim() : badgeText
  const partitionValue = /^(.+?)\s+(\([^)]*\))$/.exec(badgeValue)
  const clueTypeClass = getBadgeClueType(badgeText, clueType)
  const colorGroupClass = getColorGroupClass(badgeText)

  return (
    <span className={`evidence-badge ${clueTypeClass ? `evidence-badge--clue-${clueTypeClass}` : ''} ${colorGroupClass ?? ''} ${type ? `evidence-badge--type-${type}` : ''}`}>
      {type ? (
        <img
          className="evidence-badge-type-sprite"
          src={`/type-sprites/${type}.svg`}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      {badgeLabel ? <span className="evidence-badge__label">{badgeLabel}</span> : null}
      <span className="evidence-badge__value">{partitionValue ? <>{partitionValue[1]} <em className="evidence-badge__definition">{partitionValue[2]}</em></> : badgeValue}</span>
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
