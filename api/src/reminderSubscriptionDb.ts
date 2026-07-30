import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const doc = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } })

export interface ReminderSubscriptionRecord {
  userId: string
  email: string
  dailyReminderEmails: boolean
  unfinishedCaseReminderEmails?: boolean
  updatedAt: string
  lastReminderCaseId?: string
  lastUnfinishedCaseReminderCaseId?: string
}

const TABLE = process.env.REMINDER_SUBSCRIPTIONS_TABLE ?? 'ReminderSubscriptions'

export const getReminderSubscription = async (userId: string): Promise<ReminderSubscriptionRecord | null> => {
  const result = await doc.send(new GetCommand({ TableName: TABLE, Key: { userId } }))
  return (result.Item as ReminderSubscriptionRecord) ?? null
}

export const putReminderSubscription = async (record: ReminderSubscriptionRecord): Promise<void> => {
  await doc.send(new PutCommand({ TableName: TABLE, Item: record }))
}

export const listDailyReminderSubscriptions = async (): Promise<ReminderSubscriptionRecord[]> => {
  const records: ReminderSubscriptionRecord[] = []
  let ExclusiveStartKey: Record<string, unknown> | undefined

  do {
    const result = await doc.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: '#dailyReminderEmails = :enabled',
      ExpressionAttributeNames: { '#dailyReminderEmails': 'dailyReminderEmails' },
      ExpressionAttributeValues: { ':enabled': true },
      ExclusiveStartKey,
    }))
    records.push(...(result.Items as ReminderSubscriptionRecord[] ?? []))
    ExclusiveStartKey = result.LastEvaluatedKey
  } while (ExclusiveStartKey)

  return records
}

export const listUnfinishedCaseReminderSubscriptions = async (): Promise<ReminderSubscriptionRecord[]> => {
  const records: ReminderSubscriptionRecord[] = []
  let ExclusiveStartKey: Record<string, unknown> | undefined

  do {
    const result = await doc.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: '#unfinishedCaseReminderEmails = :enabled OR attribute_not_exists(#unfinishedCaseReminderEmails)',
      ExpressionAttributeNames: { '#unfinishedCaseReminderEmails': 'unfinishedCaseReminderEmails' },
      ExpressionAttributeValues: { ':enabled': true },
      ExclusiveStartKey,
    }))
    records.push(...(result.Items as ReminderSubscriptionRecord[] ?? []))
    ExclusiveStartKey = result.LastEvaluatedKey
  } while (ExclusiveStartKey)

  return records
}

export const markReminderSent = async (userId: string, caseId: string): Promise<void> => {
  await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId },
    UpdateExpression: 'SET #lastReminderCaseId = :caseId',
    ExpressionAttributeNames: { '#lastReminderCaseId': 'lastReminderCaseId' },
    ExpressionAttributeValues: { ':caseId': caseId },
  }))
}

export const markUnfinishedCaseReminderSent = async (userId: string, caseId: string): Promise<void> => {
  await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId },
    UpdateExpression: 'SET #lastUnfinishedCaseReminderCaseId = :caseId',
    ExpressionAttributeNames: { '#lastUnfinishedCaseReminderCaseId': 'lastUnfinishedCaseReminderCaseId' },
    ExpressionAttributeValues: { ':caseId': caseId },
  }))
}
