import type { InvestigationLeadKind, LeadPaperStyle, LeadVisualType, LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'
import { LeadVisualIcon } from './leadVisualIcons'

const leadKindLabels: Record<InvestigationLeadKind, string> = {
  search: 'Search',
  inspect: 'Inspect',
  question: 'Question',
}

const getWitnessRole = (action: LocationAction, index: number): string => {
  const baseRole = action.presentation.witnessRole ?? 'witness'
  const roles = [baseRole, 'the assistant', 'a passerby']

  return roles[index % roles.length]
}

const getWitnessPrompt = (pokemonName: string, role: string, index: number): string => {
  const prompts = [
    `Ask ${pokemonName} what ${role} saw around the missing item before it disappeared.`,
    `Ask ${pokemonName} what changed during the handoff, cleanup, or closing routine.`,
    `Ask ${pokemonName} who passed through and whether anything sounded or moved strangely.`,
  ]

  return prompts[index % prompts.length]
}

interface EvidenceLeadCardProps {
  visualType: LeadVisualType
  paperStyle: LeadPaperStyle
  label: string
  teaser: string
  clueLabel: string
  onFollow: () => void
  disabled?: boolean
  isFollowed?: boolean
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
}: EvidenceLeadCardProps) {
  return (
    <button
      type="button"
      className={`evidence-lead-card evidence-lead-card--${visualType} evidence-lead-card--paper-${paperStyle} ${isFollowed ? 'is-followed' : ''}`}
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

      <span className="evidence-lead-card__cta">{isFollowed ? 'Complete' : 'Click to investigate'}</span>
    </button>
  )
}

interface InvestigationActionChooserProps {
  actions: LocationAction[]
  interviewedWitnessPokemonIds?: number[]
  chooseAction: (actionId: string, witnessPokemonId?: number) => void
  disabled?: boolean
  noActionsRemaining?: boolean
  followedActionId?: string | null
}

export function InvestigationActionChooser({
  actions,
  interviewedWitnessPokemonIds = [],
  chooseAction,
  disabled = false,
  noActionsRemaining = false,
  followedActionId = null,
}: InvestigationActionChooserProps) {
  const interviewedWitnessIds = new Set(interviewedWitnessPokemonIds)

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
                  className={`lead-option lead-option--${leadKind} ${isFollowed ? 'is-followed' : ''}`}
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
              const witnessRole = getWitnessRole(action, index)

              return (
                <button
                  key={`${action.id}-${pokemon.id}`}
                  type="button"
                  className={`lead-option lead-option--${leadKind} ${isFollowed ? 'is-followed' : ''}`}
                  onClick={() => chooseAction(action.id, pokemon.id)}
                  disabled={disabled || isFollowed}
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
                  <span className="lead-flavor">{getWitnessPrompt(pokemon.name, witnessRole, index)}</span>
                  <span className="lead-option__cta">{isFollowed ? 'Complete' : 'Click to investigate'}</span>
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
              disabled={disabled || isFollowed}
              isFollowed={isFollowed}
            />
          )
        })}
      </div>
    </div>
  )
}
