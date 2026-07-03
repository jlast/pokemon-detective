import type { Location } from '../../game/caseModel'

interface InvestigationLocationCardProps {
  location: Location
  isActiveLocation: boolean
  isSearching: boolean
  isNewEvidence: boolean
  pointsLeft: number
  openPanel: (locationId: string) => void
}

export function InvestigationLocationCard({
  location,
  isActiveLocation,
  isSearching,
  isNewEvidence,
  pointsLeft,
  openPanel,
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

  const summaryText = !selectedAction
    ? location.teaserText ?? 'Choose how to investigate this location.'
    : selectedAction.outcomeType === 'evidence'
      ? `Evidence recovered: ${selectedAction.evidenceTitle}`
      : selectedAction.outcomeType === 'witness'
        ? 'Witness statement collected.'
        : 'No physical evidence recovered.'

  return (
    <article
      className={`location-card ${isSearching ? 'is-searching' : ''} ${isComplete ? 'is-complete' : ''} ${isNewEvidence ? 'is-new-evidence' : ''} ${pointsLeft <= 0 && !isComplete ? 'is-disabled' : ''} ${isActiveLocation ? 'is-active-location' : ''}`}
    >
      <div className="location-card-top">
        <span className="location-icon" aria-hidden="true">
          {location.icon}
        </span>
        <div className="location-heading-copy">
          <h3 className="location-name">{location.name}</h3>
          <p className="location-description">{summaryText}</p>
        </div>
        <span className={`location-status-stamp ${statusClassName}`}>{statusLabel}</span>
      </div>

      {!isComplete ? (
        <div className="location-evidence-preview is-hidden compact-location-preview">
          <div className="location-evidence-summary-row">
            <strong>Evidence</strong>
          </div>
          <div className="location-evidence-list">
            <span>???</span>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`primary-button location-action-button ${isComplete ? 'is-review' : ''}`}
        onClick={() => openPanel(location.id)}
        disabled={isSearching || (!isComplete && pointsLeft <= 0)}
      >
        {isSearching ? <span className="location-button-spinner" aria-hidden="true" /> : null}
        <span>{isComplete ? 'Review result →' : pointsLeft <= 0 ? 'No actions left' : 'Investigate →'}</span>
      </button>
    </article>
  )
}
