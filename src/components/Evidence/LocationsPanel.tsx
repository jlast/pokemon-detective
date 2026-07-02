import { useEffect, useState } from 'react'
import type { Case } from '../../game/caseModel'
import { LocationCard } from './LocationCard'

export function LocationsPanel({
  currentCase,
  isEvidenceTab,
  investigateLocation,
  openLocation,
  lastInvestigatedLocationId,
}: {
  currentCase: Case
  isEvidenceTab: boolean
  investigateLocation: (locationId: string) => void
  openLocation: (locationId: string) => void
  lastInvestigatedLocationId: string | null
}) {
  const [searchingLocationId, setSearchingLocationId] = useState<string | null>(null)
  const [highlightedLocationId, setHighlightedLocationId] = useState<string | null>(null)

  const investigatedCount = currentCase.locations.filter((location) => location.investigated).length
  const progressNote =
    investigatedCount === 0
      ? 'No evidence collected yet. Pick a location to start the case.'
      : investigatedCount === 1
        ? 'Evidence is beginning to build.'
        : investigatedCount < currentCase.locations.length
          ? 'Keep searching. The pattern may become clearer.'
          : 'All locations searched. Time to inspect suspects and make your call.'

  useEffect(() => {
    if (!lastInvestigatedLocationId) {
      return
    }

    setHighlightedLocationId(lastInvestigatedLocationId)

    const timeoutId = window.setTimeout(() => {
      setHighlightedLocationId((currentId) =>
        currentId === lastInvestigatedLocationId ? null : currentId,
      )
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [lastInvestigatedLocationId])

  const beginSearch = (locationId: string) => {
    setSearchingLocationId(locationId)

    window.setTimeout(() => {
      setSearchingLocationId((currentId) => (currentId === locationId ? null : currentId))
      investigateLocation(locationId)
    }, 420)
  }

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

      <div className="investigation-board-summary">
        <section className="investigation-progress-card inspect-item">
          <div className="overview-section-copy">
            <strong>Investigation progress</strong>
            <p className="overview-section-hook">
              {investigatedCount} / {currentCase.locations.length} locations searched
            </p>
          </div>

          <div className="investigation-progress-track" aria-hidden="true">
            {currentCase.locations.map((location) => (
              <span key={location.id} className="investigation-progress-step">
                <span className="investigation-progress-icon">{location.icon}</span>
                <span className={`investigation-progress-mark ${location.investigated ? 'is-complete' : ''}`}>
                  {location.investigated ? '✓' : '○'}
                </span>
              </span>
            ))}
          </div>

          <p className="investigation-progress-note">{progressNote}</p>
        </section>

        <section className="investigation-mission-card inspect-item">
          <strong>Mission</strong>
          <div className="investigation-mission-list">
            <span>1. Search locations</span>
            <span>2. Collect evidence</span>
            <span>3. Inspect suspects</span>
            <span>4. Rule out the innocent</span>
            <span>5. Accuse the culprit</span>
          </div>
        </section>
      </div>

      <div className="locations-grid">
        {currentCase.locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isSearching={searchingLocationId === location.id}
            isNewEvidence={highlightedLocationId === location.id}
            investigateLocation={beginSearch}
            openLocation={openLocation}
          />
        ))}
      </div>
    </section>
  )
}
