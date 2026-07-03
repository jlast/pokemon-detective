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
  observationText: string
  implicationText?: string
  unlocksLocationIds?: string[]
  isUseful: boolean
}

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
  difficulty: CaseDifficulty
  culpritPokemonId: number
  maxInvestigations: number
  suspects: Suspect[]
  locations: Location[]
  evidence: Evidence[]
  solution?: CaseSolution
  status: CaseStatus
}
