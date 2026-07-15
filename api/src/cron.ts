import { allCases, createCaseById } from '../../src/game/cases/index'
import { pokemonData } from '../../src/data/pokemon'
import { putCaseData } from './caseDataDb'

const getTodayUtc = (): string => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

const SESSION_TTL_DAYS = 7
const WITNESS_OPTION_COUNT = 3

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

interface CloudWatchEvent {
  version?: string
  id?: string
  'detail-type'?: string
  source?: string
  account?: string
  time?: string
  region?: string
  resources?: string[]
  detail?: Record<string, unknown>
}

export const handler = async (_event?: CloudWatchEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    const caseId = getTodayUtc()

    const configIndex = Math.floor(Math.random() * allCases.length)
    const config = allCases[configIndex]
    if (!config) throw new Error('No case configs available')

    const gameCase = createCaseById(config.id)
    if (!gameCase) throw new Error(`Failed to generate case for config: ${config.id}`)

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

    await putCaseData({
      caseId,
      configId: gameCase.id,
      culpritPokemonId: gameCase.culpritPokemonId,
      suspectPokemonIds,
      suspectShinyMap,
      witnessPokemonIds: createWitnessPokemonIds(suspectPokemonIds),
      actionEvidenceMap,
      solution: {
        culpritRevealText: gameCase.solution?.culpritRevealText ?? '',
        detectiveConclusion: gameCase.solution?.detectiveConclusion ?? '',
        evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
        clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
      },
      ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400,
    })

    console.log(`Generated daily case ${caseId} using config "${config.id}"`)
    return { statusCode: 200, body: JSON.stringify({ caseId, configId: config.id }) }
  } catch (error) {
    console.error('Cron handler error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate daily case' }) }
  }
}
