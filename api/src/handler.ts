import { createRemoteJWKSet, jwtVerify } from 'jose'
import { allCases, createCaseById, rebuildFullCase } from '../../src/game/cases/index'
import type { Case, CaseStatus, LocationAction } from '../../src/game/caseModel'
import { getShinySpriteUrl, pokemonData } from '../../src/data/pokemon'
import { getPokemonById } from '../../src/game/suspectCaseFile'
import { getCaseData, putCaseData } from './caseDataDb'
import {
  getProgress,
  createProgress,
  updateProgress,
  type PlayerProgressRecord,
  type InvestigatedLocationRecord,
} from './playerDb'
import { getPokedexRecord, putPokedexRecord, type PokedexRecord } from './pokedexDb'

const USER_POOL_ID = process.env.USER_POOL_ID ?? ''
const REGION = process.env.REGION ?? 'us-east-1'

const jwksUrl = new URL(
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
)
const jwks = createRemoteJWKSet(jwksUrl)

const SESSION_TTL_DAYS = 7
const MAX_ACCUSATIONS = 3
const DEFAULT_INVESTIGATIONS = 6
const SHINY_ODDS = 0.01
const WITNESS_OPTION_COUNT = 3

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

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    }
  } catch {
    return { sub: '' }
  }
}

const getDateUserId = (sub: string, caseId: string): string => `${sub}:${caseId}`

const getTodayUtc = (): string => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

const stripActionOutcome = (action: LocationAction): LocationAction => {
  const {
    observationText: _observationText,
    observationTextSmall: _observationTextSmall,
    observationTextMedium: _observationTextMedium,
    observationTextLarge: _observationTextLarge,
    evidenceId: _evidenceId,
    evidenceTitle: _evidenceTitle,
    evidenceText: _evidenceText,
    implicationText: _implicationText,
    unlocksLocationIds: _unlocksLocationIds,
    isUseful: _isUseful,
    ...rest
  } = action
  return rest as LocationAction
}

const getProgressTtl = (): number => Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400

const mergeUniqueIds = (current: number[], next: number[]): number[] => (
  [...new Set([...current, ...next])].sort((a, b) => a - b)
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

const createWitnessPokemonIds = (suspectPokemonIds: number[]): number[] => {
  const suspectIds = new Set(suspectPokemonIds)
  return shuffle(pokemonData.map((pokemon) => pokemon.id).filter((id) => !suspectIds.has(id)))
    .slice(0, WITNESS_OPTION_COUNT)
}

const getOrCreatePokedex = async (sub: string): Promise<PokedexRecord> => {
  const userId = sub
  return await getPokedexRecord(userId) ?? {
    userId,
    seenPokemonIds: [],
    unlockedPokemonIds: [],
    seenShinyPokemonIds: [],
    unlockedShinyPokemonIds: [],
  }
}

const updatePokedexForCompletedCase = async (
  sub: string,
  fullCase: Case,
  progress: PlayerProgressRecord,
  status: 'solved' | 'failed',
): Promise<void> => {
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

  await putPokedexRecord({
    userId: pokedex.userId,
    seenPokemonIds,
    unlockedPokemonIds,
    seenShinyPokemonIds,
    unlockedShinyPokemonIds,
  })
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
  })
}

const createSuspectShinyMap = (fullCase: Case): Record<string, boolean> => Object.fromEntries(
  fullCase.suspects.map((suspect) => [String(suspect.pokemonId), Math.random() < SHINY_ODDS]),
)

const hasCompleteSuspectShinyMap = (progress: PlayerProgressRecord, fullCase: Case): boolean => (
  fullCase.suspects.every((suspect) => typeof progress.suspectShinyMap?.[String(suspect.pokemonId)] === 'boolean')
)

const createCaseProgress = (
  userId: string,
  caseId: string,
  fullCase: Case,
  investigationsRemaining = fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS,
): PlayerProgressRecord => ({
  userId,
  caseId,
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

  if (hasCompleteSuspectShinyMap(next, fullCase)) {
    if (Object.keys(updates).length > 0) {
      await updateProgress(userId, { ...updates, ttl: getProgressTtl() })
    }
    return next
  }

  const suspectShinyMap = {
    ...(next.suspectShinyMap ?? {}),
  }

  for (const suspect of fullCase.suspects) {
    const key = String(suspect.pokemonId)
    suspectShinyMap[key] ??= Math.random() < SHINY_ODDS
  }

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
  const { evidence: _ev, culpritPokemonId: _cp, ...caseWithoutEvidence } = fullCase
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
    }
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
        return {
          ...loc,
          investigated: true,
          selectedActionId: record.actionId,
          observationText: record.observationText,
          evidenceTitle: record.evidenceTitle ?? null,
          evidenceText: record.evidenceText ?? null,
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
        evidenceId: null,
        actions: loc.actions.map(stripActionOutcome),
      }
    }),
    suspects: applyPlayerShinyMap(fullCase, progress).map((s) => ({
      ...s,
      manuallyRuledOut: accusedSet.has(s.pokemonId) || clearedSet.has(s.pokemonId) || s.manuallyRuledOut,
      noteStatus: accusedSet.has(s.pokemonId) || clearedSet.has(s.pokemonId) ? 'ruled-out' as const : s.noteStatus,
    })),
  }
}

const getTodayCaseData = async () => {
  const caseId = getTodayUtc()
  const record = await getCaseData(caseId)
  if (!record) return null
  return { record, caseId }
}

const loadCase = async (caseId: string) => {
  const record = await getCaseData(caseId)
  if (!record) return null
  const witnessPokemonIds = record.witnessPokemonIds ?? createWitnessPokemonIds(record.suspectPokemonIds)
  if (!record.witnessPokemonIds) {
    await putCaseData({ ...record, witnessPokemonIds })
  }
  const fullCase = rebuildFullCase(
    record.configId,
    record.culpritPokemonId,
    record.suspectPokemonIds,
    record.suspectShinyMap,
    record.actionEvidenceMap,
    record.solution,
    witnessPokemonIds,
  )
  fullCase.witnessPokemonIds = witnessPokemonIds
  return fullCase
}

const generateAndStoreCase = async (caseId: string) => {
  const config = allCases[Math.floor(Math.random() * allCases.length)]
  if (!config) return null
  const gameCase = createCaseById(config.id)
  if (!gameCase) return null

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
    suspectShinyMap[String(suspect.pokemonId)] = suspect.isShiny
  }
  const suspectPokemonIds = gameCase.suspects.map((s) => s.pokemonId)
  const witnessPokemonIds = createWitnessPokemonIds(suspectPokemonIds)

  await putCaseData({
    caseId,
    configId: gameCase.id,
    culpritPokemonId: gameCase.culpritPokemonId,
    suspectPokemonIds,
    suspectShinyMap,
    witnessPokemonIds,
    actionEvidenceMap,
    solution: {
      culpritRevealText: gameCase.solution?.culpritRevealText ?? '',
      detectiveConclusion: gameCase.solution?.detectiveConclusion ?? '',
      evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
      clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
    },
    ttl: getProgressTtl(),
  })

  gameCase.witnessPokemonIds = witnessPokemonIds
  return gameCase
}

const handleGetCurrentCase = async (event: ApiGatewayEvent): Promise<ApiGatewayResult> => {
  const result = await getTodayCaseData()
  const caseId = getTodayUtc()

  let fullCase: Case | null = null

  if (result) {
    fullCase = await loadCase(result.caseId)
  }

  if (!fullCase) {
    fullCase = await generateAndStoreCase(caseId)
  }

  if (!fullCase) return err(500, 'Failed to build case')

  const userInfo = await getUserInfo(event)
  if (userInfo.sub) {
    const userId = getDateUserId(userInfo.sub, caseId)
    let progress = await getProgress(userId)
    if (!progress) {
      progress = createCaseProgress(userId, caseId, fullCase)
      await createProgress(progress)
    } else {
      progress = await ensureProgressDefaults(userId, progress, fullCase)
    }

    return ok({
      case: buildResponseCase(fullCase, progress),
      investigationsRemaining: progress.investigationsRemaining,
      accusationsRemaining: progress.accusationsRemaining,
      accusationHistory: progress.accusationHistory,
      status: progress.status,
    })
  }

  return ok({
    case: buildResponseCase(fullCase, null),
    investigationsRemaining: fullCase.maxInvestigations ?? DEFAULT_INVESTIGATIONS,
    accusationsRemaining: MAX_ACCUSATIONS,
    accusationHistory: [],
    status: 'playing',
  })
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
  })
}

const handleInvestigate = async (
  caseId: string,
  locationId: string,
  actionId: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  let body: { witnessPokemonId?: number } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {}

  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(404, 'Case not found')

  const userId = getDateUserId(userInfo.sub, caseId)
  let progress = await getProgress(userId)

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase)
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  if (progress.status !== 'playing') return err(400, 'Game is already over')
  if (progress.investigationsRemaining <= 0) return err(400, 'No investigations remaining')
  if (progress.investigatedLocations.some((l) => l.locationId === locationId)) {
    return err(400, 'Location already investigated')
  }

  const location = fullCase.locations.find((l) => l.id === locationId)
  if (!location) return err(404, 'Location not found')

  const action = location.actions.find((a) => a.id === actionId)
  if (!action) return err(404, 'Action not found')

  const witnessPokemonId = typeof body.witnessPokemonId === 'number' ? body.witnessPokemonId : undefined
  if (action.outcomeType === 'witness') {
    if (!witnessPokemonId) return err(400, 'Witness Pokemon required')
    if (!(fullCase.witnessPokemonIds ?? []).includes(witnessPokemonId)) {
      return err(400, 'Invalid witness Pokemon')
    }
    if ((progress.interviewedWitnessPokemonIds ?? []).includes(witnessPokemonId)) {
      return err(400, 'Witness Pokemon already interviewed')
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
    evidenceTitle: action.evidenceTitle ?? undefined,
    evidenceText: action.evidenceText ?? undefined,
    witnessPokemonId,
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
    ttl: getProgressTtl(),
  })

  if (witnessPokemonId) {
    await markPokedexSeen(userInfo.sub, [witnessPokemonId])
  }

  progress = {
    ...progress,
    investigatedLocations,
    interviewedWitnessPokemonIds,
    investigationsRemaining,
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
  if (!userInfo.sub) return err(401, 'Authentication required')

  const record = await getCaseData(caseId)
  if (!record) return err(404, 'Case not found')
  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(500, 'Failed to load case')

  const userId = getDateUserId(userInfo.sub, caseId)
  let progress = await getProgress(userId)

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase, 0)
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  if (progress.status !== 'playing') return err(400, 'Game is already over')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

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
    ttl: getProgressTtl(),
  })

  if (status === 'solved' || status === 'failed') {
    await updatePokedexForCompletedCase(userInfo.sub, fullCase, progress, status)
  }

  progress = {
    ...progress,
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
  })
}

const handleClearSuspect = async (
  caseId: string,
  suspectIdStr: string,
  event: ApiGatewayEvent,
): Promise<ApiGatewayResult> => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

  let body: { cleared?: boolean } = {}
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {}

  const cleared = body.cleared ?? true

  const userId = getDateUserId(userInfo.sub, caseId)
  let progress = await getProgress(userId)
  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(404, 'Case not found')

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase)
    await createProgress(progress)
  } else {
    progress = await ensureProgressDefaults(userId, progress, fullCase)
  }

  const clearedSuspectIds = progress.clearedSuspectIds ?? []
  const updated = cleared
    ? clearedSuspectIds.includes(suspectId) ? clearedSuspectIds : [...clearedSuspectIds, suspectId]
    : clearedSuspectIds.filter((id) => id !== suspectId)

  await updateProgress(userId, { clearedSuspectIds: updated, ttl: getProgressTtl() })

  progress = { ...progress, clearedSuspectIds: updated }

  return ok({
    case: buildResponseCase(fullCase, progress),
    investigationsRemaining: progress.investigationsRemaining,
    accusationsRemaining: progress.accusationsRemaining,
    accusationHistory: progress.accusationHistory,
    status: progress.status,
  })
}

export const handler = async (
  event: ApiGatewayEvent,
  _context: unknown,
): Promise<ApiGatewayResult> => {
  if (event.requestContext.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const path = event.path.replace(/\/+$/, '')
  const method = event.requestContext.httpMethod

  try {
    if (method === 'GET' && path === '/api/cases/current') {
      return await handleGetCurrentCase(event)
    }

    if (method === 'GET' && path === '/api/pokedex') {
      return await handleGetPokedex(event)
    }

    const apiCasesMatch = path.match(/^\/api\/cases\/([^/]+)$/)
    if (method === 'GET' && apiCasesMatch) {
      return await handleGetCurrentCase(event)
    }

    const investigateMatch = path.match(/^\/api\/cases\/([^/]+)\/investigate\/([^/]+)\/([^/]+)$/)
    if (method === 'POST' && investigateMatch) {
      return await handleInvestigate(investigateMatch[1], investigateMatch[2], investigateMatch[3], event)
    }

    const accuseMatch = path.match(/^\/api\/cases\/([^/]+)\/accuse\/(\d+)$/)
    if (method === 'POST' && accuseMatch) {
      return await handleAccuse(accuseMatch[1], accuseMatch[2], event)
    }

    const clearMatch = path.match(/^\/api\/cases\/([^/]+)\/suspects\/(\d+)\/clear$/)
    if (method === 'POST' && clearMatch) {
      return await handleClearSuspect(clearMatch[1], clearMatch[2], event)
    }

    return err(404, 'Not found')
  } catch (error) {
    console.error('Handler error:', error)
    return err(500, 'Internal server error')
  }
}
