const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN ?? 'pokemon-detective'
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION ?? 'us-east-1'
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID ?? ''
const COGNITO_URL = `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com`

const TOKEN_KEY = 'cognito-id-token'
const ACCESS_TOKEN_KEY = 'cognito-access-token'
const REFRESH_TOKEN_KEY = 'cognito-refresh-token'
const PROFILE_KEY = 'cognito-user-profile'
const OAUTH_STATE_KEY = 'oauth-state'
const PKCE_VERIFIER_KEY = 'oauth-pkce-verifier'
const EXPIRY_BUFFER_MS = 5 * 60 * 1000

export interface UserProfile {
  sub: string
  email?: string
  name?: string
  picture?: string
}

const decodeJwt = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

const base64UrlEncode = (value: ArrayBuffer): string => {
  const bytes = new Uint8Array(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const createRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const random = new Uint8Array(length)
  crypto.getRandomValues(random)
  return Array.from(random, (byte) => chars[byte % chars.length]).join('')
}

const createCodeChallenge = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64UrlEncode(digest)
}

interface TokenResponse {
  id_token?: string
  access_token?: string
  refresh_token?: string
}

const saveTokens = (tokens: TokenResponse): void => {
  if (tokens.id_token) localStorage.setItem(TOKEN_KEY, tokens.id_token)
  if (tokens.access_token) localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  if (tokens.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)

  const token = tokens.id_token ?? getToken()
  const payload = token ? decodeJwt(token) : null
  if (payload) {
    const profile: UserProfile = {
      sub: (payload.sub as string) ?? '',
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getUserProfile = (): UserProfile | null => {
  const raw = localStorage.getItem(PROFILE_KEY)
  return raw ? (JSON.parse(raw) as UserProfile) : null
}

export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  const payload = decodeJwt(token)
  if (!payload) return false

  const exp = payload.exp as number | undefined
  if (exp && exp * 1000 < Date.now()) {
    if (localStorage.getItem(REFRESH_TOKEN_KEY)) return true
    clearAuth()
    return false
  }

  return true
}

const shouldRefreshToken = (token: string): boolean => {
  const payload = decodeJwt(token)
  const exp = payload?.exp as number | undefined
  return !exp || exp * 1000 - EXPIRY_BUFFER_MS < Date.now()
}

export const refreshSession = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return false

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: COGNITO_CLIENT_ID,
    refresh_token: refreshToken,
  })

  const res = await fetch(`${COGNITO_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    clearAuth()
    return false
  }

  saveTokens(await res.json() as TokenResponse)
  return true
}

export const ensureValidSession = async (): Promise<boolean> => {
  const token = getToken()
  if (!token) return false
  if (!shouldRefreshToken(token)) return true
  return refreshSession()
}

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(PROFILE_KEY)
  sessionStorage.removeItem(OAUTH_STATE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
}

export const login = async (): Promise<void> => {
  const redirectUri = `${window.location.origin}/callback`
  const state = createRandomString(32)
  const verifier = createRandomString(96)
  const challenge = await createCodeChallenge(verifier)
  sessionStorage.setItem(OAUTH_STATE_KEY, state)
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    identity_provider: 'Google',
  })
  window.location.href = `${COGNITO_URL}/oauth2/authorize?${params.toString()}`
}

export const logout = (): void => {
  clearAuth()
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    logout_uri: window.location.origin,
  })
  window.location.href = `${COGNITO_URL}/logout?${params.toString()}`
}

export const handleCallback = async (): Promise<boolean> => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)

  sessionStorage.removeItem(OAUTH_STATE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)

  if (!code || !state || state !== expectedState || !verifier) return false

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: `${window.location.origin}/callback`,
    code_verifier: verifier,
  })

  const res = await fetch(`${COGNITO_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    clearAuth()
    return false
  }

  saveTokens(await res.json() as TokenResponse)

  return true
}
