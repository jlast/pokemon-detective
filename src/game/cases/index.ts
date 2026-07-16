import type { Case, CaseSolution } from '../caseModel'
import { getPokemonById } from '../suspectCaseFile'
import { generateCaseEvidence, generateCaseLineup, generateCaseLocations } from '../caseGeneration'
import { createBaseCase, createSuspect, hydrateCaseConfig, type CaseConfig, type RawCaseConfig } from './shared'
import additionalCasesRaw from './additionalCases.json'

export const allCases: CaseConfig[] = (additionalCasesRaw as RawCaseConfig[]).map(hydrateCaseConfig)

const buildCase = (caseConfig: CaseConfig): Case => {
  const baseCase = createBaseCase(caseConfig)
  const generated = generateCaseLineup(baseCase.evidence, baseCase.locations, caseConfig.evidenceOverrides)

  return {
    ...baseCase,
    culpritPokemonId: generated.culpritPokemonId,
    suspects: generated.suspectPokemonIds.map((id) => createSuspect(id)).map((suspect) => ({
      ...suspect,
      inspectedGroups: { ...suspect.inspectedGroups },
      inspectedFacts: suspect.inspectedFacts.map((fact) => ({ ...fact })),
    })),
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
  }
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

export const getCaseList = () => allCases.map((c) => ({ id: c.id, title: c.title, shortStory: c.shortStory, crimeIcon: c.crimeIcon, difficulty: c.difficulty }))

export const createCaseById = (id: string): Case | undefined => {
  const config = allCases.find((c) => c.id === id)
  return config ? buildCase(config) : undefined
}

export const rebuildFullCase = (
  configId: string,
  culpritPokemonId: number,
  suspectPokemonIds: number[],
  suspectShinyMap: Record<number, boolean>,
  actionEvidenceMap: Record<string, string>,
  solution: CaseSolution,
  witnessPokemonIds?: number[],
): Case => {
  const config = allCases.find((c) => c.id === configId)
  if (!config) throw new Error(`Case config not found: ${configId}`)

  const baseCase = createBaseCase(config)
  const culprit = getPokemonById(culpritPokemonId)

  const overriddenLocations = baseCase.locations.map((location) => ({
    ...location,
    actions: location.actions.map((action) => {
      const chosenId = actionEvidenceMap[action.id]
      return chosenId ? { ...action, evidenceId: chosenId } : action
    }),
  }))

  const { generatedEvidence } = generateCaseEvidence(culprit, baseCase.evidence, config.evidenceOverrides)
  const generatedLocations = generateCaseLocations(culprit, overriddenLocations, config.evidenceOverrides)

  const suspects = suspectPokemonIds.map((id) => createSuspect(id, suspectShinyMap[id]))

  return {
    ...baseCase,
    culpritPokemonId,
    witnessPokemonIds,
    suspects,
    locations: generatedLocations,
    evidence: generatedEvidence,
    solution,
    status: 'active' as const,
  }
}
