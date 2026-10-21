import type { Location, LocationCardVariant } from '../../game/caseModel'
import { EvidenceBadgeList } from './EvidenceBadge'
import type { LocationSceneId } from './locationArtworkSelection'
import { WitnessLineup } from './WitnessLineup'
import { LocationArtwork } from './LocationArtwork'

interface InvestigationLocationCardProps {
  location: Location
  isActiveLocation: boolean
  isSearching: boolean
  isNewEvidence: boolean
  pointsLeft: number
  openPanel: (locationId: string) => void
  variant: LocationCardVariant
  evidenceNumber: number
  witnessPokemonIds?: number[]
  artworkScene?: LocationSceneId
  style?: React.CSSProperties
}

const getStableFallbackTilt = (locationId: string) => {
  const hash = [...locationId].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return ((hash % 41) - 20) / 10
}

export function InvestigationLocationCard({
  location,
  isActiveLocation,
  isSearching,
  isNewEvidence,
  pointsLeft,
  openPanel,
  variant,
  evidenceNumber,
  style,
  artworkScene,
  witnessPokemonIds = [],
}: InvestigationLocationCardProps) {
  const isWitnessLocation = /witness/i.test(location.name)
    || (location.actions.length > 0 && location.actions.every(action => action.presentation.kind === 'question'))
  const witnessIds = isWitnessLocation ? [...new Set([
    ...witnessPokemonIds, ...location.actions.flatMap(action => action.witnessPokemonIds ?? []),
  ])] : []
  const artwork = witnessIds.length > 0
    ? <WitnessLineup pokemonIds={witnessIds} />
    : <LocationArtwork name={location.name} context={location.id} scene={artworkScene} />
  const isComplete = location.investigated
  const statusLabel = isSearching
    ? 'Following lead...'
    : isComplete
      ? 'Evidence pinned'
      : pointsLeft <= 0
        ? 'Locked'
        : 'Not searched'

  const tiltAngle = location.cardTiltDegrees ?? getStableFallbackTilt(location.id)

  const actionable = !isSearching && !(!isComplete && pointsLeft <= 0)
  const isActionAvailable = actionable && !isComplete

  const variantClassName = `investigation-location-card--${variant}`
  const paperToneClassName = `investigation-location-card--tone-${evidenceNumber % 3}`
  const selectedAction = location.actions.find(action => action.id === location.selectedActionId)
  const clueLabel = selectedAction?.cluePreview.label ?? location.evidenceTitle
  const clueValue = location.evidenceBadges?.map(badge => {
    const separator = badge.text.indexOf(':')
    return separator >= 0 ? badge.text.slice(separator + 1).trim() : badge.text
  }).join(' / ')

  return (
    <article
      id={`board-location-${location.id}`}
      className={`investigation-location-card ${variantClassName} ${witnessIds.length ? 'investigation-location-card--witnesses' : ''} ${paperToneClassName} ${isActionAvailable ? 'is-action-available' : ''} ${isComplete ? 'is-complete' : ''} ${isNewEvidence ? 'is-new-evidence' : ''} ${pointsLeft <= 0 && !isComplete ? 'is-disabled' : ''} ${isActiveLocation ? 'is-active-location' : ''}`}
      style={{ ...style, '--tilt': `${tiltAngle}deg` } as React.CSSProperties}
      onClick={() => actionable && openPanel(location.id)}
      onKeyDown={(e) => { if (actionable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPanel(location.id) } }}
      role="button"
      tabIndex={actionable ? 0 : -1}
      aria-label={isComplete ? `Review clue from ${location.name}: ${clueValue ?? clueLabel ?? 'Investigation notes'}` : `Investigate ${location.name}`}
    >
      <span className="pin-location-dot" aria-hidden="true" />
      <span className="sr-only">{statusLabel}</span>
      <div className="location-document location-document--compact">
        {isComplete ? (
          <>
            <span className="pinned-clue__source">{location.name}</span>
            {artwork}
            <span className="pinned-clue__category">{clueLabel ?? 'Investigation notes'}</span>
            {selectedAction?.cluePreview.subtitle ? <span className="pinned-clue__subtitle">{selectedAction.cluePreview.subtitle}</span> : null}
            <EvidenceBadgeList badges={location.evidenceBadges} clueType={selectedAction?.clueRule?.axis}
              className="pinned-clue__badges" fallback={location.evidenceTitle} />
            {isNewEvidence ? <span className="pinned-clue__new">Just pinned</span> : null}
          </>
        ) : (
          <>
            {artwork}
            <h3 className="location-document__title">{location.name}</h3>
            <span className="location-document__status" aria-hidden="true">{pointsLeft <= 0 ? 'Locked' : 'Open'}</span>
          </>
        )}
      </div>
      {!isComplete ? <button
        type="button"
        className="pin-location-button"
        onClick={(e) => { e.stopPropagation(); openPanel(location.id) }}
        disabled={isSearching || (!isComplete && pointsLeft <= 0)}
      >
        {isSearching ? 'Following lead…' : pointsLeft <= 0 ? 'Locked' : 'Investigate →'}
      </button> : null}
    </article>
  )
}
