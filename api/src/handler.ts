import { createRemoteJWKSet, jwtVerify } from 'jose'
import { allCases, createCaseById, rebuildFullCase } from '../../src/game/cases/index'
import type { Case, CaseStatus, LocationCardVariant, LocationAction } from '../../src/game/caseModel'
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
const WITNESS_OPTION_COUNT = 1
const LOCATION_CARD_VARIANTS: LocationCardVariant[] = ['detective-note', 'clipboard', 'map-fragment']

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

const stripActionOutcome = (action: LocationAction): LocationAction => {
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
  const { evidence: _ev, culpritPokemonId: _cp, typeClueSlot: _typeClueSlot, typeClueGroups: _typeClueGroups, ...caseWithoutEvidence } = fullCase
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
  }
}

const getTodayCaseData = async () => {
  const caseId = getTodayUtc()
  const record = await getCaseData(caseId)
  if (!record) return null
  return { record, caseId }
}

const typeEvidenceIds = ['type-residue-clue', 'ground-trace-clue', 'force-clue', 'witness-clue']

const getStoredTypeClueGroups = (record: Awaited<ReturnType<typeof getCaseData>>) => {
  if (!record) return undefined
  if (record.typeClueGroups) return record.typeClueGroups
  if (record.typeClueGroup) return Object.fromEntries(typeEvidenceIds.map((evidenceId) => [evidenceId, record.typeClueGroup]))
  return undefined
}

const loadCase = async (caseId: string) => {
  const record = await getCaseData(caseId)
  if (!record) return null
  const storedTypeClueGroups = getStoredTypeClueGroups(record)
  const fullCase = rebuildFullCase(
    record.configId,
    record.culpritPokemonId,
    record.suspectPokemonIds,
    record.suspectShinyMap,
    record.actionEvidenceMap,
    record.solution,
    record.witnessPokemonIds,
    record.typeClueSlot ?? 'primary',
    storedTypeClueGroups,
  )
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
    || !record.typeClueGroups
  ) {
    await putCaseData({ ...record, typeClueGroups: fullCase.typeClueGroups, witnessPokemonIds, witnessPokemonIdMap, locationCardVariantMap, locationCardTiltMap })
  }

  return applyLocationCardVariants(assignWitnessPokemonToActions(fullCase, witnessPokemonIdMap), locationCardVariantMap, locationCardTiltMap)
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
    culpritPokemonId: gameCase.culpritPokemonId,
    typeClueSlot: gameCase.typeClueSlot,
    typeClueGroups: gameCase.typeClueGroups,
    suspectPokemonIds,
    suspectShinyMap,
    witnessPokemonIds,
    witnessPokemonIdMap,
    locationCardVariantMap,
    locationCardTiltMap,
    actionEvidenceMap,
    solution: {
      culpritRevealText: gameCase.solution?.culpritRevealText ?? '',
      detectiveConclusion: gameCase.solution?.detectiveConclusion ?? '',
      evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
      clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
    },
    ttl: getProgressTtl(),
  })

  return applyLocationCardVariants(assignWitnessPokemonToActions(gameCase, witnessPokemonIdMap), locationCardVariantMap, locationCardTiltMap)
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
    evidenceTitle,
    evidenceText,
    evidenceBadges,
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

  const record = await getCaseData(caseId)
  if (!record) return err(404, 'Case not found')
  const fullCase = await loadCase(caseId)
  if (!fullCase) return err(500, 'Failed to load case')

  const suspectId = Number(suspectIdStr)
  if (Number.isNaN(suspectId)) return err(400, 'Invalid suspect ID')

  if (!userInfo.sub) {
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
    })
  }

  const userId = getDateUserId(userInfo.sub, caseId)
  let progress = await getProgress(userId)

  if (!progress) {
    progress = createCaseProgress(userId, caseId, fullCase, 0)
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
