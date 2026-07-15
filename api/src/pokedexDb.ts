import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client)

export interface PokedexRecord {
  userId: string
  seenPokemonIds: number[]
  unlockedPokemonIds: number[]
  seenShinyPokemonIds?: number[]
  unlockedShinyPokemonIds?: number[]
}

const TABLE = process.env.POKEDEX_TABLE ?? 'Pokedex'

export const getPokedexRecord = async (userId: string): Promise<PokedexRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { userId } }))
  return (result.Item as PokedexRecord) ?? null
}

export const putPokedexRecord = async (record: PokedexRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}
