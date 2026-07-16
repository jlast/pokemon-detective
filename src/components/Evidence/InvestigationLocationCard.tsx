import { useMemo } from 'react'
import type { Location } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { getLocationIcon } from '../../game/locationIcons'

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
        ? 'Locked'
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

  const evidenceIcon = selectedAction?.evidenceId
    ? getEvidenceIcon(selectedAction.evidenceId, selectedAction.evidenceTitle, '🔍')
    : '🔍'
  const locationIcon = getLocationIcon(location.name, location.icon)

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
      <span className="pin-location-icon" aria-hidden="true">{locationIcon}</span>
      <h3 className="pin-location-name">{location.name}</h3>
      <div className="location-card__evidence">
        <span className="location-card__evidence-label">
          {isComplete ? 'Evidence found' : 'Evidence'}
        </span>
        {isComplete && selectedAction ? (
          selectedAction.outcomeType === 'evidence' ? (
            <span className="location-card__evidence-item">
              <span aria-hidden="true">{evidenceIcon}</span>
              <span>{selectedAction.evidenceTitle}</span>
            </span>
          ) : (
            <span className="location-card__evidence-item location-card__evidence-item--empty">
              Nothing found.
            </span>
          )
        ) : (
          <span className="location-card__evidence-item location-card__evidence-item--empty">
            {pointsLeft <= 0 ? 'Not available yet.' : 'Investigate to discover a clue.'}
          </span>
        )}
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
