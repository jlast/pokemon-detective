import { useMemo } from 'react'
import type { Location } from '../../game/caseModel'
import { getLocationIcon } from '../../game/locationIcons'

export type LocationCardVariant = 'detective-note' | 'clipboard' | 'polaroid' | 'evidence-tag' | 'map-fragment'

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

const getObservation = (location: Location) => (
  location.teaserText
  ?? location.observationText
  ?? location.description
  ?? location.actions[0]?.observationTextSmall
  ?? location.actions[0]?.observationText
  ?? 'Initial signs are waiting to be checked.'
)

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

  const tiltAngle = useMemo(() => (Math.random() * 4 - 2).toFixed(1), [location.id])

  const actionable = !isSearching && !(!isComplete && pointsLeft <= 0)
  const isActionAvailable = actionable && !isComplete

  const locationIcon = getLocationIcon(location.name, location.icon)
  const observation = getObservation(location)
  const variantClassName = `investigation-location-card--${variant}`
  const paperToneClassName = `investigation-location-card--tone-${evidenceNumber % 3}`

  const content = (() => {
    switch (variant) {
      case 'clipboard':
        return (
          <div className="location-document location-document--clipboard">
            <strong className="location-document__label">Inspection</strong>
            <h3 className="location-document__title">Location: {location.name}</h3>
            <span className="location-document__checkbox" aria-hidden="true">{isComplete ? '☑ Inspected' : '☐ Not inspected'}</span>
            <p className="location-document__observation">{observation}</p>
          </div>
        )
      case 'polaroid':
        return (
          <div className="location-document location-document--polaroid">
            <div className="location-document__photo" aria-hidden="true">
              <span>{locationIcon}</span>
            </div>
            <h3 className="location-document__caption">{location.name}</h3>
            <p className="location-document__quote">“{observation}”</p>
          </div>
        )
      case 'evidence-tag':
        return (
          <div className="location-document location-document--evidence-tag">
            <span className="location-document__tag-hole" aria-hidden="true" />
            <strong className="location-document__label">Evidence Tag #{String(evidenceNumber).padStart(2, '0')}</strong>
            <span className="location-document__large-icon" aria-hidden="true">{locationIcon}</span>
            <h3 className="location-document__title">{location.name}</h3>
            <p className="location-document__observation">{observation}</p>
          </div>
        )
      case 'map-fragment':
        return (
          <div className="location-document location-document--map-fragment">
            <div className="location-document__map" aria-hidden="true">
              <span className="location-document__route" />
              <span className="location-document__marker" />
            </div>
            <strong className="location-document__label">Marked location</strong>
            <h3 className="location-document__title">{location.name}</h3>
            <p className="location-document__observation">{observation}</p>
          </div>
        )
      case 'detective-note':
      default:
        return (
          <div className="location-document location-document--detective-note">
            <h3 className="location-document__title">{location.name}</h3>
            <p className="location-document__observation">{observation}</p>
          </div>
        )
    }
  })()

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
      {content}
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
