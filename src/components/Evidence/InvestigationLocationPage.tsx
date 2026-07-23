import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { getLocationIcon } from '../../game/locationIcons'
import { pokemonData } from '../../data/pokemon'
import { TODAY_INVESTIGATION_PATH, TODAY_SUSPECTS_PATH } from '../../paths'
import { EvidenceBadgeList } from './EvidenceBadge'
import { InvestigationActionChooser } from './InvestigationActionChooser'

interface InvestigationLocationPageProps {
  location: Location | null
  pointsLeft: number
  resolvedCount: number
  totalLocations: number
  isSearching: boolean
  interviewedWitnessPokemonIds?: number[]
  collectedEvidenceIds?: string[]
  collectedClueLabels?: string[]
  chooseAction: (locationId: string, actionId: string, witnessPokemonId?: number) => void
}

const getCompactTeaserText = (location: Location) => {
  const teaserText = location.teaserText ?? 'Choose how to investigate this location.'
  const repeatedPrefix = `${location.name} shows signs of `

  if (!teaserText.toLowerCase().startsWith(repeatedPrefix.toLowerCase())) return teaserText

  const shortened = teaserText.slice(repeatedPrefix.length)
  return `Signs of ${shortened}`
}

export function InvestigationLocationPage({
  location,
  pointsLeft,
  resolvedCount,
  totalLocations,
  isSearching,
  interviewedWitnessPokemonIds = [],
  collectedEvidenceIds = [],
  collectedClueLabels = [],
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
  const evidenceTitle = hasEvidence
    ? selectedAction?.evidenceTitle ?? location.evidenceTitle
    : 'No Useful Evidence'
  const evidenceText = hasEvidence
    ? selectedAction?.evidenceText ?? location.evidenceText
    : (location.observationText ?? selectedAction?.observationText)
  const evidenceBadges = hasEvidence
    ? selectedAction?.evidenceBadges ?? location.evidenceBadges
    : null
  const evidenceIcon = hasEvidence ? getEvidenceIcon(location.evidenceId, evidenceTitle) : null
  const locationIcon = getLocationIcon(location.name, location.icon)
  const compactTeaserText = getCompactTeaserText(location)
  const witnessPokemon = location.witnessPokemonId
    ? pokemonData.find((pokemon) => pokemon.id === location.witnessPokemonId)
    : null

  return (
    <section className="notebook-card active-investigation-panel investigation-location-page">
      {!location.investigated ? (
        <div className="active-investigation-location">
          <span className="location-icon" aria-hidden="true">
            {locationIcon}
          </span>
          <div className="location-heading-copy">
            <div className="location-title-row">
              <h2 className="location-name">{location.name}</h2>
              <span className="location-status-stamp is-idle">
                {statusLabel}
              </span>
            </div>
            <p className="location-description">{compactTeaserText}</p>
          </div>
        </div>
      ) : null}

      {!location.investigated ? (
        <>
          <InvestigationActionChooser
            actions={location.actions}
            interviewedWitnessPokemonIds={interviewedWitnessPokemonIds}
            collectedEvidenceIds={collectedEvidenceIds}
            collectedClueLabels={collectedClueLabels}
            chooseAction={(actionId, witnessPokemonId) => chooseAction(location.id, actionId, witnessPokemonId)}
            disabled={isSearching || pointsLeft <= 0}
            noActionsRemaining={pointsLeft <= 0}
            followedActionId={location.selectedActionId}
          />
          {isSearching ? <div className="active-investigation-resolving">Following lead...</div> : null}
        </>
      ) : selectedAction ? (
        <>
          {hasEvidence ? (
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
                  <span className="result-status-pill">New Evidence</span>
                  <h3>{evidenceTitle}</h3>
                  <EvidenceBadgeList badges={evidenceBadges} />
                  <p>{evidenceText}</p>
                  {witnessPokemon ? (
                    <p className="result-save-confirmation">Witness interviewed: {witnessPokemon.name}</p>
                  ) : null}
                  <p className="result-save-confirmation">✓ Added to Evidence Board</p>
                </div>
              </section>
            </section>
          ) : (
            <section className="no-evidence-result-card">
              <p className="no-evidence-location">✓ {location.name} investigated</p>
              <h3>Lead closed</h3>
              <div className="no-evidence-copy">
                <p>{evidenceText ?? 'This lead did not produce a primary clue.'}</p>
                <p>No evidence was pinned, but this route is now ruled out.</p>
              </div>
            </section>
          )}

          <div className="result-actions">
            {!hasEvidence ? (
              <Link to={TODAY_INVESTIGATION_PATH} className="primary-button suspect-file-back-button">
                Continue Investigation →
              </Link>
            ) : allLocationsInvestigated ? (
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
