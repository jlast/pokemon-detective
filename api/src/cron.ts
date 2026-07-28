import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { allCases, createCaseById, pickRandomCaseDifficulty } from '../../src/game/cases/index'
import { pokemonData } from '../../src/data/pokemon'
import type { Case, LocationCardVariant } from '../../src/game/caseModel'
import { putCaseData } from './caseDataDb'
import { getProgress } from './playerDb'
import { listDailyReminderSubscriptions, markReminderSent, type ReminderSubscriptionRecord } from './reminderSubscriptionDb'
import { validateGeneratedCase } from './validateGeneratedCase'

const ses = new SESv2Client({})
const REMINDER_EMAIL_FROM = process.env.REMINDER_EMAIL_FROM ?? ''
const APP_URL = process.env.APP_URL ?? 'https://pokemysterygame.com'

const getTodayUtc = (): string => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

const SESSION_TTL_DAYS = 7
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
  await ses.send(new SendEmailCommand({
    FromEmailAddress: REMINDER_EMAIL_FROM,
    Destination: { ToAddresses: [subscription.email] },
    Content: {
      Simple: {
        Subject: { Data: 'New puzzle is ready' },
        Body: {
          Text: {
            Data: `A new Pokemon mystery puzzle is ready. Start today's case: ${APP_URL}/today\n\nYou are receiving this because daily reminder emails are enabled in your detective profile.`,
          },
          Html: {
            Data: `<p>A new Pokemon mystery puzzle is ready.</p><p><a href="${APP_URL}/today">Start today's case</a></p><p>You are receiving this because daily reminder emails are enabled in your detective profile.</p>`,
          },
        },
      },
    },
  }))

  await markReminderSent(subscription.userId, caseId)
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
        evidenceExplanation: gameCase.solution?.evidenceExplanation ?? [],
        clearedSuspects: gameCase.solution?.clearedSuspects ?? [],
      },
      ttl: Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400,
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
