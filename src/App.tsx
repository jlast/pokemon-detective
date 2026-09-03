import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { DesktopSidebar } from './components/DesktopSidebar'
import { Header } from './components/Header'
import { AccuseRoute } from './routes/AccuseRoute'
import { AdminRoute } from './routes/AdminRoute'
import { LoginRoute } from './routes/LoginRoute'
import { CaseOverviewRoute } from './routes/CaseOverviewRoute'
import { CaseRoute } from './routes/CaseRoute'
import { EndingRoute } from './routes/EndingRoute'
import { InvestigationLocationRoute } from './routes/InvestigationLocationRoute'
import { FeedbackRoute } from './routes/FeedbackRoute'
import { HistoryRoute } from './routes/HistoryRoute'
import { HowToPlayRoute } from './routes/HowToPlayRoute'
import { PokedexRoute } from './routes/PokedexRoute'
import { SettingsRoute } from './routes/SettingsRoute'
import { SuspectFileRoute } from './routes/SuspectFileRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'
import {
  getCurrentCase,
  getCase,
  getAdminSession,
  getReminderPreferences,
  updateReminderPreferences,
  investigate as apiInvestigate,
  accuse as apiAccuse,
  clearSuspect as apiClearSuspect,
  type CaseStatsResponse,
  type ReminderPreferencesResponse,
} from './api'
import {
  trackCaseCompleted,
  trackCaseFailed,
  trackCaseStarted,
  trackInvestigation,
  trackEvent,
  trackPageView,
  trackReferralSource,
  trackReminderConversion,
  trackReturningUser,
  trackStreak,
} from './analytics'
import { allCases } from './game/cases'
import type { Case, Suspect, SuspectNoteStatus } from './game/caseModel'
import {
  CALLBACK_PATH,
  FEEDBACK_PATH,
  HISTORY_PATH,
  HOW_TO_PLAY_PATH,
  LOGIN_PATH,
  POKEDEX_PATH,
  ROOT_PATH,
  SETTINGS_PATH,
  ADMIN_PATH,
  TODAY_ACCUSE_PATH,
  TODAY_ACCUSE_ROUTE,
  TODAY_ENDING_PATH,
  TODAY_ENDING_ROUTE,
  TODAY_INVESTIGATION_PATH,
  TODAY_INVESTIGATION_LOCATION_ROUTE,
  TODAY_PATH,
  TODAY_SUSPECT_FILE_ROUTE,
  TODAY_SUSPECTS_PATH,
  accusationPath,
  endingPath,
  investigationLocationPath,
  suspectPath,
} from './paths'
import {
  isAuthenticated,
  loginWithEmail,
  loginWithGoogle,
  logout as authLogout,
  handleCallback,
  getUserProfile,
  ensureValidSession,
  type UserProfile,
} from './auth'

type DailyPuzzleDifficulty = 'easy' | 'hard'

const getTodayCaseDate = () => new Date().toISOString().slice(0, 10)
const getDailyCaseId = (date: string, difficulty: DailyPuzzleDifficulty) => `${date}-${difficulty}`
const getTodayCaseId = (difficulty: DailyPuzzleDifficulty = 'easy') => getDailyCaseId(getTodayCaseDate(), difficulty)
const getCaseDate = (caseId: string) => caseId.slice(0, 10)
const getCaseDifficulty = (caseId: string): DailyPuzzleDifficulty => caseId.endsWith('-hard') ? 'hard' : 'easy'
const CASE_ID_PATTERN = /^\d{4}-\d{2}-\d{2}(?:-(?:easy|hard))?$/
const MAX_ACCUSATIONS = 3
const ENABLE_DAILY_REMINDER_OPT_IN = true
const DEFAULT_REMINDER_PREFERENCES: ReminderPreferencesResponse = {
  dailyReminderEmails: false,
  unfinishedCaseReminderEmails: true,
}

type RouteTitleContext = {
  pathname: string
  currentCase: Case | null
}

type RouteTitle = string | ((context: RouteTitleContext) => string)

type RouteConfig = {
  url: string
  title: RouteTitle
  outlet: ReactNode
}

const caseFileTitle = ({ currentCase }: RouteTitleContext): string => (
  currentCase ? `Case Overview` : 'Loading Case File'
)

const getRouteParamPrefix = (routePath: string) => routePath.slice(0, routePath.indexOf(':'))

const getNamedRouteParam = (pathname: string, routePaths: readonly string[]): string | undefined => {
  for (const routePath of routePaths) {
    const prefix = getRouteParamPrefix(routePath)
    if (pathname.startsWith(prefix)) return pathname.slice(prefix.length).split('/')[0]
  }
}

const getDynamicRoutePageName = (
  pageNameKind: 'investigation-location' | 'suspect-file' | 'accuse' | 'ending',
  routeParam: string,
  currentCase: Case,
) => {
  if (pageNameKind === 'investigation-location') {
    const locationName = currentCase.locations.find((location) => location.id === routeParam)?.name
    return locationName ? `${locationName} Lead` : undefined
  }

  if (pageNameKind === 'suspect-file') {
    const suspectName = currentCase.suspects.find((suspect) => suspect.pokemonId === Number(routeParam))?.name
    return suspectName ? `${suspectName} Dossier` : undefined
  }

  if (pageNameKind === 'accuse') {
    const suspectName = currentCase.suspects.find((suspect) => suspect.pokemonId === Number(routeParam))?.name
    return suspectName ? `Accuse ${suspectName}` : undefined
  }

  return ({
    solved: 'Case Solved',
    failed: 'Case Closed',
  })[routeParam]
}

const dynamicCaseTitle = (
  pageNameKind: 'investigation-location' | 'suspect-file' | 'accuse' | 'ending',
  fallbackName: string,
) => ({ pathname, currentCase }: RouteTitleContext): string => {
  if (!currentCase) return fallbackName

  const routeParam = pathname.split('/').at(-1)
  if (!routeParam) return fallbackName

  return getDynamicRoutePageName(pageNameKind, routeParam, currentCase) ?? fallbackName
}

const routeMatches = (url: string, pathname: string): boolean => {
  if (url === '*') return false
  if (!url.includes(':')) return url === pathname
  return getNamedRouteParam(pathname, [url]) !== undefined
}

const getPageName = (routes: readonly RouteConfig[], pathname: string, currentCase: Case | null): string => {
  const matchedRoute = routes.find((route) => routeMatches(route.url, pathname))
  const title = matchedRoute?.title ?? 'Daily Case File'
  return typeof title === 'function' ? title({ pathname, currentCase }) : title
}

const applyCurrentCaseAssets = (caseData: Case): Case => {
  const currentConfig = allCases.find((caseConfig) => caseConfig.id === caseData.id)
  if (!currentConfig) return caseData

  return {
    ...caseData,
    sceneImage: currentConfig.sceneImage,
    sceneImageAlt: currentConfig.sceneImageAlt,
  }
}

const AppFooter = () => (
  <footer className="app-footer" aria-label="PokéMystery links">
    <a
      className="app-footer-link app-footer-link--coffee"
      href="https://buymeacoffee.com/pokemystery"
      target="_blank"
      rel="noreferrer"
      aria-label="Support PokéMystery on Buy Me a Coffee"
    >
      <img src="/bmc-logo-yellow.png" alt="" aria-hidden="true" />
    </a>
    <a
      className="app-footer-link app-footer-link--reddit"
      href="https://www.reddit.com/r/PokeMysteryGame/"
      target="_blank"
      rel="noreferrer"
      aria-label="Visit the PokéMystery subreddit"
    >
      <img src="/reddit.png" alt="" aria-hidden="true" />
    </a>
    <a
      className="app-footer-link app-footer-link--profile"
      href="https://www.reddit.com/user/Poke-Mystery/"
      target="_blank"
      rel="noreferrer"
      aria-label="Visit Poke-Mystery on Reddit"
    >
      <img src="/reddit-user.ico" alt="" aria-hidden="true" />
    </a>
    <a
      className="app-footer-link app-footer-link--discord"
      href="https://discord.gg/8kWEYHy6d6"
      target="_blank"
      rel="noreferrer"
      aria-label="Join the PokéMystery Discord"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.3 4.4A17.4 17.4 0 0 0 16 3.1a12 12 0 0 0-.6 1.2 16.2 16.2 0 0 0-4.8 0c-.2-.4-.4-.8-.6-1.2a17 17 0 0 0-4.3 1.3C3 8.4 2.3 12.3 2.7 16.1a17.2 17.2 0 0 0 5.2 2.6c.4-.6.8-1.2 1.1-1.8-.6-.2-1.1-.5-1.6-.8l.4-.3a12.3 12.3 0 0 0 10.4 0l.4.3c-.5.3-1 .6-1.6.8.3.6.7 1.2 1.1 1.8a17 17 0 0 0 5.2-2.6c.5-4.4-.7-8.3-3-11.7ZM9.6 13.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm4.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
      </svg>
    </a>
  </footer>
)

interface DifficultySelectScreenProps {
  onSelectDifficulty: (difficulty: DailyPuzzleDifficulty) => void
}

const easySilhouettePokemonIds = [1, 4, 7, 133, 152, 158]
const hardSilhouettePokemonIds = [6, 9, 149, 248, 254, 257, 260, 376, 445]

const DifficultySilhouettes = ({ pokemonIds }: { pokemonIds: readonly number[] }) => (
  <div className="difficulty-silhouettes" aria-hidden="true">
    {pokemonIds.map((pokemonId) => (
      <span key={pokemonId} className="difficulty-silhouette-frame">
        <img src={`/sprites/${pokemonId}.png`} alt="" loading="lazy" />
      </span>
    ))}
  </div>
)

const DifficultySelectScreen = ({ onSelectDifficulty }: DifficultySelectScreenProps) => (
  <div className="main-layout-single">
    <section className="difficulty-select-screen">
      <div className="difficulty-select-grid">
        <button
          type="button"
          className="difficulty-binder difficulty-binder--easy"
          onClick={() => onSelectDifficulty('easy')}
        >
          <span className="difficulty-binder__spine" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="difficulty-select-card difficulty-select-card--easy">
            <span className="difficulty-select-card__top">
              <strong>Easy</strong>
              <span className="difficulty-select-card__meta">6 suspects</span>
              <DifficultySilhouettes pokemonIds={easySilhouettePokemonIds} />
            </span>
            <span className="difficulty-select-card__bottom">
              <span className="difficulty-select-card__copy">More varied suspects</span>
              <span className="difficulty-select-card__action">Open case →</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          className="difficulty-binder difficulty-binder--hard"
          onClick={() => onSelectDifficulty('hard')}
        >
          <span className="difficulty-binder__spine" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="difficulty-select-card difficulty-select-card--hard">
            <span className="difficulty-select-card__top">
              <strong>Hard</strong>
              <span className="difficulty-select-card__meta">9 suspects</span>
              <DifficultySilhouettes pokemonIds={hardSilhouettePokemonIds} />
            </span>
            <span className="difficulty-select-card__bottom">
              <span className="difficulty-select-card__copy">More similar suspects</span>
              <span className="difficulty-select-card__action">Open case →</span>
            </span>
          </span>
        </button>
      </div>
    </section>
  </div>
)

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const todayCaseDate = getTodayCaseDate()
  const defaultTodayCaseId = getTodayCaseId()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const requestedCaseId = searchParams.get('case')?.trim() ?? ''
  const hasSelectedCase = CASE_ID_PATTERN.test(requestedCaseId)
  const activeCaseId = useMemo(() => {
    return hasSelectedCase ? requestedCaseId : defaultTodayCaseId
  }, [defaultTodayCaseId, hasSelectedCase, requestedCaseId])
  const activeCaseDate = getCaseDate(activeCaseId)
  const activePuzzleDifficulty = getCaseDifficulty(activeCaseId)
  const isArchivedCase = activeCaseDate !== todayCaseDate
  const isDefaultTodayCase = activeCaseId === defaultTodayCaseId
  const shouldShowDifficultySelect = !hasSelectedCase && (location.pathname === ROOT_PATH || location.pathname.startsWith(TODAY_PATH))
  const shouldAttachCaseParam = hasSelectedCase || !isDefaultTodayCase
  const withActiveCase = useCallback((path: string) => (
    shouldAttachCaseParam && path.startsWith(TODAY_PATH)
      ? `${path}?case=${encodeURIComponent(activeCaseId)}`
      : path
  ), [activeCaseId, shouldAttachCaseParam])

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [investigationsRemaining, setInvestigationsRemaining] = useState(0)
  const [accusationsRemaining, setAccusationsRemaining] = useState(MAX_ACCUSATIONS)
  const [accusationHistory, setAccusationHistory] = useState<number[]>([])
  const [caseStats, setCaseStats] = useState<CaseStatsResponse | null>(null)
  const [caseStreak, setCaseStreak] = useState(0)

  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    authed ? getUserProfile() : null,
  )
  const [reminderPreferences, setReminderPreferences] = useState<ReminderPreferencesResponse>(DEFAULT_REMINDER_PREFERENCES)
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogin = useCallback(() => {
    navigate(LOGIN_PATH)
  }, [navigate])

  const handleLogout = useCallback(() => {
    authLogout()
    setIsAdmin(false)
    setReminderPreferences(DEFAULT_REMINDER_PREFERENCES)
    setReminderStatus('idle')
  }, [])

  const handleUpdateReminderPreferences = useCallback((preferences: ReminderPreferencesResponse) => {
    if (!ENABLE_DAILY_REMINDER_OPT_IN) return

    const previousPreferences = reminderPreferences
    setReminderPreferences(preferences)
    setReminderStatus('saving')

    updateReminderPreferences(preferences)
      .then((preferences) => {
        setReminderPreferences(preferences)
        setReminderStatus('idle')
      })
      .catch((err) => {
        console.error('Failed to save reminder preferences:', err)
        setReminderPreferences(previousPreferences)
        setReminderStatus('error')
      })
  }, [reminderPreferences])

  const navigateAndCloseMenu = useCallback((path: string) => {
    setIsMobileMenuOpen(false)
    navigate(path)
  }, [navigate])

  const selectPuzzleDifficulty = useCallback((difficulty: DailyPuzzleDifficulty) => {
    const caseId = getDailyCaseId(activeCaseDate, difficulty)
    navigate(`${TODAY_PATH}?case=${encodeURIComponent(caseId)}`)
  }, [activeCaseDate, navigate])

  const [suspectNotes, setSuspectNotes] = useState<Map<number, {
    noteStatus: SuspectNoteStatus
  }>>(new Map())

  const updateSuspectNote = (
    pokemonId: number,
    updater: (prev: {
      noteStatus: SuspectNoteStatus
    }) => {
      noteStatus: SuspectNoteStatus
    },
  ) => {
    setSuspectNotes((prev) => {
      const next = new Map(prev)
      const current = next.get(pokemonId) ?? {
        noteStatus: 'suspect' as const,
      }
      next.set(pokemonId, updater(current))
      return next
    })
  }

  const currentCase: Case | null = useMemo(() => {
    if (!caseData) return null
    const c = JSON.parse(JSON.stringify(caseData)) as Case
    c.suspects = c.suspects.map((s) => {
      const notes = suspectNotes.get(s.pokemonId)
      if (!notes) return s
      return {
        ...s,
        noteStatus: notes.noteStatus,
        manuallyRuledOut: s.manuallyRuledOut || notes.noteStatus === 'ruled-out',
      }
    })
    return c
  }, [caseData, suspectNotes])

  useEffect(() => {
    setSuspectNotes(new Map())
  }, [activeCaseId])

  const wrongAccusationIds = useMemo(() => {
    if (!currentCase?.culpritPokemonId) return accusationHistory ?? []
    return (accusationHistory ?? []).filter((pokemonId) => pokemonId !== currentCase.culpritPokemonId)
  }, [accusationHistory, currentCase?.culpritPokemonId])

  const attemptsLeft = accusationsRemaining
  const investigationsUsed = currentCase
    ? (currentCase.maxInvestigations ?? 6) - investigationsRemaining
    : 0

  const culpritSuspect: Suspect | null = useMemo(() => {
    if (!currentCase || currentCase.culpritPokemonId == null) return null
    return currentCase.suspects.find((s) => s.pokemonId === currentCase.culpritPokemonId) ?? null
  }, [currentCase])

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [accusationTargetId, setAccusationTargetId] = useState<number | null>(null)
  const [lastInvestigatedLocationId, setLastInvestigatedLocationId] = useState<string | null>(null)
  const [, setActivePanel] = useState<'investigation' | 'suspects'>('investigation')

  const accusationTarget = currentCase?.suspects.find((s) => s.pokemonId === accusationTargetId) ?? null

  const currentRoute = location.pathname
  const activeSidebarSection = currentRoute === ROOT_PATH || currentRoute.startsWith(TODAY_PATH)
    ? 'case'
        : currentRoute.startsWith(POKEDEX_PATH)
      ? 'pokedex'
        : currentRoute.startsWith(HISTORY_PATH)
          ? 'history'
          : currentRoute.startsWith(HOW_TO_PLAY_PATH)
            ? 'how-to-play'
            : currentRoute.startsWith(FEEDBACK_PATH)
              ? 'feedback'
              : currentRoute.startsWith(SETTINGS_PATH)
                ? 'settings'
                : currentRoute.startsWith(ADMIN_PATH) ? 'admin' : ''
  const clearScreenState = () => {
    setSelectedLocationId(null)
    setAccusationTargetId(null)
  }

  const resetTransientUi = () => {
    clearScreenState()
    setActivePanel('investigation')
  }

  const loadCase = useCallback(async () => {
    if (shouldShowDifficultySelect) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = isDefaultTodayCase ? await getCurrentCase() : await getCase(activeCaseId)
      setCaseData(applyCurrentCaseAssets(data.case))
      setInvestigationsRemaining(data.investigationsRemaining)
      setAccusationsRemaining(data.accusationsRemaining ?? MAX_ACCUSATIONS)
      setAccusationHistory(data.accusationHistory ?? [])
      setCaseStats(data.caseStats ?? null)
      setCaseStreak(data.caseStreak ?? 0)
    } catch (err) {
      console.error('Failed to load daily case:', err)
    } finally {
      setLoading(false)
    }
  }, [activeCaseId, isDefaultTodayCase, shouldShowDifficultySelect])

  useEffect(() => {
    if (currentRoute === '/callback') {
      void (async () => {
        const ok = await handleCallback()
        if (ok) {
          setAuthed(true)
          setUserProfile(getUserProfile())
          await loadCase()
        }
        navigate(TODAY_PATH, { replace: true })
      })()
      return
    }
  }, [currentRoute, navigate, loadCase])

  useEffect(() => {
    if (currentRoute === '/callback') return

    void (async () => {
      const ok = await ensureValidSession()
      setAuthed(ok)
      setUserProfile(ok ? getUserProfile() : null)
    })()
  }, [currentRoute])

  useEffect(() => {
    if (!authed) {
      setIsAdmin(false)
      setReminderPreferences(DEFAULT_REMINDER_PREFERENCES)
      setReminderStatus('idle')
      return
    }

    if (!ENABLE_DAILY_REMINDER_OPT_IN) return

    setReminderStatus('loading')
    getReminderPreferences()
      .then((preferences) => {
        setReminderPreferences(preferences)
        setReminderStatus('idle')
      })
      .catch((err) => {
        console.error('Failed to load reminder preferences:', err)
        setReminderStatus('error')
      })
  }, [authed])

  useEffect(() => {
    if (!authed) {
      setIsAdmin(false)
      return
    }

    let cancelled = false
    getAdminSession()
      .then(() => {
        if (!cancelled) setIsAdmin(true)
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false)
      })

    return () => {
      cancelled = true
    }
  }, [authed])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentRoute])

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`)
  }, [location.pathname, location.search])

  useEffect(() => {
    trackReferralSource()
    trackReminderConversion()
    trackReturningUser()
  }, [])

  useEffect(() => {
    loadCase()
  }, [loadCase])

  const startInvestigation = () => {
    if (currentCase) {
      trackCaseStarted({
        caseId: activeCaseId,
        authed,
        investigationsRemaining,
        accusationsRemaining,
      })
    }
    navigate(withActiveCase(TODAY_INVESTIGATION_PATH))
  }

  const toggleRuledOut = (suspectId: number) => {
    const current = suspectNotes.get(suspectId)
    const newStatus = current?.noteStatus === 'ruled-out' ? 'suspect' : 'ruled-out'
    updateSuspectNote(suspectId, () => ({ noteStatus: newStatus }))
    apiClearSuspect(activeCaseId, suspectId, newStatus === 'ruled-out').catch((err) =>
      console.error('Failed to sync suspect status:', err),
    )
  }

  const setSuspectNoteStatus = (suspectId: number, noteStatus: SuspectNoteStatus) => {
    updateSuspectNote(suspectId, () => ({ noteStatus }))
    apiClearSuspect(activeCaseId, suspectId, noteStatus === 'ruled-out').catch((err) =>
      console.error('Failed to sync suspect status:', err),
    )
  }

  const inspectSuspect = (suspectId: number) => {
    navigate(withActiveCase(suspectPath(suspectId)))
  }

  const openAccusation = (suspectId: number) => {
    setAccusationTargetId(suspectId)
    navigate(withActiveCase(accusationPath(suspectId)))
  }

  const closeAccusation = () => {
    const suspectId = accusationTargetId
    setAccusationTargetId(null)
    navigate(withActiveCase(suspectId ? suspectPath(suspectId) : TODAY_SUSPECTS_PATH))
  }

  const confirmAccusation = async () => {
    if (!caseData || !accusationTarget) return

    if (authed) {
      try {
        const caseId = activeCaseId
        const data = await apiAccuse(caseId, accusationTarget.pokemonId)
        setCaseData(data.case)
        setAccusationHistory(data.accusationHistory ?? [])
        setAccusationsRemaining(data.accusationsRemaining ?? MAX_ACCUSATIONS)
        setCaseStats(data.caseStats ?? null)
        setAccusationTargetId(null)

        updateSuspectNote(accusationTarget.pokemonId, (prev) => ({
          ...prev,
          noteStatus: 'ruled-out',
        }))

        trackEvent('accusation_submitted', {
          case_id: caseId,
          authenticated: authed,
          suspect_id: accusationTarget.pokemonId,
          accusation_correct: data.status === 'solved',
          accusations_remaining: data.accusationsRemaining ?? MAX_ACCUSATIONS,
        })

        if (data.status === 'solved') {
          trackCaseCompleted({
            caseId,
            authed,
            suspectId: accusationTarget.pokemonId,
            investigationsUsed,
            accusationsRemaining: data.accusationsRemaining ?? MAX_ACCUSATIONS,
            wrongAccusationCount: (data.accusationHistory ?? []).filter((pokemonId) => pokemonId !== caseData.culpritPokemonId).length,
          })
          setCaseStreak(trackStreak(caseId, 'solved', data.caseStreak ?? 0))
          resetTransientUi()
          navigate(withActiveCase(endingPath('solved')))
        } else if (data.status === 'failed') {
          trackCaseFailed({
            caseId,
            authed,
            suspectId: accusationTarget.pokemonId,
            investigationsUsed,
            wrongAccusationCount: (data.accusationHistory ?? []).length,
          })
          setCaseStreak(trackStreak(caseId, 'failed', data.caseStreak ?? 0))
          resetTransientUi()
          navigate(withActiveCase(endingPath('failed')))
        } else {
          navigate(withActiveCase(suspectPath(accusationTarget.pokemonId)))
        }
      } catch (err) {
        console.error('Accusation failed:', err)
      }
    } else {
      const caseId = activeCaseId
      let accusationHistoryAfterSubmit: number[] = []
      let accusationsRemainingAfterSubmit = MAX_ACCUSATIONS
      let caseStreakAfterSubmit = 0
      let status: 'playing' | 'solved' | 'failed' = 'playing'
      try {
        const data = await apiAccuse(caseId, accusationTarget.pokemonId)
        status = data.status
        accusationHistoryAfterSubmit = data.accusationHistory ?? []
        accusationsRemainingAfterSubmit = data.accusationsRemaining ?? MAX_ACCUSATIONS
        caseStreakAfterSubmit = data.caseStreak ?? 0

        setAccusationHistory(accusationHistoryAfterSubmit)
        setAccusationsRemaining(accusationsRemainingAfterSubmit)
        setCaseData(data.case)
        setCaseStats(data.caseStats ?? null)
      } catch (err) {
        console.error('Accusation failed:', err)
        return
      }
      setAccusationTargetId(null)

      updateSuspectNote(accusationTarget.pokemonId, (prev) => ({
        ...prev,
        noteStatus: 'ruled-out',
      }))

      trackEvent('accusation_submitted', {
        case_id: caseId,
        authenticated: authed,
        suspect_id: accusationTarget.pokemonId,
        accusation_correct: status === 'solved',
        accusations_remaining: accusationsRemainingAfterSubmit,
      })

      if (status === 'solved') {
        trackCaseCompleted({
          caseId,
          authed,
          suspectId: accusationTarget.pokemonId,
          investigationsUsed,
          accusationsRemaining: accusationsRemainingAfterSubmit,
          wrongAccusationCount: accusationHistoryAfterSubmit.filter((pokemonId) => pokemonId !== caseData.culpritPokemonId).length,
        })
        setCaseStreak(trackStreak(caseId, 'solved', caseStreakAfterSubmit))
        resetTransientUi()
        navigate(withActiveCase(endingPath('solved')))
      } else if (status === 'failed') {
        trackCaseFailed({
          caseId,
          authed,
          suspectId: accusationTarget.pokemonId,
          investigationsUsed,
          wrongAccusationCount: accusationHistoryAfterSubmit.length,
        })
        setCaseStreak(trackStreak(caseId, 'failed', caseStreakAfterSubmit))
        resetTransientUi()
        navigate(withActiveCase(endingPath('failed')))
      } else {
        navigate(withActiveCase(suspectPath(accusationTarget.pokemonId)))
      }
    }
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    navigate(withActiveCase(investigationLocationPath(locationId)))
  }

  const investigateLocation = async (locationId: string, actionId: string, witnessPokemonId?: number) => {
    if (!caseData) return

    if (authed) {
      try {
        const caseId = activeCaseId
        const data = await apiInvestigate(caseId, locationId, actionId, witnessPokemonId)
        setCaseData((prev) => prev
          ? {
              ...prev,
              locations: prev.locations.map((location) => location.id === data.result.locationId
                ? {
                    ...location,
                    investigated: true,
                    selectedActionId: data.result.actionId,
                    observationText: data.result.observationText,
                    evidenceId: data.result.evidenceId,
                    evidenceTitle: data.result.evidenceTitle,
                    evidenceText: data.result.evidenceText,
                    evidenceBadges: data.result.evidenceBadges,
                    witnessPokemonId: data.result.witnessPokemonId,
                  }
                : location,
              ),
            }
          : prev,
        )
        setInvestigationsRemaining(data.investigationsRemaining)
        setAccusationsRemaining(data.accusationsRemaining ?? MAX_ACCUSATIONS)
        setAccusationHistory(data.accusationHistory ?? [])
        setLastInvestigatedLocationId(locationId)
        trackInvestigation({
          caseId,
          authed,
          locationId,
          actionId,
          witnessPokemonId,
          investigationsRemaining: data.investigationsRemaining,
          investigationsUsed: (caseData.maxInvestigations ?? 6) - data.investigationsRemaining,
        })
      } catch (err) {
        console.error('Investigation failed:', err)
      }
    } else {
      if (investigationsRemaining <= 0) return
      const location = caseData.locations.find((l) => l.id === locationId)
      if (!location || location.investigated) return
      const action = location.actions.find((a) => a.id === actionId)
      if (!action) return
      try {
        const caseId = activeCaseId
        const data = await apiInvestigate(caseId, locationId, actionId, witnessPokemonId)
        setCaseData({
          ...caseData,
          locations: caseData.locations.map((l) =>
            l.id === data.result.locationId
              ? {
                  ...l,
                  investigated: true,
                  selectedActionId: data.result.actionId,
                  observationText: data.result.observationText,
                  evidenceId: data.result.evidenceId,
                  evidenceTitle: data.result.evidenceTitle,
                  evidenceText: data.result.evidenceText,
                  evidenceBadges: data.result.evidenceBadges,
                  witnessPokemonId: data.result.witnessPokemonId,
                }
              : l,
          ),
        })
        setInvestigationsRemaining(data.investigationsRemaining)
        setAccusationsRemaining(data.accusationsRemaining ?? MAX_ACCUSATIONS)
        setAccusationHistory(data.accusationHistory ?? [])
        setLastInvestigatedLocationId(locationId)
        trackInvestigation({
          caseId,
          authed,
          locationId,
          actionId,
          witnessPokemonId,
          investigationsRemaining: data.investigationsRemaining,
          investigationsUsed: (caseData.maxInvestigations ?? 6) - data.investigationsRemaining,
        })
      } catch (err) {
        console.error('Investigation failed:', err)
      }
    }
  }

  useEffect(() => {
    if (!currentCase) return

    if (currentRoute === TODAY_INVESTIGATION_PATH || currentRoute === TODAY_PATH || currentRoute === '/') {
      clearScreenState()
      return
    }

    if (currentRoute === TODAY_SUSPECTS_PATH) {
      clearScreenState()
      return
    }

    if (currentRoute.startsWith(`${TODAY_SUSPECTS_PATH}/`)) {
      clearScreenState()
      return
    }

    if (currentRoute.startsWith(`${TODAY_INVESTIGATION_PATH}/`)) {
      const locationId = currentRoute.replace(`${TODAY_INVESTIGATION_PATH}/`, '')
      if (currentCase.locations.some((loc) => loc.id === locationId)) {
        clearScreenState()
        setSelectedLocationId(locationId)
      }
      return
    }

    if (currentRoute.startsWith(`${TODAY_ACCUSE_PATH}/`)) {
      const suspectId = Number(currentRoute.replace(`${TODAY_ACCUSE_PATH}/`, ''))
      if (currentCase.suspects.some((s) => s.pokemonId === suspectId)) {
        setAccusationTargetId(suspectId)
      }
      return
    }
  }, [currentCase, currentRoute])

  const sharedInvestigationRouteProps = currentCase ? {
    attemptsLeft,
    currentCase,
    lastInvestigatedLocationId,
    wrongAccusationIds,
    inspectSuspect,
    setSuspectNoteStatus,
    toggleRuledOut,
    openAccusation,
    investigateLocation,
    openLocation,
  } : null

  const completedCaseStatus = currentCase?.status === 'solved' || currentCase?.status === 'failed'
    ? currentCase.status
    : null
  const requestedEndingStatus = currentRoute.startsWith(`${TODAY_ENDING_PATH}/`)
    ? currentRoute.replace(`${TODAY_ENDING_PATH}/`, '').split('/')[0]
    : null
  const requestedCompletedEndingStatus =
    requestedEndingStatus === 'solved' || requestedEndingStatus === 'failed'
      ? requestedEndingStatus
      : null
  const shouldRedirectFromInvalidCompletedEnding = currentCase !== null &&
    requestedCompletedEndingStatus !== null && requestedCompletedEndingStatus !== currentCase.status
  const shouldRedirectToCompletedCase =
    completedCaseStatus !== null &&
    currentRoute.startsWith(TODAY_PATH) &&
    !currentRoute.startsWith(TODAY_ENDING_PATH)

  const routeConfig = {
    root: {
      url: ROOT_PATH,
      title: caseFileTitle,
      outlet: <Navigate to={TODAY_PATH} replace />,
    },
    currentCase: {
      url: TODAY_PATH,
      title: caseFileTitle,
      outlet: currentCase ? (
        <CaseOverviewRoute
          attemptsLeft={attemptsLeft}
          currentCase={currentCase}
          startInvestigation={startInvestigation}
          inspectSuspect={inspectSuspect}
        />
      ) : null,
    },
    investigation: {
      url: TODAY_INVESTIGATION_PATH,
      title: 'Investigation Board',
      outlet: sharedInvestigationRouteProps ? <CaseRoute {...sharedInvestigationRouteProps} /> : null,
    },
    suspects: {
      url: TODAY_SUSPECTS_PATH,
      title: 'Suspect Lineup',
      outlet: sharedInvestigationRouteProps ? <SuspectsRoute {...sharedInvestigationRouteProps} /> : null,
    },
    callback: {
      url: CALLBACK_PATH,
      title: 'Login successful',
      outlet: null,
    },
    investigationLocation: {
      url: TODAY_INVESTIGATION_LOCATION_ROUTE,
      title: dynamicCaseTitle('investigation-location', 'Investigation Lead'),
      outlet: currentCase ? (
        <InvestigationLocationRoute
          attemptsLeft={attemptsLeft}
          currentCase={currentCase}
          investigateLocation={investigateLocation}
          openLocation={openLocation}
          selectedLocationId={selectedLocationId}
        />
      ) : null,
    },
    suspectFile: {
      url: TODAY_SUSPECT_FILE_ROUTE,
      title: dynamicCaseTitle('suspect-file', 'Suspect Dossier'),
      outlet: currentCase ? (
        <SuspectFileRoute
          currentCase={currentCase}
          wrongAccusationIds={wrongAccusationIds}
          setSuspectNoteStatus={setSuspectNoteStatus}
          openAccusation={openAccusation}
          attemptsLeft={attemptsLeft}
        />
      ) : null,
    },
    accuse: {
      url: TODAY_ACCUSE_ROUTE,
      title: dynamicCaseTitle('accuse', 'Make an Accusation'),
      outlet: currentCase && sharedInvestigationRouteProps ? (
        accusationTarget ? (
          <AccuseRoute
            {...sharedInvestigationRouteProps}
            accusationTarget={accusationTarget}
            closeAccusation={closeAccusation}
            confirmAccusation={confirmAccusation}
          />
        ) : currentCase.status === 'solved' ? (
          <Navigate to={withActiveCase(endingPath('solved'))} replace />
        ) : currentCase.status === 'failed' ? (
          <Navigate to={withActiveCase(endingPath('failed'))} replace />
        ) : (
          <Navigate to={withActiveCase(TODAY_SUSPECTS_PATH)} replace />
        )
      ) : null,
    },
    ending: {
      url: TODAY_ENDING_ROUTE,
      title: dynamicCaseTitle('ending', 'Case Result'),
      outlet: currentCase ? (
        <EndingRoute
          currentCase={currentCase}
          caseId={activeCaseId}
          culpritSuspect={culpritSuspect}
          caseStats={caseStats}
          caseStreak={caseStreak}
          playerGuessCount={accusationHistory.length || (completedCaseStatus === 'failed' ? MAX_ACCUSATIONS : 1)}
        />
      ) : null,
    },
    login: {
      url: LOGIN_PATH,
      title: 'Login',
      outlet: <LoginRoute onGoogleLogin={loginWithGoogle} onEmailLogin={loginWithEmail} />,
    },
    pokedex: {
      url: POKEDEX_PATH,
      title: 'Pokédex',
      outlet: <PokedexRoute authed={authed} onLogin={handleLogin} />,
    },
    history: {
      url: HISTORY_PATH,
      title: 'Puzzle History',
      outlet: <HistoryRoute authed={authed} onLogin={handleLogin} />,
    },
    settings: {
      url: SETTINGS_PATH,
      title: 'Settings',
      outlet: (
        <SettingsRoute
          authed={authed}
          reminderPreferences={reminderPreferences}
          reminderStatus={reminderStatus}
          onLogin={handleLogin}
          onUpdateReminderPreferences={handleUpdateReminderPreferences}
        />
      ),
    },
    feedback: {
      url: FEEDBACK_PATH,
      title: 'Bugs & Ideas',
      outlet: <FeedbackRoute />,
    },
    admin: {
      url: ADMIN_PATH,
      title: 'Admin',
      outlet: <AdminRoute authed={authed} onLogin={handleLogin} />,
    },
    howToPlay: {
      url: HOW_TO_PLAY_PATH,
      title: 'How to play',
      outlet: <HowToPlayRoute />,
    },
    fallback: {
      url: '*',
      title: 'Daily Case File',
      outlet: <Navigate to={TODAY_PATH} replace />,
    },
  } satisfies Record<string, RouteConfig>

  const appRoutes = Object.values(routeConfig)

  useEffect(() => {
    document.title = `${shouldShowDifficultySelect ? 'Choose Difficulty' : getPageName(appRoutes, currentRoute, currentCase)} | PokéMystery`
  }, [appRoutes, currentRoute, currentCase, shouldShowDifficultySelect])

  if (shouldShowDifficultySelect) {
    return (
      <main className="app-shell">
        <DesktopSidebar
          activeSection="case"
          authed={authed}
          userProfile={userProfile}
          isAdmin={isAdmin}
          caseStreak={caseStreak}
          onSelectCase={() => navigate(TODAY_PATH)}
          onSelectPokedex={() => navigate(POKEDEX_PATH)}
          onSelectHistory={() => navigate(HISTORY_PATH)}
          onSelectHowToPlay={() => navigate(HOW_TO_PLAY_PATH)}
          onSelectFeedback={() => navigate(FEEDBACK_PATH)}
          onSelectSettings={() => navigate(SETTINGS_PATH)}
          onSelectAdmin={() => navigate(ADMIN_PATH)}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <div className="app-content">
          <header className="app-header notebook-card difficulty-select-header">
            <div className="brand-lockup">
              <div>
                <p className="eyebrow">PokéMystery</p>
                <h1>Choose your case</h1>
                <p className="subtle-text">Pick one to start. You can solve both.</p>
              </div>
            </div>
          </header>
          <DifficultySelectScreen onSelectDifficulty={selectPuzzleDifficulty} />
          <AppFooter />
        </div>
      </main>
    )
  }

  if (loading || !currentCase) {
    return (
      <main className="app-shell">
        <DesktopSidebar
          activeSection=""
          authed={authed}
          userProfile={userProfile}
          isAdmin={isAdmin}
          onSelectCase={() => {}}
          onSelectPokedex={() => {}}
          onSelectHistory={() => {}}
          onSelectHowToPlay={() => {}}
          onSelectFeedback={() => {}}
          onSelectSettings={() => {}}
          onSelectAdmin={() => {}}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="app-content">
          <header className="app-header notebook-card loading-case-header" aria-hidden="true">
            <div className="brand-lockup">
              <div className="loading-case-header__copy">
                <p className="eyebrow">
                  <span className="skeleton-line skeleton-line--eyebrow" />
                </p>
                <h1>
                  <span className="skeleton-line skeleton-line--title" />
                </h1>
                <p className="subtle-text">
                  <span className="skeleton-line skeleton-line--story" />
                </p>
              </div>
            </div>
          </header>
          <div className="main-layout-single">
            <section className="notebook-card loading-puzzle-card" aria-busy="true">
              <p className="placeholder-page">{isArchivedCase ? 'Loading archived puzzle...' : "Loading today's puzzle..."}</p>
            </section>
          </div>
          <AppFooter />
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <DesktopSidebar
        activeSection={activeSidebarSection}
        authed={authed}
        userProfile={userProfile}
        isAdmin={isAdmin}
        caseStreak={caseStreak}
        onSelectCase={() => navigate(TODAY_PATH)}
        onSelectPokedex={() => navigate(POKEDEX_PATH)}
        onSelectHistory={() => navigate(HISTORY_PATH)}
        onSelectHowToPlay={() => navigate(HOW_TO_PLAY_PATH)}
        onSelectFeedback={() => navigate(FEEDBACK_PATH)}
        onSelectSettings={() => navigate(SETTINGS_PATH)}
        onSelectAdmin={() => navigate(ADMIN_PATH)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <div className="app-content">
        <Header
          currentCase={currentCase}
          activeSection={activeSidebarSection}
          activePuzzleDifficulty={activePuzzleDifficulty}
          authed={authed}
          userProfile={userProfile}
          isAdmin={isAdmin}
          isMenuOpen={isMobileMenuOpen}
          hideDifficultySelector={currentRoute.startsWith(TODAY_ENDING_PATH)}
          onChangePuzzleDifficulty={selectPuzzleDifficulty}
          onToggleMenu={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          onSelectCase={() => navigateAndCloseMenu(TODAY_PATH)}
          onSelectPokedex={() => navigateAndCloseMenu(POKEDEX_PATH)}
          onSelectHistory={() => navigateAndCloseMenu(HISTORY_PATH)}
          onSelectHowToPlay={() => navigateAndCloseMenu(HOW_TO_PLAY_PATH)}
          onSelectFeedback={() => navigateAndCloseMenu(FEEDBACK_PATH)}
          onSelectSettings={() => navigateAndCloseMenu(SETTINGS_PATH)}
          onSelectAdmin={() => navigateAndCloseMenu(ADMIN_PATH)}
          onLogin={() => navigateAndCloseMenu(LOGIN_PATH)}
          onLogout={() => {
            setIsMobileMenuOpen(false)
            handleLogout()
          }}
        />

        {shouldRedirectFromInvalidCompletedEnding ? (
          <Navigate to={completedCaseStatus ? withActiveCase(endingPath(completedCaseStatus)) : withActiveCase(TODAY_PATH)} replace />
        ) : shouldRedirectToCompletedCase ? (
          <Navigate to={withActiveCase(endingPath(completedCaseStatus))} replace />
        ) : <Routes>
          {appRoutes.map((route) => (
            <Route key={route.url} path={route.url} element={route.outlet} />
          ))}
        </Routes>}
        <AppFooter />
      </div>
    </main>
  )
}

export default App
