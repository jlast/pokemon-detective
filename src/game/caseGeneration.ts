import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { CaseEvidenceExplanation, ClearedSuspectExplanation, Evidence, Location, LocationAction } from './caseModel'
import { getPokemonById } from './suspectCaseFile'

export type CaseTrait =
  | 'short_height'
  | 'medium_height'
  | 'tall_height'
  | 'light_weight'
  | 'medium_weight'
  | 'heavy_weight'
  | 'ground_affinity'
  | 'burrowing'
  | 'claw_or_scratch'
  | 'dry_environment'
  | 'water_affinity'
  | 'moisture_residue'
  | 'fire_heat'
  | 'ash_or_scorch'
  | 'air_movement'
  | 'plant_residue'
  | 'psychic_trace'
  | 'metal_scrape'
  | 'toxic_residue'
  | 'electrical_interference'
  | 'heavy_impact'
  | 'light_or_glow'
  | 'water_displacement'
  | 'stone_fragment'
  | 'cold_aura'
  | 'hp_focus'
  | 'attack_focus'
  | 'defense_focus'
  | 'special_attack_focus'
  | 'special_defense_focus'
  | 'speed_focus'
  | 'hp_poor'
  | 'attack_poor'
  | 'defense_poor'
  | 'special_attack_poor'
  | 'special_defense_poor'
  | 'speed_poor'
  | 'any'

type TraitRule = {
  trait: CaseTrait
  types?: PokemonType[]
  requirePrimary?: boolean
  check?: (pokemon: Pokemon) => boolean
}

const traitRules: TraitRule[] = [
  { trait: 'short_height', check: (p) => p.heightM <= 0.6 },
  { trait: 'medium_height', check: (p) => p.heightM > 0.6 && p.heightM < 1.4 },
  { trait: 'tall_height', check: (p) => p.heightM >= 1.4 },
  { trait: 'light_weight', check: (p) => p.weightKg <= 12 },
  { trait: 'medium_weight', check: (p) => p.weightKg > 12 && p.weightKg < 45 },
  { trait: 'heavy_weight', check: (p) => p.weightKg >= 45 },
  { trait: 'ground_affinity', types: ['ground', 'rock', 'fighting', 'normal', 'dragon'] },
  { trait: 'burrowing', types: ['ground', 'rock', 'bug'] },
  { trait: 'claw_or_scratch', types: ['ground', 'rock', 'bug', 'dark', 'fighting', 'steel', 'normal'] },
  { trait: 'dry_environment', types: ['ground', 'rock', 'fire'], requirePrimary: true },
  { trait: 'water_affinity', types: ['water', 'ice'] },
  { trait: 'moisture_residue', types: ['water', 'ice', 'grass', 'poison'] },
  { trait: 'fire_heat', types: ['fire', 'electric', 'dragon'] },
  { trait: 'ash_or_scorch', types: ['fire', 'electric'] },
  { trait: 'air_movement', types: ['flying', 'ghost'] },
  { trait: 'plant_residue', types: ['grass', 'bug'] },
  { trait: 'psychic_trace', types: ['psychic', 'ghost', 'dark', 'fairy'] },
  { trait: 'metal_scrape', types: ['steel'] },
  { trait: 'toxic_residue', types: ['poison'] },
  { trait: 'electrical_interference', types: ['electric'] },
  { trait: 'heavy_impact', check: (p) => p.weightKg >= 70 },
  { trait: 'light_or_glow', types: ['electric', 'fairy', 'psychic', 'fire', 'ghost'] },
  { trait: 'water_displacement', types: ['water'], requirePrimary: true },
  { trait: 'stone_fragment', types: ['rock', 'ground', 'steel'] },
  { trait: 'cold_aura', types: ['ice', 'ghost'] },
]

const statTraitPriority: CaseTrait[] = [
  'speed_focus',
  'attack_focus',
  'special_attack_focus',
  'defense_focus',
  'special_defense_focus',
  'hp_focus',
  'speed_poor',
  'attack_poor',
  'special_attack_poor',
  'defense_poor',
  'special_defense_poor',
  'hp_poor',
]

const traitPriority: CaseTrait[] = [...traitRules.map((rule) => rule.trait), ...statTraitPriority]

export const evidenceTraitById: Record<string, CaseTrait> = {
  'cookie-crumbs': 'short_height',
  'quiet-digging': 'burrowing',
  'small-tracks': 'light_weight',
  'sand-trail': 'ground_affinity',
  'loose-soil': 'burrowing',
  'scratch-marks': 'claw_or_scratch',
  'low-crumbs': 'short_height',
  'high-reach': 'tall_height',
  'deep-prints': 'heavy_weight',
  'light-tracks': 'light_weight',
  'avoided-water': 'dry_environment',
  'dry-trail': 'ground_affinity',
  'ash-scatter': 'ash_or_scorch',
  'static-mark': 'fire_heat',
  'frost-trail': 'moisture_residue',
  'pollen-scent': 'plant_residue',
  'psychic-echo': 'psychic_trace',
  'metal-shaving': 'metal_scrape',
  'slime-trail': 'toxic_residue',
  'feather-drift': 'air_movement',
  'flicker-surge': 'electrical_interference',
  'heavy-dent': 'heavy_impact',
  'glow-dust': 'light_or_glow',
  'splash-burst': 'water_displacement',
  'stone-chips': 'stone_fragment',
  'cold-spot': 'cold_aura',
  'steady-endurance': 'hp_focus',
  'forceful-entry': 'attack_focus',
  'braced-tracks': 'defense_focus',
  'energy-bloom': 'special_attack_focus',
  'weathered-calm': 'special_defense_focus',
  'swift-pass': 'speed_focus',
  'winded-pause': 'hp_poor',
  'gentle-handling': 'attack_poor',
  'brittle-pass': 'defense_poor',
  'faded-surge': 'special_attack_poor',
  'shaken-focus': 'special_defense_poor',
  'slow-route': 'speed_poor',
}

type ActionEvidencePool = {
  actionId: string
  locationId: string
  pool: { evidenceId: string; trait: CaseTrait }[]
  isPrimary: boolean
}

type RequiredEvidenceCategoryId = 'height' | 'weight' | 'primary_type' | 'secondary_type' | 'highest_stat' | 'lowest_stat'

type RequiredEvidenceCategory = {
  id: RequiredEvidenceCategoryId
  traits: CaseTrait[]
}

type ChosenEvidence = {
  evidenceId: string
  trait: CaseTrait
}

const actionEvidencePools: ActionEvidencePool[] = [
  { actionId: 'crumbs', locationId: 'campsite', isPrimary: true, pool: [
    { evidenceId: 'cookie-crumbs', trait: 'short_height' },
    { evidenceId: 'cookie-crumbs', trait: 'medium_height' },
    { evidenceId: 'cookie-crumbs', trait: 'tall_height' },
    { evidenceId: 'high-reach', trait: 'tall_height' },
    { evidenceId: 'ash-scatter', trait: 'ash_or_scorch' },
    { evidenceId: 'pollen-scent', trait: 'plant_residue' },
    { evidenceId: 'glow-dust', trait: 'light_or_glow' },
    { evidenceId: 'steady-endurance', trait: 'hp_focus' },
  ]},
  { actionId: 'campers', locationId: 'campsite', isPrimary: false, pool: [
    { evidenceId: 'quiet-digging', trait: 'burrowing' },
    { evidenceId: 'psychic-echo', trait: 'psychic_trace' },
    { evidenceId: 'slime-trail', trait: 'toxic_residue' },
    { evidenceId: 'flicker-surge', trait: 'electrical_interference' },
    { evidenceId: 'shaken-focus', trait: 'special_defense_poor' },
    { evidenceId: 'cookie-crumbs', trait: 'any' },
  ]},
  { actionId: 'measure-tracks', locationId: 'tracks', isPrimary: true, pool: [
    { evidenceId: 'small-tracks', trait: 'light_weight' },
    { evidenceId: 'small-tracks', trait: 'medium_weight' },
    { evidenceId: 'small-tracks', trait: 'heavy_weight' },
    { evidenceId: 'deep-prints', trait: 'heavy_weight' },
    { evidenceId: 'sand-trail', trait: 'ground_affinity' },
    { evidenceId: 'frost-trail', trait: 'moisture_residue' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
    { evidenceId: 'stone-chips', trait: 'stone_fragment' },
    { evidenceId: 'swift-pass', trait: 'speed_focus' },
  ]},
  { actionId: 'follow-tracks', locationId: 'tracks', isPrimary: false, pool: [
    { evidenceId: 'sand-trail', trait: 'ground_affinity' },
    { evidenceId: 'dry-trail', trait: 'dry_environment' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
    { evidenceId: 'splash-burst', trait: 'water_displacement' },
    { evidenceId: 'slow-route', trait: 'speed_poor' },
    { evidenceId: 'small-tracks', trait: 'any' },
  ]},
  { actionId: 'check-roots', locationId: 'forest-edge', isPrimary: true, pool: [
    { evidenceId: 'loose-soil', trait: 'burrowing' },
    { evidenceId: 'pollen-scent', trait: 'plant_residue' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
    { evidenceId: 'stone-chips', trait: 'stone_fragment' },
    { evidenceId: 'braced-tracks', trait: 'defense_focus' },
    { evidenceId: 'cookie-crumbs', trait: 'any' },
  ]},
  { actionId: 'inspect-lid', locationId: 'cookie-jar', isPrimary: true, pool: [
    { evidenceId: 'scratch-marks', trait: 'claw_or_scratch' },
    { evidenceId: 'metal-shaving', trait: 'metal_scrape' },
    { evidenceId: 'static-mark', trait: 'fire_heat' },
    { evidenceId: 'heavy-dent', trait: 'heavy_impact' },
    { evidenceId: 'flicker-surge', trait: 'electrical_interference' },
    { evidenceId: 'forceful-entry', trait: 'attack_focus' },
    { evidenceId: 'cookie-crumbs', trait: 'any' },
  ]},
  { actionId: 'check-table', locationId: 'cookie-jar', isPrimary: false, pool: [
    { evidenceId: 'high-reach', trait: 'tall_height' },
    { evidenceId: 'cookie-crumbs', trait: 'medium_height' },
    { evidenceId: 'low-crumbs', trait: 'short_height' },
    { evidenceId: 'light-tracks', trait: 'light_weight' },
    { evidenceId: 'gentle-handling', trait: 'attack_poor' },
    { evidenceId: 'winded-pause', trait: 'hp_poor' },
  ]},
  { actionId: 'interview-camper', locationId: 'witness-tent', isPrimary: true, pool: [
    { evidenceId: 'avoided-water', trait: 'dry_environment' },
    { evidenceId: 'psychic-echo', trait: 'psychic_trace' },
    { evidenceId: 'ash-scatter', trait: 'ash_or_scorch' },
    { evidenceId: 'quiet-digging', trait: 'burrowing' },
    { evidenceId: 'glow-dust', trait: 'light_or_glow' },
    { evidenceId: 'weathered-calm', trait: 'special_defense_focus' },
    { evidenceId: 'faded-surge', trait: 'special_attack_poor' },
    { evidenceId: 'cookie-crumbs', trait: 'any' },
  ]},
  { actionId: 'check-wash-bucket', locationId: 'witness-tent', isPrimary: false, pool: [
    { evidenceId: 'dry-trail', trait: 'ground_affinity' },
    { evidenceId: 'slime-trail', trait: 'toxic_residue' },
    { evidenceId: 'splash-burst', trait: 'water_displacement' },
    { evidenceId: 'cold-spot', trait: 'cold_aura' },
    { evidenceId: 'energy-bloom', trait: 'special_attack_focus' },
    { evidenceId: 'brittle-pass', trait: 'defense_poor' },
    { evidenceId: 'cookie-crumbs', trait: 'any' },
  ]},
]

type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed'

const strongestStatPriority: StatName[] = ['speed', 'attack', 'specialAttack', 'defense', 'specialDefense', 'hp']
const weakestStatPriority: StatName[] = ['hp', 'defense', 'specialDefense', 'attack', 'specialAttack', 'speed']

const focusTraitByStat: Record<StatName, CaseTrait> = {
  hp: 'hp_focus',
  attack: 'attack_focus',
  defense: 'defense_focus',
  specialAttack: 'special_attack_focus',
  specialDefense: 'special_defense_focus',
  speed: 'speed_focus',
}

const poorTraitByStat: Record<StatName, CaseTrait> = {
  hp: 'hp_poor',
  attack: 'attack_poor',
  defense: 'defense_poor',
  specialAttack: 'special_attack_poor',
  specialDefense: 'special_defense_poor',
  speed: 'speed_poor',
}

const heightTraitForPokemon = (pokemon: Pokemon): CaseTrait => {
  if (pokemon.heightM <= 0.6) return 'short_height'
  if (pokemon.heightM >= 1.4) return 'tall_height'
  return 'medium_height'
}

const weightTraitForPokemon = (pokemon: Pokemon): CaseTrait => {
  if (pokemon.weightKg <= 12) return 'light_weight'
  if (pokemon.weightKg >= 45) return 'heavy_weight'
  return 'medium_weight'
}

const getTypeTraits = (type: PokemonType, isPrimary: boolean): CaseTrait[] => traitRules
  .filter((rule) => rule.types?.includes(type) && (isPrimary || !rule.requirePrimary))
  .map((rule) => rule.trait)

const uniqueTraits = (traits: CaseTrait[]): CaseTrait[] => Array.from(new Set(traits))

const getRequiredEvidenceCategories = (pokemon: Pokemon): RequiredEvidenceCategory[] => {
  const strongestStat = pickPriorityStat(pokemon, strongestStatPriority, 'max')
  const weakestStat = pickPriorityStat(pokemon, weakestStatPriority, 'min')
  const categories: RequiredEvidenceCategory[] = [
    { id: 'height', traits: [heightTraitForPokemon(pokemon)] },
    { id: 'weight', traits: [weightTraitForPokemon(pokemon)] },
    { id: 'primary_type', traits: uniqueTraits(getTypeTraits(pokemon.types[0], true)) },
    { id: 'highest_stat', traits: [focusTraitByStat[strongestStat]] },
    { id: 'lowest_stat', traits: [poorTraitByStat[weakestStat]] },
  ]

  const secondaryType = pokemon.types[1]
  if (secondaryType) {
    categories.splice(3, 0, { id: 'secondary_type', traits: uniqueTraits(getTypeTraits(secondaryType, false)) })
  }

  return categories.filter((category) => category.traits.length > 0)
}

type PokemonCaseProfile = {
  size: 'small' | 'medium' | 'large'
  weightSize: 'light' | 'medium' | 'heavy'
  textureWord: string
  movementWord: string
  groundWord: string
  waterAvoidanceWord: string
}

type ProfileAffinity = PokemonType

const getPrimaryAffinity = (pokemon: Pokemon): ProfileAffinity => pokemon.types[0]

const affinityProfiles: Record<ProfileAffinity, { textureWord: string; groundWord: string; waterAvoidanceWord: string }> = {
  bug: { textureWord: 'shed wing dust', groundWord: 'tunneled soil', waterAvoidanceWord: 'skittering past the bucket' },
  dark: { textureWord: 'shadowy smudge', groundWord: 'darkened earth', waterAvoidanceWord: 'melting past the bucket' },
  dragon: { textureWord: 'primal scale dust', groundWord: 'raw earth', waterAvoidanceWord: 'trampling past the bucket' },
  electric: { textureWord: 'static traces', groundWord: 'scuffed ground', waterAvoidanceWord: 'staying clear of the bucket' },
  fairy: { textureWord: 'glittering dust', groundWord: 'soft moss', waterAvoidanceWord: 'drifting past the bucket' },
  fighting: { textureWord: 'heavy scuffs', groundWord: 'cracked ground', waterAvoidanceWord: 'stomping past the bucket' },
  fire: { textureWord: 'fine ash', groundWord: 'scorched earth', waterAvoidanceWord: 'circling wide around the bucket' },
  flying: { textureWord: 'light down', groundWord: 'disturbed dust', waterAvoidanceWord: 'sweeping past the bucket' },
  ghost: { textureWord: 'faint mist', groundWord: 'chilled soil', waterAvoidanceWord: 'passing through the bucket' },
  grass: { textureWord: 'leaf litter', groundWord: 'disturbed roots', waterAvoidanceWord: 'pushing through the damp patch' },
  ground: { textureWord: 'dry grit', groundWord: 'loose soil', waterAvoidanceWord: 'skirting the water bucket' },
  ice: { textureWord: 'frost film', groundWord: 'frozen earth', waterAvoidanceWord: 'skimming past the bucket' },
  normal: { textureWord: 'scattered traces', groundWord: 'soft ground', waterAvoidanceWord: 'wandering near the bucket' },
  poison: { textureWord: 'viscous smear', groundWord: 'tainted soil', waterAvoidanceWord: 'oozing around the bucket' },
  psychic: { textureWord: 'faint shimmer', groundWord: 'subtle impressions', waterAvoidanceWord: 'passing the bucket without notice' },
  rock: { textureWord: 'gritty dust', groundWord: 'broken stone', waterAvoidanceWord: 'scraping past the bucket' },
  steel: { textureWord: 'metal filings', groundWord: 'scraped ground', waterAvoidanceWord: 'clanking past the bucket' },
  water: { textureWord: 'damp residue', groundWord: 'soft mud', waterAvoidanceWord: 'lingering near the bucket' },
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

export const getPokemonCaseTraits = (pokemon: Pokemon): Set<CaseTrait> => {
  const traits = new Set<CaseTrait>()
  const allTypes = pokemon.types
  const primaryType = allTypes[0]

  for (const rule of traitRules) {
    if (rule.check) {
      if (rule.check(pokemon)) {
        traits.add(rule.trait)
      }
    } else if (rule.types) {
      const matches = rule.requirePrimary
        ? primaryType && rule.types.includes(primaryType)
        : rule.types.some((type) => allTypes.includes(type))
      if (matches) {
        traits.add(rule.trait)
      }
    }
  }

  traits.add(focusTraitByStat[pickPriorityStat(pokemon, strongestStatPriority, 'max')])
  traits.add(poorTraitByStat[pickPriorityStat(pokemon, weakestStatPriority, 'min')])

  traits.add('any')

  return traits
}

const getPokemonCaseProfile = (pokemon: Pokemon): PokemonCaseProfile => {
  const size = pokemon.heightM <= 0.6
    ? 'small'
    : pokemon.heightM >= 1.4
      ? 'large'
      : 'medium'
  const weightSize = pokemon.weightKg <= 12
    ? 'light'
    : pokemon.weightKg >= 45
      ? 'heavy'
      : 'medium'
  const affinity = getPrimaryAffinity(pokemon)
  const profile = affinityProfiles[affinity]

  return {
    size,
    weightSize,
    textureWord: profile.textureWord,
    movementWord: size === 'small' ? 'close to the ground' : size === 'large' ? 'from higher up' : 'at a medium height',
    groundWord: profile.groundWord,
    waterAvoidanceWord: profile.waterAvoidanceWord,
  }
}

const getRelevantTraits = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId)
  const traits = getPokemonCaseTraits(pokemon)

  return traitPriority.filter((trait) => traits.has(trait))
}

const scorePokemonAgainstTraits = (pokemonId: number, traits: CaseTrait[]) => {
  const pokemonTraits = getPokemonCaseTraits(getPokemonById(pokemonId))

  return traits.reduce((score, trait) => score + (pokemonTraits.has(trait) ? 1 : 0), 0)
}

const getTraitConclusionFragment = (trait: CaseTrait): string => {
  switch (trait) {
    case 'short_height':
      return 'short enough to leave low-height clues'
    case 'medium_height':
      return 'medium-sized enough to leave mid-height clues'
    case 'tall_height':
      return 'tall enough to leave higher reach clues'
    case 'light_weight':
      return 'light enough to leave shallow tracks'
    case 'medium_weight':
      return 'medium-weight enough to leave steady tracks'
    case 'heavy_weight':
      return 'heavy enough to leave deep tracks or dents'
    case 'ground_affinity':
      return 'comfortable around dry soil'
    case 'burrowing':
      return 'likely capable of digging'
    case 'claw_or_scratch':
      return 'able to scratch into hard surfaces'
    case 'dry_environment':
      return 'uneasy around water'
    case 'water_affinity':
      return 'at home in damp conditions'
    case 'moisture_residue':
      return 'carrying moisture through the scene'
    case 'fire_heat':
      return 'giving off warmth or heat'
    case 'ash_or_scorch':
      return 'leaving scorched traces behind'
    case 'air_movement':
      return 'moving through the air or from above'
    case 'plant_residue':
      return 'surrounded by plant or leaf traces'
    case 'psychic_trace':
      return 'leaving an unusual or eerie signature'
    case 'metal_scrape':
      return 'capable of scraping hard metal'
    case 'toxic_residue':
      return 'carrying a caustic or viscous trace'
    case 'electrical_interference':
      return 'disturbing lights or nearby devices'
    case 'heavy_impact':
      return 'heavy enough to leave dents or deep impressions'
    case 'light_or_glow':
      return 'leaving a faint glow or shimmer behind'
    case 'water_displacement':
      return 'disturbing water or splashing through it'
    case 'stone_fragment':
      return 'tracking chips of stone or grit through the scene'
    case 'cold_aura':
      return 'leaving a chill in the air around the clue'
    case 'hp_focus':
      return 'sturdy enough to keep going without slowing'
    case 'attack_focus':
      return 'forcing things open with direct physical power'
    case 'defense_focus':
      return 'braced well enough to push through obstacles'
    case 'special_attack_focus':
      return 'leaving signs of unusual energy rather than blunt force'
    case 'special_defense_focus':
      return 'staying calm in strange or uncomfortable conditions'
    case 'speed_focus':
      return 'moving faster than most suspects could manage'
    case 'hp_poor':
      return 'unlikely to keep up a long chase or extended effort'
    case 'attack_poor':
      return 'unlikely to rely on brute force'
    case 'defense_poor':
      return 'unlikely to handle heavy impact or rough surfaces well'
    case 'special_attack_poor':
      return 'unlikely to leave strong unusual energy traces'
    case 'special_defense_poor':
      return 'more easily rattled by strange surroundings'
    case 'speed_poor':
      return 'moving more slowly and deliberately than a fast suspect'
    default:
      return ''
  }
}

const getTraitDeductionText = (trait: CaseTrait): string => {
  switch (trait) {
    case 'short_height':
      return 'This pointed toward a shorter Pokemon moving low.'
    case 'medium_height':
      return 'This pointed toward a medium-sized Pokemon moving at table height.'
    case 'tall_height':
      return 'This pointed toward a taller suspect reaching from higher up.'
    case 'light_weight':
      return 'This pointed toward a lighter suspect leaving shallow marks.'
    case 'medium_weight':
      return 'This pointed toward a medium-weight suspect leaving steady tracks.'
    case 'heavy_weight':
      return 'This pointed toward a heavier suspect leaving deep marks.'
    case 'ground_affinity':
      return 'This suggested the culprit moved comfortably through dry grit and loose ground.'
    case 'burrowing':
      return 'This made digging behavior much more likely.'
    case 'claw_or_scratch':
      return 'This suggested the culprit could scrape or scratch into hard surfaces.'
    case 'dry_environment':
      return 'This suggested the culprit preferred the driest path through camp.'
    case 'water_affinity':
      return 'This suggested the culprit was at ease in damp or wet conditions.'
    case 'moisture_residue':
      return 'This suggested the culprit carried moisture or dampness through the scene.'
    case 'fire_heat':
      return 'This pointed toward a Pokemon that gives off unusual heat.'
    case 'ash_or_scorch':
      return 'This suggested the culprit left scorched or ashy traces behind.'
    case 'air_movement':
      return 'This suggested the culprit moved through the air or struck from above.'
    case 'plant_residue':
      return 'This suggested the culprit left plant matter or leaf litter behind.'
    case 'psychic_trace':
      return 'This suggested something unusual or eerie lingered at the scene.'
    case 'metal_scrape':
      return 'This pointed toward a suspect capable of scraping metal.'
    case 'toxic_residue':
      return 'This suggested the culprit left a caustic or viscous trail.'
    case 'electrical_interference':
      return 'This pointed toward a culprit that disrupted lights or nearby devices.'
    case 'heavy_impact':
      return 'This pointed toward a heavier culprit capable of leaving dents or deep impressions.'
    case 'light_or_glow':
      return 'This suggested the culprit left behind a faint glow or shimmer.'
    case 'water_displacement':
      return 'This suggested the culprit moved directly through water and splashed it outward.'
    case 'stone_fragment':
      return 'This suggested the culprit carried stone grit or chipped hard surfaces nearby.'
    case 'cold_aura':
      return 'This suggested the culprit left an unusual cold patch at the scene.'
    case 'hp_focus':
      return 'This suggested the culprit had the stamina to keep moving without slowing.'
    case 'attack_focus':
      return 'This pointed toward a culprit that relied on direct physical force.'
    case 'defense_focus':
      return 'This suggested the culprit handled rough contact and obstacles well.'
    case 'special_attack_focus':
      return 'This suggested the culprit left stronger unusual energy traces than blunt physical damage.'
    case 'special_defense_focus':
      return 'This suggested the culprit stayed calm in strange or uncomfortable conditions.'
    case 'speed_focus':
      return 'This pointed toward a culprit that moved faster than most suspects could manage.'
    case 'hp_poor':
      return 'This suggested the culprit was less suited to a long chase or extended effort.'
    case 'attack_poor':
      return 'This suggested the culprit relied on access or finesse rather than brute force.'
    case 'defense_poor':
      return 'This suggested the culprit would avoid heavy impacts or rough surfaces.'
    case 'special_attack_poor':
      return 'This suggested the culprit was unlikely to leave strong unusual energy traces.'
    case 'special_defense_poor':
      return 'This suggested the culprit would be more easily rattled by strange surroundings.'
    case 'speed_poor':
      return 'This suggested the culprit moved more slowly and deliberately than a fast suspect.'
    default:
      return ''
  }
}

const buildEvidenceFromTrait = (evidenceId: string, culprit: Pokemon) => {
  const profile = getPokemonCaseProfile(culprit)

  switch (evidenceId) {
    case 'cookie-crumbs':
      return {
        title: `${profile.size === 'small' ? 'Small' : profile.size === 'large' ? 'Large' : 'Medium'} Cookie Crumbs`,
        clueText: `Fresh crumbs were scattered ${profile.movementWord}.`,
        endExplanation: `The culprit moved ${profile.movementWord} while eating near the scene.`,
        deductionText:
          profile.size === 'small'
            ? 'This pointed toward a shorter Pokemon moving low.'
            : profile.size === 'large'
              ? 'This pointed toward a larger suspect reaching in from above the ground.'
              : 'This pointed toward a medium-sized suspect moving at table height.',
      }
    case 'quiet-digging':
      return {
        title: 'Quiet Digging',
        clueText: 'Someone heard soft scraping after midnight.',
        endExplanation: `The culprit likely spent time working through ${profile.groundWord} overnight.`,
        deductionText: 'This made digging or scraping behavior much more likely.',
      }
    case 'small-tracks':
      return {
        title: profile.weightSize === 'light' ? 'Light Tracks' : profile.weightSize === 'heavy' ? 'Heavy Prints' : 'Medium Tracks',
        clueText:
          profile.weightSize === 'light'
            ? 'The tracks were shallow and lightly pressed into the dirt.'
            : profile.weightSize === 'heavy'
              ? 'The prints were deeper and wider than expected.'
              : 'The tracks were steady with a medium depth through the dirt.',
        endExplanation:
          profile.weightSize === 'light'
            ? 'The culprit left light tracks near the tents.'
            : profile.weightSize === 'heavy'
              ? 'The culprit left a broader, heavier trail near the tents.'
              : 'The culprit left medium-depth tracks that held their shape near the tents.',
        deductionText:
          profile.weightSize === 'light'
            ? 'This pointed toward a lighter suspect leaving shallow marks.'
            : profile.weightSize === 'heavy'
              ? 'This pointed toward a heavier suspect that left deeper tracks.'
              : 'This pointed toward a medium-weight suspect with a steadier stride.',
      }
    case 'sand-trail':
      return {
        title: profile.textureWord === 'damp residue' ? 'Damp Trail' : 'Dry Trail',
        clueText: `A faint line of ${profile.textureWord} pulled away from the scene.`,
        endExplanation: `The culprit carried ${profile.textureWord} away from the tracks.`,
        deductionText:
          profile.textureWord === 'damp residue'
            ? 'This suggested the culprit carried moisture away from the scene.'
            : 'This suggested the culprit moved comfortably through dry grit and loose ground.',
      }
    case 'loose-soil':
      return {
        title: 'Loose Soil',
        clueText: `Fresh ${profile.groundWord} had been disturbed under the roots.`,
        endExplanation: `Something recently worked through the ${profile.groundWord} at the forest edge.`,
        deductionText: 'This made digging behavior much more likely.',
      }
    case 'scratch-marks':
      return {
        title: 'Scratch Marks',
        clueText: 'Narrow marks scored the cookie jar lid.',
        endExplanation: 'The culprit left scratch marks while forcing the jar open.',
        deductionText: 'This suggested the culprit could scrape or scratch into hard surfaces.',
      }
    case 'low-crumbs':
      return {
        title: 'Low Crumbs',
        clueText: `Crumbs had fallen ${profile.movementWord} along the edge of the table.`,
        endExplanation: `The culprit moved ${profile.movementWord} beside the table while carrying crumbs away.`,
        deductionText:
          profile.size === 'small'
            ? 'This pointed toward a suspect moving low beside the table.'
            : profile.size === 'large'
              ? 'This suggested a taller suspect reached lower than expected while passing the table.'
              : 'This suggested the culprit moved along the lower edge of the table, not from above it.',
      }
    case 'high-reach':
      return {
        title: 'High Reach',
        clueText: 'Crumbs were brushed from the upper edge of the table.',
        endExplanation: 'The culprit reached the table from higher up while carrying crumbs away.',
        deductionText: 'This pointed toward a taller suspect reaching from higher up.',
      }
    case 'deep-prints':
      return {
        title: 'Deep Prints',
        clueText: 'Several prints pressed unusually deep into the dirt.',
        endExplanation: 'The culprit was heavy enough to leave deeper marks while moving away.',
        deductionText: 'This pointed toward a heavier suspect leaving deep marks.',
      }
    case 'light-tracks':
      return {
        title: 'Light Tracks',
        clueText: 'The marks barely pressed into the dusty ground beside the table.',
        endExplanation: 'The culprit was light enough to leave only shallow marks beside the table.',
        deductionText: 'This pointed toward a lighter suspect leaving shallow marks.',
      }
    case 'avoided-water':
      return {
        title: 'Avoided Water',
        clueText: `The witness remembered the culprit ${profile.waterAvoidanceWord}.`,
        endExplanation: `The culprit deliberately avoided the wettest part of the scene by ${profile.waterAvoidanceWord}.`,
        deductionText:
          profile.textureWord === 'damp residue'
            ? 'This suggested the culprit moved near water differently than expected.'
            : 'This suggested the culprit preferred the driest path through the scene.',
      }
    case 'dry-trail':
      return {
        title: profile.textureWord === 'damp residue' ? 'Wet Smears' : 'Dry Trail',
        clueText: `A line of ${profile.textureWord} led away from the wash bucket.`,
        endExplanation: `The culprit carried ${profile.textureWord} even near the water station.`,
        deductionText:
          profile.textureWord === 'damp residue'
            ? 'This suggested the culprit carried moisture away instead of avoiding it.'
            : 'This suggested the culprit kept to dry ground even beside the water station.',
      }
    case 'ash-scatter':
      return {
        title: 'Ash Scatter',
        clueText: `A fine dusting of ${profile.textureWord} settled near the fire pit.`,
        endExplanation: `The culprit brushed against the ashes and left a trail of ${profile.textureWord}.`,
        deductionText: 'This suggested the culprit left scorched or ashy traces behind.',
      }
    case 'static-mark':
      return {
        title: 'Static Mark',
        clueText: 'A faint burn mark blackened the edge of the cookie jar lid.',
        endExplanation: 'The culprit left a scorched mark while forcing the jar open.',
        deductionText: 'This pointed toward a Pokemon that gives off unusual heat.',
      }
    case 'frost-trail':
      return {
        title: 'Frost Trail',
        clueText: `A trail of ${profile.textureWord} sparkled behind the tents.`,
        endExplanation: `The culprit left a glittering line of ${profile.textureWord} in the night air.`,
        deductionText: 'This suggested the culprit carried moisture or dampness through the scene.',
      }
    case 'pollen-scent':
      return {
        title: 'Pollen Scent',
        clueText: `The air near the roots carried a strange hint of ${profile.textureWord}.`,
        endExplanation: `The culprit disturbed the ${profile.groundWord} and stirred up ${profile.textureWord}.`,
        deductionText: 'This suggested the culprit left plant matter or leaf litter behind.',
      }
    case 'psychic-echo':
      return {
        title: 'Psychic Echo',
        clueText: 'The witness felt an odd chill while describing the culprit.',
        endExplanation: 'Something about the culprit left an uneasy sensation in the air.',
        deductionText: 'This suggested something unusual or eerie lingered at the scene.',
      }
    case 'metal-shaving':
      return {
        title: 'Metal Shaving',
        clueText: 'Thin curls of metal were found near the jar lid.',
        endExplanation: 'The culprit left metal shavings while scraping against the jar.',
        deductionText: 'This pointed toward a suspect capable of scraping metal.',
      }
    case 'slime-trail':
      return {
        title: 'Slime Trail',
        clueText: `A slick ribbon of ${profile.textureWord} traced away from the scene.`,
        endExplanation: `The culprit left a trail of ${profile.textureWord} as it moved through the scene.`,
        deductionText: 'This suggested the culprit left a caustic or viscous trail.',
      }
    case 'feather-drift':
      return {
        title: 'Feather Drift',
        clueText: `A few specks of ${profile.textureWord} drifted down near the tracks.`,
        endExplanation: `The culprit scattered ${profile.textureWord} while moving overhead or through the brush.`,
        deductionText: 'This suggested the culprit moved through the air or struck from above.',
      }
    case 'flicker-surge':
      return {
        title: 'Flicker Surge',
        clueText: 'Nearby lights flickered just before the scene was disturbed.',
        endExplanation: 'The culprit disrupted the nearby light or wiring while moving through.',
        deductionText: 'This pointed toward a culprit that disrupted lights or nearby devices.',
      }
    case 'heavy-dent':
      return {
        title: 'Heavy Dent',
        clueText: 'A deep dent had sunk into the surface beside the disturbance.',
        endExplanation: 'The culprit hit or leaned hard enough to leave a deep impression behind.',
        deductionText: 'This pointed toward a heavier culprit capable of leaving dents or deep impressions.',
      }
    case 'glow-dust':
      return {
        title: 'Glow Dust',
        clueText: 'A faint shimmer lingered over the disturbed area.',
        endExplanation: 'The culprit left a soft glowing trace hanging at the scene.',
        deductionText: 'This suggested the culprit left behind a faint glow or shimmer.',
      }
    case 'splash-burst':
      return {
        title: 'Splash Burst',
        clueText: 'Water had splashed outward in a sudden burst near the clue.',
        endExplanation: 'The culprit moved directly through the water and kicked it wide around the scene.',
        deductionText: 'This suggested the culprit moved directly through water and splashed it outward.',
      }
    case 'stone-chips':
      return {
        title: 'Stone Chips',
        clueText: 'Tiny chips of grit and broken stone were scattered nearby.',
        endExplanation: 'The culprit carried stone fragments or knocked them loose while passing through.',
        deductionText: 'This suggested the culprit carried stone grit or chipped hard surfaces nearby.',
      }
    case 'steady-endurance':
      return {
        title: 'Steady Endurance',
        clueText: 'The trail held steady farther than expected before it showed any hesitation.',
        endExplanation: 'The culprit kept moving at a consistent pace without obvious slowdown.',
        deductionText: 'This suggested the culprit had the stamina to keep moving without slowing.',
      }
    case 'cold-spot':
      return {
        title: 'Cold Spot',
        clueText: 'The air around the clue felt unnaturally cold.',
        endExplanation: 'The culprit left a lingering cold patch around the scene after moving on.',
        deductionText: 'This suggested the culprit left an unusual cold patch at the scene.',
      }
    case 'forceful-entry':
      return {
        title: 'Forceful Entry',
        clueText: 'The object looked forced aside with direct physical power, not delicate handling.',
        endExplanation: 'The culprit relied on blunt physical force while getting through the scene.',
        deductionText: 'This pointed toward a culprit that relied on direct physical force.',
      }
    case 'braced-tracks':
      return {
        title: 'Braced Tracks',
        clueText: 'The route suggested the culprit pushed through rough footing without losing balance.',
        endExplanation: 'The culprit handled contact and resistance better than a fragile suspect would have.',
        deductionText: 'This suggested the culprit handled rough contact and obstacles well.',
      }
    case 'energy-bloom':
      return {
        title: 'Energy Bloom',
        clueText: 'An unusual flare of residual energy seemed stronger than the physical damage around it.',
        endExplanation: 'The culprit left an outsized energy trace compared with the blunt impact at the scene.',
        deductionText: 'This suggested the culprit left stronger unusual energy traces than blunt physical damage.',
      }
    case 'weathered-calm':
      return {
        title: 'Weathered Calm',
        clueText: 'The trail stayed oddly composed through an area most suspects would find uncomfortable.',
        endExplanation: 'The culprit moved through the strange conditions without obvious hesitation.',
        deductionText: 'This suggested the culprit stayed calm in strange or uncomfortable conditions.',
      }
    case 'swift-pass':
      return {
        title: 'Swift Pass',
        clueText: 'The signs suggested the culprit crossed the area faster than expected.',
        endExplanation: 'The culprit covered the scene quickly enough to leave only a short, sharp disturbance.',
        deductionText: 'This pointed toward a culprit that moved faster than most suspects could manage.',
      }
    case 'winded-pause':
      return {
        title: 'Winded Pause',
        clueText: 'The trail suggested the culprit slowed sooner than expected during the escape.',
        endExplanation: 'The culprit likely could not keep up a long push without losing pace.',
        deductionText: 'This suggested the culprit was less suited to a long chase or extended effort.',
      }
    case 'gentle-handling':
      return {
        title: 'Gentle Handling',
        clueText: 'The scene showed access without the kind of brute-force damage a stronger suspect would leave.',
        endExplanation: 'The culprit got through by position or timing rather than raw power.',
        deductionText: 'This suggested the culprit relied on access or finesse rather than brute force.',
      }
    case 'brittle-pass':
      return {
        title: 'Brittle Pass',
        clueText: 'The route avoided the roughest footing, as if the culprit could not risk a hard impact.',
        endExplanation: 'The culprit seemed less suited to taking heavy knocks or rough contact.',
        deductionText: 'This suggested the culprit would avoid heavy impacts or rough surfaces.',
      }
    case 'faded-surge':
      return {
        title: 'Faded Surge',
        clueText: 'Any unusual energy at the scene was faint compared with the rest of the disturbance.',
        endExplanation: 'The culprit did not leave the kind of strong energy trace a more forceful special attacker would.',
        deductionText: 'This suggested the culprit was unlikely to leave strong unusual energy traces.',
      }
    case 'shaken-focus':
      return {
        title: 'Shaken Focus',
        clueText: 'The trail looked more hesitant in the strange part of the scene than it did elsewhere.',
        endExplanation: 'The culprit seemed more easily rattled by unusual surroundings than a calm specialist would be.',
        deductionText: 'This suggested the culprit would be more easily rattled by strange surroundings.',
      }
    case 'slow-route':
      return {
        title: 'Slow Route',
        clueText: 'The path through the scene was deliberate and slow rather than quick and direct.',
        endExplanation: 'The culprit moved more carefully and slowly than a fast suspect would have.',
        deductionText: 'This suggested the culprit moved more slowly and deliberately than a fast suspect.',
      }
    default:
      return {
        title: 'Strange Trace',
        clueText: 'Something unusual was left behind.',
        endExplanation: 'The culprit left a trace behind at the scene.',
        deductionText: 'This clue added one more useful detail to the case.',
      }
  }
}

const fillNarrativeTemplate = (template: string, profile: PokemonCaseProfile): string => {
  return template
    .replace(/\{movementWord\}/g, profile.movementWord)
    .replace(/\{textureWord\}/g, profile.textureWord)
    .replace(/\{groundWord\}/g, profile.groundWord)
    .replace(/\{waterAvoidanceWord\}/g, profile.waterAvoidanceWord)
}

const buildActionNarrative = (
  action: LocationAction,
  culprit: Pokemon,
  generatedEvidence?: Map<string, ReturnType<typeof buildEvidenceFromTrait>>,
) => {
  const profile = getPokemonCaseProfile(culprit)
  const trait = action.evidenceId ? evidenceTraitById[action.evidenceId] : null
  const deductionText = action.evidenceId && generatedEvidence
    ? generatedEvidence.get(action.evidenceId)?.deductionText
    : null

  const sizeSpecificTemplate =
    profile.size === 'small'
      ? action.observationTextSmall
      : profile.size === 'large'
        ? action.observationTextLarge
        : action.observationTextMedium

  const template = sizeSpecificTemplate ?? action.observationText
  const observationText = fillNarrativeTemplate(template, profile)

  return {
    observationText,
    implicationText: deductionText ?? (trait ? getTraitDeductionText(trait) : undefined),
  }
}

export const generateCaseEvidence = (
  culprit: Pokemon,
  baseEvidence: Evidence[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string; endExplanation?: string }>,
) => {
  const generatedEvidenceById = new Map<string, ReturnType<typeof buildEvidenceFromTrait>>()
  const profile = getPokemonCaseProfile(culprit)

  const generatedEvidence = baseEvidence.map((evidenceItem) => {
    const generated = buildEvidenceFromTrait(evidenceItem.id, culprit)
    generatedEvidenceById.set(evidenceItem.id, generated)
    const override = evidenceOverrides?.[evidenceItem.id]

    return {
      ...evidenceItem,
      title: override?.title ? fillNarrativeTemplate(override.title, profile) : generated.title,
      clueText: override?.clueText ? fillNarrativeTemplate(override.clueText, profile) : generated.clueText,
      endExplanation: override?.endExplanation ? fillNarrativeTemplate(override.endExplanation, profile) : generated.endExplanation,
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
    Object.keys(evidenceTraitById).map((evidenceId) => {
      const generated = buildEvidenceFromTrait(evidenceId, culprit)
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
        observationText: generatedNarrative.observationText,
        implicationText: generatedNarrative.implicationText,
      }
    }),
  }))
}

const getMismatchReason = (suspectId: number, relevantTraits: CaseTrait[]) => {
  const pokemonTraits = getPokemonCaseTraits(getPokemonById(suspectId))
  const missingTrait = relevantTraits.find((trait) => !pokemonTraits.has(trait))

  switch (missingTrait) {
    case 'short_height':
      return 'Did not fit the low-height clues left at the scene.'
    case 'medium_height':
      return 'Did not fit the medium-height clues left at the scene.'
    case 'tall_height':
      return 'Did not fit the high-reach clues left at the scene.'
    case 'light_weight':
      return 'Did not fit the shallow, light-track clues.'
    case 'medium_weight':
      return 'Did not fit the medium-depth track clues.'
    case 'heavy_weight':
      return 'Did not fit the deep-print or heavy-pressure clues.'
    case 'ground_affinity':
      return 'Did not fit the dry grit and loose-soil evidence.'
    case 'burrowing':
      return 'Did not explain the digging signs found at the scene.'
    case 'claw_or_scratch':
      return 'Did not fit the scratch marks found at the scene.'
    case 'dry_environment':
      return 'Did not fit the clues pointing toward dry ground and avoided water.'
    case 'water_affinity':
      return 'Did not match the damp or moisture-related evidence.'
    case 'moisture_residue':
      return 'Did not match the dampness found at the scene.'
    case 'fire_heat':
      return 'Did not show signs of the heat-related evidence.'
    case 'ash_or_scorch':
      return 'Did not match the scorched or ashy traces.'
    case 'air_movement':
      return 'Did not fit the clues pointing to airborne or elevated movement.'
    case 'plant_residue':
      return 'Did not match the plant or leaf traces at the scene.'
    case 'psychic_trace':
      return 'Did not match the unusual or eerie signature left behind.'
    case 'metal_scrape':
      return 'Did not match the signs of metal scraping.'
    case 'toxic_residue':
      return 'Did not match the caustic or viscous trail.'
    case 'electrical_interference':
      return 'Did not fit the clues pointing to disturbed lights or nearby devices.'
    case 'heavy_impact':
      return 'Did not fit the heavy dents or deep impressions at the scene.'
    case 'light_or_glow':
      return 'Did not match the faint glowing residue left behind.'
    case 'water_displacement':
      return 'Did not match the splashed water and disturbed wet ground.'
    case 'stone_fragment':
      return 'Did not fit the stone chips and grit left behind.'
    case 'cold_aura':
      return 'Did not match the unusual chill left at the scene.'
    case 'hp_focus':
      return 'Did not fit the signs of a suspect with stronger endurance.'
    case 'attack_focus':
      return 'Did not fit the direct-force clues found at the scene.'
    case 'defense_focus':
      return 'Did not fit the clues suggesting a sturdier, better-braced suspect.'
    case 'special_attack_focus':
      return 'Did not fit the unusual energy traces left at the scene.'
    case 'special_defense_focus':
      return 'Did not fit the signs that the culprit stayed calm in strange conditions.'
    case 'speed_focus':
      return 'Did not fit the clues pointing to a faster-moving suspect.'
    case 'hp_poor':
      return 'Did not fit the signs that the culprit would tire more quickly.'
    case 'attack_poor':
      return 'Did not fit the lighter, less forceful handling implied by the scene.'
    case 'defense_poor':
      return 'Did not fit the clues suggesting a more fragile suspect avoided rough contact.'
    case 'special_attack_poor':
      return 'Did not fit the weaker unusual-energy signature left behind.'
    case 'special_defense_poor':
      return 'Did not fit the signs that the culprit was more easily rattled by the surroundings.'
    case 'speed_poor':
      return 'Did not fit the slower, more deliberate route through the scene.'
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

const pickEvidenceForAction = (
  pool: ActionEvidencePool,
  culpritTraits: Set<CaseTrait>,
  usedEvidenceIds: Set<string>,
): ChosenEvidence => {
  const matching = pool.pool.filter((entry) => culpritTraits.has(entry.trait))
  const unusedMatching = matching.filter((entry) => !usedEvidenceIds.has(entry.evidenceId))
  const unused = pool.pool.filter((entry) => !usedEvidenceIds.has(entry.evidenceId))
  const candidates = unusedMatching.length > 0
    ? unusedMatching
    : matching.length > 0
      ? matching
      : unused.length > 0
        ? unused
        : pool.pool
  const chosen = candidates[Math.floor(Math.random() * candidates.length)]!
  return { evidenceId: chosen.evidenceId, trait: chosen.trait }
}

const getCategoryCandidates = (category: RequiredEvidenceCategory) => actionEvidencePools.flatMap((pool) =>
  pool.pool
    .filter((entry) => category.traits.includes(entry.trait))
    .map((entry) => ({ actionId: pool.actionId, evidenceId: entry.evidenceId, trait: entry.trait }))
)

const assignRequiredEvidence = (categories: RequiredEvidenceCategory[]): Map<string, ChosenEvidence> | null => {
  const categoriesByCandidateCount = categories
    .map((category) => ({ category, candidates: getCategoryCandidates(category) }))
    .filter((entry) => entry.candidates.length > 0)
    .sort((left, right) => left.candidates.length - right.candidates.length)

  if (categoriesByCandidateCount.length !== categories.length) {
    return null
  }

  const assignments = new Map<string, ChosenEvidence>()
  const usedEvidenceIds = new Set<string>()

  const assignNext = (categoryIndex: number): boolean => {
    if (categoryIndex >= categoriesByCandidateCount.length) {
      return true
    }

    const { candidates } = categoriesByCandidateCount[categoryIndex]!
    const orderedCandidates = shuffle(candidates)
      .sort((left, right) => Number(usedEvidenceIds.has(left.evidenceId)) - Number(usedEvidenceIds.has(right.evidenceId)))

    for (const candidate of orderedCandidates) {
      if (assignments.has(candidate.actionId)) {
        continue
      }

      const hadEvidenceId = usedEvidenceIds.has(candidate.evidenceId)
      assignments.set(candidate.actionId, { evidenceId: candidate.evidenceId, trait: candidate.trait })
      usedEvidenceIds.add(candidate.evidenceId)

      if (assignNext(categoryIndex + 1)) {
        return true
      }

      assignments.delete(candidate.actionId)
      if (!hadEvidenceId) {
        usedEvidenceIds.delete(candidate.evidenceId)
      }
    }

    return false
  }

  return assignNext(0) ? assignments : null
}

const hasRequiredEvidenceCoverage = (
  actionEvidenceMap: Map<string, ChosenEvidence>,
  categories: RequiredEvidenceCategory[],
): boolean => categories.every((category) =>
  Array.from(actionEvidenceMap.values()).some((chosen) => category.traits.includes(chosen.trait))
)

const buildSolution = (
  culpritId: number,
  suspectIds: number[],
  evidence: Evidence[],
  locations: Location[],
  relevantTraits: CaseTrait[],
  generatedEvidenceById: Map<string, ReturnType<typeof buildEvidenceFromTrait>>,
) => {
  const culprit = getPokemonById(culpritId)
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
        deductionText:
          generatedEvidenceById.get(evidenceId)?.deductionText ??
          getTraitDeductionText(evidenceItem.hiddenTrait as CaseTrait),
      }]
    })

  const clearedSuspects: ClearedSuspectExplanation[] = suspectIds
    .filter((suspectId) => suspectId !== culpritId)
    .map((suspectId) => ({
      pokemonId: suspectId,
      reason: getMismatchReason(suspectId, relevantTraits),
    }))

  return {
    culpritRevealText: `${culprit.name} was behind the case.`,
    detectiveConclusion: `The culprit had to be ${joinFragments(relevantTraits.map(getTraitConclusionFragment).filter((fragment) => fragment.length > 0))}. ${culprit.name} best fit the collected evidence.`,
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
    const relevantTraits = getRelevantTraits(culprit.id)

    if (relevantTraits.length < 2) {
      continue
    }

    const scoredDistractors = shuffle(
      pokemonData
        .filter((pokemon) => pokemon.id !== culprit.id)
        .map((pokemon) => ({
          pokemonId: pokemon.id,
          score: scorePokemonAgainstTraits(pokemon.id, relevantTraits),
        }))
        .filter((entry) => entry.score < relevantTraits.length),
    ).sort((left, right) => right.score - left.score)

    const nearMatches = scoredDistractors.filter((entry) => entry.score >= Math.max(relevantTraits.length - 2, 1))
    const mediumMatches = scoredDistractors.filter((entry) => entry.score >= 1 && entry.score < Math.max(relevantTraits.length - 2, 1))
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
      ...uniqueDistractors.map((pokemonId) => scorePokemonAgainstTraits(pokemonId, relevantTraits)),
    )

    if (topDistractorScore >= relevantTraits.length) {
      continue
    }

    const culpritTraits = getPokemonCaseTraits(culprit)
    const requiredEvidenceCategories = getRequiredEvidenceCategories(culprit)
    const actionEvidenceMap = assignRequiredEvidence(requiredEvidenceCategories)

    if (!actionEvidenceMap) {
      continue
    }

    const usedEvidenceIds = new Set(Array.from(actionEvidenceMap.values()).map((entry) => entry.evidenceId))

    for (const slot of actionEvidencePools) {
      if (actionEvidenceMap.has(slot.actionId)) {
        continue
      }

      const chosen = pickEvidenceForAction(slot, culpritTraits, usedEvidenceIds)
      actionEvidenceMap.set(slot.actionId, chosen)
      usedEvidenceIds.add(chosen.evidenceId)
    }

    if (!hasRequiredEvidenceCoverage(actionEvidenceMap, requiredEvidenceCategories)) {
      continue
    }

    const overriddenLocations = locations.map((location) => ({
      ...location,
      actions: location.actions.map((action) => {
        const chosen = action.evidenceId ? actionEvidenceMap.get(action.id) : null
        return chosen ? { ...action, evidenceId: chosen.evidenceId } : action
      }),
    }))

    const suspectIds = shuffle([culprit.id, ...uniqueDistractors])
    const { generatedEvidence, generatedEvidenceById } = generateCaseEvidence(culprit, evidence, evidenceOverrides)
    const generatedLocations = generateCaseLocations(culprit, overriddenLocations, evidenceOverrides)

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
        relevantTraits,
        generatedEvidenceById,
      ),
    }
  }

  throw new Error('Unable to generate a solvable Missing Cookies lineup.')
}
