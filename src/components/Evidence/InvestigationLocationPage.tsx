import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { TODAY_INVESTIGATION_PATH, TODAY_SUSPECTS_PATH } from '../../paths'
import { InvestigationActionChooser } from './InvestigationActionChooser'

interface InvestigationLocationPageProps {
  location: Location | null
  pointsLeft: number
  resolvedCount: number
  totalLocations: number
  isSearching: boolean
  chooseAction: (locationId: string, actionId: string) => void
}

export function InvestigationLocationPage({
  location,
  pointsLeft,
  resolvedCount,
  totalLocations,
  isSearching,
  chooseAction,
}: InvestigationLocationPageProps) {
  if (!location) {
    return (
      <section className="notebook-card active-investigation-panel">
        <div className="inspect-item">
          <strong>Location not found</strong>
          <p className="overview-section-hook">This investigation lead could not be opened.</p>
          <Link to={TODAY_INVESTIGATION_PATH} className="secondary-button suspect-file-back-button">
            Back to Investigation Board
          </Link>
        </div>
      </section>
    )
  }

  const selectedAction = location.actions.find((action) => action.id === location.selectedActionId) ?? null
  const statusLabel = location.investigated ? 'Complete' : 'Not searched'
  const hasEvidence = !!location.evidenceId
  const allLocationsInvestigated = resolvedCount >= totalLocations
  const evidenceTitle = hasEvidence ? (location.evidenceTitle ?? selectedAction?.evidenceTitle) : 'No Useful Evidence'
  const evidenceText = hasEvidence
    ? (location.evidenceText ?? selectedAction?.evidenceText)
    : (location.observationText ?? selectedAction?.observationText)
  const evidenceIcon = hasEvidence ? getEvidenceIcon(location.evidenceId, evidenceTitle, '📎') : '🔎'

  return (
    <section className="notebook-card active-investigation-panel investigation-location-page">
      {!location.investigated ? (
        <div className="active-investigation-location">
          <span className="location-icon" aria-hidden="true">
            {location.icon}
          </span>
          <div className="location-heading-copy">
            <h2 className="location-name">{location.name}</h2>
            <p className="location-description">{location.teaserText ?? 'Choose how to investigate this location.'}</p>
          </div>
          <span className="location-status-stamp is-idle">
            {statusLabel}
          </span>
        </div>
      ) : null}

      {!location.investigated ? (
        pointsLeft > 0 ? (
          <>
            <InvestigationActionChooser
              actions={location.actions}
              chooseAction={(actionId) => chooseAction(location.id, actionId)}
              disabled={isSearching}
            />
            {isSearching ? <div className="active-investigation-resolving">Following lead...</div> : null}
          </>
        ) : (
          <div className="inspect-item">
            <strong>No investigation points left.</strong>
            <p className="overview-section-hook">Review your evidence or inspect suspects.</p>
          </div>
        )
      ) : selectedAction ? (
        <>
          <section className="investigation-result-card">
            <div className="result-complete-header">
              <div>
                <h3>✓ {location.name} completed</h3>
                <p>You followed the lead.</p>
              </div>
            </div>

            <section className="evidence-hero">
              <div className="evidence-hero-icon" aria-hidden="true">
                {evidenceIcon}
              </div>
              <div className="evidence-hero-copy">
                <span className="result-status-pill">{hasEvidence ? 'New Evidence' : 'Lead Closed'}</span>
                <h3>{evidenceTitle}</h3>
                <p>{evidenceText}</p>
                <p className="result-save-confirmation">✓ {hasEvidence ? 'Added to Evidence Board' : 'Lead recorded'}</p>
              </div>
            </section>
          </section>

          <div className="result-actions">
            {allLocationsInvestigated ? (
              <>
                <Link to={TODAY_SUSPECTS_PATH} className="primary-button suspect-file-back-button">
                  Review Suspects →
                </Link>
                <Link to={TODAY_INVESTIGATION_PATH} className="secondary-button suspect-file-back-button">
                  Back to Investigation Board
                </Link>
              </>
            ) : (
              <>
                <Link to={TODAY_INVESTIGATION_PATH} className="primary-button suspect-file-back-button">
                  Continue Investigation →
                </Link>
                <Link to={TODAY_INVESTIGATION_PATH} className="secondary-button suspect-file-back-button">
                  Review Evidence
                </Link>
              </>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
