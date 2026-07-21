import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { CaseEvidenceExplanation, ClearedSuspectExplanation, ClueRule, Evidence, EvidenceBadgeData, Location, LocationAction } from './caseModel'
import { getPokemonById } from './suspectCaseFile'

type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'
type HeightBucket = 'short' | 'medium' | 'tall'
type WeightBucket = 'light' | 'medium' | 'heavy'
type EvidenceCategory = 'height' | 'weight' | 'typeResidue' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat'
type TypeClueSlot = 'primary' | 'secondary'

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
  badges?: EvidenceBadgeData[]
  rule: ClueRule
  deductionText: string
}

type PokemonCaseProfile = {
  height: HeightBucket
  weight: WeightBucket
  primaryType: PokemonType
  clueType: PokemonType | null
  clueTypeSlot: TypeClueSlot
  hasSecondaryType: boolean
  highestStat: StatName
  lowestStat: StatName
  values: Record<string, string>
}

const evidenceTemplates: EvidenceTemplate[] = [
  {
    id: 'height-clue',
    category: 'height',
    titleTemplate: 'Height Clue',
    clueTemplate: 'The missing item was disturbed {heightPosition}.',
    endTemplate: 'The culprit moved {heightPosition} while handling the stolen item.',
  },
  {
    id: 'weight-clue',
    category: 'weight',
    titleTemplate: 'Weight Clue',
    clueTemplate: 'The tracks were {trackDepth} where the culprit passed.',
    endTemplate: 'The culprit left {trackDepth} along the escape route.',
  },
  {
    id: 'type-residue-clue',
    category: 'typeResidue',
    titleTemplate: 'Type Clue',
    clueTemplate: "This clue points to possible matches for the culprit's {typeClueLower}.",
    endTemplate: "This clue pointed to possible matches for the culprit's {typeClueLower}.",
  },
  {
    id: 'ground-trace-clue',
    category: 'groundTrace',
    titleTemplate: 'Type Clue',
    clueTemplate: "This clue points to possible matches for the culprit's {typeClueLower}.",
    endTemplate: "This clue pointed to possible matches for the culprit's {typeClueLower}.",
  },
  {
    id: 'force-clue',
    category: 'force',
    titleTemplate: 'Type Clue',
    clueTemplate: "This clue points to possible matches for the culprit's {typeClueLower}.",
    endTemplate: "This clue pointed to possible matches for the culprit's {typeClueLower}.",
  },
  {
    id: 'witness-clue',
    category: 'witness',
    titleTemplate: 'Type Clue',
    clueTemplate: "This clue points to possible matches for the culprit's {typeClueLower}.",
    endTemplate: "This clue pointed to possible matches for the culprit's {typeClueLower}.",
  },
  {
    id: 'highest-stat-clue',
    category: 'highestStat',
    titleTemplate: 'Stat Clue',
    clueTemplate: 'The scene showed {strongStatTrace}.',
    endTemplate: 'The culprit relied on {strongStatTrace} during the escape.',
  },
  {
    id: 'lowest-stat-clue',
    category: 'lowestStat',
    titleTemplate: 'Stat Clue',
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

const getClueTypeSlot = (pokemon: Pokemon): TypeClueSlot => (
  pokemon.types[1] && Math.random() < 0.5 ? 'secondary' : 'primary'
)

const getSelectedType = (pokemon: Pokemon, clueTypeSlot: TypeClueSlot): PokemonType | null => (
  clueTypeSlot === 'secondary' ? pokemon.types[1] ?? null : pokemon.types[0]
)

const getTypeClueTitle = (hasSecondaryType: boolean, clueTypeSlot: TypeClueSlot): string => {
  if (!hasSecondaryType) return 'Type'
  return clueTypeSlot === 'secondary' ? 'Secondary Type' : 'Primary Type'
}

const getTypeClueLower = (hasSecondaryType: boolean, clueTypeSlot: TypeClueSlot): string => (
  getTypeClueTitle(hasSecondaryType, clueTypeSlot).toLowerCase()
)

const getPokemonCaseProfile = (pokemon: Pokemon, clueTypeSlot: TypeClueSlot): PokemonCaseProfile => {
  const height = getHeightBucket(pokemon)
  const weight = getWeightBucket(pokemon)
  const primaryType = pokemon.types[0]
  const clueType = getSelectedType(pokemon, clueTypeSlot)
  const typeForNarrative = clueType ?? primaryType
  const hasSecondaryType = Boolean(pokemon.types[1])
  const typeClueLower = getTypeClueLower(hasSecondaryType, clueTypeSlot)
  const highestStat = pickPriorityStat(pokemon, strongestStatPriority, 'max')
  const lowestStat = pickPriorityStat(pokemon, weakestStatPriority, 'min')

  return {
    height,
    weight,
    primaryType,
    clueType,
    clueTypeSlot,
    hasSecondaryType,
    highestStat,
    lowestStat,
    values: {
      ...heightValues[height],
      ...weightValues[weight],
      ...typeValues[typeForNarrative],
      ...strongStatValues[highestStat],
      ...weakStatValues[lowestStat],
      typeClueTitle: getTypeClueTitle(hasSecondaryType, clueTypeSlot),
      typeClueLower,
      typeResidue: `${typeClueLower} clue traces`,
      groundTrace: `${typeClueLower} clue traces`,
      forceTrace: `${typeClueLower} clue marks`,
      witnessDetail: `noticing a ${typeClueLower} clue`,
      movementWord: heightValues[height].heightPosition,
      textureWord: `${typeClueLower} clue traces`,
      groundWord: `${typeClueLower} clue traces`,
      waterAvoidanceWord: `noticing a ${typeClueLower} clue`,
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

const getTypeClueLabel = (profile: PokemonCaseProfile): string => {
  return getTypeClueTitle(profile.hasSecondaryType, profile.clueTypeSlot)
}

const getClueRule = (category: EvidenceCategory, profile: PokemonCaseProfile): ClueRule => {
  switch (category) {
    case 'height':
      return { axis: 'height', precision: 'exact', matchingValues: [profile.height] }
    case 'weight':
      return { axis: 'weight', precision: 'exact', matchingValues: [profile.weight] }
    case 'typeResidue':
      return { axis: 'type', precision: 'grouped', matchingValues: profile.clueType ? getTypeClueGroup(profile.clueType) : [] }
    case 'groundTrace':
      return { axis: 'groundTrace', precision: 'grouped', matchingValues: profile.clueType ? getTypeClueGroup(profile.clueType) : [] }
    case 'force':
      return { axis: 'force', precision: 'grouped', matchingValues: profile.clueType ? getTypeClueGroup(profile.clueType) : [] }
    case 'witness':
      return { axis: 'witness', precision: 'grouped', matchingValues: profile.clueType ? getTypeClueGroup(profile.clueType) : [] }
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
      return profile.clueType ?? ''
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

const getEvidenceBadges = (category: EvidenceCategory, profile: PokemonCaseProfile): EvidenceBadgeData[] => {
  switch (category) {
    case 'height':
      return [{ text: `Height: ${formatHeightLabel(profile.height)}` }]
    case 'weight':
      return [{ text: `Weight: ${formatLabel(profile.weight)}` }]
    case 'typeResidue':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return profile.clueType ? getTypeClueGroup(profile.clueType).map((type) => ({ text: formatLabel(type), type })) : []
    case 'highestStat':
      return [{ text: `Strength: ${formatLabel(profile.highestStat)}` }]
    case 'lowestStat':
      return [{ text: `Weakness: ${formatLabel(profile.lowestStat)}` }]
  }
}

const getRelevantCategories = (_pokemon: Pokemon): EvidenceCategory[] => ['height', 'weight', 'typeResidue', 'groundTrace', 'force', 'witness', 'highestStat', 'lowestStat']

const scorePokemonAgainstProfile = (pokemonId: number, culpritProfile: PokemonCaseProfile, categories: EvidenceCategory[]) => {
  const profile = getPokemonCaseProfile(getPokemonById(pokemonId), culpritProfile.clueTypeSlot)

  return categories.reduce((score, category) => {
    const rule = getClueRule(category, culpritProfile)
    const value = getClueRuleValue(profile, category)
    return rule.matchingValues.includes(value) ? score + 1 : score
  }, 0)
}

const getCategoryConclusionFragment = (category: EvidenceCategory, profile: PokemonCaseProfile): string => {
  const typeGroup = formatList(profile.clueType ? getTypeClueGroup(profile.clueType) : [])
  switch (category) {
    case 'height':
      return `${profile.values.heightRequirement} enough to match the height clues`
    case 'weight':
      return `${profile.values.weightRequirement} enough to match the track depth`
    case 'typeResidue':
      return `linked to ${typeGroup} ${getTypeClueLabel(profile).toLowerCase()} traces`
    case 'groundTrace':
      return `linked to ${typeGroup} ${getTypeClueLabel(profile).toLowerCase()} ground traces`
    case 'force':
      return `linked to ${typeGroup} ${getTypeClueLabel(profile).toLowerCase()} entry marks`
    case 'witness':
      return `linked to ${typeGroup} ${getTypeClueLabel(profile).toLowerCase()} witness signs`
    case 'highestStat':
      return `strong in ${profile.values.strongStatTrace}`
    case 'lowestStat':
      return `consistent with ${profile.values.weakStatTrace}`
  }
}

const getCategoryDeductionText = (category: EvidenceCategory, profile: PokemonCaseProfile): string => {
  const typeGroup = formatList(profile.clueType ? getTypeClueGroup(profile.clueType) : [])
  switch (category) {
    case 'height':
      return `This pointed toward a ${profile.values.heightRequirement} Pokemon.`
    case 'weight':
      return `This pointed toward a ${profile.values.weightRequirement} Pokemon.`
    case 'typeResidue':
      return `This narrowed the culprit's ${getTypeClueLabel(profile).toLowerCase()} to ${typeGroup}.`
    case 'groundTrace':
      return `This narrowed the culprit's ${getTypeClueLabel(profile).toLowerCase()} to ${typeGroup}.`
    case 'force':
      return `This narrowed the culprit's ${getTypeClueLabel(profile).toLowerCase()} to ${typeGroup}.`
    case 'witness':
      return `This narrowed the culprit's ${getTypeClueLabel(profile).toLowerCase()} to ${typeGroup}.`
    case 'highestStat':
      return `This suggested the culprit relied on ${profile.values.strongStatTrace}.`
    case 'lowestStat':
      return `This suggested the culprit showed ${profile.values.weakStatTrace}.`
  }
}

const buildEvidenceFromTemplate = (evidenceId: string, culprit: Pokemon, clueTypeSlot: TypeClueSlot): GeneratedEvidence => {
  const profile = getPokemonCaseProfile(culprit, clueTypeSlot)
  const template = getEvidenceTemplate(evidenceId)
  const badges = getEvidenceBadges(template.category, profile)
  const rule = getClueRule(template.category, profile)

  return {
    title: fillTemplate(template.titleTemplate, profile.values),
    clueText: fillTemplate(template.clueTemplate, profile.values),
    badges,
    rule,
    deductionText: getCategoryDeductionText(template.category, profile),
  }
}

const buildActionNarrative = (
  action: LocationAction,
  culprit: Pokemon,
  clueTypeSlot: TypeClueSlot,
  generatedEvidence?: Map<string, GeneratedEvidence>,
) => {
  const profile = getPokemonCaseProfile(culprit, clueTypeSlot)
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
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
  clueTypeSlot: TypeClueSlot = getClueTypeSlot(culprit),
) => {
  const generatedEvidenceById = new Map<string, GeneratedEvidence>()
  const profile = getPokemonCaseProfile(culprit, clueTypeSlot)

  const generatedEvidence = baseEvidence.map((evidenceItem) => {
    const generated = buildEvidenceFromTemplate(evidenceItem.id, culprit, clueTypeSlot)
    generatedEvidenceById.set(evidenceItem.id, generated)
    const override = evidenceOverrides?.[evidenceItem.id]

    return {
      ...evidenceItem,
      title: override?.title ? fillNarrativeTemplate(override.title, profile) : generated.title,
      clueText: override?.clueText ? fillNarrativeTemplate(override.clueText, profile) : generated.clueText,
      badges: generated.badges,
      rule: generated.rule,
    }
  })

  return { generatedEvidence, generatedEvidenceById, clueTypeSlot }
}

export const generateCaseLocations = (
  culprit: Pokemon,
  baseLocations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
  clueTypeSlot: TypeClueSlot = getClueTypeSlot(culprit),
) => {
  const profile = getPokemonCaseProfile(culprit, clueTypeSlot)
  const generatedEvidence = new Map(
    evidenceTemplates.map((template) => {
      const evidenceId = template.id
      const generated = buildEvidenceFromTemplate(evidenceId, culprit, clueTypeSlot)
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
      const generatedNarrative = buildActionNarrative(action, culprit, clueTypeSlot, generatedEvidence)

      return {
        ...action,
        evidenceTitle: generatedEvidenceItem?.title ?? action.evidenceTitle,
        evidenceText: generatedEvidenceItem?.clueText ?? action.evidenceText,
        evidenceBadges: generatedEvidenceItem?.badges,
        clueRule: generatedEvidenceItem?.rule,
        cluePreview: generatedEvidenceItem
          ? { label: generatedEvidenceItem.rule.axis === 'witness' ? generatedEvidenceItem.clueText : generatedEvidenceItem.title }
          : action.cluePreview,
        observationText: generatedNarrative.observationText,
        implicationText: generatedNarrative.implicationText,
      }
    }),
  }))
}

const getMismatchReason = (suspectId: number, culpritProfile: PokemonCaseProfile, categories: EvidenceCategory[]) => {
  const profile = getPokemonCaseProfile(getPokemonById(suspectId), culpritProfile.clueTypeSlot)
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
      return `Did not match the ${formatList(culpritProfile.clueType ? getTypeClueGroup(culpritProfile.clueType) : [])} ${getTypeClueLabel(culpritProfile).toLowerCase()} residue group.`
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

const getMismatchEvidenceLabel = (suspectId: number, culpritProfile: PokemonCaseProfile, categories: EvidenceCategory[]) => {
  const profile = getPokemonCaseProfile(getPokemonById(suspectId), culpritProfile.clueTypeSlot)
  const missingCategory = categories.find((category) => {
    const rule = getClueRule(category, culpritProfile)
    return !rule.matchingValues.includes(getClueRuleValue(profile, category))
  })

  switch (missingCategory) {
    case 'height':
      return 'Height clue'
    case 'weight':
      return 'Weight clue'
    case 'typeResidue':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return 'Type clue'
    case 'highestStat':
    case 'lowestStat':
      return 'Stat clue'
    default:
      return 'Evidence mismatch'
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
  clueTypeSlot: TypeClueSlot,
) => {
  const culprit = getPokemonById(culpritId)
  const culpritProfile = getPokemonCaseProfile(culprit, clueTypeSlot)
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
        badges: primaryAction.evidenceBadges ?? evidenceItem.badges,
        deductionText: generatedEvidenceById.get(evidenceId)?.deductionText ?? getCategoryDeductionText(getEvidenceTemplate(evidenceId).category, culpritProfile),
      }]
    })

  const clearedSuspects: ClearedSuspectExplanation[] = suspectIds
    .filter((suspectId) => suspectId !== culpritId)
    .map((suspectId) => ({
      pokemonId: suspectId,
      reason: getMismatchReason(suspectId, culpritProfile, relevantCategories),
      evidenceLabel: getMismatchEvidenceLabel(suspectId, culpritProfile, relevantCategories),
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
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
) => {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const culprit = pokemonData[Math.floor(Math.random() * pokemonData.length)]
    const clueTypeSlot = getClueTypeSlot(culprit)
    const culpritProfile = getPokemonCaseProfile(culprit, clueTypeSlot)
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
    const { generatedEvidence, generatedEvidenceById } = generateCaseEvidence(culprit, evidence, evidenceOverrides, clueTypeSlot)
    const generatedLocations = generateCaseLocations(culprit, locations, evidenceOverrides, clueTypeSlot)

    return {
      culpritPokemonId: culprit.id,
      suspectPokemonIds: suspectIds,
      evidence: generatedEvidence,
      locations: generatedLocations,
      clueTypeSlot,
      solution: buildSolution(
        culprit.id,
        suspectIds,
        generatedEvidence,
        generatedLocations,
        relevantCategories,
        generatedEvidenceById,
        clueTypeSlot,
      ),
    }
  }

  throw new Error('Unable to generate a solvable case lineup.')
}
