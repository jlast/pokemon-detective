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
    label: 'Height clue',
  },
  'weight-clue': {
    label: 'Weight clue',
  },
  'type-residue-clue': {
    label: 'Residue clue',
  },
  'ground-trace-clue': {
    label: 'Trace clue',
  },
  'force-clue': {
    label: 'Entry clue',
  },
  'witness-clue': {
    label: 'Witness clue',
  },
  'highest-stat-clue': {
    label: 'Stat clue',
  },
  'lowest-stat-clue': {
    label: 'Stat clue',
  },
  'type-affectedness-clue': {
    label: 'Reaction clue',
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
  'test-type-reaction': {
    kind: 'inspect',
    icon: '🧪',
    visualType: 'object',
    paperStyle: 'clipboard',
    displayLabel: 'Type reaction',
    teaser: 'A safe test could reveal how the culprit reacted to a type source.',
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
  'inspect-storage-base': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'ground',
    paperStyle: 'clipboard',
    displayLabel: 'Disturbed ground',
    teaser: 'Loose soil has piled against the base.',
  },
  'check-high-surfaces': {
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
  'inspect-forced-entry': {
    kind: 'inspect',
    icon: '🔦',
    visualType: 'damage',
    paperStyle: 'clipboard',
    displayLabel: 'Broken latch',
    teaser: 'Bent metal curls around the lock.',
  },
  'check-lingering-scent': {
    kind: 'inspect',
    icon: '📋',
    visualType: 'scent',
    paperStyle: 'clipboard',
    displayLabel: 'Lingering scent',
    teaser: 'A sharp scent clings to the container.',
  },
  'check-nearby-surface': {
    kind: 'inspect',
    icon: '🗄️',
    visualType: 'object',
    paperStyle: 'clipboard',
    displayLabel: 'Nearby surface',
    teaser: 'Fine scratches run along the nearby surface.',
  },
  'question-primary-witness': {
    kind: 'question',
    icon: '💬',
    visualType: 'generic-search',
    paperStyle: 'clipboard',
    displayLabel: 'Witness account',
    teaser: 'Ask what the main witness saw before the item disappeared.',
    witnessRole: 'witness',
  },
  'question-assistant': {
    kind: 'question',
    icon: '💬',
    visualType: 'generic-search',
    paperStyle: 'clipboard',
    displayLabel: 'Assistant account',
    teaser: 'Ask what changed during the handoff, cleanup, or closing routine.',
    witnessRole: 'the assistant',
  },
  'question-passerby': {
    kind: 'question',
    icon: '💬',
    visualType: 'generic-search',
    paperStyle: 'clipboard',
    displayLabel: 'Passerby account',
    teaser: 'Ask who passed through and whether anything sounded or moved strangely.',
    witnessRole: 'a passerby',
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
  witnessRoles: string[],
  witnessPromptTemplates: string[],
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
    witnessRoles,
    witnessPromptTemplates,
  },
})

const buildTemplatedLocations = (caseId: string, template: RawCaseTemplate): Location[] => [
  location(`${caseId}-scene`, template.area, '🔎', `${template.area} shows signs of a careful disturbance.`,
    ev('search-scene-traces', 'height-clue', `Search ${template.area}`, `Look for dropped traces around ${template.area}.`, `Loose traces were scattered {movementWord} through ${template.area}.`),
    ev('check-scene-edge', 'ground-trace-clue', `Check around ${template.area}`, `Search the less disturbed parts of ${template.area}.`, `The quieter edge of ${template.area} showed {groundWord}.`),
    ev('check-nearby-tools', 'force-clue', `Check nearby tools`, `Look over the tools closest to ${template.area}.`, 'One nearby tool showed {forceTrace}.'),
    ev('test-type-reaction', 'type-affectedness-clue', 'Test the residue reaction', 'Use a safe type sample on the residue.', 'The residue reacted like it came from someone {affectednessLabel}.'),
  ),
  location(`${caseId}-traces`, template.traceArea, '👣', `${template.traceArea} has marks leading away from the scene.`,
    ev('measure-tracks', 'weight-clue', 'Measure the marks', `Check the marks across ${template.traceArea}.`, `The marks run steadily across ${template.traceArea}.`,
      { small: `Small, light marks sit low across ${template.traceArea}.`, large: `Deep, heavy marks press into ${template.traceArea}.` }),
    ev('follow-tracks', 'type-residue-clue', 'Follow the trail', 'See where the trail leads.', `A line of {textureWord} trails across ${template.traceArea}.`),
    ev('photograph-tracks', 'height-clue', 'Photograph the marks', 'Document the marks before they are disturbed.', `The photo preserved traces {movementWord} across ${template.traceArea}.`),
  ),
  location(`${caseId}-storage`, template.storageArea, '📦', `${template.storageArea} looks disturbed near its base.`,
    ev('inspect-storage-base', 'ground-trace-clue', `Inspect ${template.storageArea}`, `Look under and around ${template.storageArea}.`, `The {groundWord} near ${template.storageArea} was disturbed.`),
    ev('check-high-surfaces', 'height-clue', `Check above ${template.storageArea}`, 'Search the higher surfaces nearby.', `Dust near ${template.storageArea} was shifted {heightPosition}.`),
    ev('listen-quietly', 'highest-stat-clue', 'Listen quietly', 'Pause and listen for movement.', 'The quiet pause revealed signs of {strongStatTrace}.'),
  ),
  location(`${caseId}-lock`, template.lockedObject, '🔐', `${template.lockedObject} shows signs of tampering.`,
    ev('inspect-forced-entry', 'force-clue', `Inspect ${template.lockedObject}`, `Study where ${template.lockedObject} was forced.`, `Something marked ${template.lockedObject} before it gave way.`),
    ev('check-lingering-scent', 'type-residue-clue', `Smell near ${template.lockedObject}`, 'Check for any lingering scent.', `A trace of {textureWord} clung near ${template.lockedObject}.`),
    ev('check-nearby-surface', 'lowest-stat-clue', `Check beside ${template.lockedObject}`, `Look along the nearby surface beside ${template.lockedObject}.`, `Whoever handled ${template.lockedObject} left signs of {weakStatTrace} nearby.`),
  ),
  location(`${caseId}-witness`, 'Interview Witness', '🗣️', `Someone near ${template.witnessArea} noticed something odd.`,
    wit('question-primary-witness', 'witness-clue', `Question the ${template.witnessRole}`, `Ask what the ${template.witnessRole} remembers.`, `The ${template.witnessRole} is certain about that detail.`, template.witnessRole,
      [template.witnessRole],
      [
        'Ask {pokemonName} what {witnessRole} saw around the missing item before it disappeared.',
      ],
    ),
    wit('question-assistant', 'witness-clue', 'Question the assistant', 'Ask what changed during the routine.', 'The assistant remembers a useful detail.', 'the assistant',
      ['the assistant'],
      ['Ask {pokemonName} what changed during the handoff, cleanup, or closing routine.'],
    ),
    wit('question-passerby', 'witness-clue', 'Question a passerby', 'Ask who passed through the area.', 'The passerby remembers a useful detail.', 'a passerby',
      ['a passerby'],
      ['Ask {pokemonName} who passed through and whether anything sounded or moved strangely.'],
    ),
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
