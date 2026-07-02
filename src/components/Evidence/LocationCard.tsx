import type { Location } from '../../game/caseModel'

export function LocationCard({
  location,
  isSearching,
  isNewEvidence,
  investigateLocation,
  openLocation,
}: {
  location: Location
  isSearching: boolean
  isNewEvidence: boolean
  investigateLocation: (locationId: string) => void
  openLocation: (locationId: string) => void
}) {
  const isComplete = location.investigated
  const teaserText = location.teaserText ?? 'Search this location for clues.'
  const observationText = location.observationText ?? location.description ?? ''
  const evidenceTitle = location.evidenceTitle ?? 'Clue discovered'
  const statusLabel = isSearching
    ? 'Searching...'
    : isNewEvidence
      ? 'New evidence'
      : isComplete
        ? 'Complete'
        : 'Not searched'
  const statusClassName = isSearching
    ? 'is-searching'
    : isNewEvidence
      ? 'is-found'
      : isComplete
        ? 'is-complete'
        : 'is-idle'
  const actionLabel = isSearching ? 'Searching...' : isComplete ? 'Review evidence' : 'Search'

  return (
    <article
      className={`location-card ${isSearching ? 'is-searching' : ''} ${isComplete ? 'is-complete' : ''} ${isNewEvidence ? 'is-new-evidence' : ''}`}
    >
      <div className="location-card-top">
        <span className="location-icon" aria-hidden="true">
          {location.icon}
        </span>
        <div className="location-heading-copy">
          <h3 className="location-name">{location.name}</h3>
          <p className="location-description">
            {isComplete ? observationText : teaserText}
          </p>
        </div>
        <span className={`location-status-stamp ${statusClassName}`}>{statusLabel}</span>
      </div>

      {isComplete ? (
        <div className={`location-evidence-preview ${isNewEvidence ? 'is-revealed' : ''}`}>
          <div className="location-evidence-summary-row">
            <strong>Evidence</strong>
            <span className="location-evidence-count">1 clue collected</span>
          </div>
          <div className="location-evidence-list">
            <span>✓ {evidenceTitle}</span>
            <span className="location-evidence-copy">Observation</span>
            <span>{observationText}</span>
          </div>
        </div>
      ) : (
        <div className="location-evidence-preview is-hidden">
          <div className="location-evidence-summary-row">
            <strong>Evidence</strong>
          </div>
          <div className="location-evidence-list">
            <span>???</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`primary-button location-action-button ${isComplete ? 'is-review' : ''}`}
        onClick={() => (isComplete ? openLocation(location.id) : investigateLocation(location.id))}
        disabled={isSearching}
      >
        {isSearching ? <span className="location-button-spinner" aria-hidden="true" /> : null}
        <span>{actionLabel}</span>
      </button>
    </article>
  )
}
