import { getToken, isAuthenticated } from './auth'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionData {
  sessionId: string
  date: string
  userSub: string
  status: 'playing' | 'solved' | 'failed'
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  case: import('./game/caseModel').Case
}

const authHeaders = (): Record<string, string> => {
  const token = isAuthenticated() ? getToken() : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const startDaily = async (sessionId?: string): Promise<SessionData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  }
  const body: Record<string, unknown> = {}
  if (sessionId) body.sessionId = sessionId

  const res = await fetch(`${BASE}/api/daily/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
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
