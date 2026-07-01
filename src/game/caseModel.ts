export type CaseStatus = 'active' | 'solved' | 'failed' | 'gave-up'

export type CaseDifficulty = 'easy' | 'medium' | 'hard'

export interface InspectedFact {
  key: string
  label: string
  value: string
  discovered: boolean
}

export interface Suspect {
  pokemonId: number
  name: string
  sprite: string
  manuallyRuledOut: boolean
  inspectedFacts: InspectedFact[]
}

export interface Location {
  id: string
  name: string
  icon: string
  description: string
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
