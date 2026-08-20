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

export type ClueAxis = 'height' | 'weight' | 'type' | 'groundTrace' | 'force' | 'witness' | 'highestStat' | 'lowestStat' | 'typeAffectedness' | 'region' | 'evolutionChain' | 'scene'

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
  hintType?: string
  evidenceId?: string
}

export type EvidenceEvaluationResult = 'match' | 'possible' | 'conflict' | 'unknown'

export interface EvidenceObservation {
  title: string
  observation: string
  interpretation: string
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
      kind: 'stolen-item' | 'damaged-item' | 'misplaced-item'
      name: string
      image: string
      alt: string
    }
  | {
      kind: 'missing-pokemon' | 'frightened-pokemon' | 'trapped-pokemon'
      pokemonId: number
      name: string
      image: string
      alt: string
    }

export interface CaseSolution {
  culpritRevealText: string
  detectiveConclusion: string
  clueBadges?: EvidenceBadgeData[]
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

export interface ClueBadgeGroup {
  evidenceId?: string
  hintType: string
  badges: EvidenceBadgeData[]
}

export const removeTypeSlotWording = (text: string): string => (
  text
    .replace(/\bprimary profile\b/gi, 'type profile')
    .replace(/\bsecondary profile\b/gi, 'type profile')
    .replace(/\bprimary typing\b/gi, 'type profile')
    .replace(/\bsecondary typing\b/gi, 'type profile')
)

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
        title: removeTypeSlotWording(action?.evidenceTitle ?? location.evidenceTitle ?? 'Unknown'),
        clueText: removeTypeSlotWording(action?.evidenceText ?? location.evidenceText ?? ''),
        badges: action?.evidenceBadges ?? location.evidenceBadges,
        rule: action?.clueRule ?? { axis: 'scene', precision: 'none', matchingValues: [] },
        observation: evidenceItem?.observation,
      })
    }
  }
  return discovered
}

const getBadgeKey = (badge: EvidenceBadgeData): string => `${badge.evidenceId ?? inferClueHintType(badge)}:${badge.type ?? ''}:${badge.text}`

export const getClueHintType = (axis: ClueAxis): string | undefined => {
  switch (axis) {
    case 'height':
      return 'Height estimate'
    case 'weight':
      return 'Track estimate'
    case 'type':
      return 'Residue points to'
    case 'groundTrace':
      return 'Trace points to'
    case 'force':
      return 'Entry marks point to'
    case 'witness':
      return 'Witness account points to'
    case 'highestStat':
      return 'Stat clue'
    case 'lowestStat':
      return 'Weakness clue'
    case 'typeAffectedness':
      return 'Reaction points to'
    case 'region':
      return 'Region clue'
    case 'evolutionChain':
      return 'Evolution clue'
    case 'scene':
      return undefined
  }
}

export const getSolutionClueHintType = (axis: ClueAxis): string | undefined => {
  switch (axis) {
    case 'height':
      return 'Height'
    case 'weight':
      return 'Tracks'
    case 'type':
      return 'Residue'
    case 'groundTrace':
      return 'Trace'
    case 'force':
      return 'Entry marks'
    case 'witness':
      return 'Witness'
    case 'highestStat':
      return 'Stat'
    case 'lowestStat':
      return 'Stat'
    case 'typeAffectedness':
      return 'Reaction'
    case 'region':
      return 'Region'
    case 'evolutionChain':
      return 'Evolution'
    case 'scene':
      return undefined
  }
}

const getSolutionClueHintTypeFromEvidenceId = (evidenceId: string | undefined): string | undefined => {
  switch (evidenceId) {
    case 'height-clue':
      return 'Height'
    case 'weight-clue':
      return 'Tracks'
    case 'type-residue-clue':
      return 'Residue'
    case 'ground-trace-clue':
      return 'Trace'
    case 'force-clue':
      return 'Entry marks'
    case 'witness-clue':
      return 'Witness'
    case 'highest-stat-clue':
      return 'Stat'
    case 'lowest-stat-clue':
      return 'Stat'
    case 'type-affectedness-clue':
      return 'Reaction'
    case 'region-clue':
      return 'Region'
    case 'evolution-chain-clue':
      return 'Evolution'
    default:
      return undefined
  }
}

const normalizeSolutionHintType = (hintType: string): string => {
  switch (hintType) {
    case 'Height estimate':
    case 'Height clue':
      return 'Height'
    case 'Track estimate':
    case 'Track clue':
      return 'Tracks'
    case 'Residue points to':
    case 'Residue clue':
    case 'Type residue clue':
    case 'Type clue':
      return 'Residue'
    case 'Trace points to':
    case 'Trace clue':
    case 'Type trace clue':
      return 'Trace'
    case 'Entry marks point to':
    case 'Entry mark clue':
    case 'Entry clue':
    case 'Type entry clue':
      return 'Entry marks'
    case 'Witness account points to':
    case 'Witness clue':
    case 'Type noticed clue':
      return 'Witness'
    case 'Strength clue':
    case 'Stat clue':
      return 'Stat'
    case 'Limitation clue':
    case 'Weakness clue':
      return 'Stat'
    case 'Reaction points to':
    case 'Reaction clue':
      return 'Reaction'
    case 'Region clue':
      return 'Region'
    case 'Evolution clue':
      return 'Evolution'
    default:
      return hintType
  }
}

const inferClueHintType = (badge: EvidenceBadgeData): string => {
  const evidenceHintType = getSolutionClueHintTypeFromEvidenceId(badge.evidenceId)
  if (evidenceHintType) return evidenceHintType
  if (badge.hintType) return normalizeSolutionHintType(badge.hintType)
  if (badge.text.startsWith('Height:')) return 'Height'
  if (badge.text.startsWith('Weight:')) return 'Tracks'
  if (badge.text.startsWith('Strength:')) return 'Stat'
  if (badge.text.startsWith('Weakness:')) return 'Stat'
  if (badge.text.startsWith('Weak to') || badge.text.startsWith('Strong to')) return 'Reaction'
  if (badge.text.startsWith('Region:')) return 'Region'
  if (badge.text.startsWith('Evolution:')) return 'Evolution'
  return badge.type ? 'Residue' : 'Solution'
}

export function getSolutionClueBadges(solution?: CaseSolution | null): EvidenceBadgeData[] {
  const badges = solution?.clueBadges?.length
    ? solution.clueBadges
    : solution?.evidenceExplanation.flatMap((item) => item.badges ?? []) ?? []
  const seen = new Set<string>()

  return badges.filter((badge) => {
    const key = getBadgeKey(badge)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getSolutionClueBadgesFromEvidence(evidence: Evidence[]): EvidenceBadgeData[] {
  const seen = new Set<string>()
  const badges = evidence.flatMap((item) => {
    const hintType = getSolutionClueHintType(item.rule.axis)
    return item.badges?.map((badge) => ({ ...badge, hintType, evidenceId: item.id })) ?? []
  })

  return badges.filter((badge) => {
    const key = getBadgeKey(badge)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getClueBadgeGroupsFromBadges(badges: EvidenceBadgeData[]): ClueBadgeGroup[] {
  const groups = new Map<string, ClueBadgeGroup>()

  for (const badge of badges) {
    const hintType = inferClueHintType(badge)
    const key = badge.evidenceId ?? hintType
    const group = groups.get(key) ?? { evidenceId: badge.evidenceId, hintType, badges: [] }
    groups.set(key, { ...group, badges: [...group.badges, badge] })
  }

  return [...groups.values()]
}

export function getSolutionClueBadgeGroups(solution?: CaseSolution | null): ClueBadgeGroup[] {
  return getClueBadgeGroupsFromBadges(getSolutionClueBadges(solution))
}
