import assert from 'node:assert/strict'
import { build } from '../api/node_modules/esbuild/lib/main.js'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = resolve(import.meta.dirname, '..')
const storage = new Map()
const session = new Map()
const storageAdapter = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) })
globalThis.localStorage = storageAdapter(storage)
globalThis.sessionStorage = storageAdapter(session)
globalThis.window = { location: { origin: 'https://preview.invalid', href: 'https://preview.invalid/login', search: '' } }
globalThis.fetch = () => { throw new Error('Preview authentication must not make network requests') }

async function loadAuth(preview) {
  const outfile = resolve(root, `node_modules/.cache/test-auth-${preview}.mjs`)
  await build({ entryPoints: [resolve(root, 'src/auth.ts')], bundle: true, platform: 'node', format: 'esm', outfile,
    define: { 'import.meta.env': JSON.stringify({ VITE_CODEX_PREVIEW: String(preview), VITE_COGNITO_DOMAIN: 'auth.example.invalid', VITE_COGNITO_CLIENT_ID: 'test-client' }) } })
  return { auth: await import(pathToFileURL(outfile).href), outfile }
}
const { auth, outfile } = await loadAuth(true)
assert.equal(auth.isAuthenticated(), false)
assert.equal(await auth.ensureValidSession(), false)
storage.set('pokemystery:codex-preview:v1', '{}')
assert.equal(auth.startPreviewSession(), true)
assert.equal(auth.isAuthenticated(), true)
assert.equal(await auth.ensureValidSession(), true)
assert.equal(await auth.refreshSession(), true)
assert.equal(auth.getUserProfile().name, 'Preview Detective')
assert.equal(auth.getToken(), null)
assert.equal(auth.getAccessToken(), null)
assert.equal([...storage.keys()].some(key => key.startsWith('cognito-')), false)
const reloaded = await import(pathToFileURL(outfile).href + '?reload')
assert.equal(reloaded.isAuthenticated(), true)
assert.equal(await auth.handleCallback(), false)
const locationBeforeLogout = window.location.href
auth.logout()
assert.equal(window.location.href, locationBeforeLogout)
assert.equal(auth.isAuthenticated(), false)
assert.equal(auth.getUserProfile(), null)
assert.equal(storage.get('pokemystery:codex-preview:v1'), '{}')
console.log('Preview: local sign-in, reload, no tokens/network, sign-out, and preserved game progress passed')

const prod = (await loadAuth(false)).auth
storage.set('pokemystery:codex-preview:account:v1', 'signed-in')
assert.equal(prod.startPreviewSession(), false)
assert.equal(prod.isAuthenticated(), false)
assert.equal(await prod.ensureValidSession(), false)
const payload = Buffer.from(JSON.stringify({ sub: 'test-user', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')
const testToken = `test.${payload}.test`
storage.set('cognito-id-token', testToken)
assert.equal(prod.getToken(), testToken)
assert.equal(prod.isAuthenticated(), true)
assert.equal(await prod.ensureValidSession(), true)
prod.clearAuth()
await prod.loginWithGoogle()
const googleUrl = new URL(window.location.href)
assert.equal(googleUrl.origin, 'https://auth.example.invalid')
assert.equal(googleUrl.searchParams.get('identity_provider'), 'Google')
assert.equal(googleUrl.searchParams.get('code_challenge_method'), 'S256')
assert.ok(googleUrl.searchParams.get('state'))
await prod.loginWithEmail()
assert.equal(new URL(window.location.href).searchParams.get('identity_provider'), 'COGNITO')
console.log('Production: preview bypass disabled; token sessions and real OAuth/PKCE links retained')

const apiFile = resolve(root, 'node_modules/.cache/test-preview-account-api.mjs')
await build({ entryPoints: [resolve(root, 'src/preview/api.ts')], bundle: true, platform: 'node', format: 'esm', outfile: apiFile })
const { previewFetch } = await import(pathToFileURL(apiFile).href)
const initial = await (await previewFetch('/api/reminder-preferences')).json()
assert.deepEqual(initial, { dailyReminderEmails: false, unfinishedCaseReminderEmails: false, newsAndUpdatesEmails: false })
const preferences = { dailyReminderEmails: true, unfinishedCaseReminderEmails: true, newsAndUpdatesEmails: false }
assert.equal((await previewFetch('/api/reminder-preferences', { method: 'POST', body: JSON.stringify(preferences) })).status, 200)
assert.deepEqual(await (await previewFetch('/api/reminder-preferences')).json(), preferences)
assert.equal((await previewFetch('/api/reminder-preferences', { method: 'POST', body: '{}' })).status, 400)
assert.deepEqual(await (await previewFetch('/api/history/backfill', { method: 'POST' })).json(), { generatedCaseIds: [], complete: true })
console.log('Preview account API: reminder preferences persist locally; history backfill completes without a backend')

const loginFile = resolve(root, 'node_modules/.cache/test-preview-login-page.mjs')
await build({ entryPoints: [resolve(root, 'src/routes/LoginRoute.tsx')], bundle: true, platform: 'node', format: 'esm', outfile: loginFile, jsx: 'automatic', external: ['react', 'react/jsx-runtime'] })
const { LoginRoute } = await import(pathToFileURL(loginFile).href)
const props = { onGoogleLogin() {}, onEmailLogin() {} }
const demo = renderToStaticMarkup(React.createElement(LoginRoute, { ...props, onPreviewLogin() {} }))
assert.ok(demo.includes('Continue as Preview Detective'))
assert.ok(demo.includes('Progress stays in this browser'))
assert.ok(!demo.includes('Continue with Google'))
const actual = renderToStaticMarkup(React.createElement(LoginRoute, props))
assert.ok(actual.includes('Continue with Google'))
assert.ok(actual.includes('Sign in with email'))
assert.ok(!actual.includes('Continue as Preview Detective'))
console.log('Login page: demo and real sign-in controls remain clearly separated')
