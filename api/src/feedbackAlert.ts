import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import type { CaseFeedbackRecord, GeneralFeedbackRecord } from './feedbackDb'

const client = new SNSClient({})
const TOPIC_ARN = process.env.FEEDBACK_ALERT_TOPIC_ARN ?? ''

export const publishFeedbackCommentAlert = async (record: CaseFeedbackRecord): Promise<void> => {
  if (!TOPIC_ARN) return

  const feedbackType = record.comment ? 'feedback comment' : 'feedback rating'

  await client.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Subject: `Pokemon Detective ${feedbackType}: ${record.caseId}`,
    Message: JSON.stringify(record, null, 2),
  }))
}

export const publishGeneralFeedbackAlert = async (record: GeneralFeedbackRecord): Promise<void> => {
  if (!TOPIC_ARN) return

  await client.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Subject: `Pokemon Detective ${record.feedbackType}: ${record.feedbackId}`,
    Message: JSON.stringify(record, null, 2),
  }))
}
