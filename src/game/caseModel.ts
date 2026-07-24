import type { PokemonType } from '../data/pokemon'

export type CaseStatus = 'active' | 'solved' | 'failed'

export type CaseDifficulty = 'easy' | 'medium' | 'hard'

export type SuspectNoteStatus =
  | 'suspect'
  | 'ruled-out'

export interface Suspect {
  pokemonId: number
  name: string
  sprite: string
  isShiny: boolean
  caseFileNumber?: number
  lastKnownDetail?: string
  witnessNote?: string
  manuallyRuledOut: boolean
  noteStatus: SuspectNoteStatus
}

export type LocationActionOutcomeType = 'evidence' | 'witness' | 'nothing'

export type LocationActionLeadType = 'careful' | 'thorough' | 'quick' | 'risky' | 'uncertain' | 'obvious'

export type InvestigationLeadKind = 'search' | 'inspect' | 'question'

export type LeadPaperStyle = 'notebook' | 'tag' | 'clipboard'

export type LeadVisualType =
  | 'footprints'
  | 'object'
  | 'tool-marks'
  | 'dust'
  | 'sound'
  | 'scent'
  | 'high-surface'
  | 'ground'
  | 'container'
  | 'damage'
  | 'movement'
  | 'generic-search'

export interface LocationActionPresentation {
  kind: InvestigationLeadKind
  icon: string
  visualType: LeadVisualType
  paperStyle: LeadPaperStyle
  displayLabel: string
  teaser: string
  witnessRole?: string
  witnessRoles?: string[]
  witnessPromptTemplates?: string[]
}

export type ClueAxis = 'height' | 'weight' | 'type' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat' | 'typeAffectedness' | 'scene'

export type CluePrecision = 'exact' | 'grouped' | 'none'

export interface ClueRule {
  axis: ClueAxis
  precision: CluePrecision
  matchingValues: string[]
}

export interface CluePreview {
  label: string
}

export interface EvidenceBadgeData {
  text: string
  type?: string
}

export type EvidenceEvaluationResult = 'match' | 'possible' | 'conflict' | 'unknown'

export type EvidenceNoteStatus = 'important' | 'revisit' | 'ignored' | null

export interface EvidenceObservation {
  title: string
  observation: string
  interpretation: string
}

export interface EvidencePlayerNote {
  evidenceId: string
  status: EvidenceNoteStatus
}

export interface LocationAction {
  id: string
  label: string
  leadType: LocationActionLeadType
  description: string
  outcomeType: LocationActionOutcomeType
  evidenceId?: string | null
  evidenceTitle?: string | null
  evidenceText?: string | null
  evidenceBadges?: EvidenceBadgeData[] | null
  witnessPokemonIds?: number[]
  observationText: string
  observationTextSmall?: string
  observationTextMedium?: string
  observationTextLarge?: string
  implicationText?: string
  cluePreview: CluePreview
  clueRule?: ClueRule
  presentation: LocationActionPresentation
}

export type LocationCardVariant = 'detective-note' | 'clipboard' | 'map-fragment'

export interface Location {
  id: string
  name: string
  icon: string
  teaserText?: string
  observationText?: string
  evidenceTitle?: string
  evidenceText?: string
  evidenceBadges?: EvidenceBadgeData[]
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
  badges?: EvidenceBadgeData[]
  rule: ClueRule
  observation?: EvidenceObservation
}

export interface CaseEvidenceExplanation {
  locationId: string
  evidenceTitle: string
  clueText: string
  badges?: EvidenceBadgeData[]
  deductionText: string
}

export interface ClearedSuspectExplanation {
  pokemonId: number
  reason: string
  evidenceLabel?: string
}

export type CaseTheme =
  | {
      kind: 'stolen-item'
      name: string
      image: string
      alt: string
    }
  | {
      kind: 'missing-pokemon'
      pokemonId: number
      name: string
      image: string
      alt: string
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
  theme?: CaseTheme
  difficulty: CaseDifficulty
  culpritPokemonId: number
  typeClueSlot?: 'primary' | 'secondary'
  typeClueSlots?: Record<string, 'primary' | 'secondary'>
  typeClueGroups?: Record<string, PokemonType[]>
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
  const evidenceById = new Map((caseData.evidence ?? []).map((evidence) => [evidence.id, evidence]))
  for (const location of caseData.locations ?? []) {
    if (
      location.investigated &&
      location.selectedActionId &&
      location.evidenceId &&
      !seenEvidenceIds.has(location.evidenceId)
    ) {
      seenEvidenceIds.add(location.evidenceId)
      const action = location.actions.find((a) => a.id === location.selectedActionId)
      const evidenceItem = evidenceById.get(location.evidenceId)
      discovered.push({
        id: location.evidenceId,
        title: action?.evidenceTitle ?? location.evidenceTitle ?? 'Unknown',
        clueText: action?.evidenceText ?? location.evidenceText ?? '',
        badges: action?.evidenceBadges ?? location.evidenceBadges,
        rule: action?.clueRule ?? { axis: 'scene', precision: 'none', matchingValues: [] },
        observation: evidenceItem?.observation,
      })
    }
  }
  return discovered
}
