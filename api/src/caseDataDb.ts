import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { BatchGetCommand, DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { CaseDifficulty, CaseTheme, EvidenceBadgeData } from '../../src/game/caseModel'
import type { PokemonType } from '../../src/data/pokemon'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface CaseDataRecord {
  caseId: string
  configId: string
  difficulty?: CaseDifficulty
  culpritPokemonId: number
  typeClueSlot?: 'primary' | 'secondary'
  typeClueSlots?: Record<string, 'primary' | 'secondary'>
  typeClueGroup?: PokemonType[]
  typeClueGroups?: Record<string, PokemonType[]>
  suspectPokemonIds: number[]
  suspectShinyMap: Record<string, boolean>
  witnessPokemonIds?: number[]
  witnessPokemonIdMap?: Record<string, number[]>
  actionEvidenceMap: Record<string, string>
  locationCardVariantMap?: Record<string, string>
  locationCardTiltMap?: Record<string, number>
  theme?: CaseTheme
  solution: {
    culpritRevealText: string
    detectiveConclusion: string
    clueBadges?: EvidenceBadgeData[]
    evidenceExplanation: { locationId: string; evidenceTitle: string; clueText: string; badges?: EvidenceBadgeData[]; deductionText: string }[]
    clearedSuspects: { pokemonId: number; reason: string; evidenceLabel?: string }[]
  }
  completedCount?: number
  solvedCount?: number
  totalGuessCount?: number
  ttl: number
}

export interface CaseStats {
  completedCount: number
  solvedCount: number
  totalGuessCount: number
}

const TABLE = process.env.CASE_DATA_TABLE ?? 'CaseData'

export const getCaseData = async (caseId: string): Promise<CaseDataRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { caseId } }))
  return (result.Item as CaseDataRecord) ?? null
}

export const batchGetCaseData = async (caseIds: string[]): Promise<CaseDataRecord[]> => {
  if (caseIds.length === 0) return []

  const records: CaseDataRecord[] = []
  let keys = caseIds.map((caseId) => ({ caseId }))

  do {
    const result = await doc.send(new BatchGetCommand({
      RequestItems: {
        [TABLE]: { Keys: keys },
      },
    }))

    records.push(...(result.Responses?.[TABLE] as CaseDataRecord[] | undefined ?? []))
    keys = (result.UnprocessedKeys?.[TABLE]?.Keys as { caseId: string }[] | undefined) ?? []
  } while (keys.length > 0)

  return records
}

export const putCaseData = async (record: CaseDataRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}

export const getCaseStats = (record: CaseDataRecord | null): CaseStats => ({
  completedCount: record?.completedCount ?? 0,
  solvedCount: record?.solvedCount ?? 0,
  totalGuessCount: record?.totalGuessCount ?? 0,
})

export const recordCaseCompletion = async (
  caseId: string,
  status: 'solved' | 'failed',
  guessCount: number,
): Promise<CaseStats> => {
  const result = await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { caseId },
    UpdateExpression: 'ADD completedCount :one, solvedCount :solvedIncrement, totalGuessCount :guessCount',
    ExpressionAttributeValues: {
      ':one': 1,
      ':solvedIncrement': status === 'solved' ? 1 : 0,
      ':guessCount': guessCount,
    },
    ReturnValues: 'ALL_NEW',
  }))

  return getCaseStats((result.Attributes as CaseDataRecord) ?? null)
}
