import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { createCaseById } from '../../src/game/cases/index'
import {
  getSession,
  createSession,
  updateSession,
  type InvestigatedLocationRecord,
  type SessionRecord,
} from './db'
import { getDailySeed, createSeededRng, getTodayUtc } from './seeds'

const USER_POOL_ID = process.env.USER_POOL_ID ?? ''
const REGION = process.env.REGION ?? 'us-east-1'

const jwksUrl = new URL(
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
)
const jwks = createRemoteJWKSet(jwksUrl)

interface ApiGatewayEvent {
  path: string
  httpMethod: string
  headers?: Record<string, string>
  body?: string | null
  requestContext: {
    httpMethod: string
    authorizer?: {
      sub: string
      email?: string
      name?: string
      picture?: string
    }
  }
}

interface ApiGatewayResult {
  statusCode: number
  headers: Record<string, string>
  body: string
}

const SESSION_TTL_DAYS = 7
const MAX_ACCUSATIONS = 3

const corsHeaders = {
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

const parseBody = (event: ApiGatewayEvent): Record<string, unknown> => {
  try {
    return JSON.parse(event.body ?? '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

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
  const token = extractToken(event.headers?.Authorization)
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

const getDateSessionKey = (sub: string, dateStr: string): string =>
  `${sub}:${dateStr}`

const CASE_IDS = [
  'missing-cookies',
  'purloined-page',
  'missing-medal',
  'ravaged-pantry',
  'stolen-artifact',
]

const generateDailyCase = (dateStr: string) => {
  const seed = getDailySeed(dateStr)
  const rng = createSeededRng(seed)

  const origRandom = Math.random
  Math.random = rng
  try {
    const caseIndex = Math.abs(seed) % CASE_IDS.length
    const caseId = CASE_IDS[caseIndex]
    const gameCase = createCaseById(caseId)!
    return { gameCase, caseId }
  } finally {
    Math.random = origRandom
  }
}

const buildCaseStateJson = (session: SessionRecord): string => {
  const sessionData = JSON.parse(session.caseStateJson)
  const investigatedMap = new Map(
    session.investigatedLocations.map((r) => [r.locationId, r]),
  )

  const locations = sessionData.locations.map((loc: Record<string, unknown>) => {
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
      }
    }
    return loc
  })

  const evidence = sessionData.evidence.map((ev: Record<string, unknown>) => ({
    ...ev,
    discovered: session.investigatedLocations.some(
      (r) => r.evidenceId === ev.id,
    ),
  }))

  const accusedSet = new Set(session.accusationHistory)
  const suspects = sessionData.suspects.map((s: Record<string, unknown>) => ({
    ...s,
    manuallyRuledOut: accusedSet.has(s.pokemonId as number),
    noteStatus: accusedSet.has(s.pokemonId as number) ? 'ruled-out' : 'suspect',
  }))

  const result: Record<string, unknown> = {
    ...sessionData,
    locations,
    evidence,
    suspects,
    status: session.status === 'solved' || session.status === 'failed'
      ? session.status
      : 'active',
  }

  if (session.status === 'solved' || session.status === 'failed') {
    result.culpritPokemonId = session.culpritPokemonId
    result.solution = {
      culpritRevealText: session.solutionCulpritReveal,
      detectiveConclusion: session.solutionConclusion,
    }
  } else {
    result.culpritPokemonId = -1
    result.solution = null
  }

  return JSON.stringify(result)
}

const serializeSession = (session: SessionRecord) => ({
  sessionId: session.sessionId,
  date: session.date,
  userSub: session.userSub,
  status: session.status,
  investigationsRemaining: session.investigationsRemaining,
  accusationsRemaining: session.accusationsRemaining,
  accusationHistory: session.accusationHistory,
  case: JSON.parse(buildCaseStateJson(session)),
})

const buildSessionRecord = (
  sessionId: string,
  dateStr: string,
  userSub: string,
  gameCase: { maxInvestigations: number; culpritPokemonId: number; solution?: { culpritRevealText?: string; detectiveConclusion?: string } },
  caseId: string,
  caseStateJson: string,
): SessionRecord => ({
  sessionId,
  date: dateStr,
  userSub,
  status: 'playing',
  investigationsRemaining: gameCase.maxInvestigations,
  maxInvestigations: gameCase.maxInvestigations,
  accusationsRemaining: MAX_ACCUSATIONS,
  maxAccusations: MAX_ACCUSATIONS,
  caseId,
  culpritPokemonId: gameCase.culpritPokemonId,
  investigatedLocations: [],
  accusationHistory: [],
  caseStateJson,
  solutionCulpritReveal: gameCase.solution?.culpritRevealText ?? '',
  solutionConclusion: gameCase.solution?.detectiveConclusion ?? '',
  ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400,
})

const buildCaseStateJsonRaw = (gameCase: {
  id: string; title: string; shortStory: string; crimeIcon: string; difficulty: string; maxInvestigations: number
  suspects: { pokemonId: number; name: string; sprite: string; isShiny: boolean; inspectedGroups: Record<string, boolean>; inspectedFacts: unknown[] }[]
  locations: { id: string; name: string; icon: string; teaserText?: string; description?: string; actions: unknown[] }[]
  evidence: { id: string; title: string; clueText: string; hiddenTrait: string; endExplanation: string }[]
}) => JSON.stringify({
  id: gameCase.id,
  title: gameCase.title,
  shortStory: gameCase.shortStory,
  crimeIcon: gameCase.crimeIcon,
  difficulty: gameCase.difficulty,
  maxInvestigations: gameCase.maxInvestigations,
  suspects: gameCase.suspects.map((s) => ({
    pokemonId: s.pokemonId,
    name: s.name,
    sprite: s.sprite,
    isShiny: s.isShiny,
    manuallyRuledOut: false,
    noteStatus: 'suspect',
    inspectedGroups: s.inspectedGroups,
    inspectedFacts: s.inspectedFacts,
  })),
  locations: gameCase.locations.map((l) => ({
    id: l.id,
    name: l.name,
    icon: l.icon,
    teaserText: l.teaserText,
    description: l.description,
    investigated: false,
    selectedActionId: null,
    actions: l.actions,
  })),
  evidence: gameCase.evidence.map((e) => ({
    id: e.id,
    title: e.title,
    clueText: e.clueText,
    hiddenTrait: e.hiddenTrait,
    endExplanation: e.endExplanation,
    discovered: false,
  })),
  status: 'active',
})

const handleGetDailyCase = async (dateStr: string) => {
  const { gameCase, caseId } = generateDailyCase(dateStr)
  const caseStateJson = buildCaseStateJsonRaw(gameCase)
  const data = JSON.parse(caseStateJson) as Record<string, unknown>
  data.culpritPokemonId = -1
  data.solution = null
  return ok(data)
}

const handleStart = async (
  dateStr: string,
  event: ApiGatewayEvent,
) => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')

  const sessionId = getDateSessionKey(userInfo.sub, dateStr)
  const existing = await getSession(sessionId)
  if (existing) {
    return ok(serializeSession(existing))
  }

  const { gameCase, caseId } = generateDailyCase(dateStr)
  const caseStateJson = buildCaseStateJsonRaw(gameCase)
  const session = buildSessionRecord(sessionId, dateStr, userInfo.sub, gameCase, caseId, caseStateJson)
  await createSession(session)
  return ok(serializeSession(session))
}

const handleInvestigate = async (
  sessionId: string,
  locationId: string,
  actionId: string,
) => {
  const session = await getSession(sessionId)
  if (!session) return err(404, 'Session not found')
  if (session.status !== 'playing') return err(400, 'Game is already over')
  if (session.investigationsRemaining <= 0) return err(400, 'No investigations remaining')

  if (session.investigatedLocations.some((l) => l.locationId === locationId)) {
    return err(400, 'Location already investigated')
  }

  const data = JSON.parse(session.caseStateJson)
  const location = data.locations.find(
    (l: Record<string, unknown>) => l.id === locationId,
  )
  if (!location) return err(404, 'Location not found')

  const action = (location.actions as Record<string, unknown>[]).find(
    (a) => a.id === actionId,
  )
  if (!action) return err(404, 'Action not found')

  const record: InvestigatedLocationRecord = {
    locationId,
    actionId,
    outcomeType: action.outcomeType as string,
    observationText: action.observationText as string,
    evidenceId: action.evidenceId as string | undefined,
    evidenceTitle: action.evidenceTitle as string | undefined,
    evidenceText: action.evidenceText as string | undefined,
  }

  const investigatedLocations = [...session.investigatedLocations, record]
  const investigationsRemaining = session.investigationsRemaining - 1

  await updateSession(sessionId, {
    investigatedLocations,
    investigationsRemaining,
    ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400,
  })

  session.investigatedLocations = investigatedLocations
  session.investigationsRemaining = investigationsRemaining

  return ok(serializeSession(session))
}

const handleAccuse = async (sessionId: string, suspectIdStr: string) => {
  const session = await getSession(sessionId)
  if (!session) return err(404, 'Session not found')
  if (session.status !== 'playing') return err(400, 'Game is already over')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

  if (session.accusationHistory.includes(suspectId)) {
    return err(400, 'Already accused this suspect')
  }

  const correct = suspectId === session.culpritPokemonId
  const accusationHistory = [...session.accusationHistory, suspectId]
  const accusationsRemaining = correct
    ? session.accusationsRemaining
    : session.accusationsRemaining - 1

  let status: 'playing' | 'solved' | 'failed' = 'playing'
  if (correct) {
    status = 'solved'
  } else if (accusationsRemaining <= 0) {
    status = 'failed'
  }

  await updateSession(sessionId, {
    accusationHistory,
    accusationsRemaining,
    status,
    ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400,
  })

  session.accusationHistory = accusationHistory
  session.accusationsRemaining = accusationsRemaining
  session.status = status

  return ok(serializeSession(session))
}

const handleGetSession = async (sessionId: string) => {
  const session = await getSession(sessionId)
  if (!session) return err(404, 'Session not found')
  if (session.date !== getTodayUtc()) return err(404, 'Session expired')
  return ok(serializeSession(session))
}

const handleState = async (event: ApiGatewayEvent) => {
  const userInfo = await getUserInfo(event)
  if (!userInfo.sub) return err(401, 'Authentication required')
  const dateStr = getTodayUtc()
  const sessionId = getDateSessionKey(userInfo.sub, dateStr)
  return handleGetSession(sessionId)
}

export const handler = async (
  event: ApiGatewayEvent,
  _context: unknown,
): Promise<ApiGatewayResult> => {
  if (event.requestContext.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const dateStr = getTodayUtc()
  const path = event.path.replace(/\/+$/, '')
  const method = event.requestContext.httpMethod
  const body = parseBody(event)

  try {
    if (method === 'GET' && path === '/api/daily/case') {
      return await handleGetDailyCase(dateStr)
    }

    if (method === 'POST' && path === '/api/daily/start') {
      return await handleStart(dateStr, event)
    }

    if (method === 'GET' && path === '/api/daily/state') {
      return await handleState(event)
    }

    if (method === 'GET' && path.startsWith('/api/daily/')) {
      const sessionId = path.replace('/api/daily/', '').split('/')[0]
      if (sessionId && !sessionId.includes('/')) {
        return await handleGetSession(sessionId)
      }
    }

    if (method === 'POST' && path.includes('/investigate/')) {
      const parts = path.replace('/api/daily/', '').split('/')
      const sessionId = parts[0]
      const locIdx = parts.indexOf('investigate')
      if (sessionId && locIdx !== -1 && parts[locIdx + 1] && parts[locIdx + 2]) {
        return await handleInvestigate(sessionId, parts[locIdx + 1], parts[locIdx + 2])
      }
    }

    if (method === 'POST' && path.includes('/accuse/')) {
      const parts = path.replace('/api/daily/', '').split('/')
      const sessionId = parts[0]
      const accIdx = parts.indexOf('accuse')
      if (sessionId && accIdx !== -1 && parts[accIdx + 1]) {
        return await handleAccuse(sessionId, parts[accIdx + 1])
      }
    }

    return err(404, 'Not found')
  } catch (error) {
    console.error('Handler error:', error)
    return err(500, 'Internal server error')
  }
}
