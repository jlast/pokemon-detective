import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { InvestigationActionChooser } from './InvestigationActionChooser'
import { InvestigationResult } from './InvestigationResult'

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
          <section className="selected-suspect-section inspect-item">
            <strong>Investigation result</strong>
            <p className="overview-section-hook">Lead followed: {selectedAction.label}</p>
            <InvestigationResult
              action={selectedAction}
              highlightResult={false}
              isExpanded
              onContinue={() => {}}
              showContinue={false}
            />
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
