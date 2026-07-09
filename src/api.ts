import { getToken, isAuthenticated } from './auth'
import type { Case } from './game/caseModel'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionData {
  sessionId: string
  date: string
  userSub: string
  status: 'playing' | 'solved' | 'failed'
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  case: Case
}

const authHeaders = (): Record<string, string> => {
  const token = isAuthenticated() ? getToken() : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getDailyCase = async (): Promise<Case> => {
  const res = await fetch(`${BASE}/api/daily/case`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const startDaily = async (): Promise<SessionData> => {
  const res = await fetch(`${BASE}/api/daily/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: '{}',
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const investigate = async (
  sessionId: string,
  locationId: string,
  actionId: string,
): Promise<SessionData> => {
  const res = await fetch(
    `${BASE}/api/daily/${sessionId}/investigate/${locationId}/${actionId}`,
    { method: 'POST', headers: authHeaders() },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const accuse = async (
  sessionId: string,
  suspectId: number,
): Promise<SessionData> => {
  const res = await fetch(
    `${BASE}/api/daily/${sessionId}/accuse/${suspectId}`,
    { method: 'POST', headers: authHeaders() },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const getSession = async (sessionId: string): Promise<SessionData> => {
  const res = await fetch(`${BASE}/api/daily/${sessionId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
