import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { CaseDifficulty, CaseEvidenceExplanation, ClearedSuspectExplanation, ClueRule, Evidence, EvidenceBadgeData, Location, LocationAction } from './caseModel'
import { getPokemonById } from './suspectCaseFile'

type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'
type HeightBucket = 'short' | 'medium' | 'tall'
type WeightBucket = 'light' | 'medium' | 'heavy'
type EvidenceCategory = 'height' | 'weight' | 'typeResidue' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat' | 'typeAffectedness'
type TypeAffectedness = 'weak' | 'strong'
type TypeAffectednessCandidate = { affectedness: TypeAffectedness; attackType: PokemonType }
type TypeClueSlot = 'primary' | 'secondary'
type TypeClueSlots = Record<string, TypeClueSlot>
type TypeClueGroups = Record<string, PokemonType[]>

type EvidenceClue = {
  evidenceId: string
  category: EvidenceCategory
}

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

type LineupSimilarity = 'mixed' | 'similar'

export type CaseLineupOptions = {
  difficulty?: CaseDifficulty
  suspectCount?: number
  similarity?: LineupSimilarity
}

type PokemonCaseProfile = {
  height: HeightBucket
  weight: WeightBucket
  primaryType: PokemonType
  clueType: PokemonType | null
  typeClueSlots: TypeClueSlots
  typeClueGroups: TypeClueGroups
  clueTypeSlot: TypeClueSlot
  hasSecondaryType: boolean
  highestStat: StatName
  lowestStat: StatName
  typeAffectedness: TypeAffectedness
  affectednessType: PokemonType
  affectednessValue: string
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
    clueTemplate: 'Residue at the scene matched a {profileLabel}.',
    endTemplate: 'Residue at the scene matched a {profileLabel}.',
  },
  {
    id: 'ground-trace-clue',
    category: 'groundTrace',
    titleTemplate: '{groundTitle}',
    clueTemplate: 'Ground traces matched a {traceProfileLabel}.',
    endTemplate: 'Ground traces matched a {traceProfileLabel}.',
  },
  {
    id: 'force-clue',
    category: 'force',
    titleTemplate: '{forceTitle}',
    clueTemplate: 'Marks at the entry point matched the {entryProfileLabel}.',
    endTemplate: 'Marks at the entry point matched the {entryProfileLabel}.',
  },
  {
    id: 'witness-clue',
    category: 'witness',
    titleTemplate: '{witnessTitle}',
    clueTemplate: 'A witness report matched a {witnessProfileLabel}.',
    endTemplate: 'A witness report matched a {witnessProfileLabel}.',
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
  {
    id: 'type-affectedness-clue',
    category: 'typeAffectedness',
    titleTemplate: '{affectednessTitle}',
    clueTemplate: 'The scene reaction suggested the culprit was {affectednessLabel}.',
    endTemplate: 'The scene reaction suggested the culprit was {affectednessLabel}.',
  },
]

const evidenceTemplateById = new Map(evidenceTemplates.map((template) => [template.id, template]))

const strongestStatPriority: StatName[] = ['speed', 'attack', 'specialAttack', 'defense', 'specialDefense', 'hp']
const weakestStatPriority: StatName[] = ['hp', 'defense', 'specialDefense', 'attack', 'specialAttack', 'speed']

const typeValues: Record<PokemonType, Record<string, string>> = {
  bug: {
    residueTitle: 'Fine Specks', typeResidue: 'fine powdery specks', groundTitle: 'Tiny Furrows', groundTrace: 'tiny furrows in the soil',
    forceTitle: 'Fine Scrapes', forceTrace: 'fine scraping marks', witnessTitle: 'Skittering Witness', witnessDetail: 'skittering quickly past the scene',
  },
  dark: {
    residueTitle: 'Dusky Smudge', typeResidue: 'a dusky smudge', groundTitle: 'Dimmed Soil', groundTrace: 'dimmed soil',
    forceTitle: 'Subtle Tampering', forceTrace: 'subtle pry marks', witnessTitle: 'Shadowy Movement', witnessDetail: 'slipping through the shadows',
  },
  dragon: {
    residueTitle: 'Rough Dust', typeResidue: 'rough mineral dust', groundTitle: 'Raw Scrape', groundTrace: 'raw scraped earth',
    forceTitle: 'Heavy Scoring', forceTrace: 'deep scoring marks', witnessTitle: 'Powerful Stride', witnessDetail: 'moving with a powerful stride',
  },
  electric: {
    residueTitle: 'Charged Specks', typeResidue: 'charged specks', groundTitle: 'Scuffed Ground', groundTrace: 'scuffed ground',
    forceTitle: 'Faint Scorch', forceTrace: 'a faint scorch', witnessTitle: 'Flickering Lights', witnessDetail: 'passing as the lights flickered',
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
    residueTitle: 'Ash Scatter', typeResidue: 'fine ash', groundTitle: 'Blackened Soil', groundTrace: 'blackened soil',
    forceTitle: 'Warm Mark', forceTrace: 'a faint warm mark', witnessTitle: 'Warm Draft', witnessDetail: 'leaving a warm draft behind',
  },
  flying: {
    residueTitle: 'Light Drift', typeResidue: 'light drifting fibers', groundTitle: 'Disturbed Dust', groundTrace: 'dust disturbed from above',
    forceTitle: 'Grazing Marks', forceTrace: 'grazing marks from above', witnessTitle: 'Overhead Movement', witnessDetail: 'moving overhead',
  },
  ghost: {
    residueTitle: 'Faint Haze', typeResidue: 'a faint haze', groundTitle: 'Chilled Soil', groundTrace: 'chilled soil',
    forceTitle: 'Strange Distortion', forceTrace: 'strange distortion around the latch', witnessTitle: 'Eerie Passage', witnessDetail: 'passing through the area eerily',
  },
  grass: {
    residueTitle: 'Green Flecks', typeResidue: 'green flecks', groundTitle: 'Disturbed Roots', groundTrace: 'disturbed roots',
    forceTitle: 'Vine Marks', forceTrace: 'thin vine-like marks', witnessTitle: 'Rustling Leaves', witnessDetail: 'rustling through nearby leaves',
  },
  ground: {
    residueTitle: 'Dry Grit', typeResidue: 'dry grit', groundTitle: 'Loose Soil', groundTrace: 'loose soil',
    forceTitle: 'Gritty Scrapes', forceTrace: 'gritty scrape marks', witnessTitle: 'Dry Trail', witnessDetail: 'skirting the wettest ground',
  },
  ice: {
    residueTitle: 'Cold Film', typeResidue: 'a cold film', groundTitle: 'Hardened Soil', groundTrace: 'hardened soil',
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
    residueTitle: 'Faint Shimmer', typeResidue: 'a faint shimmer', groundTitle: 'Subtle Impressions', groundTrace: 'subtle impressions',
    forceTitle: 'Odd Distortion', forceTrace: 'odd distortion marks', witnessTitle: 'Uneasy Feeling', witnessDetail: 'leaving an uneasy feeling behind',
  },
  rock: {
    residueTitle: 'Hard Chips', typeResidue: 'hard chips', groundTitle: 'Broken Surface', groundTrace: 'a broken surface',
    forceTitle: 'Hard Scrape', forceTrace: 'hard scrapes', witnessTitle: 'Scraping Steps', witnessDetail: 'scraping across the ground',
  },
  steel: {
    residueTitle: 'Silver Filings', typeResidue: 'silver filings', groundTitle: 'Scraped Ground', groundTrace: 'scraped ground',
    forceTitle: 'Bright Score', forceTrace: 'bright score marks', witnessTitle: 'Clinking Sound', witnessDetail: 'making a faint clinking sound',
  },
  water: {
    residueTitle: 'Wet Smears', typeResidue: 'damp residue', groundTitle: 'Soft Mud', groundTrace: 'soft mud',
    forceTitle: 'Washed Mark', forceTrace: 'washed-smooth marks', witnessTitle: 'Splashing Movement', witnessDetail: 'splashing near the wet ground',
  },
}

const pokemonTypes = Object.keys(typeValues) as PokemonType[]

const typeEffectiveness: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
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

const getDefensiveMultiplier = (pokemon: Pokemon, attackType: PokemonType): number => (
  pokemon.types.reduce((multiplier, defenseType) => multiplier * (typeEffectiveness[attackType][defenseType] ?? 1), 1)
)

const getTypeAffectednessValue = (affectedness: TypeAffectedness, attackType: PokemonType): string => `${affectedness}:${attackType}`

const getPokemonAffectednessCandidates = (pokemon: Pokemon): TypeAffectednessCandidate[] => pokemonTypes.flatMap((attackType): TypeAffectednessCandidate[] => {
  const multiplier = getDefensiveMultiplier(pokemon, attackType)
  if (multiplier > 1) return [{ affectedness: 'weak', attackType }]
  if (multiplier < 1) return [{ affectedness: 'strong', attackType }]
  return []
})

const getTypeAffectedness = (pokemon: Pokemon): TypeAffectednessCandidate => {
  const candidates = getPokemonAffectednessCandidates(pokemon)
  return candidates.find((candidate) => candidate.affectedness === 'weak') ?? candidates[0] ?? { affectedness: 'weak' as const, attackType: 'normal' as const }
}

const getPokemonAffectednessRuleValue = (pokemon: Pokemon, attackType: PokemonType): string => {
  const multiplier = getDefensiveMultiplier(pokemon, attackType)
  if (multiplier > 1) return getTypeAffectednessValue('weak', attackType)
  if (multiplier < 1) return getTypeAffectednessValue('strong', attackType)
  return `neutral:${attackType}`
}

const getClueTypeSlot = (pokemon: Pokemon): TypeClueSlot => (
  pokemon.types[1] && Math.random() < 0.5 ? 'secondary' : 'primary'
)

const getSelectedType = (pokemon: Pokemon, clueTypeSlot: TypeClueSlot): PokemonType | null => (
  clueTypeSlot === 'secondary' ? pokemon.types[1] ?? null : pokemon.types[0]
)

const getTypeEvidenceTemplates = () => evidenceTemplates.filter((template) => isTypeClueCategory(template.category))

const createTypeClueSlots = (pokemon: Pokemon): TypeClueSlots => Object.fromEntries(
  getTypeEvidenceTemplates().map((template) => [template.id, getClueTypeSlot(pokemon)]),
)

const createTypeClueGroup = (clueType: PokemonType | null, culpritTypes: PokemonType[]): PokemonType[] => {
  if (!clueType) return []

  const culpritTypeSet = new Set(culpritTypes)
  const distractors = shuffle(pokemonTypes.filter((type) => !culpritTypeSet.has(type))).slice(0, 2)
  return shuffle([clueType, ...distractors])
}

const isTypeClueCategory = (category: EvidenceCategory): boolean => (
  category === 'typeResidue' || category === 'groundTrace' || category === 'force' || category === 'witness'
)

const createTypeClueGroups = (pokemon: Pokemon, typeClueSlots: TypeClueSlots): TypeClueGroups => Object.fromEntries(
  getTypeEvidenceTemplates()
    .map((template) => [template.id, createTypeClueGroup(getSelectedType(pokemon, typeClueSlots[template.id] ?? 'primary'), pokemon.types)]),
)

const getTypeClueGroup = (profile: PokemonCaseProfile, evidenceId: string): PokemonType[] => (
  profile.typeClueGroups[evidenceId] ?? []
)

const getProfileLabel = (hasSecondaryType: boolean, clueTypeSlot: TypeClueSlot): string => {
  if (!hasSecondaryType) return 'profile'
  return clueTypeSlot === 'secondary' ? 'secondary profile' : 'primary profile'
}

const getPokemonCaseProfile = (pokemon: Pokemon, typeClueSlots: TypeClueSlots, typeClueGroups?: TypeClueGroups, activeEvidenceId?: string): PokemonCaseProfile => {
  const height = getHeightBucket(pokemon)
  const weight = getWeightBucket(pokemon)
  const primaryType = pokemon.types[0]
  const clueTypeSlot = activeEvidenceId ? typeClueSlots[activeEvidenceId] ?? 'primary' : 'primary'
  const clueType = getSelectedType(pokemon, clueTypeSlot)
  const typeForNarrative = clueType ?? primaryType
  const hasSecondaryType = Boolean(pokemon.types[1])
  const profileLabel = getProfileLabel(hasSecondaryType, clueTypeSlot)
  const highestStat = pickPriorityStat(pokemon, strongestStatPriority, 'max')
  const lowestStat = pickPriorityStat(pokemon, weakestStatPriority, 'min')
  const { affectedness, attackType: affectednessType } = getTypeAffectedness(pokemon)
  const affectednessLabel = `${affectedness === 'weak' ? 'weak' : 'strong'} to ${formatLabel(affectednessType)}`

  return {
    height,
    weight,
    primaryType,
    clueType,
    typeClueSlots,
    typeClueGroups: typeClueGroups ?? createTypeClueGroups(pokemon, typeClueSlots),
    clueTypeSlot,
    hasSecondaryType,
    highestStat,
    lowestStat,
    typeAffectedness: affectedness,
    affectednessType,
    affectednessValue: getTypeAffectednessValue(affectedness, affectednessType),
    values: {
      ...heightValues[height],
      ...weightValues[weight],
      ...typeValues[typeForNarrative],
      ...strongStatValues[highestStat],
      ...weakStatValues[lowestStat],
      affectednessTitle: `${formatLabel(affectednessType)} Reaction`,
      affectednessLabel,
      affectednessRequirement: affectednessLabel,
      profileLabel,
      traceProfileLabel: profileLabel,
      entryProfileLabel: profileLabel,
      witnessProfileLabel: profileLabel,
      typeResidue: 'unusual residue traces',
      groundTrace: 'unusual trace marks',
      forceTrace: 'unusual entry marks',
      witnessDetail: `describing a ${profileLabel}`,
      movementWord: heightValues[height].heightPosition,
      textureWord: 'unusual residue traces',
      groundWord: 'unusual trace marks',
      waterAvoidanceWord: `describing a ${profileLabel}`,
    },
  }
}

const fillTemplate = (template: string, values: Record<string, string>): string => (
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => values[key] ?? match)
)

const fillNarrativeTemplate = (template: string, profile: PokemonCaseProfile): string => fillTemplate(template, profile.values)

const getEvidenceTemplate = (evidenceId: string): EvidenceTemplate => evidenceTemplateById.get(evidenceId) ?? evidenceTemplates[0]!

const formatList = (values: string[]): string => {
  const labels = values.map(formatLabel)
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}`
}

const getTypeClueLabel = (profile: PokemonCaseProfile): string => {
  return getProfileLabel(profile.hasSecondaryType, profile.clueTypeSlot)
}

const getCategoryProfileLabel = (clue: EvidenceClue, profile: PokemonCaseProfile): string => {
  const profileLabel = getTypeClueLabel(profile)

  switch (clue.category) {
    case 'typeResidue':
      return `residue ${profileLabel}`
    case 'groundTrace':
      return `trace ${profileLabel}`
    case 'force':
      return `entry ${profileLabel}`
    case 'witness':
      return `witness ${profileLabel}`
    case 'typeAffectedness':
      return 'type reaction profile'
    default:
      return profileLabel
  }
}

const getClueRule = (clue: EvidenceClue, profile: PokemonCaseProfile): ClueRule => {
  switch (clue.category) {
    case 'height':
      return { axis: 'height', precision: 'exact', matchingValues: [profile.height] }
    case 'weight':
      return { axis: 'weight', precision: 'exact', matchingValues: [profile.weight] }
    case 'typeResidue':
      return { axis: 'type', precision: 'grouped', matchingValues: getTypeClueGroup(profile, clue.evidenceId) }
    case 'groundTrace':
      return { axis: 'groundTrace', precision: 'grouped', matchingValues: getTypeClueGroup(profile, clue.evidenceId) }
    case 'force':
      return { axis: 'force', precision: 'grouped', matchingValues: getTypeClueGroup(profile, clue.evidenceId) }
    case 'witness':
      return { axis: 'witness', precision: 'grouped', matchingValues: getTypeClueGroup(profile, clue.evidenceId) }
    case 'highestStat':
      return { axis: 'highestStat', precision: 'exact', matchingValues: [profile.highestStat] }
    case 'lowestStat':
      return { axis: 'lowestStat', precision: 'exact', matchingValues: [profile.lowestStat] }
    case 'typeAffectedness':
      return { axis: 'typeAffectedness', precision: 'exact', matchingValues: [profile.affectednessValue] }
  }
}

const getClueRuleValue = (pokemon: Pokemon, typeClueSlots: TypeClueSlots, clue: EvidenceClue, clueProfile?: PokemonCaseProfile): string => {
  const profile = getPokemonCaseProfile(pokemon, typeClueSlots, undefined, clue.evidenceId)

  switch (clue.category) {
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
    case 'typeAffectedness':
      return getPokemonAffectednessRuleValue(pokemon, clueProfile?.affectednessType ?? profile.affectednessType)
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

const getEvidenceBadges = (clue: EvidenceClue, profile: PokemonCaseProfile): EvidenceBadgeData[] => {
  switch (clue.category) {
    case 'height':
      return [{ text: `Height: ${formatHeightLabel(profile.height)}` }]
    case 'weight':
      return [{ text: `Weight: ${formatLabel(profile.weight)}` }]
    case 'typeResidue':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return getTypeClueGroup(profile, clue.evidenceId).map((type) => ({ text: formatLabel(type), type }))
    case 'highestStat':
      return [{ text: `Strength: ${formatLabel(profile.highestStat)}` }]
    case 'lowestStat':
      return [{ text: `Weakness: ${formatLabel(profile.lowestStat)}` }]
    case 'typeAffectedness':
      return [{ text: `${profile.typeAffectedness === 'weak' ? 'Weak' : 'Strong'} to ${formatLabel(profile.affectednessType)}`, type: profile.affectednessType }]
  }
}

const getRelevantClues = (_pokemon: Pokemon): EvidenceClue[] => evidenceTemplates.map((template) => ({
  evidenceId: template.id,
  category: template.category,
}))

const scorePokemonAgainstProfile = (pokemonId: number, culpritProfile: PokemonCaseProfile, clues: EvidenceClue[]) => {
  const pokemon = getPokemonById(pokemonId)

  return clues.reduce((score, clue) => {
    const rule = getClueRule(clue, culpritProfile)
    const value = getClueRuleValue(pokemon, culpritProfile.typeClueSlots, clue, culpritProfile)
    return rule.matchingValues.includes(value) ? score + 1 : score
  }, 0)
}

const getCategoryConclusionFragment = (clue: EvidenceClue, profile: PokemonCaseProfile): string => {
  const typeGroup = formatList(getTypeClueGroup(profile, clue.evidenceId))
  switch (clue.category) {
    case 'height':
      return `${profile.values.heightRequirement} enough to match the height clues`
    case 'weight':
      return `${profile.values.weightRequirement} enough to match the track depth`
    case 'typeResidue':
      return `linked to ${typeGroup} residue profiles`
    case 'groundTrace':
      return `linked to ${typeGroup} trace profiles`
    case 'force':
      return `linked to ${typeGroup} entry profiles`
    case 'witness':
      return `linked to ${typeGroup} witness profiles`
    case 'highestStat':
      return `strong in ${profile.values.strongStatTrace}`
    case 'lowestStat':
      return `consistent with ${profile.values.weakStatTrace}`
    case 'typeAffectedness':
      return `${profile.values.affectednessRequirement} in type matchups`
  }
}

const getCategoryDeductionText = (clue: EvidenceClue, profile: PokemonCaseProfile): string => {
  const typeGroup = formatList(getTypeClueGroup(profile, clue.evidenceId))
  switch (clue.category) {
    case 'height':
      return `This pointed toward a ${profile.values.heightRequirement} Pokemon.`
    case 'weight':
      return `This pointed toward a ${profile.values.weightRequirement} Pokemon.`
    case 'typeResidue':
    case 'groundTrace':
    case 'force':
    case 'witness':
      return `This narrowed the ${getCategoryProfileLabel(clue, profile)} to ${typeGroup}.`
    case 'highestStat':
      return `This suggested the culprit relied on ${profile.values.strongStatTrace}.`
    case 'lowestStat':
      return `This suggested the culprit showed ${profile.values.weakStatTrace}.`
    case 'typeAffectedness':
      return `This suggested the culprit was ${profile.values.affectednessRequirement}.`
  }
}

const buildEvidenceFromTemplate = (evidenceId: string, culprit: Pokemon, typeClueSlots: TypeClueSlots, typeClueGroups: TypeClueGroups): GeneratedEvidence => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, evidenceId)
  const template = getEvidenceTemplate(evidenceId)
  const clue = { evidenceId, category: template.category }
  const badges = getEvidenceBadges(clue, profile)
  const rule = getClueRule(clue, profile)

  return {
    title: fillTemplate(template.titleTemplate, profile.values),
    clueText: fillTemplate(template.clueTemplate, profile.values),
    badges,
    rule,
    deductionText: getCategoryDeductionText(clue, profile),
  }
}

const buildActionNarrative = (
  action: LocationAction,
  culprit: Pokemon,
  typeClueSlots: TypeClueSlots,
  typeClueGroups: TypeClueGroups,
  generatedEvidence?: Map<string, GeneratedEvidence>,
) => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, action.evidenceId ?? undefined)
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
  typeClueSlots: TypeClueSlots = createTypeClueSlots(culprit),
  typeClueGroups: TypeClueGroups = createTypeClueGroups(culprit, typeClueSlots),
) => {
  const generatedEvidenceById = new Map<string, GeneratedEvidence>()
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups)

  const generatedEvidence = baseEvidence.map((evidenceItem) => {
    const generated = buildEvidenceFromTemplate(evidenceItem.id, culprit, typeClueSlots, typeClueGroups)
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

  return { generatedEvidence, generatedEvidenceById, typeClueSlots, typeClueGroups }
}

export const generateCaseLocations = (
  culprit: Pokemon,
  baseLocations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
  typeClueSlots: TypeClueSlots = createTypeClueSlots(culprit),
  typeClueGroups: TypeClueGroups = createTypeClueGroups(culprit, typeClueSlots),
) => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups)
  const generatedEvidence = new Map(
    evidenceTemplates.map((template) => {
      const evidenceId = template.id
      const generated = buildEvidenceFromTemplate(evidenceId, culprit, typeClueSlots, typeClueGroups)
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
      const generatedNarrative = buildActionNarrative(action, culprit, typeClueSlots, typeClueGroups, generatedEvidence)

      return {
        ...action,
        evidenceTitle: generatedEvidenceItem?.title ?? action.evidenceTitle,
        evidenceText: generatedEvidenceItem?.clueText ?? action.evidenceText,
        evidenceBadges: generatedEvidenceItem?.badges,
        clueRule: generatedEvidenceItem?.rule,
        cluePreview: action.cluePreview,
        observationText: generatedNarrative.observationText,
        implicationText: generatedNarrative.implicationText,
      }
    }),
  }))
}

const getMismatchReason = (suspectId: number, culpritProfile: PokemonCaseProfile, clues: EvidenceClue[]) => {
  const pokemon = getPokemonById(suspectId)
  const missingClue = clues.find((clue) => {
    const rule = getClueRule(clue, culpritProfile)
    return !rule.matchingValues.includes(getClueRuleValue(pokemon, culpritProfile.typeClueSlots, clue, culpritProfile))
  })

  switch (missingClue?.category) {
    case 'height':
      return `Did not fit the ${culpritProfile.values.heightRequirement} height clues.`
    case 'weight':
      return `Did not fit the ${culpritProfile.values.weightRequirement} track clues.`
    case 'typeResidue':
      return `Did not match the ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} residue profile.`
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
    case 'typeAffectedness':
      return `Did not fit the ${culpritProfile.values.affectednessRequirement} type reaction.`
    default:
      return 'The collected clues did not support this suspect strongly enough.'
  }
}

const getMismatchEvidenceLabel = (suspectId: number, culpritProfile: PokemonCaseProfile, clues: EvidenceClue[]) => {
  const pokemon = getPokemonById(suspectId)
  const missingClue = clues.find((clue) => {
    const rule = getClueRule(clue, culpritProfile)
    return !rule.matchingValues.includes(getClueRuleValue(pokemon, culpritProfile.typeClueSlots, clue, culpritProfile))
  })

  switch (missingClue?.category) {
    case 'height':
      return `Height mismatch: needed a ${culpritProfile.values.heightRequirement} Pokemon`
    case 'weight':
      return `Track mismatch: needed a ${culpritProfile.values.weightRequirement} Pokemon`
    case 'typeResidue':
      return `Residue mismatch: expected ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} profile`
    case 'groundTrace':
      return `Ground trace mismatch: expected ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} profile`
    case 'force':
      return `Entry mark mismatch: expected ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} profile`
    case 'witness':
      return `Witness mismatch: expected ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} profile`
    case 'highestStat':
      return `Strength mismatch: needed ${formatLabel(culpritProfile.highestStat)}`
    case 'lowestStat':
      return `Weakness mismatch: needed ${formatLabel(culpritProfile.lowestStat)}`
    case 'typeAffectedness':
      return `Type reaction mismatch: needed ${culpritProfile.values.affectednessRequirement}`
    default:
      return 'Clue profile mismatch: did not match the collected evidence'
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
  relevantClues: EvidenceClue[],
  generatedEvidenceById: Map<string, GeneratedEvidence>,
  typeClueSlots: TypeClueSlots,
  typeClueGroups: TypeClueGroups,
) => {
  const culprit = getPokemonById(culpritId)
  const culpritProfile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups)
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
        deductionText: generatedEvidenceById.get(evidenceId)?.deductionText ?? getCategoryDeductionText({ evidenceId, category: getEvidenceTemplate(evidenceId).category }, culpritProfile),
      }]
    })

  const clearedSuspects: ClearedSuspectExplanation[] = suspectIds
    .filter((suspectId) => suspectId !== culpritId)
    .map((suspectId) => ({
      pokemonId: suspectId,
      reason: getMismatchReason(suspectId, culpritProfile, relevantClues),
      evidenceLabel: getMismatchEvidenceLabel(suspectId, culpritProfile, relevantClues),
    }))

  return {
    culpritRevealText: `${culprit.name} was behind the case.`,
    detectiveConclusion: `The culprit had to be ${joinFragments(relevantClues.map((clue) => getCategoryConclusionFragment(clue, culpritProfile)))}. ${culprit.name} best fit the collected evidence.`,
    evidenceExplanation,
    clearedSuspects,
  }
}

export const generateCaseLineup = (
  evidence: Evidence[],
  locations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
  options: CaseLineupOptions = {},
) => {
  const suspectCount = options.suspectCount ?? 6
  const distractorCount = suspectCount - 1

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const culprit = pokemonData[Math.floor(Math.random() * pokemonData.length)]
    const typeClueSlots = createTypeClueSlots(culprit)
    const typeClueGroups = createTypeClueGroups(culprit, typeClueSlots)
    const culpritProfile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups)
    const relevantClues = getRelevantClues(culprit)

    const scoredDistractors = shuffle(
      pokemonData
        .filter((pokemon) => pokemon.id !== culprit.id)
        .map((pokemon) => ({
          pokemonId: pokemon.id,
          score: scorePokemonAgainstProfile(pokemon.id, culpritProfile, relevantClues),
        }))
        .filter((entry) => entry.score < relevantClues.length),
    ).sort((left, right) => right.score - left.score)

    const chosen = options.similarity === 'similar'
      ? scoredDistractors
      : (() => {
          const nearMatches = scoredDistractors.filter((entry) => entry.score >= Math.max(relevantClues.length - 2, 1))
          const mediumMatches = scoredDistractors.filter((entry) => entry.score >= 1 && entry.score < Math.max(relevantClues.length - 2, 1))
          const weakMatches = scoredDistractors.filter((entry) => entry.score === 0)

          return [
            ...nearMatches.slice(0, 2),
            ...mediumMatches.slice(0, 2),
            ...weakMatches.slice(0, Math.max(distractorCount - 4, 0)),
            ...scoredDistractors,
          ]
        })()

    const uniqueDistractors = Array.from(new Map(chosen.map((entry) => [entry.pokemonId, entry])).values())
      .slice(0, distractorCount)
      .map((entry) => entry.pokemonId)

    if (uniqueDistractors.length < distractorCount) {
      continue
    }

    const topDistractorScore = Math.max(
      ...uniqueDistractors.map((pokemonId) => scorePokemonAgainstProfile(pokemonId, culpritProfile, relevantClues)),
    )

    if (topDistractorScore >= relevantClues.length) {
      continue
    }

    const suspectIds = shuffle([culprit.id, ...uniqueDistractors])
    const { generatedEvidence, generatedEvidenceById } = generateCaseEvidence(culprit, evidence, evidenceOverrides, typeClueSlots, typeClueGroups)
    const generatedLocations = generateCaseLocations(culprit, locations, evidenceOverrides, typeClueSlots, typeClueGroups)

    return {
      culpritPokemonId: culprit.id,
      suspectPokemonIds: suspectIds,
      evidence: generatedEvidence,
      locations: generatedLocations,
      typeClueSlots,
      typeClueGroups,
      solution: buildSolution(
        culprit.id,
        suspectIds,
        generatedEvidence,
        generatedLocations,
        relevantClues,
        generatedEvidenceById,
        typeClueSlots,
        typeClueGroups,
      ),
    }
  }

  throw new Error('Unable to generate a solvable case lineup.')
}
