import { getShinySpriteUrl, pokemonData } from '../../data/pokemon'
import type { Case, CaseDifficulty, CluePreview, Evidence, Location, LocationAction, LocationActionLeadType, Suspect } from '../caseModel'
import { getAbilityText, getEvolutionLineText, getHabitatNote } from '../suspectCaseFile'
import evidenceRaw from './evidence.json'

export type EvidenceOverride = { title?: string; clueText?: string; endExplanation?: string }

export type CaseConfig = {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  sceneImage: string
  sceneImageAlt: string
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
  sceneImage?: string
  sceneImageAlt?: string
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

export const createSuspect = (pokemonId: number, isShinyOverride?: boolean): Suspect => {
  const pokemon = getPokemon(pokemonId)
  const isShiny = isShinyOverride ?? (Math.random() < 0.01)

  return {
    pokemonId,
    name: pokemon.name,
    sprite: isShiny ? getShinySpriteUrl(pokemonId) : pokemon.sprite,
    isShiny,
    manuallyRuledOut: false,
    noteStatus: 'suspect',
  }
}

export const baseEvidence: Evidence[] = evidenceRaw as Evidence[]

const evidenceIdByActionId: Record<string, string> = {
  crumbs: 'height-clue',
  campers: 'witness-clue',
  'measure-tracks': 'weight-clue',
  'follow-tracks': 'type-residue-clue',
  'check-roots': 'ground-trace-clue',
  'inspect-lid': 'force-clue',
  'check-table': 'height-clue',
  'interview-camper': 'witness-clue',
  'check-wash-bucket': 'type-residue-clue',
}

const cluePreviewByEvidenceId: Record<string, CluePreview> = {
  'height-clue': {
    axis: 'height',
    strength: 'strong',
    label: 'Size clue',
    hint: 'Checks whether the culprit was small, medium-sized, or tall.',
  },
  'weight-clue': {
    axis: 'weight',
    strength: 'strong',
    label: 'Weight clue',
    hint: 'Checks how heavy the culprit was from pressure or track depth.',
  },
  'type-residue-clue': {
    axis: 'type',
    strength: 'medium',
    label: 'Type clue',
    hint: 'Narrows the culprit to a small set of possible Pokemon types.',
  },
  'ground-trace-clue': {
    axis: 'groundTrace',
    strength: 'strong',
    label: 'Movement clue',
    hint: 'Checks what kind of trace the culprit left on nearby terrain.',
  },
  'force-clue': {
    axis: 'force',
    strength: 'strong',
    label: 'Force clue',
    hint: 'Checks what kind of force or entry mark the culprit could leave.',
  },
  'witness-clue': {
    axis: 'witness',
    strength: 'medium',
    label: 'Witness clue',
    hint: 'Gets a remembered movement or behavior detail from a witness.',
  },
  'highest-stat-clue': {
    axis: 'highestStat',
    strength: 'medium',
    label: 'Strong trait',
    hint: 'Looks for the culprit trait most visible during the escape.',
  },
  'lowest-stat-clue': {
    axis: 'lowestStat',
    strength: 'weak',
    label: 'Limitation',
    hint: 'Looks for what the culprit avoided or handled poorly.',
  },
}

const scenePreview = (label = 'Scene context'): CluePreview => ({
  axis: 'scene',
  strength: 'weak',
  label,
  hint: 'Checks a side route. It may close off a theory, but rarely gives a primary clue.',
})

const sideRoutePreviewByActionId: Record<string, CluePreview> = {
  tents: scenePreview('Size clue'),
  'check-fire-pit': scenePreview('Type clue'),
  'photograph-tracks': scenePreview('Movement clue'),
  'search-branches': scenePreview('Height clue'),
  'listen-quietly': scenePreview('Movement clue'),
  'smell-jar': scenePreview('Type clue'),
  'search-bedding': scenePreview('Handling clue'),
  'check-nearby-tools': scenePreview('Force clue'),
  'scan-quiet-corner': scenePreview('Movement clue'),
  'inspect-side-surface': scenePreview('Handling clue'),
  'check-reading-lamps': scenePreview('Type clue'),
  'search-armchairs': scenePreview('Handling clue'),
}

const previewForEvidenceId = (evidenceId?: string | null): CluePreview => (
  evidenceId ? cluePreviewByEvidenceId[evidenceId] ?? scenePreview('Scene context') : scenePreview('Scene context')
)

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
  evidenceId: evidenceIdByActionId[id as keyof typeof evidenceIdByActionId] ?? null,
  evidenceTitle: null,
  evidenceText: null,
  observationText,
  observationTextSmall: sizeOverrides?.small,
  observationTextMedium: sizeOverrides?.medium,
  observationTextLarge: sizeOverrides?.large,
  cluePreview: previewForEvidenceId(evidenceIdByActionId[id as keyof typeof evidenceIdByActionId]),
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
  evidenceId: evidenceIdByActionId[id as keyof typeof evidenceIdByActionId] ?? null,
  evidenceTitle: null,
  evidenceText: null,
  observationText,
  cluePreview: previewForEvidenceId(evidenceIdByActionId[id as keyof typeof evidenceIdByActionId] ?? 'witness-clue'),
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
  cluePreview: sideRoutePreviewByActionId[id] ?? scenePreview('Side route'),
})

const fillerLeadLabels = [
  ['check-nearby-tools', 'Check nearby tools', 'Look over the closest loose items.', 'The nearby items are scattered but add nothing useful.'],
  ['scan-quiet-corner', 'Scan the quiet corner', 'Check the least disturbed part of the area.', 'The quiet corner looks ordinary and points to no suspect.'],
  ['inspect-side-surface', 'Inspect the side surface', 'Look over the nearby surface for anything missed.', 'The side surface has marks from normal use, but nothing helpful.'],
] as const

const ensureThreeNonWitnessActions = (locationItem: Location): Location => {
  if (locationItem.actions.length >= 3) return locationItem

  const existingActionIds = new Set(locationItem.actions.map((action) => action.id))
  const addedActions = fillerLeadLabels
    .filter(([id]) => !existingActionIds.has(id))
    .slice(0, 3 - locationItem.actions.length)
    .map(([id, label, description, observationText]) => noth(id, label, description, observationText))

  return {
    ...locationItem,
    actions: [...locationItem.actions, ...addedActions],
  }
}

const keepOneWitnessLocation = (locations: Location[]): Location[] => {
  const witnessActions = locations.flatMap((locationItem) => (
    locationItem.actions
      .filter((action) => action.outcomeType === 'witness')
      .map((action) => ({ locationId: locationItem.id, actionId: action.id }))
  ))
  const keptWitnessAction = witnessActions.at(-1)

  if (!keptWitnessAction) return locations

  return locations.map((locationItem) => {
    if (locationItem.id === keptWitnessAction.locationId) {
      return {
        ...locationItem,
        actions: locationItem.actions.filter((action) => action.id === keptWitnessAction.actionId),
      }
    }

    return ensureThreeNonWitnessActions({
      ...locationItem,
      actions: locationItem.actions.filter((action) => action.outcomeType !== 'witness'),
    })
  })
}

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
    noth('check-nearby-tools', `Check nearby tools`, `Look over the tools closest to ${template.area}.`, 'The nearby tools are scattered but add nothing useful.'),
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
    wit('interview-camper', `Question the ${template.witnessRole}`, `Ask what the ${template.witnessRole} remembers.`, `The ${template.witnessRole} is certain about that detail.`),
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
    sceneImage: rawCaseConfig.sceneImage ?? '/case-scenes/placeholder.svg',
    sceneImageAlt: rawCaseConfig.sceneImageAlt ?? `Scene photo for ${rawCaseConfig.title}`,
    difficulty: rawCaseConfig.difficulty,
    maxInvestigations: rawCaseConfig.maxInvestigations,
    locations: keepOneWitnessLocation(locations),
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
