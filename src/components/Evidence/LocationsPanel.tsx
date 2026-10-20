import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { getDiscoveredEvidence, type Case, type LocationCardVariant } from '../../game/caseModel'
import { getCaseThemeExhibitLabel } from '../../game/caseTheme'
import { InvestigationLocationCard } from './InvestigationLocationCard'

const placeholderSceneImage = '/case-scenes/placeholder.svg'
const locationCardVariants: LocationCardVariant[] = ['detective-note', 'clipboard', 'map-fragment']

const getPublicAssetUrl = (path: string) => {
  if (/^(https?:)?\/\//.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function LocationsPanel({
  currentCase,
  isEvidenceTab,
  openLocation,
  children,
}: {
  currentCase: Case
  isEvidenceTab: boolean
  openLocation: (locationId: string) => void
  children?: ReactNode
}) {
  const routeLocation = useLocation()
  const navigationState = routeLocation.state as { pinnedLocationId?: string; focusLocationId?: string } | null
  const pinnedLocationId = navigationState?.pinnedLocationId
  const focusLocationId = pinnedLocationId ?? navigationState?.focusLocationId
  useEffect(() => {
    if (!focusLocationId) return
    const frame = requestAnimationFrame(() => {
      const note = document.getElementById(`board-location-${focusLocationId}`)
      note?.focus({ preventScroll: true })
      note?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusLocationId])
  const investigatedCount = currentCase.locations.filter((location) => location.investigated).length
  const discoveredEvidence = getDiscoveredEvidence(currentCase)
  const evidenceCollectedCount = discoveredEvidence.length
  const actionsUsed = investigatedCount
  const maxInvestigations = currentCase.maxInvestigations
  const pointsLeft = Math.max(maxInvestigations - actionsUsed, 0)
  const exhibitImage = getPublicAssetUrl(currentCase.theme?.image ?? currentCase.sceneImage ?? placeholderSceneImage)
  const exhibitAlt = currentCase.theme?.alt ?? currentCase.sceneImageAlt ?? `Scene photo for ${currentCase.title}`
  const exhibitLabel = getCaseThemeExhibitLabel(currentCase.theme)
  const exhibitTitle = currentCase.theme?.name ?? currentCase.title

  return (
    <section
      className={`evidence-board evidence-board--pinboard mobile-section ${isEvidenceTab ? 'is-active' : ''}`}
    >
      <p className="sr-only" role="status" aria-live="polite">{pinnedLocationId
        ? `New clue pinned from ${currentCase.locations.find(location => location.id === pinnedLocationId)?.name ?? 'this location'}. Open the note to review your evidence.`
        : ''}</p>
      <div className="investigation-pinboard investigation-pinboard--focused">
        <div className="string-layer" aria-hidden="true">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="string-svg">
            <line x1="15%" y1="5%" x2="85%" y2="20%" stroke="#b8894e" strokeWidth="0.3" opacity="0.3" />
            <line x1="5%" y1="30%" x2="70%" y2="80%" stroke="#b8894e" strokeWidth="0.25" opacity="0.25" />
            <line x1="30%" y1="15%" x2="95%" y2="70%" stroke="#b8894e" strokeWidth="0.2" opacity="0.2" />
            <line x1="50%" y1="5%" x2="20%" y2="90%" stroke="#b8894e" strokeWidth="0.3" opacity="0.2" />
          </svg>
        </div>

        <div className="pinboard-card board-progress-card">
          <span>Evidence {evidenceCollectedCount}</span>
          <span>Locations {investigatedCount} / {currentCase.locations.length}</span>
          <span>Actions {pointsLeft} left</span>
        </div>

        <div className="pinboard-card case-scene-card">
          <div className="case-scene-card__pin" aria-hidden="true" />
          <div className={`case-scene-card__image-frame ${currentCase.theme ? 'case-scene-card__image-frame--sprite' : ''}`}>
            <img
              className="case-scene-card__image"
              src={exhibitImage}
              alt={exhibitAlt}
            />
          </div>
          <div className="case-scene-card__caption">
            <strong>{exhibitLabel}</strong>
            <span>{exhibitTitle}</span>
          </div>
        </div>

        {currentCase.locations.map((location, index) => {
          return (
            <InvestigationLocationCard
              key={location.id}
              location={location}
              isActiveLocation={false}
              isSearching={false}
              isNewEvidence={pinnedLocationId === location.id}
              pointsLeft={pointsLeft}
              openPanel={openLocation}
              variant={location.cardVariant ?? locationCardVariants[index % locationCardVariants.length]}
              evidenceNumber={index + 1}
            />
          )
        })}
      </div>
      {children}
    </section>
  )
}
