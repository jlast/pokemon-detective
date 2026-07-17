import type { LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'

type LeadType = 'search' | 'inspect' | 'question'

const leadTypeIcons: Record<LeadType, string> = {
  search: '👣',
  inspect: '🔦',
  question: '💬',
}

const leadTypeIconOptions: Record<LeadType, string[]> = {
  search: ['👣', '🔍', '🧭'],
  inspect: ['🔦', '📋', '🗄️'],
  question: ['💬', '🗣️', '👂'],
}

const leadTypeLabels: Record<LeadType, string> = {
  search: 'Search',
  inspect: 'Inspect',
  question: 'Question',
}

const getLeadType = (action: LocationAction): LeadType => {
  if (action.outcomeType === 'witness') return 'question'
  if (/search|track|trail|trace|mark|floor|dropped/i.test(`${action.label} ${action.description}`)) return 'search'
  return 'inspect'
}

const getBaseLeadTitle = (action: LocationAction, leadType: LeadType): string => {
  if (action.id === 'crumbs') return 'Search the floor'
  if (action.id === 'tents') return 'Inspect the surroundings'
  if (action.id === 'search-branches') return 'Inspect high surfaces'
  if (action.id === 'search-bedding') return 'Search nearby hiding spots'
  if (action.id === 'check-table') return 'Inspect the nearby surface'
  if (action.id === 'photograph-tracks') return 'Document the marks'
  if (leadType === 'question') return action.label.replace(/^Interview /i, 'Question ')
  return action.label
}

const normalizeTitle = (title: string): string => title.trim().toLowerCase()

const getLeadTitles = (actions: LocationAction[]) => {
  const baseTitles = actions.map((action) => getBaseLeadTitle(action, getLeadType(action)))
  const titleCounts = baseTitles.reduce<Record<string, number>>((counts, title) => {
    const key = normalizeTitle(title)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
  const usedTitles = new Set<string>()

  return new Map(actions.map((action, index) => {
    const baseTitle = baseTitles[index]
    const baseKey = normalizeTitle(baseTitle)
    let title = baseTitle

    if (titleCounts[baseKey] > 1) {
      const labelKey = normalizeTitle(action.label)
      title = labelKey && !usedTitles.has(labelKey) ? action.label : `${baseTitle} ${index + 1}`
    }

    usedTitles.add(normalizeTitle(title))
    return [action.id, title]
  }))
}

const getLeadDescription = (action: LocationAction, leadType: LeadType): string => {
  if (action.id === 'crumbs') return 'Fresh scuff marks may show where they moved.'
  if (action.id === 'tents') return 'The quieter edges may reveal what was missed.'
  if (action.id === 'inspect-lid') return 'The forced edge may reveal how it was opened.'
  if (action.id === 'check-table') return 'The nearby surface may still hold a useful trace.'
  if (action.id === 'check-roots') return 'Disturbed ground may show where someone paused.'
  if (action.id === 'search-branches') return 'High surfaces may show what was touched or avoided.'
  if (action.id === 'listen-quietly') return 'A quiet pause may reveal movement nearby.'
  if (action.id === 'smell-jar') return 'A lingering scent could point to who handled it.'
  if (action.id === 'measure-tracks') return 'The spacing of the marks may narrow the suspect.'
  if (action.id === 'follow-tracks') return 'The trail may show where the culprit went next.'
  if (action.id === 'photograph-tracks') return 'A careful record may reveal the pattern later.'
  if (action.id === 'check-wash-bucket') return 'Even wet ground can preserve the right clue.'
  if (action.id === 'search-bedding') return 'A hiding spot may explain who was nearby.'
  if (leadType === 'question') return 'They may remember what felt wrong before it happened.'
  if (leadType === 'search') return 'Fresh traces may reveal the path through the scene.'
  if (leadType === 'inspect') return 'The condition of the scene may reveal how it happened.'
  return action.description
}

const getLeadIcons = (actions: LocationAction[]) => {
  const usedIcons = new Set<string>()
  return new Map(actions.map((action) => {
    const leadType = getLeadType(action)
    const icon = leadTypeIconOptions[leadType].find((candidate) => !usedIcons.has(candidate)) ?? leadTypeIcons[leadType]
    usedIcons.add(icon)
    return [action.id, icon]
  }))
}

const getWitnessBaseRole = (action: LocationAction): string => (
  action.label
    .replace(/^(Interview|Question|Ask)\s+/i, '')
    .trim()
)

const getWitnessRole = (action: LocationAction, index: number): string => {
  const baseRole = getWitnessBaseRole(action)
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
  const leadIcons = getLeadIcons(actions)
  const leadTitles = getLeadTitles(actions)

  return (
    <div className="investigation-action-chooser">
      <div className="investigation-action-header">
        <h3>Which lead will you follow?</h3>
        {noActionsRemaining ? <p className="investigation-action-hint">No actions remaining.</p> : null}
      </div>
      <div className="location-leads">
        {actions.map((action) => {
          const leadType = getLeadType(action)
          const isFollowed = action.id === followedActionId
          const witnessPokemon = leadType === 'question'
            ? (action.witnessPokemonIds ?? [])
                .filter((id) => !interviewedWitnessIds.has(id))
                .map((id) => pokemonData.find((pokemon) => pokemon.id === id))
                .filter((pokemon): pokemon is Pokemon => Boolean(pokemon))
            : []
          const leadIcon = leadIcons.get(action.id) ?? leadTypeIcons[leadType]

          if (leadType === 'question') {
            if (witnessPokemon.length === 0) {
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`lead-option lead-option--${leadType} ${isFollowed ? 'is-followed' : ''}`}
                  disabled
                >
                  <span className="lead-option__type">
                    <span className="lead-option__icon" aria-hidden="true">{leadIcon}</span>
                    {leadTypeLabels[leadType]}
                  </span>
                  <span className="lead-option__title">No witnesses available</span>
                  <span className="lead-option__description">Every available witness has already been interviewed.</span>
                  <span className="lead-option__footer">
                    <span>{isFollowed ? 'Lead followed' : '1 action'}</span>
                    <span>{isFollowed ? 'Complete' : 'Unavailable'}</span>
                  </span>
                </button>
              )
            }

            return witnessPokemon.map((pokemon, index) => {
              const witnessRole = getWitnessRole(action, index)

              return (
                <button
                  key={`${action.id}-${pokemon.id}`}
                  type="button"
                  className={`lead-option lead-option--${leadType} ${isFollowed ? 'is-followed' : ''}`}
                  onClick={() => chooseAction(action.id, pokemon.id)}
                  disabled={disabled || isFollowed}
                >
                  <span className="lead-option__type">
                    <span className="lead-option__icon" aria-hidden="true">{leadIcon}</span>
                    {leadTypeLabels[leadType]}
                  </span>
                  <span className="lead-option__title">Question {witnessRole}: {pokemon.name}</span>
                  <span className="lead-option__pokemon-preview" aria-label="Available witness Pokemon">
                    <span className="lead-option__pokemon">
                      <span className="lead-option__pokemon-frame">
                        <img src={pokemon.sprite} alt="" className="lead-option__pokemon-sprite" />
                      </span>
                      <span>{pokemon.name}</span>
                    </span>
                  </span>
                  <span className="lead-option__description">{getWitnessPrompt(pokemon.name, witnessRole, index)}</span>
                  <span className="lead-option__footer">
                    <span>{isFollowed ? 'Lead followed' : '1 action'}</span>
                    <span>{isFollowed ? 'Complete' : 'Follow lead →'}</span>
                  </span>
                </button>
              )
            })
          }

          const isUnavailable = disabled || isFollowed

          return (
            <button
              key={action.id}
              type="button"
              className={`lead-option lead-option--${leadType} ${isFollowed ? 'is-followed' : ''}`}
              onClick={() => chooseAction(action.id)}
              disabled={isUnavailable}
            >
              <span className="lead-option__type">
                <span className="lead-option__icon" aria-hidden="true">{leadIcon}</span>
                {leadTypeLabels[leadType]}
              </span>
              <span className="lead-option__title">{leadTitles.get(action.id)}</span>
              <span className="lead-option__description">{getLeadDescription(action, leadType)}</span>
              <span className="lead-option__footer">
                <span>{isFollowed ? 'Lead followed' : '1 action'}</span>
                <span>{isFollowed ? 'Complete' : 'Follow lead →'}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
