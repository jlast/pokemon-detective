import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface CaseFeedbackRecord {
  feedbackId: string
  caseId: string
  userId: string
  status: 'solved' | 'failed'
  enjoymentRating: number
  comment?: string
  createdAt: string
  ttl: number
}

const TABLE = process.env.FEEDBACK_TABLE ?? 'CaseFeedback'

export const putCaseFeedback = async (record: CaseFeedbackRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}
