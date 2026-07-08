import type { Case } from '../caseModel'
import { createBaseCase, createSuspect, hydrateCaseConfig, type CaseConfig, type RawCaseConfig } from './shared'
import missingCookiesRaw from './missingCookies.json'
import purloinedPageRaw from './purloinedPage.json'
import missingMedalRaw from './missingMedal.json'
import ravagedPantryRaw from './ravagedPantry.json'
import stolenArtifactRaw from './stolenArtifact.json'
import additionalCasesRaw from './additionalCases.json'
import { generateCaseLineup } from '../caseGeneration'

const allCases: CaseConfig[] = [
  hydrateCaseConfig(missingCookiesRaw as RawCaseConfig),
  hydrateCaseConfig(purloinedPageRaw as RawCaseConfig),
  hydrateCaseConfig(missingMedalRaw as RawCaseConfig),
  hydrateCaseConfig(ravagedPantryRaw as RawCaseConfig),
  hydrateCaseConfig(stolenArtifactRaw as RawCaseConfig),
  ...(additionalCasesRaw as RawCaseConfig[]).map(hydrateCaseConfig),
]

const buildCase = (caseConfig: CaseConfig): Case => {
  const baseCase = createBaseCase(caseConfig)
  const generated = generateCaseLineup(baseCase.evidence, baseCase.locations, caseConfig.evidenceOverrides)

  return {
    ...baseCase,
    culpritPokemonId: generated.culpritPokemonId,
    suspects: generated.suspectPokemonIds.map(createSuspect).map((suspect) => ({
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

export const createMissingCookiesCase = (): Case => buildCase(allCases[0]!)
export const createPurloinedPageCase = (): Case => buildCase(allCases[1]!)
export const createMissingMedalCase = (): Case => buildCase(allCases[2]!)
export const createRavagedPantryCase = (): Case => buildCase(allCases[3]!)
export const createStolenArtifactCase = (): Case => buildCase(allCases[4]!)

export const getCaseList = () => allCases.map((c) => ({ id: c.id, title: c.title, shortStory: c.shortStory, crimeIcon: c.crimeIcon, difficulty: c.difficulty }))

export const createCaseById = (id: string): Case | undefined => {
  const config = allCases.find((c) => c.id === id)
  return config ? buildCase(config) : undefined
}
