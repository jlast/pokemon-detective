import type { Case } from '../game/caseModel'
import { getClueCollectionKey } from '../game/caseModel'
import type { SessionResponse } from '../api'

const PREFERENCES_KEY = 'pokemystery:codex-preview:reminder-preferences:v1'
const STORAGE_KEY = 'pokemystery:codex-preview:v1'
let fixtures: Promise<Record<string, Case>> | undefined
const visibleSession = (session: SessionResponse): SessionResponse => {
  const visible = structuredClone(session)
  visible.case.evidence = []
  if (visible.status === 'playing') {
    visible.case.culpritPokemonId = 0
    visible.case.solution = undefined
  }
  visible.case.locations = visible.case.locations.map(location => location.investigated ? location : ({
    ...location,
    actions: location.actions.map(action => ({ ...action, observationText: '',
      observationTextSmall: undefined, observationTextMedium: undefined, observationTextLarge: undefined,
      evidenceId: undefined, evidenceTitle: undefined, evidenceText: undefined,
      evidenceBadges: undefined, implicationText: undefined,
      clueRule: action.clueRule ? { ...action.clueRule, matchingValues: [] } : undefined,
    })),
  }))
  return visible
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
})

export async function previewFetch(input: string, init?: RequestInit): Promise<Response> {
  const path = new URL(input, window.location.origin).pathname
  const method = init?.method ?? 'GET'
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, SessionResponse>
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  if (path === '/api/history/backfill' && method === 'POST') {
    return response({ generatedCaseIds: [], complete: true })
  }
  if (path === '/api/reminder-preferences') {
    const defaults = { dailyReminderEmails: false, unfinishedCaseReminderEmails: false, newsAndUpdatesEmails: false }
    if (method === 'GET') return response(JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? JSON.stringify(defaults)))
    if (method !== 'POST') return response({ error: 'Method not allowed' }, 405)
    const body = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as Record<string, unknown>
    if (Object.keys(defaults).some(key => typeof body[key] !== 'boolean')) return response({ error: 'Invalid preferences' }, 400)
    const preferences = { dailyReminderEmails: body.dailyReminderEmails, unfinishedCaseReminderEmails: body.unfinishedCaseReminderEmails, newsAndUpdatesEmails: body.newsAndUpdatesEmails }
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    return response(preferences)
  }
  if (path === '/api/pokedex') {
    const games = Object.values(saved)
    return response({
      seenPokemonIds: [...new Set(games.flatMap(g => g.case.suspects.map(s => s.pokemonId)))],
      unlockedPokemonIds: games.filter(g => g.status === 'solved').map(g => g.case.culpritPokemonId),
      seenShinyPokemonIds: [], unlockedShinyPokemonIds: [], caseStreak: 0,
    })
  }
  if (path === '/api/history') {
    const games = Object.values(saved)
    return response({ items: games.map(g => ({ caseId: g.case.id, status: g.status,
      caseTitle: g.case.title, difficulty: g.case.difficulty, guessCount: g.accusationHistory.length })),
      solvedCount: games.filter(g => g.status === 'solved').length,
      failedCount: games.filter(g => g.status === 'failed').length,
      unsolvedCount: games.filter(g => g.status === 'playing').length, currentStreak: 0 })
  }
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] !== 'api' || parts[1] !== 'cases' || !parts[2]) {
    return response({ error: 'This feature requires the deployed backend and is unavailable in preview.' }, 501)
  }
  const caseId = parts[2] === 'current' ? `${new Date().toISOString().slice(0, 10)}-easy` : parts[2]
  if (!/^\d{4}-\d{2}-\d{2}-(easy|hard)$/.test(caseId)) return response({ error: 'Invalid preview case' }, 400)
  fixtures ??= fetch('/preview-cases.json').then(async r => {
    if (!r.ok) throw new Error('Run npm run preview:prepare before starting preview mode.')
    return r.json() as Promise<Record<string, Case>>
  })
  const templates = await fixtures
  // Re-read after loading assets so concurrent first requests cannot overwrite progress.
  Object.assign(saved, JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'))
  if (!saved[caseId]) {
    const game = structuredClone(templates[caseId.endsWith('-hard') ? 'hard' : 'easy'])
    game.id = caseId
    saved[caseId] = { case: game, investigationsRemaining: game.maxInvestigations,
      accusationsRemaining: 3, accusationHistory: [], status: 'playing', caseStreak: 0 }
    persist()
  }
  const session = saved[caseId]
  if (method === 'GET' && parts.length === 3) return response(visibleSession(session))
  const body = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as { witnessPokemonId?: number; cleared?: boolean }
  if (parts[3] === 'suspects' && parts[5] === 'clear') {
    const suspect = session.case.suspects.find(s => s.pokemonId === Number(parts[4]))
    if (!suspect) return response({ error: 'Unknown suspect' }, 404)
    suspect.manuallyRuledOut = body.cleared ?? true
    suspect.noteStatus = suspect.manuallyRuledOut ? 'ruled-out' : 'suspect'
    persist()
    return response(visibleSession(session))
  }
  if (session.status !== 'playing') return response({ error: 'Case is already over' }, 400)
  if (parts[3] === 'investigate') {
    const location = session.case.locations.find(l => l.id === parts[4])
    const action = location?.actions.find(a => a.id === parts[5])
    if (!location || !action) return response({ error: 'Unknown lead' }, 404)
    if (location.investigated || session.investigationsRemaining <= 0) return response({ error: 'Lead unavailable' }, 400)
    const collectedKeys = session.case.locations.filter(l => l.investigated).map(l => {
      const selected = l.actions.find(a => a.id === l.selectedActionId)
      return selected ? getClueCollectionKey(selected) : null
    })
    if (collectedKeys.includes(getClueCollectionKey(action))) return response({ error: 'Clue already collected' }, 400)
    if (action.outcomeType === 'witness' && (!body.witnessPokemonId || !action.witnessPokemonIds?.includes(body.witnessPokemonId))) {
      return response({ error: 'Select a valid witness' }, 400)
    }
    const evidence = session.case.evidence.find(e => e.id === action.evidenceId)
    const result = { locationId: location.id, actionId: action.id, outcomeType: action.outcomeType,
      observationText: action.observationText, evidenceId: action.evidenceId ?? undefined,
      evidenceTitle: action.evidenceTitle ?? evidence?.title,
      evidenceText: action.evidenceText ?? evidence?.clueText,
      evidenceBadges: action.evidenceBadges ?? evidence?.badges, witnessPokemonId: body.witnessPokemonId }
    Object.assign(location, result, { investigated: true, selectedActionId: action.id })
    session.investigationsRemaining -= 1
    persist()
    return response({ ...visibleSession(session), result })
  }
  if (parts[3] === 'accuse') {
    const suspectId = Number(parts[4])
    if (!session.case.suspects.some(s => s.pokemonId === suspectId) || session.accusationHistory.includes(suspectId)) {
      return response({ error: 'Invalid or repeated accusation' }, 400)
    }
    session.accusationHistory.push(suspectId)
    if (suspectId === session.case.culpritPokemonId) session.status = 'solved'
    else {
      session.accusationsRemaining -= 1
      if (session.accusationsRemaining <= 0) session.status = 'failed'
    }
    session.case.status = session.status === 'playing' ? 'active' : session.status
    persist()
    return response(visibleSession(session))
  }
  return response({ error: 'This action requires the deployed backend.' }, 501)
}
