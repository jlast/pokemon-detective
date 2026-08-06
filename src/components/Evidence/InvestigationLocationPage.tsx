import { Link, useLocation } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { getLocationIcon } from '../../game/locationIcons'
import { pokemonData } from '../../data/pokemon'
import { TODAY_INVESTIGATION_PATH, TODAY_SUSPECTS_PATH } from '../../paths'
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
  const routeLocation = useLocation()
  const withSearch = (path: string) => `${path}${routeLocation.search}`

  if (!location) {
    return (
      <section className="notebook-card active-investigation-panel">
        <div className="inspect-item">
          <strong>Location not found</strong>
          <p className="overview-section-hook">This investigation lead could not be opened.</p>
          <Link to={withSearch(TODAY_INVESTIGATION_PATH)} className="secondary-button suspect-file-back-button">
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
    : 'Lead Reviewed'
  const evidenceText = hasEvidence
    ? selectedAction?.evidenceText ?? location.evidenceText
    : (location.observationText ?? selectedAction?.observationText)
  const evidenceBadges = hasEvidence
    ? selectedAction?.evidenceBadges ?? location.evidenceBadges
    : null
  const primaryEvidenceBadgeText = evidenceBadges?.[0]?.text ?? evidenceTitle ?? 'Evidence'
  const primaryEvidenceBadgeSeparator = primaryEvidenceBadgeText.indexOf(':')
  const evidenceCategory = primaryEvidenceBadgeSeparator > 0
    ? primaryEvidenceBadgeText.slice(0, primaryEvidenceBadgeSeparator)
    : 'Evidence'
  const evidenceValue = primaryEvidenceBadgeSeparator > 0
    ? primaryEvidenceBadgeText.slice(primaryEvidenceBadgeSeparator + 1).trim()
    : primaryEvidenceBadgeText
  const evidenceIcon = hasEvidence ? getEvidenceIcon(location.evidenceId, evidenceTitle) : null
  const locationIcon = getLocationIcon(location.name, location.icon)
  const compactTeaserText = getCompactTeaserText(location)
  const witnessPokemon = location.witnessPokemonId
    ? pokemonData.find((pokemon) => pokemon.id === location.witnessPokemonId)
    : null
  const resultActions = !hasEvidence ? (
    <Link to={withSearch(TODAY_INVESTIGATION_PATH)} className="primary-button suspect-file-back-button">
      Continue Investigation →
    </Link>
  ) : allLocationsInvestigated ? (
    <>
      <Link to={withSearch(TODAY_SUSPECTS_PATH)} className="primary-button suspect-file-back-button">
        Review Suspects →
      </Link>
      <Link to={withSearch(TODAY_INVESTIGATION_PATH)} className="secondary-button suspect-file-back-button">
        Back to Investigation Board
      </Link>
    </>
  ) : (
    <>
      <Link to={withSearch(TODAY_INVESTIGATION_PATH)} className="primary-button suspect-file-back-button">
        Continue Investigation →
      </Link>
      <Link to={withSearch(TODAY_SUSPECTS_PATH)} className="secondary-button suspect-file-back-button">
        Review Evidence
      </Link>
    </>
  )

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
                <span className="result-complete-check" aria-hidden="true">✓</span>
                <div>
                  <h3>{location.name}</h3>
                  <p>Completed</p>
                </div>
              </div>

              <section className="evidence-hero">
                <div className="evidence-hero-visual">
                  <div className="evidence-hero-icon" aria-hidden="true">
                    {evidenceIcon}
                  </div>
                  <span className="result-status-pill">New evidence</span>
                </div>
                <div className="evidence-hero-copy">
                  <span className="evidence-category-badge">{evidenceCategory}</span>
                  <h3>{evidenceValue}</h3>
                  <p>{evidenceText}</p>
                  {witnessPokemon ? (
                    <p className="result-witness-confirmation">Witness interviewed: {witnessPokemon.name}</p>
                  ) : null}
                  <p className="result-save-confirmation"><span aria-hidden="true">✓</span> Added to evidence board</p>
                </div>
              </section>

              <div className="result-actions">
                {resultActions}
              </div>
            </section>
          ) : (
            <section className="no-evidence-result-card">
              <p className="no-evidence-location">✓ {location.name} investigated</p>
              <h3>Lead reviewed</h3>
              <div className="no-evidence-copy">
                <p>{evidenceText ?? 'This lead did not produce a primary clue.'}</p>
                <p>Your notes have been updated for this investigation path.</p>
              </div>
            </section>
          )}

          {!hasEvidence ? <div className="result-actions">{resultActions}</div> : null}
        </>
      ) : null}
    </section>
  )
}
