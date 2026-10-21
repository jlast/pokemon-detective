import { getClueCollectionKey, type LeadPaperStyle, type LeadVisualType, type LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'
import { MugShot } from '../Suspects/MugShot'
import { getCluePresentation } from './cluePresentation'

interface EvidenceLeadCardProps {
  visualType: LeadVisualType
  paperStyle: LeadPaperStyle
  clueLabel: string
  sprite: string
  flavor: string
  clueSubtitle?: string
  onFollow: () => void
  disabled?: boolean
  isFollowed?: boolean
  isAlreadyCollected?: boolean
}

function EvidenceLeadCard({
  visualType,
  paperStyle,
  clueLabel,
  sprite,
  flavor,
  clueSubtitle,
  onFollow,
  disabled = false,
  isFollowed = false,
  isAlreadyCollected = false,
}: EvidenceLeadCardProps) {
  const statusText = isAlreadyCollected ? 'Known clue' : isFollowed ? 'Collected' : 'Investigate →'

  return (
    <button
      type="button"
      className={`evidence-lead-card evidence-lead-card--${visualType} evidence-lead-card--paper-${paperStyle} ${isFollowed ? 'is-followed' : ''} ${isAlreadyCollected ? 'is-already-collected' : ''}`}
      onClick={onFollow}
      disabled={disabled}
    >
      <div className="evidence-lead-card__visual clue-sprite-stage" aria-hidden="true">
        <img className="clue-item-sprite" src={`/clue-sprites/${sprite}.png`} alt="" width="72" height="72" />
      </div>

      <div className="evidence-lead-card__content">
        <strong className="clue-choice-title">{clueLabel}</strong>
        {clueSubtitle ? <span className="evidence-lead-card__subtitle">{clueSubtitle}</span> : null}
        <p className="clue-choice-flavor">{flavor}</p>
      </div>

      <span className="evidence-lead-card__cta">{statusText}</span>
    </button>
  )
}

interface InvestigationActionChooserProps {
  actions: LocationAction[]
  interviewedWitnessPokemonIds?: number[]
  chooseAction: (actionId: string, witnessPokemonId?: number) => void
  collectedEvidenceIds?: string[]
  collectedClueLabels?: string[]
  disabled?: boolean
  noActionsRemaining?: boolean
  followedActionId?: string | null
}

export function InvestigationActionChooser({
  actions,
  interviewedWitnessPokemonIds = [],
  chooseAction,
  collectedEvidenceIds = [],
  collectedClueLabels = [],
  disabled = false,
  noActionsRemaining = false,
  followedActionId = null,
}: InvestigationActionChooserProps) {
  const interviewedWitnessIds = new Set(interviewedWitnessPokemonIds)
  const collectedEvidenceIdSet = new Set(collectedEvidenceIds)
  const collectedClueLabelSet = new Set(collectedClueLabels)

  return (
    <div className="investigation-action-chooser">
      <div className="investigation-action-header">
        <h3>Which clue will you follow?</h3>
        {noActionsRemaining ? <p className="investigation-action-hint">No actions remaining.</p> : null}
      </div>
      <div className="location-leads">
        {actions.map((action) => {
          const { presentation } = action
          const leadKind = presentation.kind
          const cluePreview = action.cluePreview
          const cardPresentation = getCluePresentation(action)
          const isFollowed = action.id === followedActionId
          const clueCollectionKey = getClueCollectionKey(action)
          const isAlreadyCollected = Boolean(
            collectedClueLabelSet.has(clueCollectionKey)
            || (action.evidenceId && collectedEvidenceIdSet.has(action.evidenceId) && !cluePreview.subtitle && cluePreview.label !== 'Region clue'),
          )
          const witnessPokemon = leadKind === 'question'
            ? (action.witnessPokemonIds ?? [])
                .filter((id) => !interviewedWitnessIds.has(id))
                .map((id) => pokemonData.find((pokemon) => pokemon.id === id))
                .filter((pokemon): pokemon is Pokemon => Boolean(pokemon))
            : []

          if (leadKind === 'question') {
            if (witnessPokemon.length === 0) {
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`lead-option lead-option--${leadKind} ${isFollowed ? 'is-followed' : ''} ${isAlreadyCollected ? 'is-already-collected' : ''}`}
                  disabled
                >
                  <strong className="clue-choice-title">{cluePreview.label}</strong>
                  {cluePreview.subtitle ? <span className="evidence-lead-card__subtitle">{cluePreview.subtitle}</span> : null}
                  <span className="lead-option__title">No witnesses available</span>
                </button>
              )
            }

            return witnessPokemon.map((pokemon) => {
              return (
                <button
                  key={`${action.id}-${pokemon.id}`}
                  type="button"
                  className={`lead-option lead-option--${leadKind} ${isFollowed ? 'is-followed' : ''} ${isAlreadyCollected ? 'is-already-collected' : ''}`}
                  onClick={() => chooseAction(action.id, pokemon.id)}
                  disabled={disabled || isFollowed || isAlreadyCollected}
                >
                  <span className="lead-option__pokemon-preview" aria-label="Available witness Pokemon">
                    <span className="lead-option__pokemon">
                      <span className="witness-mugshot">
                        <MugShot suspect={{ pokemonId: pokemon.id, name: pokemon.name,
                          sprite: pokemon.sprite, isShiny: false,
                          manuallyRuledOut: false, noteStatus: 'suspect' }} />
                      </span>
                      <span className="clue-sprite-caption">Witness · {pokemon.name}</span>
                    </span>
                  </span>
                  <strong className="clue-choice-title">{cluePreview.label}</strong>
                  {cluePreview.subtitle ? <span className="evidence-lead-card__subtitle">{cluePreview.subtitle}</span> : null}
                  <span className="clue-choice-flavor">{cardPresentation.flavor}</span>
                  <span className="lead-option__cta">{isAlreadyCollected ? 'Known clue' : isFollowed ? 'Collected' : 'Investigate →'}</span>
                </button>
              )
            })
          }

          return (
            <EvidenceLeadCard
              key={action.id}
              visualType={presentation.visualType}
              paperStyle={presentation.paperStyle}
              clueSubtitle={cluePreview.subtitle}
              clueLabel={cluePreview.label}
              sprite={cardPresentation.sprite}
              flavor={cardPresentation.flavor}
              onFollow={() => chooseAction(action.id)}
              disabled={disabled || isFollowed || isAlreadyCollected}
              isFollowed={isFollowed}
              isAlreadyCollected={isAlreadyCollected}
            />
          )
        })}
      </div>
    </div>
  )
}
