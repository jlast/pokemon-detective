import type { InvestigationLeadKind, LeadPaperStyle, LeadVisualType, LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'
import { LeadVisualIcon } from './leadVisualIcons'

const leadKindLabels: Record<InvestigationLeadKind, string> = {
  search: 'Search',
  inspect: 'Inspect',
  question: 'Question',
}

const fillWitnessPrompt = (template: string, pokemonName: string, witnessRole: string): string => (
  template
    .replaceAll('{pokemonName}', pokemonName)
    .replaceAll('{witnessRole}', witnessRole)
)

interface EvidenceLeadCardProps {
  visualType: LeadVisualType
  paperStyle: LeadPaperStyle
  label: string
  teaser: string
  clueLabel: string
  onFollow: () => void
  disabled?: boolean
  isFollowed?: boolean
  isAlreadyCollected?: boolean
}

function EvidenceLeadCard({
  visualType,
  paperStyle,
  label,
  teaser,
  clueLabel,
  onFollow,
  disabled = false,
  isFollowed = false,
  isAlreadyCollected = false,
}: EvidenceLeadCardProps) {
  const statusText = isAlreadyCollected ? 'You already know this clue' : isFollowed ? 'Complete' : 'Click to investigate'

  return (
    <button
      type="button"
      className={`evidence-lead-card evidence-lead-card--${visualType} evidence-lead-card--paper-${paperStyle} ${isFollowed ? 'is-followed' : ''} ${isAlreadyCollected ? 'is-already-collected' : ''}`}
      onClick={onFollow}
      disabled={disabled}
    >
      <div className="evidence-lead-card__visual" aria-hidden="true">
        <LeadVisualIcon visualType={visualType} />
      </div>

      <div className="evidence-lead-card__content">
        <span className="evidence-lead-card__label">{label}</span>
        <span className="lead-value-pill">
          <strong>{clueLabel}</strong>
        </span>
        <p className="lead-flavor">{teaser}</p>
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
        <h3>Which lead will you follow?</h3>
        {noActionsRemaining ? <p className="investigation-action-hint">No actions remaining.</p> : null}
      </div>
      <div className="location-leads">
        {actions.map((action) => {
          const { presentation } = action
          const leadKind = presentation.kind
          const cluePreview = action.cluePreview
          const isFollowed = action.id === followedActionId
          const isAlreadyCollected = Boolean(
            (action.evidenceId && collectedEvidenceIdSet.has(action.evidenceId))
            || collectedClueLabelSet.has(cluePreview.label),
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
                  <span className="lead-option__type">
                    <span className="lead-option__icon" aria-hidden="true">{presentation.icon}</span>
                    {leadKindLabels[leadKind]}
                  </span>
                  <span className="lead-option__title">No witnesses available</span>
                  <span className="lead-option__description">Every available witness has already been interviewed.</span>
                </button>
              )
            }

            return witnessPokemon.map((pokemon, index) => {
              const witnessRoles = presentation.witnessRoles ?? [presentation.witnessRole ?? 'witness']
              const witnessPromptTemplates = presentation.witnessPromptTemplates ?? [presentation.teaser]
              const witnessRole = witnessRoles[index % witnessRoles.length] ?? 'witness'
              const witnessPromptTemplate = witnessPromptTemplates[index % witnessPromptTemplates.length] ?? presentation.teaser

              return (
                <button
                  key={`${action.id}-${pokemon.id}`}
                  type="button"
                  className={`lead-option lead-option--${leadKind} ${isFollowed ? 'is-followed' : ''} ${isAlreadyCollected ? 'is-already-collected' : ''}`}
                  onClick={() => chooseAction(action.id, pokemon.id)}
                  disabled={disabled || isFollowed || isAlreadyCollected}
                >
                  <span className="lead-option__type">
                    <span className="lead-option__icon" aria-hidden="true">{presentation.icon}</span>
                    {leadKindLabels[leadKind]}
                  </span>
                  <span className="lead-option__title">Question {witnessRole}: {pokemon.name}</span>
                  <span className="lead-value-pill">
                    <strong>{cluePreview.label}</strong>
                  </span>
                  <span className="lead-option__pokemon-preview" aria-label="Available witness Pokemon">
                    <span className="lead-option__pokemon">
                      <span className="lead-option__pokemon-frame">
                        <img src={pokemon.sprite} alt="" className="lead-option__pokemon-sprite" />
                      </span>
                      <span>{pokemon.name}</span>
                    </span>
                  </span>
                  <span className="lead-flavor">{fillWitnessPrompt(witnessPromptTemplate, pokemon.name, witnessRole)}</span>
                  <span className="lead-option__cta">{isAlreadyCollected ? 'You already know this clue' : isFollowed ? 'Complete' : 'Click to investigate'}</span>
                </button>
              )
            })
          }

          return (
            <EvidenceLeadCard
              key={action.id}
              visualType={presentation.visualType}
              paperStyle={presentation.paperStyle}
              label={presentation.displayLabel}
              teaser={presentation.teaser}
              clueLabel={cluePreview.label}
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
