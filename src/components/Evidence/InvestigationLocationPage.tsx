import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { InvestigationActionChooser } from './InvestigationActionChooser'

interface InvestigationLocationPageProps {
  location: Location | null
  pointsLeft: number
  resolvedCount: number
  maxInvestigations: number
  isSearching: boolean
  chooseAction: (locationId: string, actionId: string) => void
}

export function InvestigationLocationPage({
  location,
  pointsLeft,
  resolvedCount,
  maxInvestigations,
  isSearching,
  chooseAction,
}: InvestigationLocationPageProps) {
  if (!location) {
    return (
      <section className="notebook-card active-investigation-panel">
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
  const progressSlots = Array.from({ length: maxInvestigations }, (_, index) => index < resolvedCount)

  return (
    <section className="notebook-card active-investigation-panel investigation-location-page">
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
          </div>
        )
      ) : selectedAction ? (
        <>
          <section className="investigation-result-card">
            <div className="result-location-header">
              <div>
                <h3>{location.name}</h3>
                <p className="result-action-used">Action used: {selectedAction.label}</p>
              </div>
              <div className="result-status-stack">
                <span className="result-status-pill">Investigation complete</span>
                <span className="result-evidence-count">{hasEvidence ? '+1 evidence added' : 'No evidence added'}</span>
              </div>
            </div>

            <section className="evidence-hero">
              <div className="evidence-hero-icon" aria-hidden="true">
                {hasEvidence ? '👣' : '🔎'}
              </div>
              <div className="evidence-hero-copy">
                <p className="eyebrow">New Evidence Discovered</p>
                <h3>{hasEvidence ? selectedAction.evidenceTitle : 'No Useful Evidence'}</h3>
                <p>{hasEvidence ? selectedAction.evidenceText : selectedAction.observationText}</p>
                {hasEvidence ? <span className="result-board-badge">Pinned to evidence board</span> : null}
              </div>
            </section>

            <div className="result-section-grid">
              <section className="result-info-card">
                <strong>Observation</strong>
                <p>{selectedAction.observationText}</p>
              </section>

              <section className="result-info-card deduction-card">
                <strong>Detective&apos;s Deduction</strong>
                <p>{detectiveNote}</p>
              </section>

              <section className="result-info-card board-updated-card">
                <strong>Board Updated</strong>
                {hasEvidence ? (
                  <span className="evidence-chip-new">
                    <span aria-hidden="true">✓ 👣</span>
                    {selectedAction.evidenceTitle}
                    <span className="new-badge">NEW</span>
                  </span>
                ) : (
                  <p>No new evidence was pinned.</p>
                )}
              </section>
            </div>

            <section className="progress-strip">
              <div>
                <strong>Investigation Progress</strong>
                <p>{resolvedCount} / {maxInvestigations} locations resolved</p>
                <p>{pointsLeft} / {maxInvestigations} actions remaining</p>
              </div>
              <div className="progress-dots" aria-hidden="true">
                {progressSlots.map((isUsed, index) => (
                  <span key={index} className={isUsed ? 'is-used' : ''} />
                ))}
              </div>
            </section>
          </section>

          <div className="result-actions">
            <Link to="/suspects" className="primary-button suspect-file-back-button">
              Review Suspects →
            </Link>
            <Link to="/investigation" className="secondary-button suspect-file-back-button">
              ← Continue Investigation
            </Link>
          </div>
        </>
      ) : null}
    </section>
  )
}
