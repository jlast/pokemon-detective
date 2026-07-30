import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import type { CaseFeedbackRecord } from './feedbackDb'

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
