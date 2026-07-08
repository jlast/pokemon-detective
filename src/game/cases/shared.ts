import { getShinySpriteUrl, pokemonData } from '../../data/pokemon'
import type { Case, CaseDifficulty, Evidence, InspectedFact, Location, LocationAction, LocationActionLeadType, Suspect } from '../caseModel'
import { getAbilityText, getEvolutionLineText, getHabitatNote } from '../suspectCaseFile'
import evidenceRaw from './evidence.json'

export type EvidenceOverride = { title?: string; clueText?: string; endExplanation?: string }

export type CaseConfig = {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  difficulty: CaseDifficulty
  maxInvestigations: number
  locations: Location[]
  evidenceOverrides?: Record<string, EvidenceOverride>
}

type RawCaseActionKind = 'evidence' | 'witness' | 'nothing'

type RawCaseAction = {
  kind: RawCaseActionKind
  id: string
  label: string
  description: string
  observationText: string
  sizeOverrides?: { small?: string; medium?: string; large?: string }
}

type RawCaseLocation = {
  id: string
  name: string
  icon: string
  teaserText: string
  actions: RawCaseAction[]
}

type RawCaseTemplate = {
  area: string
  traceArea: string
  storageArea: string
  lockedObject: string
  witnessArea: string
  witnessRole: string
  waterFeature: string
}

export type RawCaseConfig = {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  difficulty: CaseDifficulty
  maxInvestigations: number
  locations?: RawCaseLocation[]
  template?: RawCaseTemplate
  evidenceOverrides?: Record<string, EvidenceOverride>
}

const getPokemon = (pokemonId: number) => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

export const createHiddenFacts = (pokemonId: number): InspectedFact[] => {
  const pokemon = getPokemon(pokemonId)

  return [
    {
      key: 'type',
      label: 'Type',
      value: pokemon.types.map((type) => type[0].toUpperCase() + type.slice(1)).join(' / '),
      discovered: false,
    },
    {
      key: 'region',
      label: 'Region',
      value: pokemon.region,
      discovered: false,
    },
    {
      key: 'height',
      label: 'Height',
      value: `${pokemon.heightM} m`,
      discovered: false,
    },
    {
      key: 'weight',
      label: 'Weight',
      value: `${pokemon.weightKg} kg`,
      discovered: false,
    },
    {
      key: 'ability',
      label: 'Ability',
      value: getAbilityText(pokemonId),
      discovered: false,
    },
    {
      key: 'evolution-line',
      label: 'Evolution line',
      value: getEvolutionLineText(pokemon),
      discovered: false,
    },
    {
      key: 'habitat-note',
      label: 'Habitat note',
      value: getHabitatNote(pokemonId),
      discovered: false,
    },
  ]
}

export const createSuspect = (pokemonId: number): Suspect => {
  const pokemon = getPokemon(pokemonId)
  const isShiny = Math.random() < 0.01

  return {
    pokemonId,
    name: pokemon.name,
    sprite: isShiny ? getShinySpriteUrl(pokemonId) : pokemon.sprite,
    isShiny,
    manuallyRuledOut: false,
    noteStatus: 'suspect',
    inspectedGroups: {
      appearance: false,
      records: false,
      habitat: false,
      ability: false,
    },
    inspectedFacts: createHiddenFacts(pokemonId),
  }
}

export const baseEvidence: Evidence[] = evidenceRaw as Evidence[]

const evidenceDefaults: Record<string, { evidenceId: string; title: string; text: string }> = {
  crumbs: { evidenceId: 'cookie-crumbs', title: 'Cookie Crumbs', text: 'Fresh crumbs were scattered low across the ground.' },
  campers: { evidenceId: 'quiet-digging', title: 'Quiet Digging', text: 'Someone heard soft scraping after midnight.' },
  'measure-tracks': { evidenceId: 'small-tracks', title: 'Small Tracks', text: 'The tracks were small and close to the ground.' },
  'follow-tracks': { evidenceId: 'sand-trail', title: 'Sand Trail', text: 'A faint trail of dry grit pulled away from the scene.' },
  'check-roots': { evidenceId: 'loose-soil', title: 'Loose Soil', text: 'Fresh soil had been disturbed under the tree roots.' },
  'inspect-lid': { evidenceId: 'scratch-marks', title: 'Scratch Marks', text: 'Narrow marks scored the cookie jar lid.' },
  'check-table': { evidenceId: 'low-crumbs', title: 'Low Crumbs', text: 'Crumbs had fallen low along the edge of the table.' },
  'interview-camper': { evidenceId: 'avoided-water', title: 'Avoided Water', text: 'The witness remembered the culprit skirting around the water bucket.' },
  'check-wash-bucket': { evidenceId: 'dry-trail', title: 'Dry Trail', text: 'A dry path of grit led away from the wash bucket.' },
}

const location = (
  id: string,
  name: string,
  icon: string,
  teaserText: string,
  ...actions: LocationAction[]
): Location => ({ id, name, icon, teaserText, investigated: false, selectedActionId: null, actions })

const ev = (
  id: string,
  label: string,
  description: string,
  observationText: string,
  sizeOverrides?: { small?: string; medium?: string; large?: string },
): LocationAction => ({
  id,
  label,
  leadType: 'careful',
  description,
  outcomeType: 'evidence',
  evidenceId: evidenceDefaults[id as keyof typeof evidenceDefaults]?.evidenceId ?? null,
  evidenceTitle: evidenceDefaults[id as keyof typeof evidenceDefaults]?.title ?? null,
  evidenceText: evidenceDefaults[id as keyof typeof evidenceDefaults]?.text ?? null,
  observationText,
  observationTextSmall: sizeOverrides?.small,
  observationTextMedium: sizeOverrides?.medium,
  observationTextLarge: sizeOverrides?.large,
  unlocksLocationIds: [],
  isUseful: true,
})

const wit = (
  id: string,
  label: string,
  description: string,
  observationText: string,
): LocationAction => ({
  id,
  label,
  leadType: 'uncertain',
  description,
  outcomeType: 'witness',
  evidenceId: evidenceDefaults[id as keyof typeof evidenceDefaults]?.evidenceId ?? null,
  evidenceTitle: evidenceDefaults[id as keyof typeof evidenceDefaults]?.title ?? null,
  evidenceText: evidenceDefaults[id as keyof typeof evidenceDefaults]?.text ?? null,
  observationText,
  unlocksLocationIds: [],
  isUseful: true,
})

const noth = (id: string, label: string, description: string, observationText: string): LocationAction => ({
  id,
  label,
  leadType: 'thorough',
  description,
  outcomeType: 'nothing',
  evidenceId: null,
  evidenceTitle: null,
  evidenceText: null,
  observationText,
  unlocksLocationIds: [],
  isUseful: false,
})

const leadByActionId: Record<string, LocationActionLeadType> = {
  'follow-tracks': 'risky',
  'photograph-tracks': 'quick',
  'inspect-lid': 'obvious',
  'smell-jar': 'risky',
  tents: 'thorough',
  'search-branches': 'thorough',
  'search-bedding': 'thorough',
}

const act = <T extends LocationAction>(action: T): T => {
  const leadType = leadByActionId[action.id]
  if (leadType) (action as LocationAction).leadType = leadType
  return action
}

const buildAction = (action: RawCaseAction): LocationAction => {
  const builtAction =
    action.kind === 'evidence'
      ? ev(action.id, action.label, action.description, action.observationText, action.sizeOverrides)
      : action.kind === 'witness'
        ? wit(action.id, action.label, action.description, action.observationText)
        : noth(action.id, action.label, action.description, action.observationText)

  return act(builtAction)
}

const buildTemplatedLocations = (caseId: string, template: RawCaseTemplate): Location[] => [
  location(`${caseId}-scene`, template.area, '🔎', `${template.area} shows signs of a careful disturbance.`,
    ev('crumbs', `Search ${template.area}`, `Look for dropped traces around ${template.area}.`, `Loose traces were scattered {movementWord} through ${template.area}.`),
    act(noth('tents', `Check around ${template.area}`, `Search the less disturbed parts of ${template.area}.`, `Most of ${template.area} is messy, but that part reveals nothing useful.`)),
    wit('campers', `Question the ${template.witnessRole}`, `Ask what the ${template.witnessRole} noticed.`, `The ${template.witnessRole} remembers one detail clearly.`),
  ),
  location(`${caseId}-traces`, template.traceArea, '👣', `${template.traceArea} has marks leading away from the scene.`,
    ev('measure-tracks', 'Measure the marks', `Check the marks across ${template.traceArea}.`, `The marks run steadily across ${template.traceArea}.`,
      { small: `Small, light marks sit low across ${template.traceArea}.`, large: `Deep, heavy marks press into ${template.traceArea}.` }),
    act(ev('follow-tracks', 'Follow the trail', 'See where the trail leads.', `A line of {textureWord} trails across ${template.traceArea}.`)),
    act(noth('photograph-tracks', 'Photograph the marks', 'Document the marks before they are disturbed.', 'The photo captures the pattern but adds nothing new.')),
  ),
  location(`${caseId}-storage`, template.storageArea, '📦', `${template.storageArea} looks disturbed near its base.`,
    ev('check-roots', `Inspect ${template.storageArea}`, `Look under and around ${template.storageArea}.`, `The {groundWord} near ${template.storageArea} was disturbed.`),
    act(noth('search-branches', `Check above ${template.storageArea}`, 'Search the higher surfaces nearby.', 'The higher surfaces are dusty but untouched.')),
    noth('listen-quietly', 'Listen quietly', 'Pause and listen for movement.', 'The area is quiet. Whoever was here is gone.'),
  ),
  location(`${caseId}-lock`, template.lockedObject, '🔐', `${template.lockedObject} shows signs of tampering.`,
    act(ev('inspect-lid', `Inspect ${template.lockedObject}`, `Study where ${template.lockedObject} was forced.`, `Something marked ${template.lockedObject} before it gave way.`)),
    act(noth('smell-jar', `Smell near ${template.lockedObject}`, 'Check for any lingering scent.', 'Only the normal scent of the area remains. Nothing useful stands out.')),
    ev('check-table', `Check beside ${template.lockedObject}`, `Look along the nearby surface beside ${template.lockedObject}.`, `Whoever handled ${template.lockedObject} left traces {movementWord} nearby.`),
  ),
  location(`${caseId}-witness`, template.witnessArea, '🗣️', `Someone near ${template.witnessArea} noticed something odd.`,
    wit('interview-camper', `Interview the ${template.witnessRole}`, `Ask what the ${template.witnessRole} remembers.`, `The ${template.witnessRole} is certain about that detail.`),
    ev('check-wash-bucket', `Check ${template.waterFeature}`, `Inspect the area around ${template.waterFeature}.`, `Even near ${template.waterFeature}, a line of {textureWord} stayed behind.`),
    act(noth('search-bedding', `Search around ${template.witnessArea}`, 'Check the nearby hiding spots.', 'The nearby area is cluttered but hides nothing useful.')),
  ),
]

export const hydrateCaseConfig = (rawCaseConfig: RawCaseConfig): CaseConfig => {
  const locations = rawCaseConfig.locations
    ? rawCaseConfig.locations.map((rawLocation) =>
        location(
          rawLocation.id,
          rawLocation.name,
          rawLocation.icon,
          rawLocation.teaserText,
          ...rawLocation.actions.map(buildAction),
        )
      )
    : buildTemplatedLocations(rawCaseConfig.id, rawCaseConfig.template!)

  return {
    id: rawCaseConfig.id,
    title: rawCaseConfig.title,
    shortStory: rawCaseConfig.shortStory,
    crimeIcon: rawCaseConfig.crimeIcon,
    difficulty: rawCaseConfig.difficulty,
    maxInvestigations: rawCaseConfig.maxInvestigations,
    locations,
    evidenceOverrides: rawCaseConfig.evidenceOverrides,
  }
}

export const createBaseCase = (caseConfig: CaseConfig): Omit<Case, 'culpritPokemonId' | 'suspects' | 'solution'> => ({
  ...caseConfig,
  locations: caseConfig.locations.map((locationItem) => ({
    ...locationItem,
    actions: locationItem.actions.map((action) => ({ ...action })),
  })),
  evidence: baseEvidence.map((evidenceItem) => ({ ...evidenceItem })),
  status: 'active' as const,
})
