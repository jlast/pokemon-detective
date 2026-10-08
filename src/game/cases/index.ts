import type { Case, CaseDifficulty, CaseSolution } from '../caseModel'
import type { PokemonRegion, PokemonType } from '../../data/pokemon'
import { getPokemonById } from '../suspectCaseFile'
import { generateCaseEvidence, generateCaseLineup, generateCaseLocations, type CaseLineupOptions } from '../caseGeneration'
import { applyCaseTheme, createCaseTheme } from '../caseTheme'
import { createBaseCase, createSuspect, hydrateCaseConfig, type CaseConfig, type RawCaseConfig } from './shared'
import { cases as casesRaw } from './cases'

export const allCases: CaseConfig[] = (casesRaw as RawCaseConfig[]).map(hydrateCaseConfig)

const caseDifficulties: CaseDifficulty[] = ['easy', 'medium', 'hard']

export const pickRandomCaseDifficulty = (): CaseDifficulty => (
  caseDifficulties[Math.floor(Math.random() * caseDifficulties.length)] ?? 'easy'
)

const getLineupOptions = (difficulty: CaseDifficulty): CaseLineupOptions => {
  switch (difficulty) {
    case 'hard':
      return { suspectCount: 9, similarity: 'similar' }
    case 'medium':
      return { suspectCount: 6, similarity: 'similar' }
    case 'easy':
      return { suspectCount: 6, similarity: 'mixed' }
  }
}

const addSuspectCaseNotes = (suspects: ReturnType<typeof createSuspect>[], caseConfig: CaseConfig) => suspects.map((suspect, index) => ({
  ...suspect,
  caseFileNumber: index + 1,
  witnessNote: index % 2 === 0
    ? `Seen near ${caseConfig.locations[0]?.name ?? 'the scene'} shortly before the report.`
    : undefined,
  lastKnownDetail: index % 2 === 1
    ? `Last noted around ${caseConfig.locations[1]?.name ?? 'a nearby route'} during the incident window.`
    : undefined,
}))

const normalizeStoredEvidenceId = (evidenceId: string): string => (
  evidenceId === 'region-clue' ? 'region-clue-a' : evidenceId
)

const buildCase = (caseConfig: CaseConfig, difficulty = caseConfig.difficulty): Case => {
  const baseCase = createBaseCase(caseConfig)
  const generated = generateCaseLineup(baseCase.evidence, baseCase.locations, caseConfig.evidenceOverrides, getLineupOptions(difficulty))
  const theme = createCaseTheme(generated.suspectPokemonIds)

  return applyCaseTheme({
    ...baseCase,
    difficulty,
    culpritPokemonId: generated.culpritPokemonId,
    typeClueSlots: generated.typeClueSlots,
    typeClueGroups: generated.typeClueGroups,
    regionClueGroups: generated.regionClueGroups,
    suspects: addSuspectCaseNotes(generated.suspectPokemonIds.map((id) => createSuspect(id)), caseConfig),
    locations: generated.locations.map((locationItem) => ({
      ...locationItem,
      actions: locationItem.actions.map((action) => ({ ...action })),
    })),
    evidence: generated.evidence.map((evidenceItem) => ({ ...evidenceItem })),
    solution: {
      ...generated.solution,
      evidenceExplanation: generated.solution.evidenceExplanation.map((item) => ({ ...item })),
      clearedSuspects: generated.solution.clearedSuspects.map((item) => ({ ...item })),
    },
  }, theme)
}

const createRequiredCaseById = (id: string): Case => {
  const config = allCases.find((c) => c.id === id)
  if (!config) throw new Error(`Case config not found: ${id}`)
  return buildCase(config)
}

export const createMissingCookiesCase = (): Case => createRequiredCaseById('missing-cookies')
export const createPurloinedPageCase = (): Case => createRequiredCaseById('purloined-page')
export const createMissingMedalCase = (): Case => createRequiredCaseById('missing-medal')
export const createRavagedPantryCase = (): Case => createRequiredCaseById('ravaged-pantry')
export const createStolenArtifactCase = (): Case => createRequiredCaseById('stolen-artifact')

export const getCaseList = () => allCases.map((c) => ({ id: c.id, title: c.title, shortStory: c.shortStory, difficulty: c.difficulty }))

export const createCaseById = (id: string, difficulty?: CaseDifficulty): Case | undefined => {
  const config = allCases.find((c) => c.id === id)
  return config ? buildCase(config, difficulty) : undefined
}

export const rebuildFullCase = (
  configId: string,
  culpritPokemonId: number,
  suspectPokemonIds: number[],
  suspectShinyMap: Record<number, boolean>,
  actionEvidenceMap: Record<string, string>,
  solution: CaseSolution,
  witnessPokemonIds?: number[],
  _typeClueSlot: 'primary' | 'secondary' = 'primary',
  typeClueSlots?: Record<string, 'primary' | 'secondary'>,
  typeClueGroups?: Record<string, PokemonType[]>,
  regionClueGroups?: Record<string, PokemonRegion[]>,
  theme = createCaseTheme(suspectPokemonIds),
  difficultyOverride?: CaseDifficulty,
): Case => {
  const config = allCases.find((c) => c.id === configId)
  if (!config) throw new Error(`Case config not found: ${configId}`)

  const baseCase = createBaseCase(config)
  const culprit = getPokemonById(culpritPokemonId)

  const overriddenLocations = baseCase.locations.map((location) => ({
    ...location,
    actions: location.actions.map((action) => {
      const chosenId = actionEvidenceMap[action.id]
      return chosenId ? { ...action, evidenceId: normalizeStoredEvidenceId(chosenId) } : action
    }),
  }))

  const { generatedEvidence, typeClueSlots: resolvedTypeClueSlots, typeClueGroups: resolvedTypeClueGroups, regionClueGroups: resolvedRegionClueGroups } = generateCaseEvidence(culprit, baseCase.evidence, config.evidenceOverrides, typeClueSlots, typeClueGroups, regionClueGroups)
  const generatedLocations = generateCaseLocations(culprit, overriddenLocations, config.evidenceOverrides, resolvedTypeClueSlots, resolvedTypeClueGroups, resolvedRegionClueGroups)

  const suspects = addSuspectCaseNotes(suspectPokemonIds.map((id) => createSuspect(id, suspectShinyMap[id])), config)

  return applyCaseTheme({
    ...baseCase,
    difficulty: difficultyOverride ?? baseCase.difficulty,
    culpritPokemonId,
    typeClueSlots: resolvedTypeClueSlots,
    typeClueGroups: resolvedTypeClueGroups,
    regionClueGroups: resolvedRegionClueGroups,
    witnessPokemonIds,
    suspects,
    locations: generatedLocations,
    evidence: generatedEvidence,
    solution,
    status: 'active' as const,
  }, theme)
}
