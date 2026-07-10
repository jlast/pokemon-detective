import { getToken, isAuthenticated } from './auth'
import type { Case } from './game/caseModel'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionResponse {
  case: Case
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  status: 'playing' | 'solved' | 'failed'
}

const authHeaders = (): Record<string, string> => {
  const token = isAuthenticated() ? getToken() : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const enc = encodeURIComponent

export const getCurrentCase = async (): Promise<Case> => {
  const res = await fetch(`${BASE}/api/cases/current`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.case
}

export const investigate = async (
  caseId: string,
  locationId: string,
  actionId: string,
): Promise<SessionResponse> => {
  const res = await fetch(
    `${BASE}/api/cases/${enc(caseId)}/investigate/${enc(locationId)}/${enc(actionId)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } },
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
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ cleared }) },
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
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
