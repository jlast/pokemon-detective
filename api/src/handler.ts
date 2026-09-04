import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { allCases, createCaseById, rebuildFullCase } from '../../src/game/cases/index'
import { getCaseThemeTitle } from '../../src/game/caseTheme'
import { getSolutionClueBadgesFromEvidence, getSolutionClueHintType, type Case, type CaseDifficulty, type CaseSolution, type CaseStatus, type EvidenceBadgeData, type LocationCardVariant, type LocationAction } from '../../src/game/caseModel'
import { getShinySpriteUrl, pokemonData, type PokemonType } from '../../src/data/pokemon'
import { getPokemonById } from '../../src/game/suspectCaseFile'
import { batchGetCaseData, getCaseData, getCaseStats, putCaseData, recordCaseCompletion, type CaseDataRecord, type CaseStats } from './caseDataDb'
import { publishFeedbackCommentAlert, publishGeneralFeedbackAlert } from './feedbackAlert'
import { putCaseFeedback, putGeneralFeedback } from './feedbackDb'
import { getReminderSubscription, listReminderSubscriptions, putReminderSubscription } from './reminderSubscriptionDb'
import { validateGeneratedCase } from './validateGeneratedCase'
import {
  getProgress,
  batchGetProgress,
  createProgress,
  queryProgressByCaseId,
  updateProgress,
  type PlayerProgressRecord,
  type InvestigatedLocationRecord,
} from './playerDb'
import { getPokedexRecord, putPokedexRecord, type PokedexRecord } from './pokedexDb'

const USER_POOL_ID = process.env.USER_POOL_ID ?? ''
const REGION = process.env.REGION ?? 'us-east-1'
const REMINDER_EMAIL_FROM = process.env.REMINDER_EMAIL_FROM ?? ''
const REMINDER_EMAIL_FROM_NAME = 'PokeMystery'

const jwksUrl = new URL(
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
)
const jwks = createRemoteJWKSet(jwksUrl)
const cognito = new CognitoIdentityProviderClient({ region: REGION })
const ses = new SESv2Client({ region: REGION })

const SESSION_TTL_DAYS = 7
const CASE_DATA_TTL_DAYS = 366
const MAX_ACCUSATIONS = 3
const DEFAULT_INVESTIGATIONS = 6
const SHINY_ODDS = 0.01
const WITNESS_OPTION_COUNT = 1
const LOCATION_CARD_VARIANTS: LocationCardVariant[] = ['detective-note', 'clipboard', 'map-fragment']
const FEEDBACK_COMMENT_MAX_LENGTH = 1000
const GENERAL_FEEDBACK_MESSAGE_MAX_LENGTH = 2000
const GENERAL_FEEDBACK_CONTACT_MAX_LENGTH = 250
const GENERAL_FEEDBACK_CONTEXT_MAX_LENGTH = 500
const ADMIN_MAILING_TITLE_MAX_LENGTH = 160
const ADMIN_MAILING_BODY_MAX_LENGTH = 10000
const HISTORY_ARCHIVE_DAYS = 30

interface ApiGatewayEvent {
  path: string
  httpMethod: string
  headers?: Record<string, string>
  body?: string | null
  requestContext: {
    httpMethod: string
  }
}

interface ApiGatewayResult {
  statusCode: number
  headers: Record<string, string>
  body: string
}

type LegacyLocationActionBadges = {
  evidenceBadgeText?: string
  evidenceBadgeTexts?: string[]
  evidenceBadgeType?: string
  evidenceBadgeTypes?: string[]
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Player-Session-Id',
}

const ok = (body: unknown): ApiGatewayResult => ({
  statusCode: 200,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

const err = (statusCode: number, message: string): ApiGatewayResult => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: message }),
})

interface UserInfo {
  sub: string
  email?: string
  name?: string
  picture?: string
  groups?: string[]
}

interface AdminProgressInvestigation {
  locationId: string
  locationName: string
  actionId: string
  actionLabel: string
  outcomeType: string
  observationText: string
  evidenceId?: string
  evidenceTitle?: string
  evidenceText?: string
  evidenceBadges?: EvidenceBadgeData[]
  witnessPokemonId?: number
  witnessPokemonName?: string
}

interface AdminProgressAccusation {
  pokemonId: number
  pokemonName: string
  correct: boolean
}

interface AdminProgressPlayer {
  userId: string
  email?: string
  lastActivityAt: string | null
  playerKind: 'authenticated' | 'anonymous'
  status: 'playing' | 'solved' | 'failed'
  succeeded: boolean
  failed: boolean
  investigationsRemaining: number
  investigationsUsed: number
  accusationsRemaining: number
  accusationHistory: AdminProgressAccusation[]
  investigatedLocations: AdminProgressInvestigation[]
}

interface CaseStatsResponse extends CaseStats {
  solveRate: number | null
  averageGuesses: number | null
}

interface CaseHistoryItem {
  caseId: string
  status: 'playing' | 'solved' | 'failed'
  caseTitle: string
  difficulty?: CaseDifficulty
  culpritPokemonId?: number
  culpritPokemonName?: string
  guessCount?: number
  startedAt?: string
  completedAt?: string
}

const DAILY_CASE_ID_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:-(easy|hard))?$/
const DAILY_DIFFICULTIES = ['easy', 'hard'] as const

const getCaseDate = (caseId: string): string => caseId.slice(0, 10)

const getCaseIdDifficulty = (caseId: string): CaseDifficulty | undefined => {
  const difficulty = DAILY_CASE_ID_PATTERN.exec(caseId)?.[2]
  return difficulty === 'easy' || difficulty === 'hard' ? difficulty : undefined
}

const getDailyCaseId = (date: string, difficulty: typeof DAILY_DIFFICULTIES[number]): string => `${date}-${difficulty}`

const getDefaultTodayCaseId = (): string => getDailyCaseId(getTodayUtc(), 'easy')

const getDailyCaseSortRank = (caseId: string): number => {
  const difficulty = getCaseIdDifficulty(caseId)
  if (difficulty === 'easy') return 0
  if (difficulty === 'hard') return 1
  return 2
}

const hasSolvedCaseOnDate = (outcomes: Record<string, 'solved' | 'failed'>, date: string): boolean => (
  outcomes[date] === 'solved' || DAILY_DIFFICULTIES.some((difficulty) => outcomes[getDailyCaseId(date, difficulty)] === 'solved')
)

const calculateSolvedStreak = (outcomes: Record<string, 'solved' | 'failed'>): number => {
  const current = new Date(`${getTodayUtc()}T00:00:00.000Z`)
  let streak = 0

  while (hasSolvedCaseOnDate(outcomes, current.toISOString().slice(0, 10))) {
    streak += 1
    current.setUTCDate(current.getUTCDate() - 1)
  }

  return streak
}

const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null
  return parts[1]
}

const getUserInfo = async (event: ApiGatewayEvent): Promise<UserInfo> => {
  const token = extractToken(event.headers?.Authorization ?? event.headers?.authorization)
  if (!token) return { sub: '' }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    })
    return {
      sub: (payload.sub as string) ?? '',
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
      groups: Array.isArray(payload['cognito:groups'])
        ? payload['cognito:groups'].filter((group): group is string => typeof group === 'string')
        : [],
    }
  } catch {
    return { sub: '' }
  }
}

const getDateUserId = (sub: string, caseId: string): string => `${sub}:${caseId}`

const stripDateFromUserId = (userId: string): string => userId.replace(/:\d{4}-\d{2}-\d{2}(?:-(?:easy|hard))?$/, '')

const getHeader = (event: ApiGatewayEvent, name: string): string | undefined => {
  const lowerName = name.toLowerCase()
  const match = Object.entries(event.headers ?? {}).find(([key]) => key.toLowerCase() === lowerName)
  return match?.[1]
}

const getGameplaySub = (event: ApiGatewayEvent, userInfo: UserInfo): string => {
  if (userInfo.sub) return userInfo.sub

  const playerSessionId = getHeader(event, 'X-Player-Session-Id')?.trim()
  if (!playerSessionId || !/^[a-zA-Z0-9._~-]{16,128}$/.test(playerSessionId)) return ''

  return `anonymous:${playerSessionId}`
}

const buildCaseStatsResponse = (stats: CaseStats): CaseStatsResponse => ({
  ...stats,
  solveRate: stats.completedCount > 0 ? stats.solvedCount / stats.completedCount : null,
  averageGuesses: stats.completedCount > 0 ? stats.totalGuessCount / stats.completedCount : null,
})

const isAdmin = (userInfo: UserInfo): boolean => userInfo.groups?.includes('admins') ?? false

const requireAdmin = async (event: ApiGatewayEvent): Promise<{ userInfo: UserInfo } | ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')
  if (!isAdmin(userInfo)) return err(403, 'Admin access required')
  return { userInfo }
}

const isApiResult = (value: { userInfo: UserInfo } | ApiGatewayResult): value is ApiGatewayResult => (
  'statusCode' in value
)

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

const createLocationCardVariantMap = (locations: Case['locations']): Record<string, LocationCardVariant> => {
  const pool = shuffle(LOCATION_CARD_VARIANTS.flatMap((variant) => [variant, variant]))
  return locations.reduce<Record<string, LocationCardVariant>>((variantMap, location, index) => {
    variantMap[location.id] = pool[index % pool.length]
    return variantMap
  }, {})
}

const createLocationCardTiltMap = (locations: Case['locations']): Record<string, number> => (
  locations.reduce<Record<string, number>>((tiltMap, location) => {
    tiltMap[location.id] = Number((Math.random() * 4 - 2).toFixed(1))
    return tiltMap
  }, {})
)

const hasCompleteLocationCardVariantMap = (
  locations: Case['locations'],
  variantMap: Record<string, string> | undefined,
): variantMap is Record<string, LocationCardVariant> => (
  !!variantMap && locations.every((location) => LOCATION_CARD_VARIANTS.includes(variantMap[location.id] as LocationCardVariant))
)

const hasCompleteLocationCardTiltMap = (
  locations: Case['locations'],
  tiltMap: Record<string, number> | undefined,
): tiltMap is Record<string, number> => (
  !!tiltMap && locations.every((location) => typeof tiltMap[location.id] === 'number')
)

const applyLocationCardVariants = (
  fullCase: Case,
  variantMap: Record<string, LocationCardVariant>,
  tiltMap: Record<string, number>,
): Case => ({
  ...fullCase,
  locations: fullCase.locations.map((location) => ({
    ...location,
    cardVariant: variantMap[location.id],
    cardTiltDegrees: tiltMap[location.id],
  })),
})

const getWitnessActionIds = (fullCase: Case): string[] => (
  fullCase.locations.flatMap((location) => (
    location.actions
      .filter((action) => action.outcomeType === 'witness')
      .map((action) => action.id)
  ))
)

const normalizeCaseSolution = (fullCase: Case): CaseSolution | undefined => {
  if (!fullCase.solution) return undefined

  return {
    ...fullCase.solution,
    clueBadges: getSolutionClueBadgesFromEvidence(fullCase.evidence),
  }
}

const areSolutionsEqual = (left: CaseSolution | undefined, right: CaseSolution | undefined): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
)

const flattenWitnessPokemonIdMap = (witnessPokemonIdMap: Record<string, number[]>): number[] => (
  Object.values(witnessPokemonIdMap).flat()
)

const assignWitnessPokemonToActions = (fullCase: Case, witnessPokemonIdMap: Record<string, number[]>): Case => {
  const witnessPokemonIds = flattenWitnessPokemonIdMap(witnessPokemonIdMap)

  return {
    ...fullCase,
    witnessPokemonIds,
    locations: fullCase.locations.map((location) => ({
      ...location,
      actions: location.actions.map((action) => {
        if (action.outcomeType !== 'witness') return action
        return { ...action, witnessPokemonIds: witnessPokemonIdMap[action.id] ?? [] }
      }),
    })),
  }
}

const countWitnessActions = (fullCase: Case): number => (
  fullCase.locations.reduce(
    (total, location) => total + location.actions.filter((action) => action.outcomeType === 'witness').length,
    0,
  )
)

const hasCompleteWitnessPokemonIds = (
  witnessPokemonIds: number[] | undefined,
  requiredCount: number,
  suspectPokemonIds: number[],
): witnessPokemonIds is number[] => {
  if (!witnessPokemonIds || witnessPokemonIds.length !== requiredCount) return false
  const suspectIds = new Set(suspectPokemonIds)
  const witnessNames = new Set<string>()

  for (const witnessPokemonId of witnessPokemonIds) {
    if (suspectIds.has(witnessPokemonId)) return false
    const pokemon = pokemonData.find((candidate) => candidate.id === witnessPokemonId)
    if (!pokemon || witnessNames.has(pokemon.name)) return false
    witnessNames.add(pokemon.name)
  }

  return true
}

const hasCompleteWitnessPokemonIdMap = (
  witnessPokemonIdMap: Record<string, number[]> | undefined,
  witnessActionIds: string[],
  suspectPokemonIds: number[],
): witnessPokemonIdMap is Record<string, number[]> => {
  if (!witnessPokemonIdMap) return false
  const witnessPokemonIds = witnessActionIds.flatMap((actionId) => witnessPokemonIdMap[actionId] ?? [])

  return witnessActionIds.every((actionId) => witnessPokemonIdMap[actionId]?.length === WITNESS_OPTION_COUNT)
    && Object.keys(witnessPokemonIdMap).every((actionId) => witnessActionIds.includes(actionId))
    && hasCompleteWitnessPokemonIds(witnessPokemonIds, witnessActionIds.length * WITNESS_OPTION_COUNT, suspectPokemonIds)
}

const createWitnessPokemonIdMap = (fullCase: Case, witnessPokemonIds: number[]): Record<string, number[]> => {
  const witnessActionIds = getWitnessActionIds(fullCase)
  return Object.fromEntries(witnessActionIds.map((actionId, index) => [
    actionId,
    witnessPokemonIds.slice(index * WITNESS_OPTION_COUNT, (index + 1) * WITNESS_OPTION_COUNT),
  ]))
}

const getTodayUtc = (): string => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

const getPastCaseIds = (days: number): string[] => {
  const current = new Date(`${getTodayUtc()}T00:00:00.000Z`)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(current)
    date.setUTCDate(current.getUTCDate() - index - 1)
    const caseDate = date.toISOString().slice(0, 10)
    return [getDailyCaseId(caseDate, 'easy'), getDailyCaseId(caseDate, 'hard'), caseDate]
  }).flat()
}

const getPastCaseDates = (days: number): string[] => {
  const current = new Date(`${getTodayUtc()}T00:00:00.000Z`)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(current)
    date.setUTCDate(current.getUTCDate() - index - 1)
    return date.toISOString().slice(0, 10)
  })
}

const stripActionOutcome = (action: LocationAction & LegacyLocationActionBadges): LocationAction => {
  const {
    observationText: _observationText,
    observationTextSmall: _observationTextSmall,
    observationTextMedium: _observationTextMedium,
    observationTextLarge: _observationTextLarge,
    evidenceId: _evidenceId,
    evidenceTitle: _evidenceTitle,
    evidenceText: _evidenceText,
    evidenceBadges: _evidenceBadges,
    evidenceBadgeText: _evidenceBadgeText,
    evidenceBadgeTexts: _evidenceBadgeTexts,
    evidenceBadgeType: _evidenceBadgeType,
    evidenceBadgeTypes: _evidenceBadgeTypes,
    implicationText: _implicationText,
    clueRule,
    ...rest
  } = action
  return {
    ...rest,
    ...(clueRule ? { clueRule: { ...clueRule, matchingValues: [] } } : {}),
  } as LocationAction
}

const getProgressTtl = (): number => Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400
const getCaseDataTtl = (): number => Math.floor(Date.now() / 1000) + CASE_DATA_TTL_DAYS * 86400

const getActivityTimestamp = (): string => new Date().toISOString()

const getProgressActivityTimestamp = (progress: PlayerProgressRecord): string | null => {
  if (progress.lastActivityAt) return progress.lastActivityAt
  if (typeof progress.ttl !== 'number') return null

  return new Date((progress.ttl - SESSION_TTL_DAYS * 86400) * 1000).toISOString()
}

const getPlayerMetadataUpdates = (
  userInfo: UserInfo,
  lastActivityAt: string,
): Partial<Pick<PlayerProgressRecord, 'email' | 'lastActivityAt'>> => ({
  ...(userInfo.email ? { email: userInfo.email } : {}),
  lastActivityAt,
})

const mergeUniqueIds = (current: number[], next: number[]): number[] => (
  [...new Set([...current, ...next])].sort((a, b) => a - b)
)

const createWitnessPokemonIds = (suspectPokemonIds: number[], count = WITNESS_OPTION_COUNT): number[] => {
  const suspectIds = new Set(suspectPokemonIds)
  const seenNames = new Set<string>()
  return shuffle(pokemonData.filter((pokemon) => !suspectIds.has(pokemon.id)))
    .filter((pokemon) => {
      if (seenNames.has(pokemon.name)) return false
      seenNames.add(pokemon.name)
      return true
    })
    .map((pokemon) => pokemon.id)
    .slice(0, count)
}

const getOrCreatePokedex = async (sub: string): Promise<PokedexRecord> => {
  const userId = sub
  return await getPokedexRecord(userId) ?? {
    userId,
    seenPokemonIds: [],
    unlockedPokemonIds: [],
    seenShinyPokemonIds: [],
    unlockedShinyPokemonIds: [],
    caseOutcomes: {},
    caseHistory: {},
    currentStreak: 0,
  }
}

const getPokedexStreak = (pokedex: PokedexRecord): number => (
  calculateSolvedStreak(pokedex.caseOutcomes ?? {})
)

const updatePokedexForCompletedCase = async (
  sub: string,
  caseId: string,
  fullCase: Case,
  progress: PlayerProgressRecord,
  status: 'solved' | 'failed',
  guessCount: number,
): Promise<PokedexRecord> => {
  const suspectPokemonIds = fullCase.suspects.map((suspect) => suspect.pokemonId)
  const witnessPokemonIds = progress.interviewedWitnessPokemonIds ?? []
  const shinyPokemonIds = fullCase.suspects
    .filter((suspect) => progress.suspectShinyMap?.[String(suspect.pokemonId)] === true)
    .map((suspect) => suspect.pokemonId)
  const pokedex = await getOrCreatePokedex(sub)
  const seenPokemonIds = mergeUniqueIds(pokedex.seenPokemonIds ?? [], [...suspectPokemonIds, ...witnessPokemonIds])
  const unlockedPokemonIds = status === 'solved'
    ? mergeUniqueIds(pokedex.unlockedPokemonIds ?? [], [...suspectPokemonIds, ...witnessPokemonIds])
    : pokedex.unlockedPokemonIds ?? []
  const seenShinyPokemonIds = mergeUniqueIds(pokedex.seenShinyPokemonIds ?? [], shinyPokemonIds)
  const unlockedShinyPokemonIds = status === 'solved'
    ? mergeUniqueIds(pokedex.unlockedShinyPokemonIds ?? [], shinyPokemonIds)
    : pokedex.unlockedShinyPokemonIds ?? []
  const caseOutcomes = { ...pokedex.caseOutcomes, [caseId]: status }
  const existingHistory = pokedex.caseHistory?.[caseId]
  const caseHistory = {
    ...pokedex.caseHistory,
    [caseId]: {
      status,
      caseTitle: fullCase.title,
      difficulty: fullCase.difficulty,
      culpritPokemonId: fullCase.culpritPokemonId,
      guessCount,
      startedAt: existingHistory?.startedAt,
      completedAt: new Date().toISOString(),
    },
  }
  const currentStreak = calculateSolvedStreak(caseOutcomes)

  const nextPokedex = {
    userId: pokedex.userId,
    seenPokemonIds,
    unlockedPokemonIds,
    seenShinyPokemonIds,
    unlockedShinyPokemonIds,
    caseOutcomes,
    caseHistory,
    currentStreak,
  }

  await putPokedexRecord(nextPokedex)
  return nextPokedex
}

const markPokedexSeen = async (sub: string, pokemonIds: number[]): Promise<void> => {
  if (pokemonIds.length === 0) return
  const pokedex = await getOrCreatePokedex(sub)
  await putPokedexRecord({
    userId: pokedex.userId,
    seenPokemonIds: mergeUniqueIds(pokedex.seenPokemonIds ?? [], pokemonIds),
    unlockedPokemonIds: pokedex.unlockedPokemonIds ?? [],
    seenShinyPokemonIds: pokedex.seenShinyPokemonIds ?? [],
    unlockedShinyPokemonIds: pokedex.unlockedShinyPokemonIds ?? [],
    caseOutcomes: pokedex.caseOutcomes ?? {},
    caseHistory: pokedex.caseHistory ?? {},
    currentStreak: getPokedexStreak(pokedex),
  })
}

const markCaseHistoryStarted = async (sub: string, caseId: string, fullCase: Case): Promise<void> => {
  const pokedex = await getOrCreatePokedex(sub)
  if (pokedex.caseHistory?.[caseId]) return

  await putPokedexRecord({
    userId: pokedex.userId,
    seenPokemonIds: pokedex.seenPokemonIds ?? [],
    unlockedPokemonIds: pokedex.unlockedPokemonIds ?? [],
    seenShinyPokemonIds: pokedex.seenShinyPokemonIds ?? [],
    unlockedShinyPokemonIds: pokedex.unlockedShinyPokemonIds ?? [],
    caseOutcomes: pokedex.caseOutcomes ?? {},
    caseHistory: {
      ...pokedex.caseHistory,
      [caseId]: {
        status: 'playing',
        caseTitle: fullCase.title,
        difficulty: fullCase.difficulty,
        culpritPokemonId: fullCase.culpritPokemonId,
        startedAt: new Date().toISOString(),
      },
    },
    currentStreak: getPokedexStreak(pokedex),
  })
}

const compactSuspectShinyMap = (suspectShinyMap: Record<string, boolean>): Record<string, boolean> => Object.fromEntries(
  Object.entries(suspectShinyMap).filter(([, isShiny]) => isShiny),
)

const createSuspectShinyMap = (fullCase: Case): Record<string, boolean> => {
  const suspectShinyMap: Record<string, boolean> = {}
  for (const suspect of fullCase.suspects) {
    if (Math.random() < SHINY_ODDS) {
      suspectShinyMap[String(suspect.pokemonId)] = true
    }
  }
  return suspectShinyMap
}

const resolveEvidenceTitle = (record: InvestigatedLocationRecord, action: LocationAction | undefined): string | undefined => (
  action?.evidenceTitle ?? record.evidenceTitle ?? undefined
)

const resolveEvidenceText = (record: InvestigatedLocationRecord, action: LocationAction | undefined): string | undefined => (
  action?.evidenceText ?? record.evidenceText
)

const resolveEvidenceBadges = (record: InvestigatedLocationRecord, action: LocationAction | undefined) => {
  if (action?.evidenceBadges?.length) return action.evidenceBadges
  if (record.evidenceBadges?.length) return record.evidenceBadges
  if (record.evidenceBadgeTexts?.length) {
    return record.evidenceBadgeTexts.map((text, index) => ({ text, type: record.evidenceBadgeTypes?.[index] }))
  }
  if (record.evidenceBadgeText) return [{ text: record.evidenceBadgeText, type: record.evidenceBadgeType }]
  return undefined
}

const hasSuspectShinyMap = (progress: PlayerProgressRecord): boolean => progress.suspectShinyMap !== undefined

const createCaseProgress = (
  userId: string,
  caseId: string,
  fullCase: Case,
  investigationsRemaining = fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS,
  metadata: Partial<Pick<PlayerProgressRecord, 'email' | 'lastActivityAt'>> = {},
): PlayerProgressRecord => ({
  userId,
  caseId,
  ...metadata,
  status: 'playing',
  investigationsRemaining,
  accusationsRemaining: MAX_ACCUSATIONS,
  accusationHistory: [],
  investigatedLocations: [],
  clearedSuspectIds: [],
  interviewedWitnessPokemonIds: [],
  suspectShinyMap: createSuspectShinyMap(fullCase),
  ttl: getProgressTtl(),
})

const ensureProgressDefaults = async (
  userId: string,
  progress: PlayerProgressRecord,
  fullCase: Case,
): Promise<PlayerProgressRecord> => {
  const updates: Partial<PlayerProgressRecord> = {}
  const next: PlayerProgressRecord = { ...progress }

  if (!next.status) {
    next.status = 'playing'
    updates.status = next.status
  }

  if (typeof next.investigationsRemaining !== 'number') {
    next.investigationsRemaining = fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS
    updates.investigationsRemaining = next.investigationsRemaining
  }

  if (typeof next.accusationsRemaining !== 'number') {
    next.accusationsRemaining = MAX_ACCUSATIONS
    updates.accusationsRemaining = next.accusationsRemaining
  }

  if (!Array.isArray(next.accusationHistory)) {
    next.accusationHistory = []
    updates.accusationHistory = next.accusationHistory
  }

  if (!Array.isArray(next.investigatedLocations)) {
    next.investigatedLocations = []
    updates.investigatedLocations = next.investigatedLocations
  }

  if (!Array.isArray(next.clearedSuspectIds)) {
    next.clearedSuspectIds = []
    updates.clearedSuspectIds = next.clearedSuspectIds
  }

  if (!Array.isArray(next.interviewedWitnessPokemonIds)) {
    next.interviewedWitnessPokemonIds = []
    updates.interviewedWitnessPokemonIds = next.interviewedWitnessPokemonIds
  }

  if (hasSuspectShinyMap(next)) {
    const suspectShinyMap = compactSuspectShinyMap(next.suspectShinyMap)
    if (Object.keys(suspectShinyMap).length !== Object.keys(next.suspectShinyMap).length) {
      next.suspectShinyMap = suspectShinyMap
      updates.suspectShinyMap = suspectShinyMap
    }

    if (Object.keys(updates).length > 0) {
      await updateProgress(userId, { ...updates, ttl: getProgressTtl() })
    }
    return next
  }

  const suspectShinyMap = createSuspectShinyMap(fullCase)
  next.suspectShinyMap = suspectShinyMap
  updates.suspectShinyMap = suspectShinyMap

  await updateProgress(userId, { ...updates, ttl: getProgressTtl() })

  return next
}

const applyPlayerShinyMap = (fullCase: Case, progress: PlayerProgressRecord): Case['suspects'] => (
  fullCase.suspects.map((suspect) => {
    const isShiny = progress.suspectShinyMap[String(suspect.pokemonId)] ?? false
    return {
      ...suspect,
      isShiny,
      sprite: isShiny ? getShinySpriteUrl(suspect.pokemonId) : getPokemonById(suspect.pokemonId).sprite,
    }
  })
)

const buildResponseCase = (fullCase: Case, progress: PlayerProgressRecord | null): Case => {
  const { evidence: _ev, culpritPokemonId: _cp, typeClueSlot: _typeClueSlot, typeClueSlots: _typeClueSlots, typeClueGroups: _typeClueGroups, ...caseWithoutEvidence } = fullCase
  if (!progress) {
    return {
      ...caseWithoutEvidence,
      solution: undefined,
      status: 'active' as CaseStatus,
      locations: fullCase.locations.map((l) => ({
        ...l,
        investigated: false,
        selectedActionId: null,
        actions: l.actions.map(stripActionOutcome),
      })),
      suspects: fullCase.suspects.map((s) => ({
        ...s,
        manuallyRuledOut: false,
        noteStatus: 'suspect' as const,
      })),
    } as Case
  }

  const investigatedMap = new Map(progress.investigatedLocations.map((r) => [r.locationId, r]))
  const accusedSet = new Set(progress.accusationHistory)
  const clearedSet = new Set(progress.clearedSuspectIds ?? [])
  const isOver = progress.status === 'solved' || progress.status === 'failed'

  return {
    ...caseWithoutEvidence,
    ...(isOver ? { culpritPokemonId: fullCase.culpritPokemonId } : {}),
    status: (progress.status === 'playing' ? 'active' : progress.status) as CaseStatus,
    solution: isOver ? fullCase.solution : undefined,
    locations: fullCase.locations.map((loc) => {
      if (investigatedMap.has(loc.id)) {
        const record = investigatedMap.get(loc.id)!
        const selectedAction = loc.actions.find((action) => action.id === record.actionId)
        return {
          ...loc,
          investigated: true,
          selectedActionId: record.actionId,
          observationText: record.observationText,
          evidenceTitle: resolveEvidenceTitle(record, selectedAction) ?? null,
          evidenceText: resolveEvidenceText(record, selectedAction) ?? null,
          evidenceBadges: resolveEvidenceBadges(record, selectedAction) ?? null,
          evidenceId: record.evidenceId ?? null,
          witnessPokemonId: record.witnessPokemonId,
        }
      }
      return {
        ...loc,
        investigated: false,
        selectedActionId: null,
        observationText: undefined,
        evidenceTitle: null,
        evidenceText: null,
        evidenceBadges: null,
        evidenceId: null,
        actions: loc.actions.map(stripActionOutcome),
      }
    }),
    suspects: applyPlayerShinyMap(fullCase, progress).map((s) => ({
      ...s,
      manuallyRuledOut: accusedSet.has(s.pokemonId) || clearedSet.has(s.pokemonId) || s.manuallyRuledOut,
      noteStatus: accusedSet.has(s.pokemonId) || clearedSet.has(s.pokemonId) ? 'ruled-out' as const : s.noteStatus,
    })),
  } as Case
}

const isCaseId = (caseId: string): boolean => DAILY_CASE_ID_PATTERN.test(caseId)

const typeEvidenceIds = ['type-residue-clue', 'ground-trace-clue', 'force-clue', 'witness-clue']

const getStoredTypeClueSlots = (record: Awaited<ReturnType<typeof getCaseData>>) => {
  if (!record) return undefined
  if (record.typeClueSlots) return record.typeClueSlots
  return undefined
}

const getStoredTypeClueGroups = (record: Awaited<ReturnType<typeof getCaseData>>): Record<string, PokemonType[]> | undefined => {
  if (!record) return undefined
  if (!record.typeClueSlots) return undefined
  if (record.typeClueGroups) return record.typeClueGroups
  if (record.typeClueGroup) return Object.fromEntries(typeEvidenceIds.map((evidenceId) => [evidenceId, record.typeClueGroup as PokemonType[]]))
  return undefined
}

const getStoredDifficulty = (record: Awaited<ReturnType<typeof getCaseData>>): CaseDifficulty | undefined => {
  if (!record) return undefined
  if (record.difficulty) return record.difficulty
  return record.suspectPokemonIds.length >= 9 ? 'hard' : 'easy'
}

const loadCase = async (caseId: string) => {
  const record = await getCaseData(caseId)
  if (!record) return null
  const storedTypeClueSlots = getStoredTypeClueSlots(record)
  const storedTypeClueGroups = getStoredTypeClueGroups(record)
  const storedDifficulty = getStoredDifficulty(record)
  let fullCase = rebuildFullCase(
    record.configId,
    record.culpritPokemonId,
    record.suspectPokemonIds,
    record.suspectShinyMap,
    record.actionEvidenceMap,
    record.solution,
    record.witnessPokemonIds,
    record.typeClueSlot ?? 'primary',
    storedTypeClueSlots,
    storedTypeClueGroups,
    record.theme,
    storedDifficulty,
  )
  const normalizedSolution = normalizeCaseSolution(fullCase)
  const solutionChanged = !areSolutionsEqual(record.solution, normalizedSolution)
  fullCase = {
    ...fullCase,
    solution: normalizedSolution,
  }
  const witnessActionIds = getWitnessActionIds(fullCase)
  const requiredWitnessPokemonCount = witnessActionIds.length * WITNESS_OPTION_COUNT
  const witnessPokemonIds = hasCompleteWitnessPokemonIds(record.witnessPokemonIds, requiredWitnessPokemonCount, record.suspectPokemonIds)
    ? record.witnessPokemonIds
    : createWitnessPokemonIds(record.suspectPokemonIds, requiredWitnessPokemonCount)
  const witnessPokemonIdMap = hasCompleteWitnessPokemonIdMap(record.witnessPokemonIdMap, witnessActionIds, record.suspectPokemonIds)
    ? record.witnessPokemonIdMap
    : createWitnessPokemonIdMap(fullCase, witnessPokemonIds)
  const locationCardVariantMap = hasCompleteLocationCardVariantMap(fullCase.locations, record.locationCardVariantMap)
    ? record.locationCardVariantMap
    : createLocationCardVariantMap(fullCase.locations)
  const locationCardTiltMap = hasCompleteLocationCardTiltMap(fullCase.locations, record.locationCardTiltMap)
    ? record.locationCardTiltMap
    : createLocationCardTiltMap(fullCase.locations)

  if (
    !hasCompleteWitnessPokemonIds(record.witnessPokemonIds, requiredWitnessPokemonCount, record.suspectPokemonIds)
    || !hasCompleteWitnessPokemonIdMap(record.witnessPokemonIdMap, witnessActionIds, record.suspectPokemonIds)
    || !hasCompleteLocationCardVariantMap(fullCase.locations, record.locationCardVariantMap)
    || !hasCompleteLocationCardTiltMap(fullCase.locations, record.locationCardTiltMap)
    || !record.typeClueSlots
    || !record.typeClueGroups
    || !record.theme
    || !record.difficulty
    || solutionChanged
  ) {
    await putCaseData({ ...record, difficulty: fullCase.difficulty, typeClueSlots: fullCase.typeClueSlots, typeClueGroups: fullCase.typeClueGroups, theme: fullCase.theme, solution: normalizedSolution ?? record.solution, witnessPokemonIds, witnessPokemonIdMap, locationCardVariantMap, locationCardTiltMap, ttl: getCaseDataTtl() })
  }

  return applyLocationCardVariants(assignWitnessPokemonToActions(fullCase, witnessPokemonIdMap), locationCardVariantMap, locationCardTiltMap)
}

const generateAndStoreCase = async (caseId: string) => {
  const config = allCases[Math.floor(Math.random() * allCases.length)]
  if (!config) return null
  const difficulty = getCaseIdDifficulty(caseId) ?? 'easy'
  const gameCase = createCaseById(config.id, difficulty)
  if (!gameCase) return null
  validateGeneratedCase(gameCase)

  const actionEvidenceMap: Record<string, string> = {}
  for (const location of gameCase.locations) {
    for (const action of location.actions) {
      if (action.evidenceId) {
        actionEvidenceMap[action.id] = action.evidenceId
      }
    }
  }

  const suspectShinyMap: Record<string, boolean> = {}
  for (const suspect of gameCase.suspects) {
    if (suspect.isShiny) {
      suspectShinyMap[String(suspect.pokemonId)] = true
    }
  }
  const suspectPokemonIds = gameCase.suspects.map((s) => s.pokemonId)
  const witnessPokemonIds = createWitnessPokemonIds(suspectPokemonIds, countWitnessActions(gameCase) * WITNESS_OPTION_COUNT)
  const witnessPokemonIdMap = createWitnessPokemonIdMap(gameCase, witnessPokemonIds)
  const locationCardVariantMap = createLocationCardVariantMap(gameCase.locations)
  const locationCardTiltMap = createLocationCardTiltMap(gameCase.locations)

  await putCaseData({
    caseId,
    configId: gameCase.id,
    difficulty: gameCase.difficulty,
    culpritPokemonId: gameCase.culpritPokemonId,
    typeClueSlots: gameCase.typeClueSlots,
    typeClueGroups: gameCase.typeClueGroups,
    suspectPokemonIds,
    suspectShinyMap,
    witnessPokemonIds,
    witnessPokemonIdMap,
    locationCardVariantMap,
    locationCardTiltMap,
    theme: gameCase.theme,
    actionEvidenceMap,
    solution: {
      culpritRevealText: gameCase.solution?.culpritRevealText ?? '',
      detectiveConclusion: gameCase.solution?.detectiveConclusion ?? '',
      clueBadges: gameCase.solution?.clueBadges ?? [],
      evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
      clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
    },
    ttl: getCaseDataTtl(),
  })

  return applyLocationCardVariants(assignWitnessPokemonToActions(gameCase, witnessPokemonIdMap), locationCardVariantMap, locationCardTiltMap)
}

const handleGetCase = async (event: ApiGatewayEvent, requestedCaseId = getDefaultTodayCaseId()): Promise<ApiGatewayResult> => {
  if (!isCaseId(requestedCaseId)) return err(400, 'Invalid case ID')

  const todayCaseId = getTodayUtc()
  const isToday = getCaseDate(requestedCaseId) === todayCaseId
  const caseId = requestedCaseId
  const record = await getCaseData(caseId)
  const caseStats = buildCaseStatsResponse(getCaseStats(record ?? null))

  let fullCase: Case | null = null

  if (record) {
    fullCase = await loadCase(caseId)
  }

  if (!fullCase && isToday && getCaseIdDifficulty(caseId)) {
    fullCase = await generateAndStoreCase(caseId)
  }

  if (!fullCase) return isToday ? err(500, 'Failed to build case') : err(404, 'Case not found')

  const userInfo = await getUserInfo(event)
  const caseStreak = userInfo.sub ? getPokedexStreak(await getOrCreatePokedex(userInfo.sub)) : 0
  const gameplaySub = getGameplaySub(event, userInfo)
  if (gameplaySub) {
    const userId = getDateUserId(gameplaySub, caseId)
    let progress = await getProgress(userId)
    if (!progress) {
      progress = createCaseProgress(userId, caseId, fullCase, undefined, getPlayerMetadataUpdates(userInfo, getActivityTimestamp()))
      await createProgress(progress)
    } else {
      progress = await ensureProgressDefaults(userId, progress, fullCase)
    }

    if (userInfo.sub) {
      try {
        await markCaseHistoryStarted(userInfo.sub, caseId, fullCase)
      } catch (error) {
        console.error('Failed to mark case history started:', error)
      }
    }

    return ok({
      case: buildResponseCase(fullCase, progress),
      investigationsRemaining: progress.investigationsRemaining,
      accusationsRemaining: progress.accusationsRemaining,
      accusationHistory: progress.accusationHistory,
      status: progress.status,
      caseStats,
      caseStreak,
    })
  }

  return ok({
    case: buildResponseCase(fullCase, null),
    investigationsRemaining: fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS,
    accusationsRemaining: MAX_ACCUSATIONS,
    accusationHistory: [],
    status: 'playing',
    caseStats,
    caseStreak,
  })
}

const getPokemonName = (pokemonId: number): string => (
  pokemonData.find((pokemon) => pokemon.id === pokemonId)?.name ?? `Pokemon #${pokemonId}`
)

const getCaseConfigTitle = (configId: string): string => (
  allCases.find((caseConfig) => caseConfig.id === configId)?.title ?? 'Daily puzzle'
)

const getCaseRecordTitle = (record: CaseDataRecord): string => {
  if (record.theme) return getCaseThemeTitle(record.theme)
  return getCaseConfigTitle(record.configId)
}

const resolveAdminEvidenceBadges = (
  record: InvestigatedLocationRecord,
  action: LocationAction | undefined,
): EvidenceBadgeData[] | undefined => {
  const badges = resolveEvidenceBadges(record, action) as EvidenceBadgeData[] | undefined
  if (!badges?.length) return undefined

  const hintType = action?.clueRule ? getSolutionClueHintType(action.clueRule.axis) : undefined
  return badges.map((badge) => ({
    ...badge,
    evidenceId: badge.evidenceId ?? record.evidenceId,
    hintType: badge.hintType ?? hintType,
  }))
}

const buildAdminProgressPlayer = (fullCase: Case, progress: PlayerProgressRecord): AdminProgressPlayer => {
  const investigationsUsed = (fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS) - progress.investigationsRemaining
  const investigatedLocations = progress.investigatedLocations.map((record) => {
    const location = fullCase.locations.find((location) => location.id === record.locationId)
    const action = location?.actions.find((action) => action.id === record.actionId)
    return {
      locationId: record.locationId,
      locationName: location?.name ?? record.locationId,
      actionId: record.actionId,
      actionLabel: action?.label ?? record.actionId,
      outcomeType: record.outcomeType,
      observationText: record.observationText,
      evidenceId: record.evidenceId,
      evidenceTitle: resolveEvidenceTitle(record, action),
      evidenceText: resolveEvidenceText(record, action),
      evidenceBadges: resolveAdminEvidenceBadges(record, action),
      witnessPokemonId: record.witnessPokemonId,
      witnessPokemonName: record.witnessPokemonId ? getPokemonName(record.witnessPokemonId) : undefined,
    }
  })
  const accusationHistory = progress.accusationHistory.map((pokemonId) => ({
    pokemonId,
    pokemonName: getPokemonName(pokemonId),
    correct: pokemonId === fullCase.culpritPokemonId,
  }))

  return {
    userId: progress.userId,
    email: progress.email,
    lastActivityAt: getProgressActivityTimestamp(progress),
    playerKind: progress.userId.startsWith('anonymous:') ? 'anonymous' : 'authenticated',
    status: progress.status,
    succeeded: progress.status === 'solved',
    failed: progress.status === 'failed',
    investigationsRemaining: progress.investigationsRemaining,
    investigationsUsed,
    accusationsRemaining: progress.accusationsRemaining,
    accusationHistory,
    investigatedLocations,
  }
}

const handleGetAdminSession = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const admin = await requireAdmin(event)
  if (isApiResult(admin)) return admin

  return ok({
    admin: true,
    profile: {
      sub: admin.userInfo.sub,
      email: admin.userInfo.email,
      name: admin.userInfo.name,
      picture: admin.userInfo.picture,
    },
  })
}

const handleGetAdminCaseProgress = async (
  caseId: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const admin = await requireAdmin(event)
  if (isApiResult(admin)) return admin

  if (!isCaseId(caseId)) return err(400, 'Invalid case ID')

  const buildCaseProgress = async (resolvedCaseId: string) => {
    const fullCase = await loadCase(resolvedCaseId)
    if (!fullCase) return null

    const progressRecords = await queryProgressByCaseId(resolvedCaseId)
    const players = progressRecords
      .filter((progress) => progress.status !== 'playing' || (progress.investigatedLocations?.length ?? 0) > 0)
      .sort((left, right) => {
        const rightActivity = getProgressActivityTimestamp(right) ?? ''
        const leftActivity = getProgressActivityTimestamp(left) ?? ''
        return rightActivity.localeCompare(leftActivity) || stripDateFromUserId(left.userId).localeCompare(stripDateFromUserId(right.userId))
      })
      .map((progress) => buildAdminProgressPlayer(fullCase, progress))

    return {
      caseId: resolvedCaseId,
      difficulty: fullCase.difficulty,
      caseTitle: fullCase.title,
      culpritPokemonId: fullCase.culpritPokemonId,
      culpritPokemonName: getPokemonName(fullCase.culpritPokemonId),
      players,
    }
  }

  const requestedDifficulty = getCaseIdDifficulty(caseId)
  const date = getCaseDate(caseId)
  const candidateCaseIds = requestedDifficulty
    ? [caseId]
    : [getDailyCaseId(date, 'easy'), getDailyCaseId(date, 'hard')]

  let cases = (await Promise.all(candidateCaseIds.map(buildCaseProgress)))
    .filter((caseProgress): caseProgress is NonNullable<typeof caseProgress> => caseProgress !== null)

  if (!requestedDifficulty && cases.length === 0) {
    const legacyCase = await buildCaseProgress(date)
    if (legacyCase) cases = [legacyCase]
  }

  if (cases.length === 0) return err(404, 'Case not found')

  return ok({
    date,
    cases,
  })
}

interface MailingRecipient {
  userId: string
  email: string
}

const getCognitoMailingRecipients = async (): Promise<MailingRecipient[]> => {
  const recipients: MailingRecipient[] = []
  let PaginationToken: string | undefined

  do {
    const result = await cognito.send(new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      PaginationToken,
    }))

    for (const user of result.Users ?? []) {
      const attributes = Object.fromEntries((user.Attributes ?? []).map((attribute) => [attribute.Name, attribute.Value]))
      const userId = attributes.sub
      const email = attributes.email
      if (!userId || !email) continue
      recipients.push({ userId, email })
    }

    PaginationToken = result.PaginationToken
  } while (PaginationToken)

  return recipients
}

const handleSendAdminMailing = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const admin = await requireAdmin(event)
  if (isApiResult(admin)) return admin

  if (!REMINDER_EMAIL_FROM) return err(500, 'Mail sender is not configured')

  let body: { title?: unknown; body?: unknown } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return err(400, 'Invalid JSON')
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const mailBody = typeof body.body === 'string' ? body.body.trim() : ''

  if (!title) return err(400, 'Title is required')
  if (!mailBody) return err(400, 'Body is required')
  if (title.length > ADMIN_MAILING_TITLE_MAX_LENGTH) return err(400, 'Title is too long')
  if (mailBody.length > ADMIN_MAILING_BODY_MAX_LENGTH) return err(400, 'Body is too long')

  const [cognitoRecipients, subscriptions] = await Promise.all([
    getCognitoMailingRecipients(),
    listReminderSubscriptions(),
  ])
  const subscriptionMap = new Map(subscriptions.map((subscription) => [subscription.userId, subscription]))
  const fromAddress = `${REMINDER_EMAIL_FROM_NAME} <${REMINDER_EMAIL_FROM}>`
  let sent = 0
  let skipped = 0
  let failed = 0
  const sentEmails: string[] = []
  const skippedEmails: string[] = []
  const failedEmails: string[] = []

  for (const recipient of cognitoRecipients) {
    const subscription = subscriptionMap.get(recipient.userId)
    if (subscription?.newsAndUpdatesEmails === false) {
      skipped += 1
      skippedEmails.push(recipient.email)
      continue
    }

    try {
      const sendResult = await ses.send(new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: { ToAddresses: [recipient.email] },
        Content: {
          Simple: {
            Subject: { Data: title },
            Body: {
              Text: { Data: mailBody },
            },
          },
        },
      }))
      sent += 1
      sentEmails.push(recipient.email)
      console.log('Admin mailing accepted by SES', { userId: recipient.userId, email: recipient.email, messageId: sendResult.MessageId })
    } catch (error) {
      failed += 1
      failedEmails.push(recipient.email)
      console.error(`Failed to send admin mailing to user ${recipient.userId}:`, error)
    }
  }

  console.log('Admin mailing complete', { sent, skipped, failed, sentEmails, skippedEmails, failedEmails })

  return ok({ sent, skipped, failed, sentEmails, skippedEmails, failedEmails })
}

const handleGetPokedex = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const pokedex = await getOrCreatePokedex(userInfo.sub)
  return ok({
    seenPokemonIds: pokedex.seenPokemonIds ?? [],
    unlockedPokemonIds: pokedex.unlockedPokemonIds ?? [],
    seenShinyPokemonIds: pokedex.seenShinyPokemonIds ?? [],
    unlockedShinyPokemonIds: pokedex.unlockedShinyPokemonIds ?? [],
    caseStreak: getPokedexStreak(pokedex),
  })
}

const handleGetHistory = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const pokedex = await getOrCreatePokedex(userInfo.sub)
  const caseHistory = pokedex.caseHistory ?? {}
  const caseOutcomes = pokedex.caseOutcomes ?? {}
  const caseIds = getPastCaseIds(HISTORY_ARCHIVE_DAYS)
  const caseRecords = await batchGetCaseData(caseIds)
  const caseRecordMap = new Map(caseRecords.map((record) => [record.caseId, record]))
  const progressRecords = await batchGetProgress(caseRecords.map((record) => getDateUserId(userInfo.sub, record.caseId)))
  const progressMap = new Map(progressRecords.map((progress) => [progress.caseId, progress]))
  const buildItem = (record: CaseDataRecord): CaseHistoryItem => {
    const progress = progressMap.get(record.caseId)
    const stored = caseHistory[record.caseId]
    const storedOutcome = caseOutcomes[record.caseId]
    const status = progress?.status ?? stored?.status ?? storedOutcome ?? 'playing'
    const completed = status === 'solved' || status === 'failed'
    const resolved = status === 'solved'
    const guessCount = progress
      ? progress.status === 'failed' ? MAX_ACCUSATIONS : progress.accusationHistory.length
      : stored?.guessCount ?? (storedOutcome === 'failed' ? MAX_ACCUSATIONS : storedOutcome === 'solved' ? 1 : undefined)

    return {
      caseId: record.caseId,
      status,
      caseTitle: stored?.caseTitle || getCaseRecordTitle(record),
      difficulty: stored?.difficulty ?? record.difficulty,
      ...(resolved ? {
        culpritPokemonId: record.culpritPokemonId,
        culpritPokemonName: getPokemonName(record.culpritPokemonId),
      } : {}),
      guessCount,
      startedAt: stored?.startedAt ?? (progress ? getProgressActivityTimestamp(progress) ?? undefined : undefined),
      completedAt: completed ? stored?.completedAt ?? `${getCaseDate(record.caseId)}T00:00:00.000Z` : undefined,
    }
  }
  const items = caseIds
    .map((caseId) => caseRecordMap.get(caseId))
    .filter((record): record is CaseDataRecord => record !== undefined)
    .map(buildItem)
    .sort((left, right) => (
      getCaseDate(right.caseId).localeCompare(getCaseDate(left.caseId))
      || getDailyCaseSortRank(left.caseId) - getDailyCaseSortRank(right.caseId)
    ))

  return ok({
    items,
    solvedCount: items.filter((item) => item.status === 'solved').length,
    failedCount: items.filter((item) => item.status === 'failed').length,
    unsolvedCount: items.filter((item) => item.status === 'playing').length,
    currentStreak: getPokedexStreak(pokedex),
  })
}

const handleBackfillHistory = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const caseIds = getPastCaseIds(HISTORY_ARCHIVE_DAYS)
  const caseRecords = await batchGetCaseData(caseIds)
  const caseRecordMap = new Map(caseRecords.map((record) => [record.caseId, record]))
  const missingCaseDate = getPastCaseDates(HISTORY_ARCHIVE_DAYS).find((caseDate) => (
    !caseRecordMap.has(caseDate)
    && !DAILY_DIFFICULTIES.some((difficulty) => caseRecordMap.has(getDailyCaseId(caseDate, difficulty)))
  ))

  if (!missingCaseDate) {
    console.log('History backfill complete', { userId: userInfo.sub })
    return ok({ generatedCaseIds: [], complete: true })
  }

  const generatedCaseIds = DAILY_DIFFICULTIES
    .map((difficulty) => getDailyCaseId(missingCaseDate, difficulty))

  console.log('History backfill generating', { userId: userInfo.sub, caseDate: missingCaseDate, generatedCaseIds })

  for (const caseId of generatedCaseIds) {
    await generateAndStoreCase(caseId)
  }

  console.log('History backfill generated', { userId: userInfo.sub, caseDate: missingCaseDate, generatedCaseIds })
  return ok({ generatedCaseIds, complete: false })
}

const handleGetReminderPreferences = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const subscription = await getReminderSubscription(userInfo.sub)
  const unfinishedCaseReminderEmails = subscription?.unfinishedCaseReminderEmails ?? true
  const newsAndUpdatesEmails = subscription?.newsAndUpdatesEmails ?? true

  if (userInfo.email && (!subscription || subscription.unfinishedCaseReminderEmails == null || subscription.newsAndUpdatesEmails == null)) {
    await putReminderSubscription({
      userId: userInfo.sub,
      email: userInfo.email,
      dailyReminderEmails: subscription?.dailyReminderEmails ?? false,
      unfinishedCaseReminderEmails,
      newsAndUpdatesEmails,
      updatedAt: new Date().toISOString(),
      lastReminderCaseId: subscription?.lastReminderCaseId,
      lastUnfinishedCaseReminderCaseId: subscription?.lastUnfinishedCaseReminderCaseId,
    })
  }

  return ok({
    dailyReminderEmails: subscription?.dailyReminderEmails ?? false,
    unfinishedCaseReminderEmails,
    newsAndUpdatesEmails,
  })
}

const handleUpdateReminderPreferences = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')
  if (!userInfo.email) return err(400, 'Email address required')

  let body: { dailyReminderEmails?: unknown; unfinishedCaseReminderEmails?: unknown; newsAndUpdatesEmails?: unknown } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {}

  if (typeof body.dailyReminderEmails !== 'boolean') {
    return err(400, 'dailyReminderEmails must be a boolean')
  }

  if (typeof body.unfinishedCaseReminderEmails !== 'boolean') {
    return err(400, 'unfinishedCaseReminderEmails must be a boolean')
  }

  if (typeof body.newsAndUpdatesEmails !== 'boolean') {
    return err(400, 'newsAndUpdatesEmails must be a boolean')
  }

  const existing = await getReminderSubscription(userInfo.sub)
  await putReminderSubscription({
    userId: userInfo.sub,
    email: userInfo.email,
    dailyReminderEmails: body.dailyReminderEmails,
    unfinishedCaseReminderEmails: body.unfinishedCaseReminderEmails,
    newsAndUpdatesEmails: body.newsAndUpdatesEmails,
    updatedAt: new Date().toISOString(),
    lastReminderCaseId: existing?.lastReminderCaseId,
    lastUnfinishedCaseReminderCaseId: existing?.lastUnfinishedCaseReminderCaseId,
  })

  return ok({
    dailyReminderEmails: body.dailyReminderEmails,
    unfinishedCaseReminderEmails: body.unfinishedCaseReminderEmails,
    newsAndUpdatesEmails: body.newsAndUpdatesEmails,
  })
}

const handleInvestigate = async (
  caseId: string,
  locationId: string,
  actionId: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)

  let body: { witnessPokemonId?: number } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {}

  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(404, 'Case not found')

  const location = fullCase.locations.find((l) => l.id === locationId)
  if (!location) return err(404, 'Location not found')

  const action = location.actions.find((a) => a.id === actionId)
  if (!action) return err(404, 'Action not found')

  const evidenceItem = action.evidenceId
    ? fullCase.evidence.find((item) => item.id === action.evidenceId)
    : undefined
  const evidenceTitle = action.evidenceTitle ?? evidenceItem?.title
  const evidenceText = action.evidenceText ?? evidenceItem?.clueText
  const evidenceBadges = action.evidenceBadges ?? evidenceItem?.badges

  const witnessPokemonId = typeof body.witnessPokemonId === 'number' ? body.witnessPokemonId : undefined
  if (action.outcomeType === 'witness') {
    if (!witnessPokemonId) return err(400, 'Witness Pokemon required')
    if (!(action.witnessPokemonIds ?? []).includes(witnessPokemonId)) {
      return err(400, 'Invalid witness Pokemon')
    }
  } else if (witnessPokemonId) {
    return err(400, 'Witness Pokemon only applies to witness leads')
  }

  const record: InvestigatedLocationRecord = {
    locationId,
    actionId,
    outcomeType: action.outcomeType,
    observationText: action.observationText,
    evidenceId: action.evidenceId ?? undefined,
    evidenceTitle,
    evidenceText,
    evidenceBadges,
    witnessPokemonId,
  }

  const gameplaySub = getGameplaySub(event, userInfo)

  if (!gameplaySub) {
    return ok({
      result: record,
      investigationsRemaining: fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS,
      accusationsRemaining: MAX_ACCUSATIONS,
      accusationHistory: [],
      status: 'playing',
    })
  }

  const userId = getDateUserId(gameplaySub, caseId)
  let progress = await getProgress(userId)
  const activityAt = getActivityTimestamp()

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase, undefined, getPlayerMetadataUpdates(userInfo, activityAt))
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  if (progress.status !== 'playing') return err(400, 'Game is already over')
  if (progress.investigationsRemaining <= 0) return err(400, 'No investigations remaining')
  if (progress.investigatedLocations.some((l) => l.locationId === locationId)) {
    return err(400, 'Location already investigated')
  }
  if (witnessPokemonId && (progress.interviewedWitnessPokemonIds ?? []).includes(witnessPokemonId)) {
    return err(400, 'Witness Pokemon already interviewed')
  }

  const investigatedLocations = [...progress.investigatedLocations, record]
  const interviewedWitnessPokemonIds = witnessPokemonId
    ? mergeUniqueIds(progress.interviewedWitnessPokemonIds ?? [], [witnessPokemonId])
    : progress.interviewedWitnessPokemonIds ?? []
  const investigationsRemaining = progress.investigationsRemaining - 1

  await updateProgress(userId, {
    investigatedLocations,
    interviewedWitnessPokemonIds,
    investigationsRemaining,
    ...getPlayerMetadataUpdates(userInfo, activityAt),
    ttl: getProgressTtl(),
  })

  if (userInfo.sub && witnessPokemonId) {
    await markPokedexSeen(userInfo.sub, [witnessPokemonId])
  }

  progress = {
    ...progress,
    investigatedLocations,
    interviewedWitnessPokemonIds,
    investigationsRemaining,
    ...getPlayerMetadataUpdates(userInfo, activityAt),
  }

  return ok({
    result: record,
    investigationsRemaining: progress.investigationsRemaining,
    accusationsRemaining: progress.accusationsRemaining,
    accusationHistory: progress.accusationHistory,
    status: progress.status,
  })
}

const handleAccuse = async (
  caseId: string,
  suspectIdStr: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  let caseStreak = userInfo.sub ? getPokedexStreak(await getOrCreatePokedex(userInfo.sub)) : 0

  const record = await getCaseData(caseId)
  if (!record) return err(404, 'Case not found')
  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(500, 'Failed to load case')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

  const gameplaySub = getGameplaySub(event, userInfo)

  if (!gameplaySub) {
    let body: { accusationHistory?: number[], accusationsRemaining?: number } = {}
    try {
      body = JSON.parse(event.body ?? '{}')
    } catch {}

    const previousHistory = Array.isArray(body.accusationHistory) ? body.accusationHistory : []
    if (previousHistory.includes(suspectId)) {
      return err(400, 'Already accused this suspect')
    }

    const previousRemaining = typeof body.accusationsRemaining === 'number'
      ? body.accusationsRemaining
      : MAX_ACCUSATIONS
    const correct = suspectId === record.culpritPokemonId
    const accusationHistory = [...previousHistory, suspectId]
    const accusationsRemaining = correct ? previousRemaining : previousRemaining - 1

    let status: 'playing' | 'solved' | 'failed' = 'playing'
    if (correct) {
      status = 'solved'
    } else if (accusationsRemaining <= 0) {
      status = 'failed'
    }

    const progress = {
      ...createCaseProgress(`anonymous:${caseId}`, caseId, fullCase),
      accusationHistory,
      accusationsRemaining,
      status,
    }

    return ok({
      case: buildResponseCase(fullCase, progress),
      investigationsRemaining: progress.investigationsRemaining,
      accusationsRemaining: progress.accusationsRemaining,
      accusationHistory: progress.accusationHistory,
      status: progress.status,
      caseStats: buildCaseStatsResponse(getCaseStats(record)),
      caseStreak: 0,
    })
  }

  const userId = getDateUserId(gameplaySub, caseId)
  let progress = await getProgress(userId)
  const activityAt = getActivityTimestamp()

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase, 0, getPlayerMetadataUpdates(userInfo, activityAt))
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  if (progress.status !== 'playing') return err(400, 'Game is already over')

  if (progress.accusationHistory.includes(suspectId)) {
    return err(400, 'Already accused this suspect')
  }

  const correct = suspectId === record.culpritPokemonId
  const accusationHistory = [...progress.accusationHistory, suspectId]
  const accusationsRemaining = correct
    ? progress.accusationsRemaining
    : progress.accusationsRemaining - 1

  let status: 'playing' | 'solved' | 'failed' = 'playing'
  if (correct) {
    status = 'solved'
  } else if (accusationsRemaining <= 0) {
    status = 'failed'
  }

  await updateProgress(userId, {
    accusationHistory,
    accusationsRemaining,
    status,
    ...getPlayerMetadataUpdates(userInfo, activityAt),
    ttl: getProgressTtl(),
  })

  let caseStats = buildCaseStatsResponse(getCaseStats(record))
  const guessCount = status === 'solved' ? accusationHistory.length : MAX_ACCUSATIONS
  if (status === 'solved' || status === 'failed') {
    caseStats = buildCaseStatsResponse(await recordCaseCompletion(caseId, status, guessCount))
  }

  if (userInfo.sub && (status === 'solved' || status === 'failed')) {
    const pokedex = await updatePokedexForCompletedCase(userInfo.sub, caseId, fullCase, progress, status, guessCount)
    caseStreak = getPokedexStreak(pokedex)
  }

  progress = {
    ...progress,
    accusationHistory,
    accusationsRemaining,
    status,
    ...getPlayerMetadataUpdates(userInfo, activityAt),
  }

  return ok({
    case: buildResponseCase(fullCase, progress),
    investigationsRemaining: progress.investigationsRemaining,
    accusationsRemaining: progress.accusationsRemaining,
    accusationHistory: progress.accusationHistory,
    status: progress.status,
    caseStats,
    caseStreak,
  })
}

const handleClearSuspect = async (
  caseId: string,
  suspectIdStr: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  const gameplaySub = getGameplaySub(event, userInfo)
  if (!gameplaySub) return err(401, 'Authentication required')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

  let body: { cleared?: boolean } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {}

  const cleared = body.cleared ?? true

  const userId = getDateUserId(gameplaySub, caseId)
  let progress = await getProgress(userId)
  const activityAt = getActivityTimestamp()
  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(404, 'Case not found')

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase, undefined, getPlayerMetadataUpdates(userInfo, activityAt))
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  const clearedSuspectIds = progress.clearedSuspectIds ?? []
  const updated = cleared
    ? clearedSuspectIds.includes(suspectId) ? clearedSuspectIds : [...clearedSuspectIds, suspectId]
    : clearedSuspectIds.filter((id) => id !== suspectId)

  await updateProgress(userId, {
    clearedSuspectIds: updated,
    ...getPlayerMetadataUpdates(userInfo, activityAt),
    ttl: getProgressTtl(),
  })

  progress = { ...progress, clearedSuspectIds: updated, ...getPlayerMetadataUpdates(userInfo, activityAt) }

  return ok({
    case: buildResponseCase(fullCase, progress),
    investigationsRemaining: progress.investigationsRemaining,
    accusationsRemaining: progress.accusationsRemaining,
    accusationHistory: progress.accusationHistory,
    status: progress.status,
  })
}

const isRating = (value: unknown): value is number => (
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
)

const isGeneralFeedbackType = (value: unknown): value is 'bug' | 'feature' => (
  value === 'bug' || value === 'feature'
)

const trimOptionalString = (value: unknown, maxLength: number): string | undefined | null => {
  if (value === undefined) return undefined
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed.length > maxLength) return null
  return trimmed || undefined
}

const handleSubmitGeneralFeedback = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  const gameplaySub = getGameplaySub(event, userInfo)
  if (!gameplaySub) return err(401, 'Authentication required')

  let body: {
    feedbackType?: unknown
    message?: unknown
    contact?: unknown
    pageUrl?: unknown
    userAgent?: unknown
  } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return err(400, 'Invalid JSON')
  }

  if (!isGeneralFeedbackType(body.feedbackType)) return err(400, 'Invalid feedback type')
  if (typeof body.message !== 'string') return err(400, 'Message is required')

  const message = body.message.trim()
  if (!message) return err(400, 'Message is required')
  if (message.length > GENERAL_FEEDBACK_MESSAGE_MAX_LENGTH) return err(400, 'Message is too long')

  const contact = trimOptionalString(body.contact, GENERAL_FEEDBACK_CONTACT_MAX_LENGTH)
  if (contact === null) return err(400, 'Invalid contact')

  const pageUrl = trimOptionalString(body.pageUrl, GENERAL_FEEDBACK_CONTEXT_MAX_LENGTH)
  if (pageUrl === null) return err(400, 'Invalid page URL')

  const userAgent = trimOptionalString(body.userAgent, GENERAL_FEEDBACK_CONTEXT_MAX_LENGTH)
  if (userAgent === null) return err(400, 'Invalid user agent')

  const feedbackRecord = {
    feedbackKind: 'general' as const,
    feedbackId: `general:${Date.now()}:${Math.random().toString(36).slice(2)}`,
    userId: gameplaySub,
    feedbackType: body.feedbackType,
    message,
    contact,
    pageUrl,
    userAgent,
    createdAt: new Date().toISOString(),
    ttl: getProgressTtl(),
  }

  await putGeneralFeedback(feedbackRecord)

  try {
    await publishGeneralFeedbackAlert(feedbackRecord)
  } catch (error) {
    console.error('Failed to publish general feedback alert:', error)
  }

  return ok({ submitted: true })
}

const handleSubmitFeedback = async (
  caseId: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  const gameplaySub = getGameplaySub(event, userInfo)
  if (!gameplaySub) return err(401, 'Authentication required')

  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(404, 'Case not found')

  const userId = getDateUserId(gameplaySub, caseId)
  let progress = await getProgress(userId)
  if (!progress) return err(400, 'Case is not complete')
  progress = await ensureProgressDefaults(userId, progress, fullCase)

  if (progress.status !== 'solved' && progress.status !== 'failed') {
    return err(400, 'Case is not complete')
  }

  let body: {
    enjoymentRating?: unknown
    comment?: unknown
  } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return err(400, 'Invalid JSON')
  }

  if (!isRating(body.enjoymentRating)) return err(400, 'Invalid enjoyment rating')
  if (body.comment !== undefined && typeof body.comment !== 'string') return err(400, 'Invalid comment')

  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  if (comment.length > FEEDBACK_COMMENT_MAX_LENGTH) return err(400, 'Comment is too long')

  const feedbackRecord = {
    feedbackId: `${caseId}:${gameplaySub}`,
    caseId,
    userId: gameplaySub,
    status: progress.status,
    enjoymentRating: body.enjoymentRating,
    comment: comment || undefined,
    createdAt: new Date().toISOString(),
    ttl: getProgressTtl(),
  }

  await putCaseFeedback(feedbackRecord)

  try {
    await publishFeedbackCommentAlert(feedbackRecord)
  } catch (error) {
    console.error('Failed to publish feedback alert:', error)
  }

  return ok({ submitted: true })
}

export const handler = async (
  event: ApiGatewayEvent,
  _context: unknown,
): Promise<ApiGatewayResult> => {
  const path = event.path.replace(/\/+$/, '')
  const method = event.requestContext.httpMethod
  const logAndReturn = (result: ApiGatewayResult): ApiGatewayResult => {
    console.log('API response', { method, path, statusCode: result.statusCode })
    return result
  }

  console.log('API request', { method, path })

  if (event.requestContext.httpMethod === 'OPTIONS') {
    return logAndReturn({ statusCode: 204, headers: corsHeaders, body: '' })
  }

  try {
    if (method === 'GET' && path === '/api/cases/current') {
      return logAndReturn(await handleGetCase(event))
    }

    if (method === 'GET' && path === '/api/admin/session') {
      return logAndReturn(await handleGetAdminSession(event))
    }

    const adminCaseProgressMatch = path.match(/^\/api\/admin\/cases\/([^/]+)\/progress$/)
    if (method === 'GET' && adminCaseProgressMatch) {
      return logAndReturn(await handleGetAdminCaseProgress(decodeURIComponent(adminCaseProgressMatch[1]), event))
    }

    if (method === 'POST' && path === '/api/admin/mailing') {
      return logAndReturn(await handleSendAdminMailing(event))
    }

    if (method === 'GET' && path === '/api/pokedex') {
      return logAndReturn(await handleGetPokedex(event))
    }

    if (method === 'GET' && path === '/api/history') {
      return logAndReturn(await handleGetHistory(event))
    }

    if (method === 'POST' && path === '/api/history/backfill') {
      return logAndReturn(await handleBackfillHistory(event))
    }

    if (method === 'GET' && path === '/api/reminder-preferences') {
      return logAndReturn(await handleGetReminderPreferences(event))
    }

    if (method === 'POST' && path === '/api/reminder-preferences') {
      return logAndReturn(await handleUpdateReminderPreferences(event))
    }

    if (method === 'POST' && path === '/api/feedback') {
      return logAndReturn(await handleSubmitGeneralFeedback(event))
    }

    const apiCasesMatch = path.match(/^\/api\/cases\/([^/]+)$/)
    if (method === 'GET' && apiCasesMatch) {
      return logAndReturn(await handleGetCase(event, decodeURIComponent(apiCasesMatch[1])))
    }

    const investigateMatch = path.match(/^\/api\/cases\/([^/]+)\/investigate\/([^/]+)\/([^/]+)$/)
    if (method === 'POST' && investigateMatch) {
      return logAndReturn(await handleInvestigate(investigateMatch[1], investigateMatch[2], investigateMatch[3], event))
    }

    const accuseMatch = path.match(/^\/api\/cases\/([^/]+)\/accuse\/(\d+)$/)
    if (method === 'POST' && accuseMatch) {
      return logAndReturn(await handleAccuse(accuseMatch[1], accuseMatch[2], event))
    }

    const clearMatch = path.match(/^\/api\/cases\/([^/]+)\/suspects\/(\d+)\/clear$/)
    if (method === 'POST' && clearMatch) {
      return logAndReturn(await handleClearSuspect(clearMatch[1], clearMatch[2], event))
    }

    const feedbackMatch = path.match(/^\/api\/cases\/([^/]+)\/feedback$/)
    if (method === 'POST' && feedbackMatch) {
      return logAndReturn(await handleSubmitFeedback(feedbackMatch[1], event))
    }

    return logAndReturn(err(404, 'Not found'))
  } catch (error) {
    console.error('Handler error:', { method, path, error })
    return logAndReturn(err(500, 'Internal server error'))
  }
}
