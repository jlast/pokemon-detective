import type { LocationAction } from '../../game/caseModel'
import { pokemonData, type Pokemon } from '../../data/pokemon'
import { LeadVisualIcon, type LeadVisualType } from './leadVisualIcons'

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

const getLeadVisualType = (action: LocationAction): LeadVisualType => {
  const text = `${action.id} ${action.label} ${action.description}`.toLowerCase()
  if (/track|foot|print|crumb|scuff|trail/.test(text)) return 'footprints'
  if (/lid|latch|forced|broken|damage|crack/.test(text)) return 'damage'
  if (/screw|tool|mark|scrape|photograph/.test(text)) return 'tool-marks'
  if (/dust|ash/.test(text)) return 'dust'
  if (/listen|sound|noise|quiet/.test(text)) return 'sound'
  if (/smell|scent/.test(text)) return 'scent'
  if (/above|high|shelf|branch|top/.test(text)) return 'high-surface'
  if (/ground|root|floor|under/.test(text)) return 'ground'
  if (/case|jar|cabinet|drawer|chest|box|bucket|container/.test(text)) return 'container'
  if (/follow|movement|route|path/.test(text)) return 'movement'
  if (/table|display|object|item|surface/.test(text)) return 'object'
  return 'generic-search'
}

const cleanLeadLabel = (label: string): string => (
  label
    .replace(/^(Search|Inspect|Check|Look|Study|Measure|Follow|Photograph|Document|Smell|Listen)\s+(the\s+)?/i, '')
    .replace(/^around\s+/i, '')
    .replace(/^near\s+/i, '')
    .trim()
)

const formatClueLabel = (label: string): string => {
  const cleaned = cleanLeadLabel(label)
  if (!cleaned) return 'Unusual trace'
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

const getLeadSubject = (action: LocationAction): string => {
  const subject = cleanLeadLabel(action.label)
    .replace(/^(the|a|an)\s+/i, '')
    .toLowerCase()

  return subject || 'nearby surface'
}

const getEvidenceLeadLabel = (action: LocationAction): string => {
  if (action.id === 'crumbs') return 'Footprints'
  if (action.id === 'tents') return 'Disturbed edge'
  if (action.id === 'measure-tracks') return 'Track depth'
  if (action.id === 'follow-tracks') return 'Escape route'
  if (action.id === 'photograph-tracks') return 'Track pattern'
  if (action.id === 'check-roots') return 'Disturbed ground'
  if (action.id === 'search-branches') return 'High surface'
  if (action.id === 'listen-quietly') return 'Muffled noise'
  if (action.id === 'inspect-lid') return 'Broken latch'
  if (action.id === 'smell-jar') return 'Lingering scent'
  if (action.id === 'check-table') return 'Nearby surface'
  if (action.id === 'check-wash-bucket') return 'Wet trace'
  if (action.id === 'search-bedding') return 'Hidden nook'
  return formatClueLabel(action.label)
}

const getEvidenceLeadTeaser = (action: LocationAction): string => {
  const subject = getLeadSubject(action)

  if (action.id === 'crumbs') return `Fresh heel marks stop beside the ${subject}.`
  if (action.id === 'tents') return `Leaves near the ${subject} remain untouched.`
  if (action.id === 'measure-tracks') return `Deep prints cross the dirt beside the ${subject}.`
  if (action.id === 'follow-tracks') return `A thin trail bends toward the side path.`
  if (action.id === 'photograph-tracks') return `A clean photo could catch the spacing between prints.`
  if (action.id === 'check-roots') return `Loose soil has piled against the ${subject}.`
  if (action.id === 'search-branches') return `Dust on the ${subject} has a fresh gap.`
  if (action.id === 'listen-quietly') return `A soft scrape comes from behind the shelves.`
  if (action.id === 'inspect-lid') return `Bent metal curls around the ${subject}.`
  if (action.id === 'smell-jar') return `A sharp scent clings to the ${subject}.`
  if (action.id === 'check-table') return `Fine scratches run along the ${subject}.`
  if (action.id === 'check-wash-bucket') return `Mud flecks ring the ${subject}.`
  if (action.id === 'search-bedding') return `A tucked corner near the ${subject} is flattened.`
  if (/search|look/i.test(action.description)) return `A small scrape sits beside the ${subject}.`
  if (/inspect|study|check/i.test(action.description)) return `Fresh dust breaks along the ${subject}.`
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

interface EvidenceLeadCardProps {
  visualType: LeadVisualType
  label: string
  teaser: string
  onFollow: () => void
  disabled?: boolean
  isFollowed?: boolean
}

function EvidenceLeadCard({
  visualType,
  label,
  teaser,
  onFollow,
  disabled = false,
  isFollowed = false,
}: EvidenceLeadCardProps) {
  return (
    <button
      type="button"
      className={`evidence-lead-card evidence-lead-card--${visualType} ${isFollowed ? 'is-followed' : ''}`}
      onClick={onFollow}
      disabled={disabled}
    >
      <div className="evidence-lead-card__visual" aria-hidden="true">
        <LeadVisualIcon visualType={visualType} />
      </div>

      <div className="evidence-lead-card__content">
        <span className="evidence-lead-card__label">{label}</span>
        <p className="evidence-lead-card__teaser">{teaser}</p>
      </div>
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
  const leadIcons = getLeadIcons(actions)

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
                </button>
              )
            })
          }

          return (
            <EvidenceLeadCard
              key={action.id}
              visualType={getLeadVisualType(action)}
              label={getEvidenceLeadLabel(action)}
              teaser={getEvidenceLeadTeaser(action)}
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
