import { useMemo } from 'react'
import type { Location } from '../../game/caseModel'

interface InvestigationLocationCardProps {
  location: Location
  isActiveLocation: boolean
  isSearching: boolean
  isNewEvidence: boolean
  pointsLeft: number
  openPanel: (locationId: string) => void
  style?: React.CSSProperties
}

export function InvestigationLocationCard({
  location,
  isActiveLocation,
  isSearching,
  isNewEvidence,
  pointsLeft,
  openPanel,
  style,
}: InvestigationLocationCardProps) {
  const isComplete = location.investigated
  const selectedAction = location.actions.find((action) => action.id === location.selectedActionId) ?? null
  const statusLabel = isSearching
    ? 'Following lead...'
    : isComplete
      ? 'Complete'
      : pointsLeft <= 0
        ? 'No actions left'
        : 'Not searched'
  const statusClassName = isSearching
    ? 'is-searching'
    : isComplete
      ? 'is-complete'
      : pointsLeft <= 0
        ? 'is-disabled'
        : 'is-idle'

  const tiltAngle = useMemo(() => (Math.random() * 4 - 2).toFixed(1), [location.id])

  const actionable = !isSearching && !(!isComplete && pointsLeft <= 0)

  return (
    <article
      className={`investigation-location-card ${isComplete ? 'is-complete' : ''} ${isNewEvidence ? 'is-new-evidence' : ''} ${pointsLeft <= 0 && !isComplete ? 'is-disabled' : ''} ${isActiveLocation ? 'is-active-location' : ''}`}
      style={{ ...style, '--tilt': `${tiltAngle}deg` } as React.CSSProperties}
      onClick={() => actionable && openPanel(location.id)}
      onKeyDown={(e) => { if (actionable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPanel(location.id) } }}
      role="button"
      tabIndex={actionable ? 0 : -1}
      aria-label={`Investigate ${location.name}`}
    >
      <span className="pin-location-dot" aria-hidden="true" />
      <span className={`pin-location-status ${statusClassName}`}>{statusLabel}</span>
      <span className="pin-location-icon" aria-hidden="true">{location.icon}</span>
      <h3 className="pin-location-name">{location.name}</h3>
      <div className="pin-location-evidence-slots" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className="pin-location-evidence-slot">
            {isComplete && selectedAction?.outcomeType === 'evidence' && i === 0 ? '🔍' : '?'}
          </span>
        ))}
      </div>
      <button
        type="button"
        className={`pin-location-button ${isComplete ? 'is-review' : ''}`}
        onClick={(e) => { e.stopPropagation(); openPanel(location.id) }}
        disabled={isSearching || (!isComplete && pointsLeft <= 0)}
      >
        {isSearching ? 'Following lead…' : isComplete ? 'Review →' : pointsLeft <= 0 ? 'Locked' : 'Investigate →'}
      </button>
    </article>
  )
}
