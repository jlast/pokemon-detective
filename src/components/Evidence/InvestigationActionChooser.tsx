import type { LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'

const leadTypeIcons: Record<LocationAction['leadType'], string> = {
  careful: '🔍',
  thorough: '⛺',
  quick: '📸',
  risky: '⚠️',
  uncertain: '🗣️',
  obvious: '🕵️',
}

const leadTypeLabels: Record<LocationAction['leadType'], string> = {
  careful: 'Careful',
  thorough: 'Thorough',
  quick: 'Quick',
  risky: 'Risky',
  uncertain: 'Uncertain',
  obvious: 'Obvious',
}

interface InvestigationActionChooserProps {
  actions: LocationAction[]
  witnessPokemonIds?: number[]
  interviewedWitnessPokemonIds?: number[]
  chooseAction: (actionId: string, witnessPokemonId?: number) => void
  disabled?: boolean
}

export function InvestigationActionChooser({
  actions,
  witnessPokemonIds = [],
  interviewedWitnessPokemonIds = [],
  chooseAction,
  disabled = false,
}: InvestigationActionChooserProps) {
  const interviewedWitnessIds = new Set(interviewedWitnessPokemonIds)
  const witnessPokemon = witnessPokemonIds
    .filter((id) => !interviewedWitnessIds.has(id))
    .map((id) => pokemonData.find((pokemon) => pokemon.id === id))
    .filter((pokemon): pokemon is Pokemon => Boolean(pokemon))

  return (
    <div className="investigation-action-chooser">
      <div className="investigation-action-header">
        <strong>Available leads</strong>
        <p className="investigation-action-hint">Choose carefully. This spends 1 action.</p>
      </div>
      <div className="investigation-action-list">
        {actions.map((action) => {
          if (action.outcomeType === 'witness' && witnessPokemon.length > 0) {
            return (
              <div key={action.id} className="investigation-action-option investigation-action-option--witness">
                <div className="investigation-action-meta">
                  <span className="investigation-action-icon" aria-hidden="true">
                    {leadTypeIcons[action.leadType]}
                  </span>
                  <span className="investigation-action-tag">{leadTypeLabels[action.leadType]}</span>
                </div>
                <span className="investigation-action-label">{action.label}</span>
                <span className="investigation-action-description">{action.description}</span>
                <div className="witness-pokemon-options" aria-label="Choose witness Pokemon">
                  {witnessPokemon.map((pokemon) => (
                    <button
                      key={pokemon.id}
                      type="button"
                      className="witness-pokemon-option"
                      onClick={() => chooseAction(action.id, pokemon.id)}
                      disabled={disabled}
                    >
                      <img src={pokemon.sprite} alt="" className="witness-pokemon-sprite" />
                      <span>{pokemon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <button
              key={action.id}
              type="button"
              className="investigation-action-option"
              onClick={() => chooseAction(action.id)}
              disabled={disabled}
            >
              <div className="investigation-action-meta">
                <span className="investigation-action-icon" aria-hidden="true">
                  {leadTypeIcons[action.leadType]}
                </span>
                <span className="investigation-action-tag">{leadTypeLabels[action.leadType]}</span>
              </div>
              <span className="investigation-action-label">{action.label}</span>
              <span className="investigation-action-description">{action.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
