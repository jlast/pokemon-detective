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

export interface Location {
  id: string
  name: string
  icon: string
  description?: string
  teaserText?: string
  observationText?: string
  evidenceTitle?: string
  evidenceText?: string
  evidenceId: string
  investigated: boolean
}

export interface Evidence {
  id: string
  title: string
  clueText: string
  hiddenTrait: string
  endExplanation: string
  discovered: boolean
}

export interface Case {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  difficulty: CaseDifficulty
  culpritPokemonId: number
  suspects: Suspect[]
  locations: Location[]
  evidence: Evidence[]
  status: CaseStatus
}
