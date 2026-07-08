const BASE = import.meta.env.VITE_API_BASE ?? ''

export interface SessionData {
  sessionId: string
  date: string
  status: 'playing' | 'solved' | 'failed'
  investigationsRemaining: number
  accusationsRemaining: number
  accusationHistory: number[]
  case: import('./game/caseModel').Case
}

export const startDaily = async (sessionId?: string): Promise<SessionData> => {
  const res = await fetch(`${BASE}/api/daily/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
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
    { method: 'POST' },
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
    { method: 'POST' },
  )
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const getSession = async (sessionId: string): Promise<SessionData> => {
  const res = await fetch(`${BASE}/api/daily/${sessionId}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
