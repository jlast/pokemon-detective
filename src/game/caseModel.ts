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

export type ClueAxis = 'height' | 'weight' | 'type' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat' | 'scene'

export type CluePrecision = 'exact' | 'grouped' | 'none'

export interface ClueRule {
  axis: ClueAxis
  precision: CluePrecision
  matchingValues: string[]
}

export interface CluePreview {
  label: string
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
  evidenceBadgeText?: string | null
  evidenceBadgeType?: string | null
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
  evidenceBadgeText?: string
  evidenceBadgeType?: string
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
  badgeText?: string
  badgeType?: string
  rule: ClueRule
}

export interface CaseEvidenceExplanation {
  locationId: string
  evidenceTitle: string
  clueText: string
  badgeText?: string
  badgeType?: string
  deductionText: string
}

export interface ClearedSuspectExplanation {
  pokemonId: number
  reason: string
  evidenceLabel?: string
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
        badgeText: action?.evidenceBadgeText ?? location.evidenceBadgeText,
        badgeType: action?.evidenceBadgeType ?? location.evidenceBadgeType,
        rule: action?.clueRule ?? { axis: 'scene', precision: 'none', matchingValues: [] },
      })
    }
  }
  return discovered
}
