import type { Location, LocationCardVariant } from '../../game/caseModel'
import { getLocationIcon } from '../../game/locationIcons'

interface InvestigationLocationCardProps {
  location: Location
  isActiveLocation: boolean
  isSearching: boolean
  isNewEvidence: boolean
  pointsLeft: number
  openPanel: (locationId: string) => void
  variant: LocationCardVariant
  evidenceNumber: number
  style?: React.CSSProperties
}

const getStableFallbackTilt = (locationId: string) => {
  const hash = [...locationId].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return ((hash % 41) - 20) / 10
}

export function InvestigationLocationCard({
  location,
  isActiveLocation,
  isSearching,
  isNewEvidence,
  pointsLeft,
  openPanel,
  variant,
  evidenceNumber,
  style,
}: InvestigationLocationCardProps) {
  const isComplete = location.investigated
  const statusLabel = isSearching
    ? 'Following lead...'
    : isComplete
      ? 'Complete'
      : pointsLeft <= 0
        ? 'Locked'
        : 'Not searched'

  const tiltAngle = location.cardTiltDegrees ?? getStableFallbackTilt(location.id)

  const actionable = !isSearching && !(!isComplete && pointsLeft <= 0)
  const isActionAvailable = actionable && !isComplete

  const variantClassName = `investigation-location-card--${variant}`
  const paperToneClassName = `investigation-location-card--tone-${evidenceNumber % 3}`
  const locationIcon = getLocationIcon(location.name, location.icon)

  return (
    <article
      className={`investigation-location-card ${variantClassName} ${paperToneClassName} ${isActionAvailable ? 'is-action-available' : ''} ${isComplete ? 'is-complete' : ''} ${isNewEvidence ? 'is-new-evidence' : ''} ${pointsLeft <= 0 && !isComplete ? 'is-disabled' : ''} ${isActiveLocation ? 'is-active-location' : ''}`}
      style={{ ...style, '--tilt': `${tiltAngle}deg` } as React.CSSProperties}
      onClick={() => actionable && openPanel(location.id)}
      onKeyDown={(e) => { if (actionable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPanel(location.id) } }}
      role="button"
      tabIndex={actionable ? 0 : -1}
      aria-label={`Investigate ${location.name}`}
    >
      <span className="pin-location-dot" aria-hidden="true" />
      <span className="sr-only">{statusLabel}</span>
      <div className="location-document location-document--compact">
        {variant === 'map-fragment' ? (
          <svg className="location-document__route-map" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
            <path d="M18 62 C34 54 34 34 51 31 S77 44 92 27" />
            <circle cx="18" cy="62" r="4" />
            <circle cx="92" cy="27" r="5" />
          </svg>
        ) : null}
        <span className="location-document__icon" aria-hidden="true">{locationIcon}</span>
        <h3 className="location-document__title">{location.name}</h3>
        <span className="location-document__status" aria-hidden="true">{isComplete ? 'Done' : pointsLeft <= 0 ? 'Locked' : 'Open'}</span>
      </div>
      <button
        type="button"
        className={`pin-location-button ${isComplete ? 'is-review' : ''}`}
        onClick={(e) => { e.stopPropagation(); openPanel(location.id) }}
        disabled={isSearching || (!isComplete && pointsLeft <= 0)}
      >
        {isSearching ? 'Following lead…' : isComplete ? 'Investigate →' : pointsLeft <= 0 ? 'Locked' : 'Investigate →'}
      </button>
    </article>
  )
}
