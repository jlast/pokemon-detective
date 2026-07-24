import { pokemonData, type Pokemon } from '../data/pokemon'
import type { ClueRule, Evidence, EvidenceBadgeData, EvidenceEvaluationResult } from './caseModel'

const toTitle = (value: string) => value[0].toUpperCase() + value.slice(1)

export type DetectiveProfileRow = { label: string; value: string; source?: string; badges?: EvidenceBadgeData[] }

export type DetectiveProfileData = {
  investigativeTraits: DetectiveProfileRow[]
}

export type SuspectEvidenceEvaluation = {
  evidenceId: string
  title: string
  result: EvidenceEvaluationResult
  observation: string
  interpretation: string
  explanation: string
  resultLabel: string
  matchingValues?: string[]
  conflictingValues?: string[]
}

const getHeightBucket = (pokemon: Pokemon) => pokemon.heightM <= 0.6 ? 'short' : pokemon.heightM >= 1.4 ? 'tall' : 'medium'

const getWeightBucket = (pokemon: Pokemon) => pokemon.weightKg <= 12 ? 'light' : pokemon.weightKg >= 45 ? 'heavy' : 'medium'

const statLabels = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Special Attack',
  specialDefense: 'Special Defense',
  speed: 'Speed',
} as const

type StatName = keyof typeof statLabels

const highestStatPriority: StatName[] = ['speed', 'attack', 'specialAttack', 'defense', 'specialDefense', 'hp']
const lowestStatPriority: StatName[] = ['hp', 'defense', 'specialDefense', 'attack', 'specialAttack', 'speed']

const typeEffectiveness: Record<string, Partial<Record<string, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const getStatValue = (pokemon: Pokemon, statName: StatName) => pokemon[statName]

const pickStatKey = (pokemon: Pokemon, priority: StatName[], mode: 'highest' | 'lowest') => {
  let selected = priority[0]
  let selectedValue = getStatValue(pokemon, selected)

  for (const statName of priority.slice(1)) {
    const value = getStatValue(pokemon, statName)
    if ((mode === 'highest' && value > selectedValue) || (mode === 'lowest' && value < selectedValue)) {
      selected = statName
      selectedValue = value
    }
  }

  return selected
}

const getDefensiveMultiplier = (pokemon: Pokemon, attackType: string): number => (
  pokemon.types.reduce((multiplier, defenseType) => multiplier * (typeEffectiveness[attackType]?.[defenseType] ?? 1), 1)
)

const getAffectednessRuleValue = (pokemon: Pokemon, attackType: string): string => {
  const multiplier = getDefensiveMultiplier(pokemon, attackType)
  if (multiplier > 1) return `weak:${attackType}`
  if (multiplier < 1) return `strong:${attackType}`
  return `neutral:${attackType}`
}

const formatList = (values: string[]): string => {
  if (values.length <= 1) return values[0] ?? ''
  if (values.length === 2) return `${values[0]} or ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, or ${values.at(-1)}`
}

const formatHeightBucket = (value: string) => value === 'short' ? 'Small' : toTitle(value)

const formatAffectednessValue = (value: string) => {
  const [affectedness, attackType] = value.split(':')
  if (!affectedness || !attackType) return value
  if (affectedness === 'weak') return `Weak to ${toTitle(attackType)}`
  if (affectedness === 'strong') return `Strong to ${toTitle(attackType)}`
  return `Neutral to ${toTitle(attackType)}`
}

const formatRuleValue = (rule: ClueRule, value: string) => {
  switch (rule.axis) {
    case 'height':
      return formatHeightBucket(value)
    case 'weight':
      return toTitle(value)
    case 'type':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return toTitle(value)
    case 'highestStat':
    case 'lowestStat':
      return statLabels[value as StatName] ?? value
    case 'typeAffectedness':
      return formatAffectednessValue(value)
    case 'scene':
      return value
  }
}

const getTraitLabelForRule = (rule: ClueRule) => {
  switch (rule.axis) {
    case 'height':
      return 'height estimate'
    case 'weight':
      return 'weight estimate'
    case 'type':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return 'typing'
    case 'highestStat':
      return 'strongest stat'
    case 'lowestStat':
      return 'weakest stat'
    case 'typeAffectedness':
      return 'defensive matchup'
    case 'scene':
      return 'case file'
  }
}

export const buildEvidenceExplanation = ({
  evaluation,
  traitLabel,
  suspectName: _suspectName,
  comparisonContext = 'single',
}: {
  evaluation: EvidenceEvaluationResult
  traitLabel: string
  suspectName?: string
  comparisonContext?: 'single' | 'comparison'
}) => {
  const subject = comparisonContext === 'single' ? 'this suspect' : 'the suspect'

  switch (evaluation) {
    case 'match':
      return `Fits ${subject}'s ${traitLabel}.`
    case 'possible':
      return `Could fit ${subject}'s ${traitLabel}, but it is not conclusive.`
    case 'conflict':
      return `Conflicts with ${subject}'s ${traitLabel}.`
    case 'unknown':
      return 'This clue does not compare cleanly to a known suspect trait.'
  }
}

const formatEvaluationInterpretation = (pokemon: Pokemon, evidence: Evidence, suspectValue: string, result: EvidenceEvaluationResult): string => {
  const expected = evidence.rule.matchingValues.map((value) => formatRuleValue(evidence.rule, value))
  const actual = formatRuleValue(evidence.rule, suspectValue)
  const compatible = result === 'match' || result === 'possible'

  switch (evidence.rule.axis) {
    case 'height':
      return compatible
        ? `This suspect is ${actual}, consistent with the scene estimate.`
        : `This suspect is ${actual}, but the scene estimate points to ${formatList(expected)}.`
    case 'weight':
      return compatible
        ? `This suspect is ${actual}, consistent with the track estimate.`
        : `This suspect is ${actual}, but the tracks point to ${formatList(expected)}.`
    case 'type':
    case 'groundTrace':
    case 'force':
    case 'witness': {
      const suspectTypes = pokemon.types.map(toTitle)
      return compatible
        ? `Consistent with this suspect's ${formatList(suspectTypes)} typing.`
        : `${pokemon.name}'s ${formatList(suspectTypes)} typing is outside the expected ${formatList(expected)} profile.`
    }
    case 'highestStat':
      return compatible
        ? `This suspect's strongest stat matches the clue.`
        : `This suspect's strongest stat is ${actual}, but the clue points to ${formatList(expected)}.`
    case 'lowestStat':
      return compatible
        ? `This suspect's weakest stat matches the clue.`
        : `This suspect's weakest stat is ${actual}, but the clue points to ${formatList(expected)}.`
    case 'typeAffectedness':
      return compatible
        ? `This suspect is ${actual.toLowerCase()}, matching the reaction clue.`
        : `This suspect is ${actual.toLowerCase()}, which conflicts with the observed ${formatList(expected).toLowerCase()}.`
    case 'scene':
      return `${evidence.title} does not point to a suspect trait yet.`
  }
}

const getEvaluationResult = (rule: ClueRule, suspectValue: string): EvidenceEvaluationResult => {
  if (rule.precision === 'none' || rule.matchingValues.length === 0) return 'unknown'
  if (!rule.matchingValues.includes(suspectValue)) return 'conflict'
  return rule.precision === 'grouped' ? 'possible' : 'match'
}

const getResultLabel = (result: EvidenceEvaluationResult) => {
  switch (result) {
    case 'match':
      return 'Fits this suspect'
    case 'possible':
      return 'Possible, but not conclusive'
    case 'conflict':
      return 'Conflicts with this suspect'
    case 'unknown':
      return 'Inconclusive'
  }
}

const getFallbackObservation = (evidence: Evidence) => ({
  observation: evidence.clueText || `${evidence.title} was recorded in the case file.`,
  interpretation: 'Compare this clue against the suspect file before deciding.',
})

const getSuspectRuleValue = (pokemon: Pokemon, rule: ClueRule): string => {
  switch (rule.axis) {
    case 'height':
      return getHeightBucket(pokemon)
    case 'weight':
      return getWeightBucket(pokemon)
    case 'type':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return pokemon.types.find((type) => rule.matchingValues.includes(type)) ?? ''
    case 'highestStat':
      return pickStatKey(pokemon, highestStatPriority, 'highest')
    case 'lowestStat':
      return pickStatKey(pokemon, lowestStatPriority, 'lowest')
    case 'typeAffectedness': {
      const attackType = rule.matchingValues[0]?.split(':')[1] ?? ''
      return getAffectednessRuleValue(pokemon, attackType)
    }
    case 'scene':
      return ''
  }
}

export const getSuspectEvidenceEvaluations = (pokemon: Pokemon, evidenceItems: Evidence[]): SuspectEvidenceEvaluation[] => evidenceItems.map((evidence) => {
  const fallback = getFallbackObservation(evidence)

  if (evidence.rule.precision === 'none' || evidence.rule.matchingValues.length === 0) {
    return {
      evidenceId: evidence.id,
      title: evidence.title,
      result: 'unknown',
      observation: evidence.observation?.observation ?? fallback.observation,
      interpretation: evidence.observation?.interpretation ?? fallback.interpretation,
      explanation: buildEvidenceExplanation({ evaluation: 'unknown', traitLabel: 'case file' }),
      resultLabel: getResultLabel('unknown'),
    }
  }

  const value = getSuspectRuleValue(pokemon, evidence.rule)
  const result = getEvaluationResult(evidence.rule, value)

  return {
    evidenceId: evidence.id,
    title: evidence.title,
    result,
    observation: evidence.observation?.observation ?? fallback.observation,
    interpretation: evidence.observation?.interpretation ?? formatEvaluationInterpretation(pokemon, evidence, value, result),
    explanation: buildEvidenceExplanation({ evaluation: result, traitLabel: getTraitLabelForRule(evidence.rule) }),
    resultLabel: getResultLabel(result),
    matchingValues: result === 'match' || result === 'possible' ? evidence.rule.matchingValues.map((matchingValue) => formatRuleValue(evidence.rule, matchingValue)) : undefined,
    conflictingValues: result === 'conflict' ? [formatRuleValue(evidence.rule, value)] : undefined,
  }
})

export const getPokemonById = (pokemonId: number): Pokemon => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

export const getDetectiveProfile = (pokemonId: number): DetectiveProfileData => {
  const pokemon = getPokemonById(pokemonId)

  return {
    investigativeTraits: buildInvestigativeProfile(pokemon),
  }
}

export const buildInvestigativeProfile = (pokemon: Pokemon): DetectiveProfileRow[] => [
  { label: 'Height', value: `${pokemon.heightM} m · ${formatHeightBucket(getHeightBucket(pokemon))}` },
  { label: 'Weight', value: `${pokemon.weightKg} kg · ${toTitle(getWeightBucket(pokemon))}` },
  { label: 'Type', value: '', badges: pokemon.types.map((type) => ({ text: toTitle(type), type })) },
  { label: 'Highest stat', value: statLabels[pickStatKey(pokemon, highestStatPriority, 'highest')] },
  { label: 'Lowest stat', value: statLabels[pickStatKey(pokemon, lowestStatPriority, 'lowest')] },
]
