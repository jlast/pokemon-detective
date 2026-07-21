import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { CaseEvidenceExplanation, ClearedSuspectExplanation, ClueRule, Evidence, Location, LocationAction } from './caseModel'
import { getPokemonById } from './suspectCaseFile'

type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'
type HeightBucket = 'short' | 'medium' | 'tall'
type WeightBucket = 'light' | 'medium' | 'heavy'
type EvidenceCategory = 'height' | 'weight' | 'typeResidue' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat'

type EvidenceTemplate = {
  id: string
  category: EvidenceCategory
  titleTemplate: string
  clueTemplate: string
  endTemplate: string
}

type GeneratedEvidence = {
  title: string
  clueText: string
  badgeText: string
  badgeType?: string
  rule: ClueRule
  deductionText: string
}

type PokemonCaseProfile = {
  height: HeightBucket
  weight: WeightBucket
  primaryType: PokemonType
  highestStat: StatName
  lowestStat: StatName
  values: Record<string, string>
}

const evidenceTemplates: EvidenceTemplate[] = [
  {
    id: 'height-clue',
    category: 'height',
    titleTemplate: '{heightTitle}',
    clueTemplate: 'The missing item was disturbed {heightPosition}.',
    endTemplate: 'The culprit moved {heightPosition} while handling the stolen item.',
  },
  {
    id: 'weight-clue',
    category: 'weight',
    titleTemplate: '{trackTitle}',
    clueTemplate: 'The tracks were {trackDepth} where the culprit passed.',
    endTemplate: 'The culprit left {trackDepth} along the escape route.',
  },
  {
    id: 'type-residue-clue',
    category: 'typeResidue',
    titleTemplate: '{residueTitle}',
    clueTemplate: 'There was {typeResidue} left behind.',
    endTemplate: 'The culprit left {typeResidue} while moving through the scene.',
  },
  {
    id: 'ground-trace-clue',
    category: 'groundTrace',
    titleTemplate: '{groundTitle}',
    clueTemplate: 'The nearby ground showed {groundTrace}.',
    endTemplate: 'The culprit disturbed {groundTrace} near the scene.',
  },
  {
    id: 'force-clue',
    category: 'force',
    titleTemplate: '{forceTitle}',
    clueTemplate: 'The point of entry showed {forceTrace}.',
    endTemplate: 'The culprit got through by leaving {forceTrace}.',
  },
  {
    id: 'witness-clue',
    category: 'witness',
    titleTemplate: '{witnessTitle}',
    clueTemplate: 'A witness remembered the culprit {witnessDetail}.',
    endTemplate: 'The witness account matched someone {witnessDetail}.',
  },
  {
    id: 'highest-stat-clue',
    category: 'highestStat',
    titleTemplate: '{strongStatTitle}',
    clueTemplate: 'The scene showed {strongStatTrace}.',
    endTemplate: 'The culprit relied on {strongStatTrace} during the escape.',
  },
  {
    id: 'lowest-stat-clue',
    category: 'lowestStat',
    titleTemplate: '{weakStatTitle}',
    clueTemplate: 'The route suggested {weakStatTrace}.',
    endTemplate: 'The culprit avoided trouble by showing {weakStatTrace}.',
  },
]

const evidenceTemplateById = new Map(evidenceTemplates.map((template) => [template.id, template]))

const strongestStatPriority: StatName[] = ['speed', 'attack', 'specialAttack', 'defense', 'specialDefense', 'hp']
const weakestStatPriority: StatName[] = ['hp', 'defense', 'specialDefense', 'attack', 'specialAttack', 'speed']

const typeValues: Record<PokemonType, Record<string, string>> = {
  bug: {
    residueTitle: 'Wing Dust', typeResidue: 'shed wing dust', groundTitle: 'Tunneled Soil', groundTrace: 'tunneled soil',
    forceTitle: 'Fine Scrapes', forceTrace: 'fine scraping marks', witnessTitle: 'Skittering Witness', witnessDetail: 'skittering quickly past the scene',
  },
  dark: {
    residueTitle: 'Shadow Smudge', typeResidue: 'a shadowy smudge', groundTitle: 'Darkened Earth', groundTrace: 'darkened earth',
    forceTitle: 'Subtle Tampering', forceTrace: 'subtle pry marks', witnessTitle: 'Shadowy Movement', witnessDetail: 'slipping through the shadows',
  },
  dragon: {
    residueTitle: 'Scale Dust', typeResidue: 'primal scale dust', groundTitle: 'Raw Earth', groundTrace: 'raw earth',
    forceTitle: 'Heavy Scoring', forceTrace: 'deep scoring marks', witnessTitle: 'Powerful Stride', witnessDetail: 'moving with a powerful stride',
  },
  electric: {
    residueTitle: 'Static Traces', typeResidue: 'static traces', groundTitle: 'Scuffed Ground', groundTrace: 'scuffed ground',
    forceTitle: 'Static Mark', forceTrace: 'a faint static scorch', witnessTitle: 'Flickering Lights', witnessDetail: 'passing as the lights flickered',
  },
  fairy: {
    residueTitle: 'Glitter Dust', typeResidue: 'glittering dust', groundTitle: 'Soft Moss', groundTrace: 'soft moss pressed flat',
    forceTitle: 'Delicate Marks', forceTrace: 'delicate pressure marks', witnessTitle: 'Drifting Figure', witnessDetail: 'drifting lightly past the scene',
  },
  fighting: {
    residueTitle: 'Heavy Scuffs', typeResidue: 'heavy scuffs', groundTitle: 'Cracked Ground', groundTrace: 'cracked ground',
    forceTitle: 'Forceful Entry', forceTrace: 'direct force marks', witnessTitle: 'Stomping Steps', witnessDetail: 'stomping with purpose',
  },
  fire: {
    residueTitle: 'Ash Scatter', typeResidue: 'fine ash', groundTitle: 'Scorched Earth', groundTrace: 'scorched earth',
    forceTitle: 'Heat Mark', forceTrace: 'a faint burn mark', witnessTitle: 'Warm Draft', witnessDetail: 'leaving a warm draft behind',
  },
  flying: {
    residueTitle: 'Feather Drift', typeResidue: 'light down', groundTitle: 'Disturbed Dust', groundTrace: 'dust disturbed from above',
    forceTitle: 'Grazing Marks', forceTrace: 'grazing marks from above', witnessTitle: 'Overhead Movement', witnessDetail: 'moving overhead',
  },
  ghost: {
    residueTitle: 'Faint Mist', typeResidue: 'faint mist', groundTitle: 'Chilled Soil', groundTrace: 'chilled soil',
    forceTitle: 'Strange Distortion', forceTrace: 'strange distortion around the latch', witnessTitle: 'Eerie Passage', witnessDetail: 'passing through the area eerily',
  },
  grass: {
    residueTitle: 'Leaf Traces', typeResidue: 'leaf litter', groundTitle: 'Disturbed Roots', groundTrace: 'disturbed roots',
    forceTitle: 'Vine Marks', forceTrace: 'thin vine-like marks', witnessTitle: 'Rustling Leaves', witnessDetail: 'rustling through nearby leaves',
  },
  ground: {
    residueTitle: 'Dry Grit', typeResidue: 'dry grit', groundTitle: 'Loose Soil', groundTrace: 'loose soil',
    forceTitle: 'Gritty Scrapes', forceTrace: 'gritty scrape marks', witnessTitle: 'Dry Trail', witnessDetail: 'skirting the wettest ground',
  },
  ice: {
    residueTitle: 'Frost Trail', typeResidue: 'frost film', groundTitle: 'Frozen Earth', groundTrace: 'frozen earth',
    forceTitle: 'Cold Crack', forceTrace: 'cold-stressed cracks', witnessTitle: 'Cold Spot', witnessDetail: 'leaving a chill in the air',
  },
  normal: {
    residueTitle: 'Scattered Traces', typeResidue: 'scattered traces', groundTitle: 'Soft Ground', groundTrace: 'soft ground pressed down',
    forceTitle: 'Plain Marks', forceTrace: 'plain handling marks', witnessTitle: 'Steady Movement', witnessDetail: 'moving steadily through the area',
  },
  poison: {
    residueTitle: 'Slime Trail', typeResidue: 'a viscous smear', groundTitle: 'Tainted Soil', groundTrace: 'tainted soil',
    forceTitle: 'Caustic Mark', forceTrace: 'a caustic mark', witnessTitle: 'Oozing Trail', witnessDetail: 'oozing around the obstacle',
  },
  psychic: {
    residueTitle: 'Psychic Echo', typeResidue: 'a faint shimmer', groundTitle: 'Subtle Impressions', groundTrace: 'subtle impressions',
    forceTitle: 'Odd Distortion', forceTrace: 'odd distortion marks', witnessTitle: 'Uneasy Feeling', witnessDetail: 'leaving an uneasy feeling behind',
  },
  rock: {
    residueTitle: 'Stone Chips', typeResidue: 'stone chips', groundTitle: 'Broken Stone', groundTrace: 'broken stone',
    forceTitle: 'Stone Scrape', forceTrace: 'hard stone scrapes', witnessTitle: 'Scraping Steps', witnessDetail: 'scraping across the ground',
  },
  steel: {
    residueTitle: 'Metal Shaving', typeResidue: 'metal filings', groundTitle: 'Scraped Ground', groundTrace: 'scraped ground',
    forceTitle: 'Metal Score', forceTrace: 'metal score marks', witnessTitle: 'Metallic Sound', witnessDetail: 'making a faint metallic sound',
  },
  water: {
    residueTitle: 'Wet Smears', typeResidue: 'damp residue', groundTitle: 'Soft Mud', groundTrace: 'soft mud',
    forceTitle: 'Water Mark', forceTrace: 'water-worn marks', witnessTitle: 'Splashing Movement', witnessDetail: 'splashing near the water',
  },
}

const typeClueGroups: PokemonType[][] = [
  ['fire', 'water', 'ground'],
  ['electric', 'steel', 'rock'],
  ['grass', 'bug', 'poison'],
  ['ghost', 'psychic', 'dark'],
  ['flying', 'dragon', 'fairy'],
  ['normal', 'fighting', 'ice'],
]

const heightValues: Record<HeightBucket, Record<string, string>> = {
  short: { heightTitle: 'Low Traces', heightPosition: 'low to the ground', heightRequirement: 'small' },
  medium: { heightTitle: 'Mid-Height Traces', heightPosition: 'around table height', heightRequirement: 'medium-sized' },
  tall: { heightTitle: 'High Reach', heightPosition: 'from higher up', heightRequirement: 'tall' },
}

const weightValues: Record<WeightBucket, Record<string, string>> = {
  light: { trackTitle: 'Light Tracks', trackDepth: 'shallow and lightly pressed', weightRequirement: 'light' },
  medium: { trackTitle: 'Medium Tracks', trackDepth: 'steady with a medium depth', weightRequirement: 'medium-weight' },
  heavy: { trackTitle: 'Heavy Prints', trackDepth: 'deep and wide', weightRequirement: 'heavy' },
}

const strongStatValues: Record<StatName, Record<string, string>> = {
  hp: { strongStatTitle: 'Steady Endurance', strongStatTrace: 'unusually steady endurance' },
  attack: { strongStatTitle: 'Forceful Entry', strongStatTrace: 'direct physical force' },
  defense: { strongStatTitle: 'Braced Tracks', strongStatTrace: 'a sturdy, well-braced path' },
  specialAttack: { strongStatTitle: 'Energy Bloom', strongStatTrace: 'strong unusual energy' },
  specialDefense: { strongStatTitle: 'Weathered Calm', strongStatTrace: 'calm movement through strange conditions' },
  speed: { strongStatTitle: 'Swift Pass', strongStatTrace: 'a fast crossing' },
}

const weakStatValues: Record<StatName, Record<string, string>> = {
  hp: { weakStatTitle: 'Winded Pause', weakStatTrace: 'a quick loss of stamina' },
  attack: { weakStatTitle: 'Gentle Handling', weakStatTrace: 'careful handling instead of brute force' },
  defense: { weakStatTitle: 'Brittle Pass', weakStatTrace: 'avoidance of rough contact' },
  specialAttack: { weakStatTitle: 'Faded Surge', weakStatTrace: 'faint unusual energy' },
  specialDefense: { weakStatTitle: 'Shaken Focus', weakStatTrace: 'hesitation in strange surroundings' },
  speed: { weakStatTitle: 'Slow Route', weakStatTrace: 'slow, deliberate movement' },
}

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }

  return copy
}

const getStatValue = (pokemon: Pokemon, statName: StatName): number => pokemon[statName]

const pickPriorityStat = (pokemon: Pokemon, priority: StatName[], mode: 'max' | 'min'): StatName => {
  let selected = priority[0]
  let selectedValue = getStatValue(pokemon, selected)

  for (const statName of priority.slice(1)) {
    const value = getStatValue(pokemon, statName)
    if ((mode === 'max' && value > selectedValue) || (mode === 'min' && value < selectedValue)) {
      selected = statName
      selectedValue = value
    }
  }

  return selected
}

const getHeightBucket = (pokemon: Pokemon): HeightBucket => {
  if (pokemon.heightM <= 0.6) return 'short'
  if (pokemon.heightM >= 1.4) return 'tall'
  return 'medium'
}

const getWeightBucket = (pokemon: Pokemon): WeightBucket => {
  if (pokemon.weightKg <= 12) return 'light'
  if (pokemon.weightKg >= 45) return 'heavy'
  return 'medium'
}

const getPokemonCaseProfile = (pokemon: Pokemon): PokemonCaseProfile => {
  const height = getHeightBucket(pokemon)
  const weight = getWeightBucket(pokemon)
  const primaryType = pokemon.types[0]
  const highestStat = pickPriorityStat(pokemon, strongestStatPriority, 'max')
  const lowestStat = pickPriorityStat(pokemon, weakestStatPriority, 'min')

  return {
    height,
    weight,
    primaryType,
    highestStat,
    lowestStat,
    values: {
      ...heightValues[height],
      ...weightValues[weight],
      ...typeValues[primaryType],
      ...strongStatValues[highestStat],
      ...weakStatValues[lowestStat],
      movementWord: heightValues[height].heightPosition,
      textureWord: typeValues[primaryType].typeResidue,
      groundWord: typeValues[primaryType].groundTrace,
      waterAvoidanceWord: typeValues[primaryType].witnessDetail,
    },
  }
}

const fillTemplate = (template: string, values: Record<string, string>): string => (
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => values[key] ?? match)
)

const fillNarrativeTemplate = (template: string, profile: PokemonCaseProfile): string => fillTemplate(template, profile.values)

const getEvidenceTemplate = (evidenceId: string): EvidenceTemplate => evidenceTemplateById.get(evidenceId) ?? evidenceTemplates[0]!

const getTypeClueGroup = (type: PokemonType): PokemonType[] => (
  typeClueGroups.find((group) => group.includes(type)) ?? [type]
)

const formatList = (values: string[]): string => {
  const labels = values.map(formatLabel)
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}`
}

const getClueRule = (category: EvidenceCategory, profile: PokemonCaseProfile): ClueRule => {
  switch (category) {
    case 'height':
      return { axis: 'height', precision: 'exact', matchingValues: [profile.height] }
    case 'weight':
      return { axis: 'weight', precision: 'exact', matchingValues: [profile.weight] }
    case 'typeResidue':
      return { axis: 'type', precision: 'grouped', matchingValues: getTypeClueGroup(profile.primaryType) }
    case 'groundTrace':
      return { axis: 'groundTrace', precision: 'exact', matchingValues: [profile.primaryType] }
    case 'force':
      return { axis: 'force', precision: 'exact', matchingValues: [profile.primaryType] }
    case 'witness':
      return { axis: 'witness', precision: 'exact', matchingValues: [profile.primaryType] }
    case 'highestStat':
      return { axis: 'highestStat', precision: 'exact', matchingValues: [profile.highestStat] }
    case 'lowestStat':
      return { axis: 'lowestStat', precision: 'exact', matchingValues: [profile.lowestStat] }
  }
}

const getClueRuleValue = (profile: PokemonCaseProfile, category: EvidenceCategory): string => {
  switch (category) {
    case 'height':
      return profile.height
    case 'weight':
      return profile.weight
    case 'typeResidue':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return profile.primaryType
    case 'highestStat':
      return profile.highestStat
    case 'lowestStat':
      return profile.lowestStat
  }
}

const formatLabel = (value: string): string => (
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
)

const formatHeightLabel = (height: HeightBucket): string => (
  height === 'short' ? 'Small' : formatLabel(height)
)

const getEvidenceBadge = (category: EvidenceCategory, profile: PokemonCaseProfile): { badgeText: string; badgeType?: string } => {
  switch (category) {
    case 'height':
      return { badgeText: `Height: ${formatHeightLabel(profile.height)}` }
    case 'weight':
      return { badgeText: `Weight: ${formatLabel(profile.weight)}` }
    case 'typeResidue':
      return { badgeText: `Type group: ${formatList(getTypeClueGroup(profile.primaryType))}` }
    case 'groundTrace':
    case 'force':
    case 'witness':
      return { badgeText: formatLabel(profile.primaryType), badgeType: profile.primaryType }
    case 'highestStat':
      return { badgeText: `Strength: ${formatLabel(profile.highestStat)}` }
    case 'lowestStat':
      return { badgeText: `Weakness: ${formatLabel(profile.lowestStat)}` }
  }
}

const getRelevantCategories = (_pokemon: Pokemon): EvidenceCategory[] => ['height', 'weight', 'typeResidue', 'groundTrace', 'force', 'witness', 'highestStat', 'lowestStat']

const scorePokemonAgainstProfile = (pokemonId: number, culpritProfile: PokemonCaseProfile, categories: EvidenceCategory[]) => {
  const profile = getPokemonCaseProfile(getPokemonById(pokemonId))

  return categories.reduce((score, category) => {
    const rule = getClueRule(category, culpritProfile)
    const value = getClueRuleValue(profile, category)
    return rule.matchingValues.includes(value) ? score + 1 : score
  }, 0)
}

const getCategoryConclusionFragment = (category: EvidenceCategory, profile: PokemonCaseProfile): string => {
  switch (category) {
    case 'height':
      return `${profile.values.heightRequirement} enough to match the height clues`
    case 'weight':
      return `${profile.values.weightRequirement} enough to match the track depth`
    case 'typeResidue':
      return `linked to ${formatList(getTypeClueGroup(profile.primaryType))} type traces`
    case 'groundTrace':
      return `able to leave ${profile.values.groundTrace}`
    case 'force':
      return `able to leave ${profile.values.forceTrace}`
    case 'witness':
      return `seen ${profile.values.witnessDetail}`
    case 'highestStat':
      return `strong in ${profile.values.strongStatTrace}`
    case 'lowestStat':
      return `consistent with ${profile.values.weakStatTrace}`
  }
}

const getCategoryDeductionText = (category: EvidenceCategory, profile: PokemonCaseProfile): string => {
  switch (category) {
    case 'height':
      return `This pointed toward a ${profile.values.heightRequirement} Pokemon.`
    case 'weight':
      return `This pointed toward a ${profile.values.weightRequirement} Pokemon.`
    case 'typeResidue':
      return `This narrowed the culprit to ${formatList(getTypeClueGroup(profile.primaryType))} types.`
    case 'groundTrace':
      return `This suggested a Pokemon associated with ${profile.values.groundTrace}.`
    case 'force':
      return `This suggested a culprit capable of leaving ${profile.values.forceTrace}.`
    case 'witness':
      return `This matched a culprit ${profile.values.witnessDetail}.`
    case 'highestStat':
      return `This suggested the culprit relied on ${profile.values.strongStatTrace}.`
    case 'lowestStat':
      return `This suggested the culprit showed ${profile.values.weakStatTrace}.`
  }
}

const buildEvidenceFromTemplate = (evidenceId: string, culprit: Pokemon): GeneratedEvidence => {
  const profile = getPokemonCaseProfile(culprit)
  const template = getEvidenceTemplate(evidenceId)
  const badge = getEvidenceBadge(template.category, profile)
  const rule = getClueRule(template.category, profile)

  return {
    title: fillTemplate(template.titleTemplate, profile.values),
    clueText: fillTemplate(template.clueTemplate, profile.values),
    ...badge,
    rule,
    deductionText: getCategoryDeductionText(template.category, profile),
  }
}

const buildActionNarrative = (
  action: LocationAction,
  culprit: Pokemon,
  generatedEvidence?: Map<string, GeneratedEvidence>,
) => {
  const profile = getPokemonCaseProfile(culprit)
  const deductionText = action.evidenceId && generatedEvidence
    ? generatedEvidence.get(action.evidenceId)?.deductionText
    : null

  const sizeSpecificTemplate =
    profile.height === 'short'
      ? action.observationTextSmall
      : profile.height === 'tall'
        ? action.observationTextLarge
        : action.observationTextMedium

  const template = sizeSpecificTemplate ?? action.observationText

  return {
    observationText: fillNarrativeTemplate(template, profile),
    implicationText: deductionText ?? undefined,
  }
}

export const generateCaseEvidence = (
  culprit: Pokemon,
  baseEvidence: Evidence[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string; endExplanation?: string }>,
) => {
  const generatedEvidenceById = new Map<string, GeneratedEvidence>()
  const profile = getPokemonCaseProfile(culprit)

  const generatedEvidence = baseEvidence.map((evidenceItem) => {
    const generated = buildEvidenceFromTemplate(evidenceItem.id, culprit)
    generatedEvidenceById.set(evidenceItem.id, generated)
    const override = evidenceOverrides?.[evidenceItem.id]

    return {
      ...evidenceItem,
      title: override?.title ? fillNarrativeTemplate(override.title, profile) : generated.title,
      clueText: override?.clueText ? fillNarrativeTemplate(override.clueText, profile) : generated.clueText,
      badgeText: generated.badgeText,
      badgeType: generated.badgeType,
      rule: generated.rule,
    }
  })

  return { generatedEvidence, generatedEvidenceById }
}

export const generateCaseLocations = (
  culprit: Pokemon,
  baseLocations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string; endExplanation?: string }>,
) => {
  const profile = getPokemonCaseProfile(culprit)
  const generatedEvidence = new Map(
    evidenceTemplates.map((template) => {
      const evidenceId = template.id
      const generated = buildEvidenceFromTemplate(evidenceId, culprit)
      const override = evidenceOverrides?.[evidenceId]
      return [evidenceId, {
        ...generated,
        title: override?.title ? fillNarrativeTemplate(override.title, profile) : generated.title,
        clueText: override?.clueText ? fillNarrativeTemplate(override.clueText, profile) : generated.clueText,
      }] as const
    }),
  )

  return baseLocations.map((location) => ({
    ...location,
    actions: location.actions.map((action) => {
      const generatedEvidenceItem = action.evidenceId ? generatedEvidence.get(action.evidenceId) : null
      const generatedNarrative = buildActionNarrative(action, culprit, generatedEvidence)

      return {
        ...action,
        evidenceTitle: generatedEvidenceItem?.title ?? action.evidenceTitle,
        evidenceText: generatedEvidenceItem?.clueText ?? action.evidenceText,
        evidenceBadgeText: generatedEvidenceItem?.badgeText,
        evidenceBadgeType: generatedEvidenceItem?.badgeType,
        clueRule: generatedEvidenceItem?.rule,
        observationText: generatedNarrative.observationText,
        implicationText: generatedNarrative.implicationText,
      }
    }),
  }))
}

const getMismatchReason = (suspectId: number, culpritProfile: PokemonCaseProfile, categories: EvidenceCategory[]) => {
  const profile = getPokemonCaseProfile(getPokemonById(suspectId))
  const missingCategory = categories.find((category) => {
    const rule = getClueRule(category, culpritProfile)
    return !rule.matchingValues.includes(getClueRuleValue(profile, category))
  })

  switch (missingCategory) {
    case 'height':
      return `Did not fit the ${culpritProfile.values.heightRequirement} height clues.`
    case 'weight':
      return `Did not fit the ${culpritProfile.values.weightRequirement} track clues.`
    case 'typeResidue':
      return `Did not match the ${formatList(getTypeClueGroup(culpritProfile.primaryType))} type residue group.`
    case 'groundTrace':
      return `Did not explain the ${culpritProfile.values.groundTrace} at the scene.`
    case 'force':
      return `Did not fit the ${culpritProfile.values.forceTrace} at the point of entry.`
    case 'witness':
      return `Did not match the witness account of someone ${culpritProfile.values.witnessDetail}.`
    case 'highestStat':
      return `Did not fit the signs of ${culpritProfile.values.strongStatTrace}.`
    case 'lowestStat':
      return `Did not fit the signs of ${culpritProfile.values.weakStatTrace}.`
    default:
      return 'The collected clues did not support this suspect strongly enough.'
  }
}

const joinFragments = (fragments: string[]) => {
  if (fragments.length <= 1) {
    return fragments[0] ?? 'the evidence collected'
  }

  if (fragments.length === 2) {
    return `${fragments[0]} and ${fragments[1]}`
  }

  return `${fragments.slice(0, -1).join(', ')}, and ${fragments.at(-1)}`
}

const buildSolution = (
  culpritId: number,
  suspectIds: number[],
  evidence: Evidence[],
  locations: Location[],
  relevantCategories: EvidenceCategory[],
  generatedEvidenceById: Map<string, GeneratedEvidence>,
) => {
  const culprit = getPokemonById(culpritId)
  const culpritProfile = getPokemonCaseProfile(culprit)
  const evidenceById = new Map(evidence.map((item) => [item.id, item]))

  const evidenceExplanation: CaseEvidenceExplanation[] = locations
    .flatMap((location) => {
      const primaryAction = location.actions.find(
        (action) => action.evidenceId && (action.outcomeType === 'evidence' || action.outcomeType === 'witness')
      )
      if (!primaryAction) return []
      const evidenceId = primaryAction.evidenceId
      if (!evidenceId) return []
      const evidenceItem = evidenceById.get(evidenceId)
      if (!evidenceItem) return []
      return [{
        locationId: location.id,
        evidenceTitle: primaryAction.evidenceTitle ?? evidenceItem.title,
        clueText: primaryAction.evidenceText ?? evidenceItem.clueText,
        badgeText: primaryAction.evidenceBadgeText ?? evidenceItem.badgeText,
        badgeType: primaryAction.evidenceBadgeType ?? evidenceItem.badgeType,
        deductionText: generatedEvidenceById.get(evidenceId)?.deductionText ?? getCategoryDeductionText(getEvidenceTemplate(evidenceId).category, culpritProfile),
      }]
    })

  const clearedSuspects: ClearedSuspectExplanation[] = suspectIds
    .filter((suspectId) => suspectId !== culpritId)
    .map((suspectId) => ({
      pokemonId: suspectId,
      reason: getMismatchReason(suspectId, culpritProfile, relevantCategories),
    }))

  return {
    culpritRevealText: `${culprit.name} was behind the case.`,
    detectiveConclusion: `The culprit had to be ${joinFragments(relevantCategories.map((category) => getCategoryConclusionFragment(category, culpritProfile)))}. ${culprit.name} best fit the collected evidence.`,
    evidenceExplanation,
    clearedSuspects,
  }
}

export const generateCaseLineup = (
  evidence: Evidence[],
  locations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string; endExplanation?: string }>,
) => {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const culprit = pokemonData[Math.floor(Math.random() * pokemonData.length)]
    const culpritProfile = getPokemonCaseProfile(culprit)
    const relevantCategories = getRelevantCategories(culprit).slice(0, 6)

    const scoredDistractors = shuffle(
      pokemonData
        .filter((pokemon) => pokemon.id !== culprit.id)
        .map((pokemon) => ({
          pokemonId: pokemon.id,
          score: scorePokemonAgainstProfile(pokemon.id, culpritProfile, relevantCategories),
        }))
        .filter((entry) => entry.score < relevantCategories.length),
    ).sort((left, right) => right.score - left.score)

    const nearMatches = scoredDistractors.filter((entry) => entry.score >= Math.max(relevantCategories.length - 2, 1))
    const mediumMatches = scoredDistractors.filter((entry) => entry.score >= 1 && entry.score < Math.max(relevantCategories.length - 2, 1))
    const weakMatches = scoredDistractors.filter((entry) => entry.score === 0)

    const chosen = [
      ...nearMatches.slice(0, 2),
      ...mediumMatches.slice(0, 2),
      ...weakMatches.slice(0, 2),
      ...scoredDistractors,
    ]

    const uniqueDistractors = Array.from(new Map(chosen.map((entry) => [entry.pokemonId, entry])).values())
      .slice(0, 5)
      .map((entry) => entry.pokemonId)

    if (uniqueDistractors.length < 5) {
      continue
    }

    const topDistractorScore = Math.max(
      ...uniqueDistractors.map((pokemonId) => scorePokemonAgainstProfile(pokemonId, culpritProfile, relevantCategories)),
    )

    if (topDistractorScore >= relevantCategories.length) {
      continue
    }

    const suspectIds = shuffle([culprit.id, ...uniqueDistractors])
    const { generatedEvidence, generatedEvidenceById } = generateCaseEvidence(culprit, evidence, evidenceOverrides)
    const generatedLocations = generateCaseLocations(culprit, locations, evidenceOverrides)

    return {
      culpritPokemonId: culprit.id,
      suspectPokemonIds: suspectIds,
      evidence: generatedEvidence,
      locations: generatedLocations,
      solution: buildSolution(
        culprit.id,
        suspectIds,
        generatedEvidence,
        generatedLocations,
        relevantCategories,
        generatedEvidenceById,
      ),
    }
  }

  throw new Error('Unable to generate a solvable case lineup.')
}
