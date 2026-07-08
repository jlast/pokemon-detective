import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { CaseEvidenceExplanation, ClearedSuspectExplanation, Evidence, Location, LocationAction } from './caseModel'
import { getPokemonById } from './suspectCaseFile'

export type CaseTrait =
  | 'small_stature'
  | 'large_stature'
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

type TraitRule = {
  trait: CaseTrait
  types?: PokemonType[]
  requirePrimary?: boolean
  check?: (pokemon: Pokemon) => boolean
}

const traitRules: TraitRule[] = [
  { trait: 'small_stature', check: (p) => p.heightM <= 1.0 && p.weightKg <= 35 },
  { trait: 'large_stature', check: (p) => p.heightM >= 1.4 || p.weightKg >= 45 },
  { trait: 'ground_affinity', types: ['ground', 'rock', 'fighting', 'normal', 'dragon'] },
  { trait: 'burrowing', types: ['ground', 'rock', 'bug'] },
  { trait: 'claw_or_scratch', types: ['ground', 'rock', 'bug', 'dark', 'fighting', 'steel', 'normal'] },
  { trait: 'dry_environment', types: ['ground', 'rock', 'fire'], requirePrimary: true },
  { trait: 'water_affinity', types: ['water', 'ice'] },
  { trait: 'moisture_residue', types: ['water', 'ice', 'grass', 'poison'] },
  { trait: 'fire_heat', types: ['fire', 'electric', 'dragon'] },
  { trait: 'ash_or_scorch', types: ['fire', 'electric'] },
  { trait: 'air_movement', types: ['flying', 'psychic', 'ghost', 'fairy'] },
  { trait: 'plant_residue', types: ['grass', 'bug'] },
  { trait: 'psychic_trace', types: ['psychic', 'ghost', 'dark', 'fairy'] },
  { trait: 'metal_scrape', types: ['steel'] },
  { trait: 'toxic_residue', types: ['poison'] },
]

const traitPriority: CaseTrait[] = traitRules.map((rule) => rule.trait)

export const evidenceTraitById: Record<string, CaseTrait> = {
  'cookie-crumbs': 'small_stature',
  'quiet-digging': 'burrowing',
  'small-tracks': 'small_stature',
  'sand-trail': 'ground_affinity',
  'loose-soil': 'burrowing',
  'scratch-marks': 'claw_or_scratch',
  'low-crumbs': 'small_stature',
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
}

type ActionEvidencePool = {
  actionId: string
  locationId: string
  pool: { evidenceId: string; trait: CaseTrait }[]
  isPrimary: boolean
}

const actionEvidencePools: ActionEvidencePool[] = [
  { actionId: 'crumbs', locationId: 'campsite', isPrimary: true, pool: [
    { evidenceId: 'cookie-crumbs', trait: 'small_stature' },
    { evidenceId: 'low-crumbs', trait: 'large_stature' },
    { evidenceId: 'ash-scatter', trait: 'ash_or_scorch' },
    { evidenceId: 'pollen-scent', trait: 'plant_residue' },
  ]},
  { actionId: 'campers', locationId: 'campsite', isPrimary: false, pool: [
    { evidenceId: 'quiet-digging', trait: 'burrowing' },
    { evidenceId: 'psychic-echo', trait: 'psychic_trace' },
    { evidenceId: 'slime-trail', trait: 'toxic_residue' },
  ]},
  { actionId: 'measure-tracks', locationId: 'tracks', isPrimary: true, pool: [
    { evidenceId: 'small-tracks', trait: 'small_stature' },
    { evidenceId: 'sand-trail', trait: 'ground_affinity' },
    { evidenceId: 'frost-trail', trait: 'moisture_residue' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
  ]},
  { actionId: 'follow-tracks', locationId: 'tracks', isPrimary: false, pool: [
    { evidenceId: 'sand-trail', trait: 'ground_affinity' },
    { evidenceId: 'dry-trail', trait: 'dry_environment' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
  ]},
  { actionId: 'check-roots', locationId: 'forest-edge', isPrimary: true, pool: [
    { evidenceId: 'loose-soil', trait: 'burrowing' },
    { evidenceId: 'pollen-scent', trait: 'plant_residue' },
    { evidenceId: 'feather-drift', trait: 'air_movement' },
  ]},
  { actionId: 'inspect-lid', locationId: 'cookie-jar', isPrimary: true, pool: [
    { evidenceId: 'scratch-marks', trait: 'claw_or_scratch' },
    { evidenceId: 'metal-shaving', trait: 'metal_scrape' },
    { evidenceId: 'static-mark', trait: 'fire_heat' },
  ]},
  { actionId: 'check-table', locationId: 'cookie-jar', isPrimary: false, pool: [
    { evidenceId: 'low-crumbs', trait: 'large_stature' },
    { evidenceId: 'cookie-crumbs', trait: 'small_stature' },
  ]},
  { actionId: 'interview-camper', locationId: 'witness-tent', isPrimary: true, pool: [
    { evidenceId: 'avoided-water', trait: 'dry_environment' },
    { evidenceId: 'psychic-echo', trait: 'psychic_trace' },
    { evidenceId: 'ash-scatter', trait: 'ash_or_scorch' },
    { evidenceId: 'quiet-digging', trait: 'burrowing' },
  ]},
  { actionId: 'check-wash-bucket', locationId: 'witness-tent', isPrimary: false, pool: [
    { evidenceId: 'dry-trail', trait: 'ground_affinity' },
    { evidenceId: 'slime-trail', trait: 'toxic_residue' },
  ]},
]

type PokemonCaseProfile = {
  size: 'small' | 'medium' | 'large'
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

  return traits
}

const getPokemonCaseProfile = (pokemon: Pokemon): PokemonCaseProfile => {
  const size = pokemon.heightM <= 0.7 && pokemon.weightKg <= 15
    ? 'small'
    : pokemon.heightM >= 1.4 || pokemon.weightKg >= 45
      ? 'large'
      : 'medium'
  const affinity = getPrimaryAffinity(pokemon)
  const profile = affinityProfiles[affinity]

  return {
    size,
    textureWord: profile.textureWord,
    movementWord: size === 'small' ? 'close to the ground' : size === 'large' ? 'with a heavier reach' : 'at a medium height',
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

const getTraitConclusionFragment = (trait: CaseTrait) => {
  switch (trait) {
    case 'small_stature':
      return 'small and close to the ground'
    case 'large_stature':
      return 'large and heavy on the ground'
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
  }
}

const getTraitDeductionText = (trait: CaseTrait) => {
  switch (trait) {
    case 'small_stature':
      return 'This pointed toward a small Pokemon that stayed low.'
    case 'large_stature':
      return 'This pointed toward a larger, heavier suspect.'
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
  }
}

const buildEvidenceFromTrait = (evidenceId: string, culprit: Pokemon) => {
  const profile = getPokemonCaseProfile(culprit)

  switch (evidenceId) {
    case 'cookie-crumbs':
      return {
        title: 'Cookie Crumbs',
        clueText: `Fresh crumbs were scattered ${profile.movementWord}.`,
        endExplanation: `The culprit moved ${profile.movementWord} while eating near the campfire.`,
        deductionText:
          profile.size === 'small'
            ? 'This pointed toward a small Pokemon that stayed low.'
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
        title: profile.size === 'small' ? 'Small Tracks' : profile.size === 'large' ? 'Heavy Prints' : 'Medium Tracks',
        clueText:
          profile.size === 'small'
            ? 'The tracks were small and close to the ground.'
            : profile.size === 'large'
              ? 'The prints were deeper and wider than expected.'
              : 'The tracks were medium-sized and steady through the dirt.',
        endExplanation:
          profile.size === 'small'
            ? 'The culprit left small, low tracks near the tents.'
            : profile.size === 'large'
              ? 'The culprit left a broader, heavier trail near the tents.'
              : 'The culprit left medium tracks that held their shape near the tents.',
        deductionText:
          profile.size === 'small'
            ? 'This pointed toward a small Pokemon that stayed low.'
            : profile.size === 'large'
              ? 'This pointed toward a larger suspect that left heavier tracks.'
              : 'This pointed toward a medium-sized suspect with a steadier stride.',
      }
    case 'sand-trail':
      return {
        title: profile.textureWord === 'damp residue' ? 'Damp Trail' : 'Dry Trail',
        clueText: `A faint line of ${profile.textureWord} pulled away from the camp.`,
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
    case 'avoided-water':
      return {
        title: 'Avoided Water',
        clueText: `The camper remembered the culprit ${profile.waterAvoidanceWord}.`,
        endExplanation: `The culprit deliberately avoided the wettest part of camp by ${profile.waterAvoidanceWord}.`,
        deductionText:
          profile.textureWord === 'damp residue'
            ? 'This suggested the culprit moved near water differently than expected.'
            : 'This suggested the culprit preferred the driest path through camp.',
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
        clueText: `A slick ribbon of ${profile.textureWord} traced away from the camp.`,
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

const generateCaseEvidence = (
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

const generateCaseLocations = (
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
    case 'small_stature':
      return 'Did not fit the small, low clues left at the scene.'
    case 'large_stature':
      return 'Did not fit the signs of a larger, heavier suspect.'
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

const pickEvidenceForAction = (pool: ActionEvidencePool, culpritTraits: Set<CaseTrait>): string => {
  const matching = pool.pool.filter((entry) => culpritTraits.has(entry.trait))
  const chosen = matching.length > 0
    ? matching[Math.floor(Math.random() * matching.length)]
    : pool.pool[Math.floor(Math.random() * pool.pool.length)]

  return chosen.evidenceId
}

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
      const evidenceItem = evidenceById.get(primaryAction.evidenceId)
      if (!evidenceItem) return []
      return [{
        locationId: location.id,
        evidenceTitle: primaryAction.evidenceTitle ?? evidenceItem.title,
        clueText: primaryAction.evidenceText ?? evidenceItem.clueText,
        deductionText:
          generatedEvidenceById.get(primaryAction.evidenceId)?.deductionText ??
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
    detectiveConclusion: `The culprit had to be ${joinFragments(relevantTraits.map(getTraitConclusionFragment))}. ${culprit.name} best fit the collected evidence.`,
    evidenceExplanation,
    clearedSuspects,
  }
}

export const generateCaseLineup = (
  evidence: Evidence[],
  locations: Location[],
  evidenceOverrides?: Record<string, { title?: string; clueText?: string; endExplanation?: string }>,
) => {
  const candidates = pokemonData.filter((pokemon) => !pokemon.isLegendary && !pokemon.isMythical)

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const culprit = candidates[Math.floor(Math.random() * candidates.length)]
    const relevantTraits = getRelevantTraits(culprit.id)

    if (relevantTraits.length < 2) {
      continue
    }

    const scoredDistractors = shuffle(
      candidates
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
    const actionEvidenceMap = new Map<string, string>()

    for (const slot of actionEvidencePools) {
      const chosenId = pickEvidenceForAction(slot, culpritTraits)
      actionEvidenceMap.set(slot.actionId, chosenId)
    }

    const overriddenLocations = locations.map((location) => ({
      ...location,
      actions: location.actions.map((action) => {
        const chosenId = action.evidenceId ? actionEvidenceMap.get(action.id) : null
        return chosenId ? { ...action, evidenceId: chosenId } : action
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
