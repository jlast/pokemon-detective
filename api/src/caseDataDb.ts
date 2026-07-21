import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface CaseDataRecord {
  caseId: string
  configId: string
  culpritPokemonId: number
  suspectPokemonIds: number[]
  suspectShinyMap: Record<string, boolean>
  witnessPokemonIds?: number[]
  witnessPokemonIdMap?: Record<string, number[]>
  actionEvidenceMap: Record<string, string>
  locationCardVariantMap?: Record<string, string>
  locationCardTiltMap?: Record<string, number>
  solution: {
    culpritRevealText: string
    detectiveConclusion: string
    evidenceExplanation: { locationId: string; evidenceTitle: string; clueText: string; badgeText?: string; badgeType?: string; deductionText: string }[]
    clearedSuspects: { pokemonId: number; reason: string }[]
  }
  ttl: number
}

const TABLE = process.env.CASE_DATA_TABLE ?? 'CaseData'

export const getCaseData = async (caseId: string): Promise<CaseDataRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { caseId } }))
  return (result.Item as CaseDataRecord) ?? null
}

export const putCaseData = async (record: CaseDataRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}
