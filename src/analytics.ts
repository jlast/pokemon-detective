const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''
const ATTRIBUTION_KEY = 'pokemon-detective-attribution'
const VISIT_HISTORY_KEY = 'pokemon-detective-visit-history'
const COMPLETED_CASE_DATES_KEY = 'pokemon-detective-completed-case-dates'
const STARTED_CASE_IDS_KEY = 'pokemon-detective-started-case-ids'
const REMINDER_CONVERSION_DATES_KEY = 'pokemon-detective-reminder-conversion-dates'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

type AnalyticsValue = string | number | boolean | null | undefined

interface AttributionData {
  source: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  referrer?: string
  reminder: boolean
}

interface VisitHistory {
  firstSeenDate: string
  lastSeenDate: string
  returningUserTrackedDate?: string
}

interface GameplayEventParams {
  caseId: string
  authed: boolean
  status?: 'playing' | 'solved' | 'failed'
  investigationsRemaining?: number
  investigationsUsed?: number
  accusationsRemaining?: number
  wrongAccusationCount?: number
  suspectId?: number
  locationId?: string
  actionId?: string
  witnessPokemonId?: number
}

const getUtcDate = (): string => new Date().toISOString().slice(0, 10)

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const getSearchParams = (): URLSearchParams => {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

const normalizeSource = (value: string | null | undefined): string | undefined => {
  const source = value?.trim().toLowerCase()
  return source || undefined
}

const readAttributionFromUrl = (): AttributionData | null => {
  if (typeof window === 'undefined') return null

  const params = getSearchParams()
  const utmSource = normalizeSource(params.get('utm_source'))
  const source = normalizeSource(params.get('source'))
  const reminderParam = normalizeSource(params.get('reminder'))
  const isReminder = reminderParam === '1'
    || reminderParam === 'true'
    || utmSource === 'reminder'
    || source === 'reminder'

  if (!utmSource && !source && !document.referrer && !isReminder) return null

  let referrerSource: string | undefined
  if (document.referrer) {
    try {
      referrerSource = new URL(document.referrer).hostname.replace(/^www\./, '')
    } catch {
      referrerSource = document.referrer
    }
  }

  return {
    source: utmSource ?? source ?? referrerSource ?? 'direct',
    medium: params.get('utm_medium') ?? undefined,
    campaign: params.get('utm_campaign') ?? undefined,
    content: params.get('utm_content') ?? undefined,
    term: params.get('utm_term') ?? undefined,
    referrer: document.referrer || undefined,
    reminder: isReminder,
  }
}

const getAttribution = (): AttributionData => {
  if (typeof window === 'undefined') return { source: 'direct', reminder: false }

  const fromUrl = readAttributionFromUrl()
  const stored = safeParse<AttributionData>(localStorage.getItem(ATTRIBUTION_KEY))
  const attribution = stored ?? fromUrl ?? { source: 'direct', reminder: false }

  if (!stored || fromUrl?.reminder) {
    const next = fromUrl?.reminder && stored ? { ...stored, ...fromUrl, reminder: true } : attribution
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next))
    return next
  }

  return attribution
}

const getAttributionParams = (): Record<string, AnalyticsValue> => {
  const attribution = getAttribution()
  return {
    referral_source: attribution.source,
    referral_medium: attribution.medium,
    referral_campaign: attribution.campaign,
    referral_content: attribution.content,
    referral_term: attribution.term,
    referral_referrer: attribution.referrer,
    reminder_attributed: attribution.reminder,
  }
}

const getVisitHistory = (): VisitHistory | null => {
  if (typeof window === 'undefined') return null
  return safeParse<VisitHistory>(localStorage.getItem(VISIT_HISTORY_KEY))
}

const dateDiffDays = (from: string, to: string): number => {
  const fromMs = Date.parse(`${from}T00:00:00.000Z`)
  const toMs = Date.parse(`${to}T00:00:00.000Z`)
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0
  return Math.max(Math.round((toMs - fromMs) / 86400000), 0)
}

const getCompletedCaseDates = (): string[] => {
  if (typeof window === 'undefined') return []
  const dates = safeParse<string[]>(localStorage.getItem(COMPLETED_CASE_DATES_KEY))
  return Array.isArray(dates) ? dates : []
}

const getStringList = (key: string): string[] => {
  if (typeof window === 'undefined') return []
  const values = safeParse<string[]>(localStorage.getItem(key))
  return Array.isArray(values) ? values : []
}

const calculateStreak = (dates: string[]): number => {
  const completedDates = new Set(dates)
  const current = new Date(`${getUtcDate()}T00:00:00.000Z`)
  let streak = 0

  while (completedDates.has(current.toISOString().slice(0, 10))) {
    streak += 1
    current.setUTCDate(current.getUTCDate() - 1)
  }

  return streak
}

const initializeGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || initialized || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.gtag = window.gtag ?? function gtag() {
    window.dataLayer?.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.append(script)

  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  initialized = true
}

export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  initializeGoogleAnalytics()
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    ...getAttributionParams(),
  })
}

export const trackEvent = (name: string, params: Record<string, AnalyticsValue> = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  initializeGoogleAnalytics()
  window.gtag?.('event', name, {
    ...getAttributionParams(),
    ...params,
  })
}

export const trackReferralSource = () => {
  const attribution = getAttribution()
  trackEvent('referral_source_captured', {
    referral_source: attribution.source,
    referral_medium: attribution.medium,
    referral_campaign: attribution.campaign,
    referral_referrer: attribution.referrer,
  })
}

export const trackReminderConversion = () => {
  if (!readAttributionFromUrl()?.reminder) return

  const today = getUtcDate()
  const trackedDates = getStringList(REMINDER_CONVERSION_DATES_KEY)
  if (trackedDates.includes(today)) return

  localStorage.setItem(REMINDER_CONVERSION_DATES_KEY, JSON.stringify([...trackedDates, today]))

  trackEvent('reminder_conversion', {
    conversion_type: 'site_visit',
  })
}

export const trackReturningUser = () => {
  if (typeof window === 'undefined') return

  const today = getUtcDate()
  const history = getVisitHistory()
  if (!history) {
    localStorage.setItem(VISIT_HISTORY_KEY, JSON.stringify({ firstSeenDate: today, lastSeenDate: today }))
    return
  }

  if (history.lastSeenDate !== today && history.returningUserTrackedDate !== today) {
    trackEvent('returning_user', {
      days_since_first_seen: dateDiffDays(history.firstSeenDate, today),
      days_since_last_seen: dateDiffDays(history.lastSeenDate, today),
    })
  }

  localStorage.setItem(VISIT_HISTORY_KEY, JSON.stringify({
    ...history,
    lastSeenDate: today,
    returningUserTrackedDate: history.lastSeenDate !== today ? today : history.returningUserTrackedDate,
  }))
}

export const trackCaseStarted = (params: GameplayEventParams) => {
  if (typeof window !== 'undefined') {
    const startedCaseIds = getStringList(STARTED_CASE_IDS_KEY)
    if (startedCaseIds.includes(params.caseId)) return
    localStorage.setItem(STARTED_CASE_IDS_KEY, JSON.stringify([...startedCaseIds, params.caseId]))
  }

  trackEvent('case_started', {
    case_id: params.caseId,
    authenticated: params.authed,
    investigations_remaining: params.investigationsRemaining,
    accusations_remaining: params.accusationsRemaining,
  })
}

export const trackInvestigation = (params: GameplayEventParams) => {
  trackEvent('investigation_completed', {
    case_id: params.caseId,
    authenticated: params.authed,
    location_id: params.locationId,
    action_id: params.actionId,
    witness_pokemon_id: params.witnessPokemonId,
    investigations_remaining: params.investigationsRemaining,
    investigations_used: params.investigationsUsed,
  })
}

export const trackCaseCompleted = (params: GameplayEventParams) => {
  trackEvent('case_completed', {
    case_id: params.caseId,
    authenticated: params.authed,
    suspect_id: params.suspectId,
    investigations_used: params.investigationsUsed,
    accusations_remaining: params.accusationsRemaining,
    wrong_accusation_count: params.wrongAccusationCount,
  })
}

export const trackCaseFailed = (params: GameplayEventParams) => {
  trackEvent('case_failed', {
    case_id: params.caseId,
    authenticated: params.authed,
    suspect_id: params.suspectId,
    investigations_used: params.investigationsUsed,
    wrong_accusation_count: params.wrongAccusationCount,
  })
}

export const trackStreak = (caseId: string, status: 'solved' | 'failed') => {
  if (typeof window === 'undefined') return

  const caseDate = caseId || getUtcDate()
  const dates = getCompletedCaseDates()
  const nextDates = dates.includes(caseDate) ? dates : [...dates, caseDate].sort()
  localStorage.setItem(COMPLETED_CASE_DATES_KEY, JSON.stringify(nextDates))

  trackEvent('streak_updated', {
    case_id: caseId,
    case_status: status,
    streak_days: calculateStreak(nextDates),
  })
}
