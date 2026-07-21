import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

const TABLES = [
  { name: process.env.CASE_DATA_TABLE, key: 'caseId', label: 'case data' },
  { name: process.env.PLAYER_PROGRESS_TABLE, key: 'userId', label: 'player progress' },
]

const isTestTable = (tableName) => typeof tableName === 'string' && /test$/i.test(tableName)

const assertSafeTables = () => {
  const missing = TABLES.filter((table) => !table.name)
  if (missing.length > 0) {
    throw new Error(`Missing required table env vars: ${missing.map((table) => table.label).join(', ')}`)
  }

  const unsafe = TABLES.filter((table) => !isTestTable(table.name))
  if (unsafe.length > 0) {
    throw new Error(`Refusing to clear non-test table(s): ${unsafe.map((table) => table.name).join(', ')}`)
  }
}

const chunk = (items, size) => {
  const chunks = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const deleteBatch = async (doc, tableName, keyName, keys) => {
  for (const keyChunk of chunk(keys, 25)) {
    let requestItems = {
      [tableName]: keyChunk.map((keyValue) => ({
        DeleteRequest: { Key: { [keyName]: keyValue } },
      })),
    }

    do {
      const result = await doc.send(new BatchWriteCommand({ RequestItems: requestItems }))
      requestItems = result.UnprocessedItems ?? {}
    } while ((requestItems[tableName] ?? []).length > 0)
  }
}

const clearTable = async (doc, table) => {
  let deleted = 0
  let lastEvaluatedKey

  do {
    const result = await doc.send(new ScanCommand({
      TableName: table.name,
      ProjectionExpression: '#key',
      ExpressionAttributeNames: { '#key': table.key },
      ExclusiveStartKey: lastEvaluatedKey,
    }))

    const keys = (result.Items ?? [])
      .map((item) => item[table.key])
      .filter((keyValue) => keyValue !== undefined)

    await deleteBatch(doc, table.name, table.key, keys)
    deleted += keys.length
    lastEvaluatedKey = result.LastEvaluatedKey
  } while (lastEvaluatedKey)

  return deleted
}

const main = async () => {
  assertSafeTables()

  const client = new DynamoDBClient({})
  const doc = DynamoDBDocumentClient.from(client)

  for (const table of TABLES) {
    const deleted = await clearTable(doc, table)
    console.log(`Cleared ${deleted} item(s) from ${table.name}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
