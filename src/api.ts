import { ensureValidSession, getToken } from './auth'
import type { Case } from './game/caseModel'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionResponse {
  case: Case
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  status: 'playing' | 'solved' | 'failed'
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
}

const authHeaders = async (): Promise<Record<string, string>> => {
  const token = await ensureValidSession() ? getToken() : null
  return token ? { Authorization: `Bearer ${token}` } : {}
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

export const investigate = async (
  caseId: string,
  locationId: string,
  actionId: string,
): Promise<InvestigationResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/investigate/${enc(locationId)}/${enc(actionId)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...await authHeaders() } },
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
): Promise<SessionResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/accuse/${suspectId}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...await authHeaders() } },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
