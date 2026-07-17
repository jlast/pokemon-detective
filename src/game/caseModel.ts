export type CaseStatus = 'active' | 'solved' | 'failed' | 'gave-up'

export type CaseDifficulty = 'easy' | 'medium' | 'hard'

export interface InspectedFact {
  key: string
  label: string
  value: string
  discovered: boolean
}

export type SuspectInvestigationGroup = 'appearance' | 'records' | 'habitat' | 'ability'

export type SuspectNoteStatus =
  | 'suspect'
  | 'ruled-out'

export interface Suspect {
  pokemonId: number
  name: string
  sprite: string
  isShiny: boolean
  manuallyRuledOut: boolean
  noteStatus: SuspectNoteStatus
  inspectedGroups: Record<SuspectInvestigationGroup, boolean>
  inspectedFacts: InspectedFact[]
}

export type LocationActionOutcomeType = 'evidence' | 'witness' | 'nothing' | 'unlock'

export type LocationActionLeadType = 'careful' | 'thorough' | 'quick' | 'risky' | 'uncertain' | 'obvious'

export interface LocationAction {
  id: string
  label: string
  leadType: LocationActionLeadType
  description: string
  outcomeType: LocationActionOutcomeType
  evidenceId?: string | null
  evidenceTitle?: string | null
  evidenceText?: string | null
  witnessPokemonId?: number
  witnessPokemonIds?: number[]
  observationText: string
  observationTextSmall?: string
  observationTextMedium?: string
  observationTextLarge?: string
  implicationText?: string
  unlocksLocationIds?: string[]
  isUseful: boolean
}

export type LocationCardVariant = 'detective-note' | 'clipboard' | 'map-fragment'

export interface Location {
  id: string
  name: string
  icon: string
  description?: string
  teaserText?: string
  observationText?: string
  evidenceTitle?: string
  evidenceText?: string
  evidenceId?: string
  witnessPokemonId?: number
  cardVariant?: LocationCardVariant
  cardTiltDegrees?: number
  investigated: boolean
  selectedActionId: string | null
  actions: LocationAction[]
}

export interface Evidence {
  id: string
  title: string
  clueText: string
  hiddenTrait: string
  endExplanation: string
  discovered: boolean
}

export interface CaseEvidenceExplanation {
  locationId: string
  evidenceTitle: string
  clueText: string
  deductionText: string
}

export interface ClearedSuspectExplanation {
  pokemonId: number
  reason: string
}

export interface CaseSolution {
  culpritRevealText: string
  detectiveConclusion: string
  evidenceExplanation: CaseEvidenceExplanation[]
  clearedSuspects: ClearedSuspectExplanation[]
}

export interface Case {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  sceneImage: string
  sceneImageAlt: string
  difficulty: CaseDifficulty
  culpritPokemonId: number
  maxInvestigations: number
  witnessPokemonIds?: number[]
  suspects: Suspect[]
  locations: Location[]
  evidence: Evidence[]
  solution?: CaseSolution
  status: CaseStatus
}

export function getDiscoveredEvidence(caseData: Case): Evidence[] {
  const discovered: Evidence[] = []
  const seenEvidenceIds = new Set<string>()
  for (const location of caseData.locations) {
    if (
      location.investigated &&
      location.selectedActionId &&
      location.evidenceId &&
      !seenEvidenceIds.has(location.evidenceId)
    ) {
      seenEvidenceIds.add(location.evidenceId)
      const action = location.actions.find((a) => a.id === location.selectedActionId)
      discovered.push({
        id: location.evidenceId,
        title: action?.evidenceTitle ?? location.evidenceTitle ?? 'Unknown',
        clueText: action?.evidenceText ?? location.evidenceText ?? '',
        hiddenTrait: '',
        endExplanation: '',
        discovered: true,
      })
    }
  }
  return discovered
}
