import { Link } from 'react-router-dom'
import type { Location } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { pokemonData } from '../../data/pokemon'
import { TODAY_INVESTIGATION_PATH, TODAY_SUSPECTS_PATH } from '../../paths'
import { InvestigationActionChooser } from './InvestigationActionChooser'

const isPlaceholderWitnessText = (text: string | null | undefined) => (
  text === 'A witness remembered a telling detail.'
)

interface InvestigationLocationPageProps {
  location: Location | null
  pointsLeft: number
  resolvedCount: number
  totalLocations: number
  isSearching: boolean
  witnessPokemonIds?: number[]
  interviewedWitnessPokemonIds?: number[]
  chooseAction: (locationId: string, actionId: string, witnessPokemonId?: number) => void
}

export function InvestigationLocationPage({
  location,
  pointsLeft,
  resolvedCount,
  totalLocations,
  isSearching,
  witnessPokemonIds = [],
  interviewedWitnessPokemonIds = [],
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
    ? (isPlaceholderWitnessText(location.evidenceText) ? selectedAction?.evidenceTitle : location.evidenceTitle) ?? selectedAction?.evidenceTitle
    : 'No Useful Evidence'
  const evidenceText = hasEvidence
    ? (isPlaceholderWitnessText(location.evidenceText) ? selectedAction?.evidenceText : location.evidenceText) ?? selectedAction?.evidenceText
    : (location.observationText ?? selectedAction?.observationText)
  const evidenceIcon = hasEvidence ? getEvidenceIcon(location.evidenceId, evidenceTitle) : null
  const witnessPokemon = location.witnessPokemonId
    ? pokemonData.find((pokemon) => pokemon.id === location.witnessPokemonId)
    : null

  return (
    <section className="notebook-card active-investigation-panel investigation-location-page">
      {!location.investigated ? (
        <div className="active-investigation-location">
          <span className="location-icon" aria-hidden="true">
            {location.icon}
          </span>
          <div className="location-heading-copy">
            <h2 className="location-name">{location.name}</h2>
            <p className="location-description">{location.teaserText ?? 'Choose how to investigate this location.'}</p>
          </div>
          <span className="location-status-stamp is-idle">
            {statusLabel}
          </span>
        </div>
      ) : null}

      {!location.investigated ? (
        pointsLeft > 0 ? (
          <>
            <InvestigationActionChooser
              actions={location.actions}
              witnessPokemonIds={witnessPokemonIds}
              interviewedWitnessPokemonIds={interviewedWitnessPokemonIds}
              chooseAction={(actionId, witnessPokemonId) => chooseAction(location.id, actionId, witnessPokemonId)}
              disabled={isSearching}
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
              <h3>Nothing useful here</h3>
              <div className="no-evidence-copy">
                <p>The area appears undisturbed.</p>
                <p>This location can be ruled out.</p>
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
