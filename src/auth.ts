const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN ?? 'pokemon-detective'
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION ?? 'us-east-1'
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID ?? ''
const COGNITO_URL = `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com`

const TOKEN_KEY = 'cognito-id-token'
const PROFILE_KEY = 'cognito-user-profile'

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

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
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
    clearAuth()
    return false
  }

  return true
}

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

export const login = (): void => {
  const redirectUri = `${window.location.origin}/callback`
  const state = Math.random().toString(36).slice(2)
  sessionStorage.setItem('oauth-state', state)

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: 'token',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
    state,
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

export const handleCallback = (): boolean => {
  const hash = window.location.hash.slice(1)
  if (!hash) return false

  const params = new URLSearchParams(hash)
  const token = params.get('id_token')

  if (!token) return false

  localStorage.setItem(TOKEN_KEY, token)

  const payload = decodeJwt(token)
  if (payload) {
    const profile: UserProfile = {
      sub: (payload.sub as string) ?? '',
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }

  window.location.hash = ''
  return true
}
