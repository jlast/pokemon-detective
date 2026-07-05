import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { InvestigationActionChooser } from './InvestigationActionChooser'

interface InvestigationLocationPageProps {
  location: Location | null
  pointsLeft: number
  isSearching: boolean
  chooseAction: (locationId: string, actionId: string) => void
}

export function InvestigationLocationPage({
  location,
  pointsLeft,
  isSearching,
  chooseAction,
}: InvestigationLocationPageProps) {
  if (!location) {
    return (
      <section className="notebook-card active-investigation-panel">
        <Link to="/investigation" className="subtle-link suspect-file-back-link">
          ← Back to Investigation Board
        </Link>
        <div className="inspect-item">
          <strong>Location not found</strong>
          <p className="overview-section-hook">This investigation lead could not be opened.</p>
          <Link to="/investigation" className="secondary-button suspect-file-back-button">
            Back to Investigation Board
          </Link>
        </div>
      </section>
    )
  }

  const selectedAction = location.actions.find((action) => action.id === location.selectedActionId) ?? null
  const statusLabel = location.investigated ? 'Complete' : 'Not searched'
  const hasEvidence =
    selectedAction?.outcomeType === 'evidence' || selectedAction?.outcomeType === 'witness'
  const detectiveNote = selectedAction
    ? hasEvidence
      ? selectedAction.implicationText ?? 'The new clue should be compared against the suspect files.'
      : 'This lead does not narrow the suspect list.'
    : null

  return (
    <section className="notebook-card active-investigation-panel investigation-location-page">
      <Link to="/investigation" className="subtle-link suspect-file-back-link">
        ← Back to Investigation Board
      </Link>

      <div className="active-investigation-location">
        <span className="location-icon" aria-hidden="true">
          {location.icon}
        </span>
        <div className="location-heading-copy">
          <h2 className="location-name">{location.name}</h2>
          <p className="location-description">{location.teaserText ?? 'Choose how to investigate this location.'}</p>
        </div>
        <span className={`location-status-stamp ${location.investigated ? 'is-complete' : 'is-idle'}`}>
          {statusLabel}
        </span>
      </div>

      {!location.investigated ? (
        pointsLeft > 0 ? (
          <>
            <InvestigationActionChooser
              actions={location.actions}
              chooseAction={(actionId) => chooseAction(location.id, actionId)}
            />
            {isSearching ? <div className="active-investigation-resolving">Following lead...</div> : null}
          </>
        ) : (
          <div className="inspect-item">
            <strong>No investigation points left.</strong>
            <p className="overview-section-hook">Review your evidence or inspect suspects.</p>
            <Link to="/investigation" className="secondary-button suspect-file-back-button">
              Back to Investigation Board
            </Link>
          </div>
        )
      ) : selectedAction ? (
        <>
          <section className="investigation-report">
            <div className="investigation-report-section">
              <strong>Investigation complete</strong>
            </div>

            <div className="investigation-report-divider" aria-hidden="true" />

            <div className="investigation-report-section investigation-report-finding">
              <strong>Finding</strong>
              {hasEvidence ? (
                <>
                  <p className="investigation-report-evidence-title">📎 {selectedAction.evidenceTitle}</p>
                  <p>{selectedAction.evidenceText}</p>
                </>
              ) : (
                <>
                  <p className="investigation-report-evidence-title">No useful evidence was recovered.</p>
                  <p>{selectedAction.observationText}</p>
                </>
              )}
            </div>

            <div className="investigation-report-divider" aria-hidden="true" />

            <div className="investigation-report-section investigation-report-notes">
              <strong>Detective&apos;s Notes</strong>
              <p>{detectiveNote}</p>
            </div>

            <div className="investigation-report-divider" aria-hidden="true" />

            <div className="investigation-report-section">
              <strong>Evidence Board</strong>
              <p>{hasEvidence ? `✓ ${selectedAction.evidenceTitle} added` : 'No new evidence added.'}</p>
            </div>
          </section>

          <div className="investigation-location-actions">
            <Link to="/investigation" className="secondary-button suspect-file-back-button">
              Back to Board
            </Link>
            <Link to="/suspects" className="primary-button suspect-file-back-button">
              Inspect Suspects
            </Link>
          </div>
        </>
      ) : null}
    </section>
  )
}
