import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { allCases, createCaseById, pickRandomCaseDifficulty } from '../../src/game/cases/index'
import { pokemonData } from '../../src/data/pokemon'
import type { Case, LocationCardVariant } from '../../src/game/caseModel'
import { putCaseData } from './caseDataDb'
import { getProgress } from './playerDb'
import {
  listDailyReminderSubscriptions,
  listUnfinishedCaseReminderSubscriptions,
  markReminderSent,
  markUnfinishedCaseReminderSent,
  type ReminderSubscriptionRecord,
} from './reminderSubscriptionDb'
import { validateGeneratedCase } from './validateGeneratedCase'

const ses = new SESv2Client({})
const REMINDER_EMAIL_FROM = process.env.REMINDER_EMAIL_FROM ?? ''
const APP_URL = process.env.APP_URL ?? 'https://pokemysterygame.com'
const REMINDER_EMAIL_FROM_NAME = 'PokeMystery'

const getTodayUtc = (): string => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

const CASE_DATA_TTL_DAYS = 366
const WITNESS_OPTION_COUNT = 1
const LOCATION_CARD_VARIANTS: LocationCardVariant[] = ['detective-note', 'clipboard', 'map-fragment']

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

const countWitnessActions = (gameCase: Case): number => (
  gameCase.locations.reduce(
    (total, location) => total + location.actions.filter((action) => action.outcomeType === 'witness').length,
    0,
  )
)

const getWitnessActionIds = (gameCase: Case): string[] => (
  gameCase.locations.flatMap((location) => (
    location.actions
      .filter((action) => action.outcomeType === 'witness')
      .map((action) => action.id)
  ))
)

const createWitnessPokemonIds = (suspectPokemonIds: number[], count: number): number[] => {
  const suspectIds = new Set(suspectPokemonIds)
  const seenNames = new Set<string>()
  return shuffle(pokemonData.filter((pokemon) => !suspectIds.has(pokemon.id)))
    .filter((pokemon) => {
      if (seenNames.has(pokemon.name)) return false
      seenNames.add(pokemon.name)
      return true
    })
    .map((pokemon) => pokemon.id)
    .slice(0, count)
}

const createWitnessPokemonIdMap = (gameCase: Case, witnessPokemonIds: number[]): Record<string, number[]> => {
  const witnessActionIds = getWitnessActionIds(gameCase)
  return Object.fromEntries(witnessActionIds.map((actionId, index) => [
    actionId,
    witnessPokemonIds.slice(index * WITNESS_OPTION_COUNT, (index + 1) * WITNESS_OPTION_COUNT),
  ]))
}

const createLocationCardVariantMap = (locations: Case['locations']): Record<string, LocationCardVariant> => {
  const pool = shuffle(LOCATION_CARD_VARIANTS.flatMap((variant) => [variant, variant]))
  return locations.reduce<Record<string, LocationCardVariant>>((variantMap, location, index) => {
    variantMap[location.id] = pool[index % pool.length]
    return variantMap
  }, {})
}

const createLocationCardTiltMap = (locations: Case['locations']): Record<string, number> => (
  locations.reduce<Record<string, number>>((tiltMap, location) => {
    tiltMap[location.id] = Number((Math.random() * 4 - 2).toFixed(1))
    return tiltMap
  }, {})
)

const getDateUserId = (sub: string, caseId: string): string => `${sub}:${caseId}`

const hasCompletedToday = async (userId: string, caseId: string): Promise<boolean> => {
  const progress = await getProgress(getDateUserId(userId, caseId))
  return progress?.status === 'solved' || progress?.status === 'failed'
}

const sendReminderEmail = async (subscription: ReminderSubscriptionRecord, caseId: string): Promise<void> => {
  const todayCaseUrl = `${APP_URL}/today`
  const settingsUrl = `${APP_URL}/settings`
  const fromAddress = `${REMINDER_EMAIL_FROM_NAME} <${REMINDER_EMAIL_FROM}>`

  await ses.send(new SendEmailCommand({
    FromEmailAddress: fromAddress,
    Destination: { ToAddresses: [subscription.email] },
    Content: {
      Simple: {
        Subject: { Data: 'New puzzle is ready' },
        Body: {
          Text: {
            Data: [
              'A new PokeMystery case is ready.',
              '',
              'Your detective desk has a fresh daily puzzle waiting. Follow the clues, question the witnesses, and make your accusation.',
              '',
              `Start today's case: ${todayCaseUrl}`,
              '',
              'You are receiving this because daily reminder emails are enabled in your detective profile.',
              `Manage email preferences: ${settingsUrl}`,
            ].join('\n'),
          },
          Html: {
            Data: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New puzzle is ready</title>
  </head>
  <body style="margin:0;background:#f3ead6;color:#203250;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3ead6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff8df;border:1px solid #d8c39c;border-radius:22px;box-shadow:0 16px 36px rgba(47,35,21,0.14);overflow:hidden;">
            <tr>
              <td style="background:#203250;color:#fffdf7;padding:22px 24px;">
                <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#f4d35e;">PokeMystery</div>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.1;font-weight:900;">New daily case ready</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px 8px;">
                <div style="display:inline-block;background:#f4d35e;color:#203250;border:1px solid #b69134;border-radius:999px;padding:7px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">Detective alert</div>
                <p style="margin:18px 0 0;font-size:18px;line-height:1.55;">Your detective desk has a fresh daily puzzle waiting. Follow the clues, question the witnesses, and make your accusation.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 28px;">
                <a href="${todayCaseUrl}" style="display:inline-block;background:#203250;color:#fffdf7;text-decoration:none;border-radius:14px;padding:14px 20px;font-family:Arial,sans-serif;font-size:15px;font-weight:900;box-shadow:0 8px 16px rgba(31,50,80,0.18);">Start today's case</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e3d2ad;padding:16px 24px 22px;color:#67738a;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
                You are receiving this because daily reminder emails are enabled in your detective profile.
                <br>
                <a href="${settingsUrl}" style="color:#203250;font-weight:800;text-decoration:underline;">Manage email preferences</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
          },
        },
      },
    },
  }))

  await markReminderSent(subscription.userId, caseId)
}

const sendUnfinishedCaseReminderEmail = async (subscription: ReminderSubscriptionRecord, caseId: string): Promise<void> => {
  const todayCaseUrl = `${APP_URL}/today`
  const settingsUrl = `${APP_URL}/settings`
  const fromAddress = `${REMINDER_EMAIL_FROM_NAME} <${REMINDER_EMAIL_FROM}>`

  await ses.send(new SendEmailCommand({
    FromEmailAddress: fromAddress,
    Destination: { ToAddresses: [subscription.email] },
    Content: {
      Simple: {
        Subject: { Data: 'Your case is still open' },
        Body: {
          Text: {
            Data: [
              'Your PokeMystery case is still open.',
              '',
              'There are 8 hours left to finish today\'s puzzle. Return to your detective desk before the case file closes.',
              '',
              `Continue today's case: ${todayCaseUrl}`,
              '',
              'You are receiving this because unfinished-case reminder emails are enabled in Settings.',
              `Manage email preferences: ${settingsUrl}`,
            ].join('\n'),
          },
          Html: {
            Data: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your case is still open</title>
  </head>
  <body style="margin:0;background:#f3ead6;color:#203250;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3ead6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff8df;border:1px solid #d8c39c;border-radius:22px;box-shadow:0 16px 36px rgba(47,35,21,0.14);overflow:hidden;">
            <tr>
              <td style="background:#203250;color:#fffdf7;padding:22px 24px;">
                <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#f4d35e;">PokeMystery</div>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.1;font-weight:900;">Case still open</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px 8px;">
                <div style="display:inline-block;background:#f4d35e;color:#203250;border:1px solid #b69134;border-radius:999px;padding:7px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;">8 hours left</div>
                <p style="margin:18px 0 0;font-size:18px;line-height:1.55;">Today's case is not done yet. Return to your detective desk before the file closes.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 28px;">
                <a href="${todayCaseUrl}" style="display:inline-block;background:#203250;color:#fffdf7;text-decoration:none;border-radius:14px;padding:14px 20px;font-family:Arial,sans-serif;font-size:15px;font-weight:900;box-shadow:0 8px 16px rgba(31,50,80,0.18);">Continue today's case</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e3d2ad;padding:16px 24px 22px;color:#67738a;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;">
                You are receiving this because unfinished-case reminder emails are enabled in Settings.
                <br>
                <a href="${settingsUrl}" style="color:#203250;font-weight:800;text-decoration:underline;">Manage email preferences</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
          },
        },
      },
    },
  }))

  await markUnfinishedCaseReminderSent(subscription.userId, caseId)
}

const sendDailyReminders = async (caseId: string): Promise<{ sent: number; skipped: number; failed: number }> => {
  const subscriptions = await listDailyReminderSubscriptions()
  if (!REMINDER_EMAIL_FROM) {
    console.warn('Skipping reminder emails because REMINDER_EMAIL_FROM is not configured')
    return { sent: 0, skipped: subscriptions.length, failed: 0 }
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const subscription of subscriptions) {
    try {
      if (!subscription.email || subscription.lastReminderCaseId === caseId) {
        skipped += 1
        continue
      }

      if (await hasCompletedToday(subscription.userId, caseId)) {
        skipped += 1
        continue
      }

      await sendReminderEmail(subscription, caseId)
      sent += 1
    } catch (error) {
      failed += 1
      console.error(`Failed to send reminder for user ${subscription.userId}:`, error)
    }
  }

  return { sent, skipped, failed }
}

const sendUnfinishedCaseReminders = async (caseId: string): Promise<{ sent: number; skipped: number; failed: number }> => {
  const subscriptions = await listUnfinishedCaseReminderSubscriptions()
  if (!REMINDER_EMAIL_FROM) {
    console.warn('Skipping unfinished-case reminder emails because REMINDER_EMAIL_FROM is not configured')
    return { sent: 0, skipped: subscriptions.length, failed: 0 }
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const subscription of subscriptions) {
    try {
      if (!subscription.email || subscription.lastUnfinishedCaseReminderCaseId === caseId) {
        skipped += 1
        continue
      }

      if (await hasCompletedToday(subscription.userId, caseId)) {
        skipped += 1
        continue
      }

      await sendUnfinishedCaseReminderEmail(subscription, caseId)
      sent += 1
    } catch (error) {
      failed += 1
      console.error(`Failed to send unfinished-case reminder for user ${subscription.userId}:`, error)
    }
  }

  return { sent, skipped, failed }
}

interface CloudWatchEvent {
  version?: string
  id?: string
  'detail-type'?: string
  source?: string
  account?: string
  time?: string
  region?: string
  resources?: string[]
  detail?: Record<string, unknown>
}

export const handler = async (_event?: CloudWatchEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    const caseId = getTodayUtc()

    if (_event?.detail?.reminderType === 'unfinished-case') {
      const reminders = await sendUnfinishedCaseReminders(caseId)
      console.log(`Unfinished-case reminders for ${caseId}: ${reminders.sent} sent, ${reminders.skipped} skipped, ${reminders.failed} failed`)
      return { statusCode: 200, body: JSON.stringify({ caseId, reminders }) }
    }

    const configIndex = Math.floor(Math.random() * allCases.length)
    const config = allCases[configIndex]
    if (!config) throw new Error('No case configs available')

    const difficulty = pickRandomCaseDifficulty()
    const gameCase = createCaseById(config.id, difficulty)
    if (!gameCase) throw new Error(`Failed to generate case for config: ${config.id}`)
    validateGeneratedCase(gameCase)

    const actionEvidenceMap: Record<string, string> = {}
    for (const location of gameCase.locations) {
      for (const action of location.actions) {
        if (action.evidenceId) {
          actionEvidenceMap[action.id] = action.evidenceId
        }
      }
    }

    const suspectShinyMap: Record<string, boolean> = {}
    for (const suspect of gameCase.suspects) {
      if (suspect.isShiny) {
        suspectShinyMap[String(suspect.pokemonId)] = true
      }
    }
    const suspectPokemonIds = gameCase.suspects.map((s) => s.pokemonId)
    const witnessPokemonIds = createWitnessPokemonIds(suspectPokemonIds, countWitnessActions(gameCase) * WITNESS_OPTION_COUNT)
    const witnessPokemonIdMap = createWitnessPokemonIdMap(gameCase, witnessPokemonIds)
    const locationCardVariantMap = createLocationCardVariantMap(gameCase.locations)
    const locationCardTiltMap = createLocationCardTiltMap(gameCase.locations)

    await putCaseData({
      caseId,
      configId: gameCase.id,
      difficulty: gameCase.difficulty,
      culpritPokemonId: gameCase.culpritPokemonId,
      typeClueSlots: gameCase.typeClueSlots,
      typeClueGroups: gameCase.typeClueGroups,
      suspectPokemonIds,
      suspectShinyMap,
      witnessPokemonIds,
      witnessPokemonIdMap,
      locationCardVariantMap,
      locationCardTiltMap,
      theme: gameCase.theme,
      actionEvidenceMap,
      solution: {
        culpritRevealText: gameCase.solution?.culpritRevealText ?? '',
        detectiveConclusion: gameCase.solution?.detectiveConclusion ?? '',
        clueBadges: gameCase.solution?.clueBadges ?? [],
        evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
        clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
      },
      ttl: Math.floor(Date.now() / 1000) + CASE_DATA_TTL_DAYS * 86400,
    })

    const reminders = await sendDailyReminders(caseId)

    console.log(`Generated daily case ${caseId} using config "${config.id}" at ${gameCase.difficulty} difficulty`)
    console.log(`Daily reminders for ${caseId}: ${reminders.sent} sent, ${reminders.skipped} skipped, ${reminders.failed} failed`)
    return { statusCode: 200, body: JSON.stringify({ caseId, configId: config.id, difficulty: gameCase.difficulty, reminders }) }
  } catch (error) {
    console.error('Cron handler error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate daily case' }) }
  }
}
