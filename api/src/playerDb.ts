import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface InvestigatedLocationRecord {
  locationId: string
  actionId: string
  outcomeType: string
  observationText: string
  evidenceId?: string
  evidenceTitle?: string
  evidenceText?: string
  witnessPokemonId?: number
}

export interface PlayerProgressRecord {
  userId: string
  caseId: string
  status: 'playing' | 'solved' | 'failed'
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  investigatedLocations: InvestigatedLocationRecord[]
  clearedSuspectIds: number[]
  interviewedWitnessPokemonIds?: number[]
  suspectShinyMap: Record<string, boolean>
  ttl: number
}

const TABLE = process.env.PLAYER_PROGRESS_TABLE ?? 'PlayerProgress'

export const getProgress = async (userId: string): Promise<PlayerProgressRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { userId } }))
  return (result.Item as PlayerProgressRecord) ?? null
}

export const createProgress = async (record: PlayerProgressRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}

export const updateProgress = async (
  userId: string,
  updates: Partial<PlayerProgressRecord>,
): Promise<void> => {
  const keys = Object.keys(updates) as (keyof PlayerProgressRecord)[]
  if (keys.length === 0) return

  const setExpr = keys.map((k) => `#${k} = :${k}`).join(', ')
  const attrNames = Object.fromEntries(keys.map((k) => [`#${k}`, k]))
  const attrValues = Object.fromEntries(keys.map((k) => [`:${k}`, updates[k]]))

  await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId },
    UpdateExpression: `SET ${setExpr}`,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrValues,
  }))
}
