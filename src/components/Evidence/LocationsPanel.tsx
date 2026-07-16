import { getDiscoveredEvidence, type Case } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
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
    return 'One piece of evidence found.'
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
  const discoveredEvidence = getDiscoveredEvidence(currentCase)
  const evidenceCollectedCount = discoveredEvidence.length
  const actionsUsed = investigatedCount
  const maxInvestigations = currentCase.maxInvestigations
  const pointsLeft = Math.max(maxInvestigations - actionsUsed, 0)
  const remainingCopy = getRemainingInvestigationCopy(pointsLeft)
  const currentTheoryCopy = getCurrentTheoryCopy(evidenceCollectedCount, pointsLeft)

  return (
    <section
      className={`notebook-card evidence-board mobile-section ${isEvidenceTab ? 'is-active' : ''}`}
    >
      <div className="investigation-pinboard">
        <div className="string-layer" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="string-svg">
            <line x1="15%" y1="5%" x2="85%" y2="20%" stroke="#b8894e" strokeWidth="0.3" opacity="0.3" />
            <line x1="5%" y1="30%" x2="70%" y2="80%" stroke="#b8894e" strokeWidth="0.25" opacity="0.25" />
            <line x1="30%" y1="15%" x2="95%" y2="70%" stroke="#b8894e" strokeWidth="0.2" opacity="0.2" />
            <line x1="50%" y1="5%" x2="20%" y2="90%" stroke="#b8894e" strokeWidth="0.3" opacity="0.2" />
          </svg>
        </div>

        <div className="pinboard-card board-progress-card" style={{ gridArea: 'stats' }}>
          <span>Evidence {evidenceCollectedCount}</span>
          <span>Locations {investigatedCount} / {currentCase.locations.length}</span>
          <span>Actions {pointsLeft} left</span>
        </div>

        <div className="pinboard-card budget-card" style={{ gridArea: 'budget' }}>
          <div className="budget-card-pin" aria-hidden="true" />
          <strong className="budget-card-title">Budget</strong>
          <div className="budget-token-row" aria-hidden="true">
            {Array.from({ length: maxInvestigations }, (_, index) => (
              <span
                key={index}
                className={`budget-token ${index < pointsLeft ? 'is-available' : 'is-spent'}`}
              />
            ))}
          </div>
          <p className="budget-card-text">{remainingCopy}</p>
          <p className="budget-card-meta">{actionsUsed} / {maxInvestigations} used</p>
        </div>

        <div className="pinboard-card evidence-card" style={{ gridArea: 'evidence' }}>
          <strong className="evidence-card-title">Evidence</strong>
          {discoveredEvidence.length > 0 ? (
            <ul className="evidence-card-list">
              {discoveredEvidence.slice(0, 5).map((item) => (
                <li key={item.id} className="evidence-card-item">
                  <span aria-hidden="true">{getEvidenceIcon(item.id, item.title)}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="evidence-card-empty">No evidence collected yet.</p>
          )}
          <p className="budget-card-meta">{evidenceCollectedCount} evidence item{evidenceCollectedCount !== 1 ? 's' : ''} collected</p>
        </div>

        <div className="pinboard-card theory-card" style={{ gridArea: 'theory' }}>
          <div className="theory-card-stack" aria-hidden="true" />
          <strong className="theory-card-title">Current Theory</strong>
          <p className="theory-card-text">{currentTheoryCopy}</p>
        </div>

        {currentCase.locations.map((location, index) => {
          const gridAreas = ['pantry', 'kitchen', 'storage', 'photo', 'counter']
          const area = gridAreas[index] ?? `loc-${index}`
          return (
            <InvestigationLocationCard
              key={location.id}
              location={location}
              isActiveLocation={false}
              isSearching={false}
              isNewEvidence={false}
              pointsLeft={pointsLeft}
              openPanel={openLocation}
              style={{ gridArea: area }}
            />
          )
        })}
      </div>
    </section>
  )
}
