import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client)

export interface InvestigatedLocationRecord {
  locationId: string
  actionId: string
  outcomeType: string
  observationText: string
  evidenceId?: string
  evidenceTitle?: string
  evidenceText?: string
}

export interface SessionRecord {
  sessionId: string
  date: string
  status: 'playing' | 'solved' | 'failed'
  investigationsRemaining: number
  maxInvestigations: number
  accusationsRemaining: number
  maxAccusations: number
  caseId: string
  culpritPokemonId: number
  investigatedLocations: InvestigatedLocationRecord[]
  accusationHistory: number[]
  caseStateJson: string
  solutionCulpritReveal: string
  solutionConclusion: string
  ttl: number
}

const TABLE = process.env.TABLE_NAME ?? 'DailyPuzzleSession'

export const getSession = async (sessionId: string): Promise<SessionRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { sessionId } }))
  return (result.Item as SessionRecord) ?? null
}

export const createSession = async (record: SessionRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}

export const updateSession = async (
  sessionId: string,
  updates: Partial<SessionRecord>,
): Promise<void> => {
  const keys = Object.keys(updates) as (keyof SessionRecord)[]
  if (keys.length === 0) return

  const setExpr = keys.map((k) => `#${k} = :${k}`).join(', ')
  const attrNames = Object.fromEntries(keys.map((k) => [`#${k}`, k]))
  const attrValues = Object.fromEntries(keys.map((k) => [`:${k}`, updates[k]]))

  await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { sessionId },
    UpdateExpression: `SET ${setExpr}`,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrValues,
  }))
}
