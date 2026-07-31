import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { CaseDifficulty } from '../../src/game/caseModel'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface PokedexRecord {
  userId: string
  seenPokemonIds: number[]
  unlockedPokemonIds: number[]
  seenShinyPokemonIds?: number[]
  unlockedShinyPokemonIds?: number[]
  caseOutcomes?: Record<string, 'solved' | 'failed'>
  caseHistory?: Record<string, {
    status: 'playing' | 'solved' | 'failed'
    caseTitle: string
    difficulty?: CaseDifficulty
    culpritPokemonId: number
    guessCount?: number
    startedAt?: string
    completedAt?: string
  }>
  currentStreak?: number
}

const TABLE = process.env.POKEDEX_TABLE ?? 'Pokedex'

export const getPokedexRecord = async (userId: string): Promise<PokedexRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { userId } }))
  return (result.Item as PokedexRecord) ?? null
}

export const putPokedexRecord = async (record: PokedexRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}
