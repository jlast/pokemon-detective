import { getShinySpriteUrl, pokemonData } from '../../data/pokemon'
import type { Case, CaseDifficulty, CluePreview, Evidence, Location, LocationAction, LocationActionPresentation, Suspect } from '../caseModel'
import evidenceRaw from './evidence.json'

export type EvidenceOverride = { title?: string; clueText?: string }

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
  template: RawCaseTemplate
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

const cluePreviewByEvidenceId: Record<string, CluePreview> = {
  'height-clue': {
    label: 'Size clue',
  },
  'weight-clue': {
    label: 'Weight clue',
  },
  'type-residue-clue': {
    label: 'Type clue',
  },
  'ground-trace-clue': {
    label: 'Movement clue',
  },
  'force-clue': {
    label: 'Force clue',
  },
  'witness-clue': {
    label: 'Witness clue',
  },
  'highest-stat-clue': {
    label: 'Strong trait',
  },
  'lowest-stat-clue': {
    label: 'Limitation',
  },
}

const scenePreview = (label = 'Scene context'): CluePreview => ({
  label,
})

const presentationByActionId: Record<string, LocationActionPresentation> = {
  'search-scene-traces': {
    kind: 'search',
    icon: '👣',
    visualType: 'footprints',
    paperStyle: 'notebook',
    displayLabel: 'Footprints',
    teaser: 'Fresh heel marks stop beside the area.',
  },
  'check-scene-edge': {
    kind: 'search',
    icon: '🔍',
    visualType: 'object',
    paperStyle: 'tag',
    displayLabel: 'Disturbed edge',
    teaser: 'Leaves near the edge remain untouched.',
  },
  'check-nearby-tools': {
    kind: 'inspect',
    icon: '📋',
    visualType: 'tool-marks',
    paperStyle: 'clipboard',
    displayLabel: 'Nearby tools',
    teaser: 'A small scrape sits beside the closest tools.',
  },
  'scan-quiet-corner': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'object',
    paperStyle: 'clipboard',
    displayLabel: 'Quiet corner',
    teaser: 'Fresh dust breaks along the quiet corner.',
  },
  'inspect-side-surface': {
    kind: 'inspect',
    icon: '🗄️',
    visualType: 'object',
    paperStyle: 'clipboard',
    displayLabel: 'Side surface',
    teaser: 'Fresh dust breaks along the side surface.',
  },
  'measure-tracks': {
    kind: 'search',
    icon: '👣',
    visualType: 'footprints',
    paperStyle: 'notebook',
    displayLabel: 'Track depth',
    teaser: 'Deep prints cross the dirt beside the marks.',
  },
  'follow-tracks': {
    kind: 'search',
    icon: '🔍',
    visualType: 'footprints',
    paperStyle: 'notebook',
    displayLabel: 'Escape route',
    teaser: 'A thin trail bends toward the side path.',
  },
  'photograph-tracks': {
    kind: 'inspect',
    icon: '📋',
    visualType: 'tool-marks',
    paperStyle: 'tag',
    displayLabel: 'Track pattern',
    teaser: 'A clean photo could catch the spacing between prints.',
  },
  'check-roots': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'ground',
    paperStyle: 'clipboard',
    displayLabel: 'Disturbed ground',
    teaser: 'Loose soil has piled against the base.',
  },
  'search-branches': {
    kind: 'search',
    icon: '👣',
    visualType: 'high-surface',
    paperStyle: 'tag',
    displayLabel: 'High surface',
    teaser: 'Dust on the upper surface has a fresh gap.',
  },
  'listen-quietly': {
    kind: 'inspect',
    icon: '📋',
    visualType: 'sound',
    paperStyle: 'clipboard',
    displayLabel: 'Muffled noise',
    teaser: 'A soft scrape comes from behind the shelves.',
  },
  'inspect-lid': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'damage',
    paperStyle: 'clipboard',
    displayLabel: 'Broken latch',
    teaser: 'Bent metal curls around the lock.',
  },
  'smell-jar': {
    kind: 'inspect',
    icon: '📋',
    visualType: 'scent',
    paperStyle: 'clipboard',
    displayLabel: 'Lingering scent',
    teaser: 'A sharp scent clings to the container.',
  },
  'check-table': {
    kind: 'inspect',
    icon: '🗄️',
    visualType: 'object',
    paperStyle: 'clipboard',
    displayLabel: 'Nearby surface',
    teaser: 'Fine scratches run along the nearby surface.',
  },
  'interview-camper': {
    kind: 'question',
    icon: '💬',
    visualType: 'generic-search',
    paperStyle: 'clipboard',
    displayLabel: 'Witness account',
    teaser: 'Ask what changed during the handoff, cleanup, or closing routine.',
    witnessRole: 'witness',
  },
  'check-wash-bucket': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'container',
    paperStyle: 'clipboard',
    displayLabel: 'Wet trace',
    teaser: 'Mud flecks ring the water feature.',
  },
  'search-bedding': {
    kind: 'search',
    icon: '👣',
    visualType: 'high-surface',
    paperStyle: 'tag',
    displayLabel: 'Hidden nook',
    teaser: 'A tucked corner near the witness area is flattened.',
  },
}

const getPresentation = (id: string, fallback: LocationActionPresentation): LocationActionPresentation => (
  presentationByActionId[id] ?? fallback
)

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
  evidenceId: string,
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
  evidenceId,
  evidenceTitle: null,
  evidenceText: null,
  observationText,
  observationTextSmall: sizeOverrides?.small,
  observationTextMedium: sizeOverrides?.medium,
  observationTextLarge: sizeOverrides?.large,
  cluePreview: previewForEvidenceId(evidenceId),
  presentation: getPresentation(id, {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'generic-search',
    paperStyle: 'clipboard',
    displayLabel: label,
    teaser: description,
  }),
})

const wit = (
  id: string,
  evidenceId: string,
  label: string,
  description: string,
  observationText: string,
  witnessRole: string,
): LocationAction => ({
  id,
  label,
  leadType: 'uncertain',
  description,
  outcomeType: 'witness',
  evidenceId,
  evidenceTitle: null,
  evidenceText: null,
  observationText,
  cluePreview: previewForEvidenceId(evidenceId),
  presentation: {
    ...getPresentation(id, {
      kind: 'question',
      icon: '💬',
      visualType: 'generic-search',
      paperStyle: 'clipboard',
      displayLabel: 'Witness account',
      teaser: description,
      witnessRole,
    }),
    witnessRole,
  },
})

const buildTemplatedLocations = (caseId: string, template: RawCaseTemplate): Location[] => [
  location(`${caseId}-scene`, template.area, '🔎', `${template.area} shows signs of a careful disturbance.`,
    ev('search-scene-traces', 'height-clue', `Search ${template.area}`, `Look for dropped traces around ${template.area}.`, `Loose traces were scattered {movementWord} through ${template.area}.`),
    ev('check-scene-edge', 'height-clue', `Check around ${template.area}`, `Search the less disturbed parts of ${template.area}.`, `The quieter edge of ${template.area} was disturbed {heightPosition}.`),
    ev('check-nearby-tools', 'force-clue', `Check nearby tools`, `Look over the tools closest to ${template.area}.`, 'One nearby tool showed {forceTrace}.'),
  ),
  location(`${caseId}-traces`, template.traceArea, '👣', `${template.traceArea} has marks leading away from the scene.`,
    ev('measure-tracks', 'weight-clue', 'Measure the marks', `Check the marks across ${template.traceArea}.`, `The marks run steadily across ${template.traceArea}.`,
      { small: `Small, light marks sit low across ${template.traceArea}.`, large: `Deep, heavy marks press into ${template.traceArea}.` }),
    ev('follow-tracks', 'type-residue-clue', 'Follow the trail', 'See where the trail leads.', `A line of {textureWord} trails across ${template.traceArea}.`),
    ev('photograph-tracks', 'weight-clue', 'Photograph the marks', 'Document the marks before they are disturbed.', `The photo preserved marks that were {trackDepth} across ${template.traceArea}.`),
  ),
  location(`${caseId}-storage`, template.storageArea, '📦', `${template.storageArea} looks disturbed near its base.`,
    ev('check-roots', 'ground-trace-clue', `Inspect ${template.storageArea}`, `Look under and around ${template.storageArea}.`, `The {groundWord} near ${template.storageArea} was disturbed.`),
    ev('search-branches', 'height-clue', `Check above ${template.storageArea}`, 'Search the higher surfaces nearby.', `Dust near ${template.storageArea} was shifted {heightPosition}.`),
    ev('listen-quietly', 'witness-clue', 'Listen quietly', 'Pause and listen for movement.', `The quiet pause caught a report of someone {witnessDetail}.`),
  ),
  location(`${caseId}-lock`, template.lockedObject, '🔐', `${template.lockedObject} shows signs of tampering.`,
    ev('inspect-lid', 'force-clue', `Inspect ${template.lockedObject}`, `Study where ${template.lockedObject} was forced.`, `Something marked ${template.lockedObject} before it gave way.`),
    ev('smell-jar', 'type-residue-clue', `Smell near ${template.lockedObject}`, 'Check for any lingering scent.', `A trace of {textureWord} clung near ${template.lockedObject}.`),
    ev('check-table', 'height-clue', `Check beside ${template.lockedObject}`, `Look along the nearby surface beside ${template.lockedObject}.`, `Whoever handled ${template.lockedObject} left traces {movementWord} nearby.`),
  ),
  location(`${caseId}-witness`, template.witnessArea, '🗣️', `Someone near ${template.witnessArea} noticed something odd.`,
    wit('interview-camper', 'witness-clue', `Question the ${template.witnessRole}`, `Ask what the ${template.witnessRole} remembers.`, `The ${template.witnessRole} is certain about that detail.`, template.witnessRole),
    ev('check-wash-bucket', 'type-residue-clue', `Check ${template.waterFeature}`, `Inspect the area around ${template.waterFeature}.`, `Even near ${template.waterFeature}, a line of {textureWord} stayed behind.`),
    ev('search-bedding', 'witness-clue', `Search around ${template.witnessArea}`, 'Check the nearby hiding spots.', `A note near ${template.witnessArea} described someone {witnessDetail}.`),
  ),
]

export const hydrateCaseConfig = (rawCaseConfig: RawCaseConfig): CaseConfig => {
  const locations = buildTemplatedLocations(rawCaseConfig.id, rawCaseConfig.template)

  return {
    id: rawCaseConfig.id,
    title: rawCaseConfig.title,
    shortStory: rawCaseConfig.shortStory,
    crimeIcon: rawCaseConfig.crimeIcon,
    sceneImage: rawCaseConfig.sceneImage ?? '/case-scenes/placeholder.svg',
    sceneImageAlt: rawCaseConfig.sceneImageAlt ?? `Scene photo for ${rawCaseConfig.title}`,
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
