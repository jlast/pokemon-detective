import { ensureValidSession, getPlayerSessionId, getToken } from './auth'
import type { Case, EvidenceBadgeData } from './game/caseModel'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionResponse {
  case: Case
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  status: 'playing' | 'solved' | 'failed'
  caseStats?: CaseStatsResponse
  caseStreak?: number
}

export interface CaseStatsResponse {
  completedCount: number
  solvedCount: number
  totalGuessCount: number
  solveRate: number | null
  averageGuesses: number | null
}

export interface InvestigationResponse {
  result: {
    locationId: string
    actionId: string
    outcomeType: string
    observationText: string
    evidenceId?: string
    evidenceTitle?: string
    evidenceText?: string
    evidenceBadges?: EvidenceBadgeData[]
    witnessPokemonId?: number
  }
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  status: 'playing' | 'solved' | 'failed'
}

export interface PokedexResponse {
  seenPokemonIds: number[]
  unlockedPokemonIds: number[]
  seenShinyPokemonIds: number[]
  unlockedShinyPokemonIds: number[]
  caseStreak?: number
}

export interface CaseFeedbackPayload {
  enjoymentRating: number
  comment?: string
}

export interface ReminderPreferencesResponse {
  dailyReminderEmails: boolean
  unfinishedCaseReminderEmails: boolean
}

const authHeaders = async (): Promise<Record<string, string>> => {
  const token = await ensureValidSession() ? getToken() : null
  return token ? { Authorization: `Bearer ${token}` } : { 'X-Player-Session-Id': getPlayerSessionId() }
}

const enc = encodeURIComponent

export const getCurrentCase = async (): Promise<SessionResponse> => {
  const res = await fetch(`${BASE}/api/cases/current`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const getPokedex = async (): Promise<PokedexResponse> => {
  const res = await fetch(`${BASE}/api/pokedex`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const getReminderPreferences = async (): Promise<ReminderPreferencesResponse> => {
  const res = await fetch(`${BASE}/api/reminder-preferences`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const updateReminderPreferences = async (
  preferences: ReminderPreferencesResponse,
): Promise<ReminderPreferencesResponse> => {
  const res = await fetch(
    `${BASE}/api/reminder-preferences`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...await authHeaders() },
      body: JSON.stringify(preferences),
    },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const investigate = async (
  caseId: string,
  locationId: string,
  actionId: string,
  witnessPokemonId?: number,
): Promise<InvestigationResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/investigate/${enc(locationId)}/${enc(actionId)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...await authHeaders() },
      body: JSON.stringify(witnessPokemonId ? { witnessPokemonId } : {}),
    },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const clearSuspect = async (
  caseId: string,
  suspectId: number,
  cleared: boolean,
): Promise<SessionResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/suspects/${suspectId}/clear`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...await authHeaders() }, body: JSON.stringify({ cleared }) },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const accuse = async (
  caseId: string,
  suspectId: number,
  progress?: { accusationHistory: number[], accusationsRemaining: number },
): Promise<SessionResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/accuse/${suspectId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...await authHeaders() },
      body: progress ? JSON.stringify(progress) : undefined,
    },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const submitCaseFeedback = async (
  caseId: string,
  payload: CaseFeedbackPayload,
): Promise<{ submitted: true }> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...await authHeaders() },
      body: JSON.stringify(payload),
    },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
