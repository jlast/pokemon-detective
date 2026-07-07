import type { Case } from '../../game/caseModel'
import { InvestigationLocationCard } from './InvestigationLocationCard'

const getRemainingInvestigationCopy = (remainingActions: number) => {
  if (remainingActions <= 0) {
    return 'No investigations left.'
  }

  if (remainingActions === 1) {
    return 'Final investigation.'
  }

  if (remainingActions === 2) {
    return 'Two investigations remain.'
  }

  if (remainingActions === 3) {
    return 'The case is taking shape.'
  }

  if (remainingActions === 4) {
    return 'Plenty of time left.'
  }

  return 'Full budget available.'
}

const getCurrentTheoryCopy = (evidenceCount: number, remainingActions: number) => {
  if (remainingActions <= 0) {
    return 'Investigation is over. Make your call.'
  }

  if (evidenceCount === 0) {
    return 'No suspect stands out yet.'
  }

  if (evidenceCount === 1) {
    return 'One clue has surfaced.'
  }

  if (evidenceCount === 2) {
    return 'A pattern may be forming.'
  }

  if (evidenceCount === 3) {
    return 'Several leads point in the same direction.'
  }

  if (evidenceCount === 4) {
    return 'You may be ready to inspect suspect files.'
  }

  return 'The case is ready for a final accusation.'
}

export function LocationsPanel({
  currentCase,
  isEvidenceTab,
  openLocation,
}: {
  currentCase: Case
  isEvidenceTab: boolean
  openLocation: (locationId: string) => void
}) {
  const investigatedCount = currentCase.locations.filter((location) => location.investigated).length
  const evidenceCollectedCount = currentCase.evidence.filter((evidenceItem) => evidenceItem.discovered).length
  const discoveredEvidence = currentCase.evidence.filter((evidenceItem) => evidenceItem.discovered)
  const actionsUsed = investigatedCount
  const maxInvestigations = currentCase.maxInvestigations
  const pointsLeft = Math.max(maxInvestigations - actionsUsed, 0)
  const remainingCopy = getRemainingInvestigationCopy(pointsLeft)
  const currentTheoryCopy = getCurrentTheoryCopy(evidenceCollectedCount, pointsLeft)

  return (
    <section
      className={`notebook-card evidence-board mobile-section ${isEvidenceTab ? 'is-active' : ''}`}
    >
      <div className="investigation-board-heading">
        <div>
          <h2>Investigation Board</h2>
          <p className="investigation-board-subtitle">Each location may reveal valuable evidence.</p>
        </div>
      </div>

      <div className="detective-desk-shell">
        <div className="detective-desk-tab">Detective Desk</div>
        <section className="detective-desk notebook-card">
          <div className="detective-desk-grid">
            <section className="detective-desk-section">
              <strong>Investigation Budget</strong>

              <div className="investigation-token-row" aria-hidden="true">
                {Array.from({ length: maxInvestigations }, (_, index) => (
                  <span
                    key={index}
                    className={`investigation-token ${index < pointsLeft ? 'is-available' : 'is-spent'}`}
                  />
                ))}
              </div>

              <p className="detective-desk-copy">{remainingCopy}</p>
              <p className="detective-desk-meta">Actions used: {actionsUsed} / {maxInvestigations}</p>
              <p className="detective-desk-meta">Locations resolved: {investigatedCount} / {currentCase.locations.length}</p>
            </section>

            <section className="detective-desk-section detective-desk-evidence-board">
              <strong>Evidence Board</strong>

              {discoveredEvidence.length > 0 ? (
                <>
                  <div className="detective-desk-evidence-tags">
                    {discoveredEvidence.map((evidenceItem) => (
                      <span key={evidenceItem.id} className="detective-desk-evidence-tag">
                        <span aria-hidden="true">📎</span>
                        <span>{evidenceItem.title}</span>
                      </span>
                    ))}
                  </div>
                  <p className="detective-desk-meta">
                    {evidenceCollectedCount} {evidenceCollectedCount === 1 ? 'clue' : 'clues'} collected
                  </p>
                </>
              ) : (
                <div className="detective-desk-empty-state">
                  <p className="detective-desk-copy">No clues yet.</p>
                  <p className="detective-desk-meta">Search a location.</p>
                </div>
              )}
            </section>

            <section className="detective-desk-section">
              <strong>Current Theory</strong>
              <p className="detective-desk-meta">Detective note</p>
              <p className="detective-desk-copy">{currentTheoryCopy}</p>
              <p className="detective-desk-meta">Every action costs time. Choose carefully.</p>
            </section>
          </div>
        </section>
      </div>

      <div className="locations-grid">
        {currentCase.locations.map((location) => (
          <InvestigationLocationCard
            key={location.id}
            location={location}
            isActiveLocation={false}
            isSearching={false}
            isNewEvidence={false}
            pointsLeft={pointsLeft}
            openPanel={openLocation}
          />
        ))}
      </div>

    </section>
  )
}
