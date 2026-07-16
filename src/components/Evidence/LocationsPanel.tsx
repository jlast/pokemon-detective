import { useMemo } from 'react'
import { getDiscoveredEvidence, type Case } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { InvestigationLocationCard, type LocationCardVariant } from './InvestigationLocationCard'

const placeholderSceneImage = '/case-scenes/placeholder.svg'
const locationCardVariants: LocationCardVariant[] = ['detective-note', 'clipboard', 'polaroid', 'evidence-tag', 'map-fragment']

const getPublicAssetUrl = (path: string) => {
  if (/^(https?:)?\/\//.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

const getWorkingTheoryCopy = (evidenceCount: number, remainingActions: number, suspectCount: number) => {
  if (remainingActions <= 0) {
    return 'Final notes are in order. The remaining pattern is ready to test.'
  }
  if (evidenceCount === 0) {
    return 'No clear pattern yet. Continue searching for common clues.'
  }
  if (evidenceCount === 1) {
    return 'One clue marks the first thread. Trace where it leads next.'
  }
  if (evidenceCount === 2) {
    return 'Two clues now point in the same direction. Movement through the scene is taking shape.'
  }
  if (evidenceCount === 3) {
    return 'Several marks begin to agree. The suspect profile is narrowing.'
  }
  if (evidenceCount === 4) {
    return `Only a few suspects still match the notes. Check the remaining ${Math.min(suspectCount, 3)} closely.`
  }
  return 'Evidence points to a narrow path. The final accusation is close.'
}

const getEvidenceBoardCopy = (evidenceCount: number, maxInvestigations: number) => {
  if (evidenceCount <= 0) {
    return 'No evidence pinned.'
  }
  if (evidenceCount >= maxInvestigations) {
    return 'Evidence board complete. Ready for final accusation.'
  }
  if (evidenceCount === 1) {
    return '1 item pinned.'
  }
  if (evidenceCount >= 3) {
    return `${evidenceCount} pieces of evidence pinned. Patterns beginning to emerge.`
  }
  return `${evidenceCount} pieces of evidence pinned.`
}

const createLocationVariantAssignments = (locations: Case['locations']) => {
  const pool = locationCardVariants.flatMap((variant) => [variant, variant])
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5)

  return locations.reduce<Record<string, LocationCardVariant>>((assignments, location, index) => {
    assignments[location.id] = shuffledPool[index % shuffledPool.length]
    return assignments
  }, {})
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
  const workingTheoryCopy = getWorkingTheoryCopy(evidenceCollectedCount, pointsLeft, currentCase.suspects.length)
  const evidenceBoardCopy = getEvidenceBoardCopy(evidenceCollectedCount, maxInvestigations)
  const sceneImage = getPublicAssetUrl(currentCase.sceneImage ?? placeholderSceneImage)
  const sceneImageAlt = currentCase.sceneImageAlt ?? `Scene photo for ${currentCase.title}`
  const locationAssignmentKey = currentCase.locations.map((location) => location.id).join('|')
  const locationVariantAssignments = useMemo(
    () => createLocationVariantAssignments(currentCase.locations),
    [currentCase.id, locationAssignmentKey],
  )

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

        <div className="pinboard-card case-scene-card" style={{ gridArea: 'budget' }}>
          <div className="case-scene-card__pin" aria-hidden="true" />
          <div className="case-scene-card__image-frame">
            <img
              className="case-scene-card__image"
              src={sceneImage}
              alt={sceneImageAlt}
            />
          </div>
          <div className="case-scene-card__caption">
            <strong>Exhibit A</strong>
            <span>{currentCase.title}</span>
          </div>
        </div>

        <div className="pinboard-card evidence-card" style={{ gridArea: 'evidence' }}>
          <strong className="evidence-card-title">Evidence Board</strong>
          {discoveredEvidence.length > 0 ? (
            <ul className="evidence-card-list">
              {discoveredEvidence.slice(0, 5).map((item) => (
                <li key={item.id} className="evidence-card-item">
                  <span aria-hidden="true">{getEvidenceIcon(item.id, item.title, '📎')}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="evidence-card-empty">No confirmed evidence.</p>
          )}
          <p className="pinboard-card-meta">{evidenceBoardCopy}</p>
        </div>

        <div className="pinboard-card theory-card" style={{ gridArea: 'theory' }}>
          <strong className="theory-card-title">Working Theory</strong>
          <p className="theory-card-text">{workingTheoryCopy}</p>
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
              variant={locationVariantAssignments[location.id] ?? locationCardVariants[index % locationCardVariants.length]}
              evidenceNumber={index + 1}
              style={{ gridArea: area }}
            />
          )
        })}
      </div>
    </section>
  )
}
