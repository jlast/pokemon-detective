import { pokemonData, type Pokemon, type PokemonColor, type PokemonRegion, type PokemonType } from '../data/pokemon'
import { getSolutionClueBadgesFromEvidence, type CaseDifficulty, type CaseEvidenceExplanation, type ClearedSuspectExplanation, type ClueRule, type Evidence, type EvidenceBadgeData, type EvidenceObservation, type Location, type LocationAction } from './caseModel'
import { previewForEvidenceId } from './cases/shared'
import { getPokemonById } from './suspectCaseFile'

type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'
type HeightBucket = 'short' | 'medium' | 'tall'
type WeightBucket = 'light' | 'medium' | 'heavy'
type EvolutionChainStage = 'stage1' | 'stage2' | 'stage3' | 'noEvolutionChain'
type EvolutionPotential = 'canEvolve' | 'cannotEvolve'
type EvidenceCategory = 'height' | 'weight' | 'typeResidue' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat' | 'typeAffectedness' | 'region' | 'color' | 'evolutionChain'
type ColorGroup = 'warm' | 'cool' | 'neutral'
type TypeAffectedness = 'weak' | 'strong'
type TypeAffectednessCandidate = { affectedness: TypeAffectedness; attackType: PokemonType }
type TypeClueSlot = 'primary' | 'secondary'
type TypeClueSlots = Record<string, TypeClueSlot>
type TypeClueGroups = Record<string, PokemonType[]>
type RegionClueGroups = Record<string, PokemonRegion[]>

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
  observation: EvidenceObservation
}

type ScorePokemonAgainstProfile = (pokemonId: number, culpritProfile: PokemonCaseProfile, clues: EvidenceClue[]) => number

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
  regionClueGroups: RegionClueGroups
  clueTypeSlot: TypeClueSlot
  hasSecondaryType: boolean
  highestStat: StatName
  lowestStat: StatName
  typeAffectedness: TypeAffectedness
  affectednessType: PokemonType
  affectednessValue: string
  region: PokemonRegion
  regionGroup: PokemonRegion[]
  color: PokemonColor
  colorGroup: ColorGroup
  evolutionChainStage: EvolutionChainStage
  evolutionPotential: EvolutionPotential
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
  {
    id: 'region-clue-a',
    category: 'region',
    titleTemplate: 'Regional Trace',
    clueTemplate: 'The scene held details associated with the {regionGroup} regions.',
    endTemplate: 'The scene held details associated with the {regionGroup} regions.',
  },
  {
    id: 'region-clue-b',
    category: 'region',
    titleTemplate: 'Regional Trace',
    clueTemplate: 'The scene held details associated with the {regionGroup} regions.',
    endTemplate: 'The scene held details associated with the {regionGroup} regions.',
  },
  {
    id: 'region-clue-c',
    category: 'region',
    titleTemplate: 'Regional Trace',
    clueTemplate: 'The scene held details associated with the {regionGroup} regions.',
    endTemplate: 'The scene held details associated with the {regionGroup} regions.',
  },
  {
    id: 'color-clue',
    category: 'color',
    titleTemplate: 'Color Trace',
    clueTemplate: 'A visual trace pointed to the {colorGroupLabel}: {colorGroupDescription}.',
    endTemplate: 'A visual trace pointed to the {colorGroupLabel}: {colorGroupDescription}.',
  },
  {
    id: 'evolution-chain-clue',
    category: 'evolutionChain',
    titleTemplate: 'Evolution Trace',
    clueTemplate: 'The clue suggested the culprit {evolutionChainLabel}.',
    endTemplate: 'The clue suggested the culprit {evolutionChainLabel}.',
  },
]

const legacyRegionTemplate: EvidenceTemplate = {
  id: 'region-clue',
  category: 'region',
  titleTemplate: 'Regional Trace',
  clueTemplate: 'The scene held details associated with the {regionGroup} regions.',
  endTemplate: 'The scene held details associated with the {regionGroup} regions.',
}

const evidenceTemplateById = new Map([...evidenceTemplates, legacyRegionTemplate].map((template) => [template.id, template]))

export const getCaseEvidenceTemplates = (difficulty: CaseDifficulty | undefined): EvidenceTemplate[] => (
  difficulty === 'hard'
    ? evidenceTemplates
    : evidenceTemplates.filter((template) => template.id !== 'color-clue')
)

const getRequiredEvidenceIds = (difficulty: CaseDifficulty | undefined): string[] => (
  difficulty === 'hard' ? ['color-clue'] : []
)

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

const getProfileLabel = (hasSecondaryType: boolean, _clueTypeSlot: TypeClueSlot): string => {
  if (!hasSecondaryType) return 'profile'
  return 'type profile'
}

const getEvolutionChainStage = (pokemon: Pokemon): EvolutionChainStage => {
  if (pokemon.evolutionLineStages === 1) return 'noEvolutionChain'
  return `stage${pokemon.evolutionStage}` as EvolutionChainStage
}

const getEvolutionPotential = (pokemon: Pokemon): EvolutionPotential => (
  pokemon.evolutionStage < pokemon.evolutionLineStages ? 'canEvolve' : 'cannotEvolve'
)

const getEvolutionChainLabel = (potential: EvolutionPotential): string => {
  switch (potential) {
    case 'canEvolve':
      return 'can still evolve'
    case 'cannotEvolve':
      return 'cannot evolve anymore'
  }
}

const getEvolutionChainBadgeLabel = (potential: EvolutionPotential): string => {
  switch (potential) {
    case 'canEvolve':
      return 'Can still evolve'
    case 'cannotEvolve':
      return 'Cannot evolve anymore'
  }
}

const pokemonRegions: PokemonRegion[] = [...new Set(pokemonData.map((pokemon) => pokemon.region))]

const colorGroupColors: Record<ColorGroup, PokemonColor[]> = {
  warm: ['red', 'yellow', 'pink'],
  cool: ['blue', 'green', 'purple'],
  neutral: ['black', 'white', 'gray', 'brown'],
}

const getColorGroup = (color: PokemonColor): ColorGroup => {
  if (colorGroupColors.warm.includes(color)) return 'warm'
  if (colorGroupColors.cool.includes(color)) return 'cool'
  return 'neutral'
}

const getColorGroupLabel = (group: ColorGroup): string => `${group} colors`

const getColorGroupDescription = (group: ColorGroup): string => formatList(colorGroupColors[group])

const regionClueEvidenceIds = ['region-clue-a', 'region-clue-b', 'region-clue-c'] as const

const normalizeRegionEvidenceId = (evidenceId: string): string => (
  evidenceId === 'region-clue' ? 'region-clue-a' : evidenceId
)

const createRegionGroup = (region: PokemonRegion, pokemonId: number, variantIndex = 0): PokemonRegion[] => {
  const otherRegions = pokemonRegions.filter((candidateRegion) => candidateRegion !== region)
  const partnerRegions = [0, 1]
    .map((offset) => otherRegions[(pokemonId + variantIndex * 2 + offset) % otherRegions.length])
    .filter((candidateRegion): candidateRegion is PokemonRegion => Boolean(candidateRegion))

  return [region, ...Array.from(new Set(partnerRegions))]
}

const createRegionClueGroups = (pokemon: Pokemon): RegionClueGroups => Object.fromEntries(
  regionClueEvidenceIds.map((evidenceId, index) => [evidenceId, createRegionGroup(pokemon.region, pokemon.id, index)]),
)

const getRegionClueGroup = (profile: PokemonCaseProfile, evidenceId: string): PokemonRegion[] => (
  profile.regionClueGroups[normalizeRegionEvidenceId(evidenceId)] ?? profile.regionGroup
)

const getPokemonCaseProfile = (pokemon: Pokemon, typeClueSlots: TypeClueSlots, typeClueGroups?: TypeClueGroups, regionClueGroups?: RegionClueGroups, activeEvidenceId?: string): PokemonCaseProfile => {
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
  const evolutionChainStage = getEvolutionChainStage(pokemon)
  const evolutionPotential = getEvolutionPotential(pokemon)
  const resolvedRegionClueGroups = regionClueGroups ?? createRegionClueGroups(pokemon)
  const regionGroup = activeEvidenceId
    ? resolvedRegionClueGroups[normalizeRegionEvidenceId(activeEvidenceId)] ?? createRegionGroup(pokemon.region, pokemon.id)
    : createRegionGroup(pokemon.region, pokemon.id)
  const colorGroup = getColorGroup(pokemon.color)

  return {
    height,
    weight,
    primaryType,
    clueType,
    typeClueSlots,
    typeClueGroups: typeClueGroups ?? createTypeClueGroups(pokemon, typeClueSlots),
    regionClueGroups: resolvedRegionClueGroups,
    clueTypeSlot,
    hasSecondaryType,
    highestStat,
    lowestStat,
    typeAffectedness: affectedness,
    affectednessType,
    affectednessValue: getTypeAffectednessValue(affectedness, affectednessType),
    region: pokemon.region,
    regionGroup,
    color: pokemon.color,
    colorGroup,
    evolutionChainStage,
    evolutionPotential,
    values: {
      ...heightValues[height],
      ...weightValues[weight],
      ...typeValues[typeForNarrative],
      ...strongStatValues[highestStat],
      ...weakStatValues[lowestStat],
      affectednessTitle: `${formatLabel(affectednessType)} Reaction`,
      affectednessLabel,
      affectednessRequirement: affectednessLabel,
      region: pokemon.region,
      regionGroup: formatList(regionGroup),
      color: formatLabel(pokemon.color),
      colorGroup: colorGroup,
      colorGroupLabel: getColorGroupLabel(colorGroup),
      colorGroupDescription: getColorGroupDescription(colorGroup),
      evolutionChainLabel: getEvolutionChainLabel(evolutionPotential),
      evolutionChainBadgeLabel: getEvolutionChainBadgeLabel(evolutionPotential),
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
    case 'region':
      return { axis: 'region', precision: 'grouped', matchingValues: getRegionClueGroup(profile, clue.evidenceId) }
    case 'color':
      return { axis: 'color', precision: 'grouped', matchingValues: [profile.colorGroup] }
    case 'evolutionChain':
      return { axis: 'evolutionChain', precision: 'grouped', matchingValues: [profile.evolutionPotential] }
  }
}

const getClueRuleValue = (pokemon: Pokemon, typeClueSlots: TypeClueSlots, clue: EvidenceClue, clueProfile?: PokemonCaseProfile): string => {
  if (clue.category === 'typeResidue' || clue.category === 'groundTrace' || clue.category === 'force' || clue.category === 'witness') {
    if (clueProfile) {
      return pokemon.types.find((type) => getTypeClueGroup(clueProfile, clue.evidenceId).includes(type)) ?? getPokemonCaseProfile(pokemon, typeClueSlots, undefined, undefined, clue.evidenceId).clueType ?? ''
    }

    return getPokemonCaseProfile(pokemon, typeClueSlots, undefined, undefined, clue.evidenceId).clueType ?? ''
  }

  switch (clue.category) {
    case 'height':
      return getHeightBucket(pokemon)
    case 'weight':
      return getWeightBucket(pokemon)
    case 'highestStat':
      return pickPriorityStat(pokemon, strongestStatPriority, 'max')
    case 'lowestStat':
      return pickPriorityStat(pokemon, weakestStatPriority, 'min')
    case 'typeAffectedness':
      return getPokemonAffectednessRuleValue(pokemon, clueProfile?.affectednessType ?? getTypeAffectedness(pokemon).attackType)
    case 'region':
      return pokemon.region
    case 'color':
      return getColorGroup(pokemon.color)
    case 'evolutionChain':
      return getEvolutionPotential(pokemon)
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
    case 'region':
      return [{ text: `Region: ${formatList(getRegionClueGroup(profile, clue.evidenceId))}` }]
    case 'color':
      return [{ text: `Color: ${getColorGroupLabel(profile.colorGroup)} (${getColorGroupDescription(profile.colorGroup)})` }]
    case 'evolutionChain':
      return [{ text: `Evolution: ${getEvolutionChainBadgeLabel(profile.evolutionPotential)}` }]
  }
}

const getRelevantClues = (_pokemon: Pokemon, templates: EvidenceTemplate[] = evidenceTemplates): EvidenceClue[] => templates.map((template) => ({
  evidenceId: template.id,
  category: template.category,
}))

const getEvidenceClue = (evidenceId: string): EvidenceClue => {
  const template = getEvidenceTemplate(evidenceId)
  return { evidenceId: template.id, category: template.category }
}

const getEvidenceClues = (evidenceIds: string[]): EvidenceClue[] => evidenceIds.map(getEvidenceClue)

const getLocationChoiceAxis = (category: EvidenceCategory): EvidenceCategory | 'stat' | 'typeClue' => {
  if (category === 'typeResidue' || category === 'groundTrace' || category === 'force' || category === 'witness') return 'typeClue'
  if (category === 'highestStat' || category === 'lowestStat') return 'stat'
  return category
}

const hasDistinctLocationChoiceAxes = (evidenceIds: string[]): boolean => {
  const axes = evidenceIds.map((evidenceId) => getLocationChoiceAxis(getEvidenceClue(evidenceId).category))
  return new Set(axes).size === axes.length
}

const getSingleUseCaseAxis = (evidenceId: string): string | null => (
  getEvidenceClue(evidenceId).category === 'region' ? 'region' : null
)

const hasDistinctSingleUseCaseAxes = (evidenceIds: string[]): boolean => {
  const axes = evidenceIds.map(getSingleUseCaseAxis).filter((axis): axis is string => Boolean(axis))
  return new Set(axes).size === axes.length
}

export const isEvidenceSetSolvable = (
  culpritId: number,
  suspectIds: number[],
  typeClueSlots: TypeClueSlots | undefined,
  typeClueGroups: TypeClueGroups | undefined,
  evidenceIds: string[],
  scoreAgainstProfile: ScorePokemonAgainstProfile = scorePokemonAgainstProfile,
  regionClueGroups?: RegionClueGroups,
): boolean => {
  if (!typeClueSlots || !typeClueGroups || evidenceIds.length === 0) return false

  const culprit = getPokemonById(culpritId)
  const culpritProfile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups)
  const clues = getEvidenceClues([...new Set(evidenceIds)])

  return suspectIds
    .filter((suspectId) => suspectId !== culpritId)
    .every((suspectId) => scoreAgainstProfile(suspectId, culpritProfile, clues) < clues.length)
}

export const areLocationEvidenceChoicesSolvable = (
  culpritId: number,
  suspectIds: number[],
  typeClueSlots: TypeClueSlots | undefined,
  typeClueGroups: TypeClueGroups | undefined,
  locationEvidenceChoices: string[][],
  scoreAgainstProfile: ScorePokemonAgainstProfile = scorePokemonAgainstProfile,
  regionClueGroups?: RegionClueGroups,
): boolean => {
  if (locationEvidenceChoices.length === 0 || locationEvidenceChoices.some((choices) => choices.length === 0)) return false

  const visit = (locationIndex: number, selectedEvidenceIds: string[]): boolean => {
    if (locationIndex >= locationEvidenceChoices.length) {
      return isEvidenceSetSolvable(culpritId, suspectIds, typeClueSlots, typeClueGroups, selectedEvidenceIds, scoreAgainstProfile, regionClueGroups)
    }

    return locationEvidenceChoices[locationIndex]!.every((evidenceId) => (
      visit(locationIndex + 1, [...selectedEvidenceIds, evidenceId])
    ))
  }

  return visit(0, [])
}

const getCombinations = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [[]]
  if (size > items.length) return []

  const combinations: T[][] = []

  const visit = (startIndex: number, selected: T[]) => {
    if (selected.length === size) {
      combinations.push(selected)
      return
    }

    for (let index = startIndex; index <= items.length - (size - selected.length); index += 1) {
      visit(index + 1, [...selected, items[index]!])
    }
  }

  visit(0, [])
  return combinations
}

const pickSolvableLocationEvidenceIds = (
  culpritId: number,
  suspectIds: number[],
  typeClueSlots: TypeClueSlots,
  typeClueGroups: TypeClueGroups,
  locationCount: number,
  scoreAgainstProfile: ScorePokemonAgainstProfile = scorePokemonAgainstProfile,
  regionClueGroups?: RegionClueGroups,
  availableEvidenceTemplates: EvidenceTemplate[] = evidenceTemplates,
  requiredEvidenceIds: string[] = [],
): string[] | null => {
  const evidenceIds = availableEvidenceTemplates.map((template) => template.id)
  const uniqueRequiredEvidenceIds = [...new Set(requiredEvidenceIds.filter((evidenceId) => evidenceIds.includes(evidenceId)))]
  const optionalEvidenceIds = evidenceIds.filter((evidenceId) => !uniqueRequiredEvidenceIds.includes(evidenceId))
  const optionalChoiceCount = Math.min(locationCount, evidenceIds.length) - uniqueRequiredEvidenceIds.length
  if (optionalChoiceCount < 0) return null
  const candidateSets = shuffle(getCombinations(optionalEvidenceIds, optionalChoiceCount).map((candidateSet) => [...uniqueRequiredEvidenceIds, ...candidateSet]))

  return candidateSets.find((candidateSet) => (
    hasDistinctSingleUseCaseAxes(candidateSet) &&
    isEvidenceSetSolvable(culpritId, suspectIds, typeClueSlots, typeClueGroups, candidateSet, scoreAgainstProfile, regionClueGroups)
  )) ?? null
}

const createSolvableLocationEvidenceChoices = (
  culpritId: number,
  suspectIds: number[],
  typeClueSlots: TypeClueSlots,
  typeClueGroups: TypeClueGroups,
  locations: Location[],
  baseEvidenceIds: string[],
  scoreAgainstProfile: ScorePokemonAgainstProfile = scorePokemonAgainstProfile,
  regionClueGroups?: RegionClueGroups,
  availableEvidenceTemplates: EvidenceTemplate[] = evidenceTemplates,
): string[][] | null => {
  const allEvidenceIds = availableEvidenceTemplates.map((template) => template.id)
  const locationEvidenceChoices = shuffle(baseEvidenceIds).map((evidenceId) => [evidenceId])

  for (const [locationIndex, location] of locations.entries()) {
    const choices = locationEvidenceChoices[locationIndex]
    if (!choices) return null

    const additionalChoiceCount = Math.max(location.actions.length - 1, 0)
    for (let choiceIndex = 0; choiceIndex < additionalChoiceCount; choiceIndex += 1) {
      const candidates = shuffle(allEvidenceIds.filter((evidenceId) => !choices.includes(evidenceId)))
      const candidate = candidates.find((evidenceId) => {
        const nextLocationChoices = [...choices, evidenceId]
        if (!hasDistinctLocationChoiceAxes(nextLocationChoices)) return false

        const nextChoices = locationEvidenceChoices.map((locationChoices, index) => (
          index === locationIndex ? nextLocationChoices : locationChoices
        ))

        if (!hasDistinctSingleUseCaseAxes(nextChoices.flat())) return false

        return areLocationEvidenceChoicesSolvable(culpritId, suspectIds, typeClueSlots, typeClueGroups, nextChoices, scoreAgainstProfile, regionClueGroups)
      })

      if (!candidate) return null
      choices.push(candidate)
    }
  }

  return locationEvidenceChoices
}

const assignLocationEvidence = (locations: Location[], locationEvidenceChoices: string[][]): Location[] => {
  return locations.map((location, locationIndex) => {
    const evidenceChoices = locationEvidenceChoices[locationIndex]
    if (!evidenceChoices?.length) return location

    return {
      ...location,
      actions: location.actions.map((action, actionIndex) => {
        const evidenceId = evidenceChoices[actionIndex % evidenceChoices.length]!
        return {
          ...action,
          evidenceId,
          cluePreview: previewForEvidenceId(evidenceId),
          presentation: evidenceId === 'color-clue'
            ? { ...action.presentation, icon: '🖌️', visualType: 'paintbrush', displayLabel: 'Visual trace' }
            : action.presentation,
        }
      }),
    }
  })
}

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
    case 'groundTrace':
    case 'force':
    case 'witness':
      return `matched a type clue for ${typeGroup}`
    case 'highestStat':
      return `strong in ${profile.values.strongStatTrace}`
    case 'lowestStat':
      return `consistent with ${profile.values.weakStatTrace}`
    case 'typeAffectedness':
      return `${profile.values.affectednessRequirement} in type matchups`
    case 'region':
      return `from ${formatList(getRegionClueGroup(profile, clue.evidenceId))}`
    case 'color':
      return `in the ${profile.values.colorGroupLabel}`
    case 'evolutionChain':
      return profile.values.evolutionChainLabel
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
      return `This type clue pointed to ${typeGroup}.`
    case 'highestStat':
      return `This suggested the culprit relied on ${profile.values.strongStatTrace}.`
    case 'lowestStat':
      return `This suggested the culprit showed ${profile.values.weakStatTrace}.`
    case 'typeAffectedness':
      return `This suggested the culprit was ${profile.values.affectednessRequirement}.`
    case 'region':
      return `This pointed toward a Pokemon from ${formatList(getRegionClueGroup(profile, clue.evidenceId))}.`
    case 'color':
      return `This color clue pointed to the ${profile.values.colorGroupLabel}: ${profile.values.colorGroupDescription}.`
    case 'evolutionChain':
      return `This suggested the culprit ${profile.values.evolutionChainLabel}.`
  }
}

const getEvidenceObservation = (clue: EvidenceClue, profile: PokemonCaseProfile, title: string): EvidenceObservation => {
  const typeGroup = formatList(getTypeClueGroup(profile, clue.evidenceId))

  switch (clue.category) {
    case 'height':
      return {
        title,
        observation: `Marks at the scene sat ${profile.values.heightPosition}.`,
        interpretation: `That points to a ${profile.values.heightRequirement} culprit.`,
      }
    case 'weight':
      return {
        title,
        observation: `Tracks along the route were ${profile.values.trackDepth}.`,
        interpretation: `That points to a ${profile.values.weightRequirement} culprit.`,
      }
    case 'typeResidue':
      return {
        title,
        observation: `${formatLabel(profile.clueType ?? profile.primaryType)}-like residue was found at the scene.`,
        interpretation: `The residue is consistent with ${typeGroup} activity.`,
      }
    case 'groundTrace':
      return {
        title,
        observation: `The ground showed ${profile.values.groundTrace}.`,
        interpretation: `The trace profile is consistent with ${typeGroup} activity.`,
      }
    case 'force':
      return {
        title,
        observation: `The entry point showed ${profile.values.forceTrace}.`,
        interpretation: `The marks are consistent with ${typeGroup} activity.`,
      }
    case 'witness':
      return {
        title,
        observation: `A witness described someone ${profile.values.witnessDetail}.`,
        interpretation: `The report is consistent with ${typeGroup} activity.`,
      }
    case 'highestStat':
      return {
        title,
        observation: `The scene showed ${profile.values.strongStatTrace}.`,
        interpretation: `That points toward a suspect whose strongest stat is ${formatLabel(profile.highestStat)}.`,
      }
    case 'lowestStat':
      return {
        title,
        observation: `The route showed ${profile.values.weakStatTrace}.`,
        interpretation: `That points toward a suspect whose weakest stat is ${formatLabel(profile.lowestStat)}.`,
      }
    case 'typeAffectedness':
      return {
        title,
        observation: `The residue reacted as if the culprit was ${profile.values.affectednessRequirement}.`,
        interpretation: `The reaction matters because defensive type matchups can narrow the suspect list.`,
      }
    case 'region':
      return {
        title,
        observation: `Regional traces at the scene pointed toward ${formatList(getRegionClueGroup(profile, clue.evidenceId))}.`,
        interpretation: `That points toward a suspect first discovered in one of those regions.`,
      }
    case 'color':
      return {
        title,
        observation: `A visual trace matched the ${profile.values.colorGroupLabel}.`,
        interpretation: `That means ${profile.values.colorGroupDescription}.`,
      }
    case 'evolutionChain':
      return {
        title,
        observation: `The scene suggested the culprit ${profile.values.evolutionChainLabel}.`,
        interpretation: `That narrows suspects by whether they can still evolve.`,
      }
  }
}

const buildEvidenceFromTemplate = (evidenceId: string, culprit: Pokemon, typeClueSlots: TypeClueSlots, typeClueGroups: TypeClueGroups, regionClueGroups: RegionClueGroups): GeneratedEvidence => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups, evidenceId)
  const template = getEvidenceTemplate(evidenceId)
  const clue = { evidenceId, category: template.category }
  const badges = getEvidenceBadges(clue, profile)
  const rule = getClueRule(clue, profile)
  const title = fillTemplate(template.titleTemplate, profile.values)

  return {
    title,
    clueText: fillTemplate(template.clueTemplate, profile.values),
    badges,
    rule,
    deductionText: getCategoryDeductionText(clue, profile),
    observation: getEvidenceObservation(clue, profile, title),
  }
}

const buildActionNarrative = (
  action: LocationAction,
  culprit: Pokemon,
  typeClueSlots: TypeClueSlots,
  typeClueGroups: TypeClueGroups,
  regionClueGroups: RegionClueGroups,
  generatedEvidence?: Map<string, GeneratedEvidence>,
) => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups, action.evidenceId ?? undefined)
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
  regionClueGroups: RegionClueGroups = createRegionClueGroups(culprit),
  availableEvidenceTemplates: EvidenceTemplate[] = evidenceTemplates,
) => {
  const generatedEvidenceById = new Map<string, GeneratedEvidence>()
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups)
  const availableEvidenceIds = new Set(availableEvidenceTemplates.map((template) => template.id))

  const generatedEvidence = baseEvidence.filter((evidenceItem) => availableEvidenceIds.has(evidenceItem.id)).map((evidenceItem) => {
    const generated = buildEvidenceFromTemplate(evidenceItem.id, culprit, typeClueSlots, typeClueGroups, regionClueGroups)
    generatedEvidenceById.set(evidenceItem.id, generated)
    const override = evidenceOverrides?.[evidenceItem.id]

    return {
      ...evidenceItem,
      title: override?.title ? fillNarrativeTemplate(override.title, profile) : generated.title,
      clueText: override?.clueText ? fillNarrativeTemplate(override.clueText, profile) : generated.clueText,
      badges: generated.badges,
      rule: generated.rule,
      observation: generated.observation,
    }
  })

  return { generatedEvidence, generatedEvidenceById, typeClueSlots, typeClueGroups, regionClueGroups }
}

export const generateCaseLocations = (
  culprit: Pokemon,
  baseLocations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string }>,
  typeClueSlots: TypeClueSlots = createTypeClueSlots(culprit),
  typeClueGroups: TypeClueGroups = createTypeClueGroups(culprit, typeClueSlots),
  regionClueGroups: RegionClueGroups = createRegionClueGroups(culprit),
  availableEvidenceTemplates: EvidenceTemplate[] = evidenceTemplates,
) => {
  const profile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups)
  const generatedEvidence = new Map(
    availableEvidenceTemplates.map((template) => {
      const evidenceId = template.id
      const generated = buildEvidenceFromTemplate(evidenceId, culprit, typeClueSlots, typeClueGroups, regionClueGroups)
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
      const generatedNarrative = buildActionNarrative(action, culprit, typeClueSlots, typeClueGroups, regionClueGroups, generatedEvidence)

      return {
        ...action,
        evidenceTitle: generatedEvidenceItem?.title ?? action.evidenceTitle,
        evidenceText: generatedEvidenceItem?.clueText ?? action.evidenceText,
        evidenceBadges: generatedEvidenceItem?.badges,
        clueRule: generatedEvidenceItem?.rule,
        cluePreview: previewForEvidenceId(action.evidenceId),
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
    case 'groundTrace':
    case 'force':
    case 'witness':
      return `Did not match the ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))} type clue.`
    case 'highestStat':
      return `Did not fit the signs of ${culpritProfile.values.strongStatTrace}.`
    case 'lowestStat':
      return `Did not fit the signs of ${culpritProfile.values.weakStatTrace}.`
    case 'typeAffectedness':
      return `Did not fit the ${culpritProfile.values.affectednessRequirement} type reaction.`
    case 'region':
      return `Did not match the ${formatList(getRegionClueGroup(culpritProfile, missingClue.evidenceId))} region clue.`
    case 'color':
      return `Did not match the ${culpritProfile.values.colorGroupLabel} color clue.`
    case 'evolutionChain':
      return `Did not match ${culpritProfile.values.evolutionChainLabel}.`
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
    case 'groundTrace':
    case 'force':
    case 'witness':
      return `Type clue mismatch: expected ${formatList(getTypeClueGroup(culpritProfile, missingClue.evidenceId))}`
    case 'highestStat':
      return `Strength mismatch: needed ${formatLabel(culpritProfile.highestStat)}`
    case 'lowestStat':
      return `Weakness mismatch: needed ${formatLabel(culpritProfile.lowestStat)}`
    case 'typeAffectedness':
      return `Type reaction mismatch: needed ${culpritProfile.values.affectednessRequirement}`
    case 'region':
      return `Region mismatch: expected ${formatList(getRegionClueGroup(culpritProfile, missingClue.evidenceId))}`
    case 'color':
      return `Color mismatch: expected ${culpritProfile.values.colorGroupLabel}`
    case 'evolutionChain':
      return `Evolution mismatch: needed ${culpritProfile.values.evolutionChainBadgeLabel}`
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
  regionClueGroups: RegionClueGroups,
) => {
  const culprit = getPokemonById(culpritId)
  const culpritProfile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups)
  const evidenceById = new Map(evidence.map((item) => [item.id, item]))

  const solutionEvidenceItems: CaseEvidenceExplanation[] = locations
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
  const evidenceExplanation: CaseEvidenceExplanation[] = solutionEvidenceItems.map(({ badges: _badges, ...item }) => item)

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
    clueBadges: getSolutionClueBadgesFromEvidence(evidence),
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
  const availableEvidenceTemplates = getCaseEvidenceTemplates(options.difficulty)
  const requiredEvidenceIds = getRequiredEvidenceIds(options.difficulty)

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const culprit = pokemonData[Math.floor(Math.random() * pokemonData.length)]
    const typeClueSlots = createTypeClueSlots(culprit)
    const typeClueGroups = createTypeClueGroups(culprit, typeClueSlots)
    const regionClueGroups = createRegionClueGroups(culprit)
    const culpritProfile = getPokemonCaseProfile(culprit, typeClueSlots, typeClueGroups, regionClueGroups)
    const relevantClues = getRelevantClues(culprit, availableEvidenceTemplates)
    const scoreCache = new Map<string, number>()
    const scoreAgainstProfile: ScorePokemonAgainstProfile = (pokemonId, profile, clues) => {
      const clueKey = clues.map((clue) => clue.evidenceId).sort().join('|')
      const key = `${pokemonId}:${clueKey}`
      const cached = scoreCache.get(key)
      if (cached !== undefined) return cached
      const score = scorePokemonAgainstProfile(pokemonId, profile, clues)
      scoreCache.set(key, score)
      return score
    }

    const scoredDistractors = shuffle(
      pokemonData
        .filter((pokemon) => pokemon.id !== culprit.id)
        .map((pokemon) => ({
          pokemonId: pokemon.id,
          score: scoreAgainstProfile(pokemon.id, culpritProfile, relevantClues),
        }))
        .filter((entry) => entry.score < relevantClues.length),
    ).sort((left, right) => right.score - left.score)

    const chosen = options.similarity === 'similar'
      ? [
          ...shuffle(scoredDistractors.slice(0, Math.max(distractorCount * 8, distractorCount))),
          ...scoredDistractors,
        ]
      : (() => {
          const nearMatches = scoredDistractors.filter((entry) => entry.score >= Math.max(relevantClues.length - 2, 1))
          const mediumMatches = scoredDistractors.filter((entry) => entry.score >= 1 && entry.score < Math.max(relevantClues.length - 2, 1))
          const weakMatches = scoredDistractors.filter((entry) => entry.score === 0)

          return [
            ...shuffle(nearMatches).slice(0, 1),
            ...shuffle(mediumMatches).slice(0, 3),
            ...shuffle(weakMatches).slice(0, Math.max(distractorCount - 4, 0)),
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
      ...uniqueDistractors.map((pokemonId) => scoreAgainstProfile(pokemonId, culpritProfile, relevantClues)),
    )

    if (topDistractorScore >= relevantClues.length) {
      continue
    }

    const suspectIds = shuffle([culprit.id, ...uniqueDistractors])
    const solvableLocationEvidenceIds = pickSolvableLocationEvidenceIds(
      culprit.id,
      suspectIds,
      typeClueSlots,
      typeClueGroups,
      locations.length,
      scoreAgainstProfile,
      regionClueGroups,
      availableEvidenceTemplates,
      requiredEvidenceIds,
    )

    if (!solvableLocationEvidenceIds) {
      continue
    }

    const locationEvidenceChoices = createSolvableLocationEvidenceChoices(
      culprit.id,
      suspectIds,
      typeClueSlots,
      typeClueGroups,
      locations,
      solvableLocationEvidenceIds,
      scoreAgainstProfile,
      regionClueGroups,
      availableEvidenceTemplates,
    )

    if (!locationEvidenceChoices) {
      continue
    }

    const randomizedLocations = assignLocationEvidence(locations, locationEvidenceChoices)
    const { generatedEvidence, generatedEvidenceById } = generateCaseEvidence(culprit, evidence, evidenceOverrides, typeClueSlots, typeClueGroups, regionClueGroups, availableEvidenceTemplates)
    const generatedLocations = generateCaseLocations(culprit, randomizedLocations, evidenceOverrides, typeClueSlots, typeClueGroups, regionClueGroups, availableEvidenceTemplates)
    const solutionClues = getEvidenceClues([...new Set(locationEvidenceChoices.flat())])

    return {
      culpritPokemonId: culprit.id,
      suspectPokemonIds: suspectIds,
      evidence: generatedEvidence,
      locations: generatedLocations,
      typeClueSlots,
      typeClueGroups,
      regionClueGroups,
      solution: buildSolution(
        culprit.id,
        suspectIds,
        generatedEvidence,
        generatedLocations,
        solutionClues,
        generatedEvidenceById,
        typeClueSlots,
        typeClueGroups,
        regionClueGroups,
      ),
    }
  }

  throw new Error('Unable to generate a solvable case lineup.')
}
