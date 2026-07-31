import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { DesktopSidebar } from './components/DesktopSidebar'
import { Header } from './components/Header'
import { AccuseRoute } from './routes/AccuseRoute'
import { LoginRoute } from './routes/LoginRoute'
import { CaseOverviewRoute } from './routes/CaseOverviewRoute'
import { CaseRoute } from './routes/CaseRoute'
import { EndingRoute } from './routes/EndingRoute'
import { InvestigationLocationRoute } from './routes/InvestigationLocationRoute'
import { HowToPlayRoute } from './routes/HowToPlayRoute'
import { PokedexRoute } from './routes/PokedexRoute'
import { SettingsRoute } from './routes/SettingsRoute'
import { SuspectFileRoute } from './routes/SuspectFileRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'
import {
  getCurrentCase,
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
  HOW_TO_PLAY_PATH,
  LOGIN_PATH,
  POKEDEX_PATH,
  ROOT_PATH,
  SETTINGS_PATH,
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
  login,
  logout as authLogout,
  handleCallback,
  getUserProfile,
  ensureValidSession,
  type UserProfile,
} from './auth'

const getTodayCaseId = () => new Date().toISOString().slice(0, 10)
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
  </footer>
)

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [investigationsRemaining, setInvestigationsRemaining] = useState(0)
  const [accusationsRemaining, setAccusationsRemaining] = useState(MAX_ACCUSATIONS)
  const [accusationHistory, setAccusationHistory] = useState<number[]>([])
  const [caseStats, setCaseStats] = useState<CaseStatsResponse | null>(null)
  const [caseStreak, setCaseStreak] = useState(0)

  const [authed, setAuthed] = useState(() => isAuthenticated())
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
      : currentRoute.startsWith(HOW_TO_PLAY_PATH)
        ? 'how-to-play'
        : currentRoute.startsWith(SETTINGS_PATH) ? 'settings' : ''
  const clearScreenState = () => {
    setSelectedLocationId(null)
    setAccusationTargetId(null)
  }

  const resetTransientUi = () => {
    clearScreenState()
    setActivePanel('investigation')
  }

  const loadCase = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCurrentCase()
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
  }, [])

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
        caseId: getTodayCaseId(),
        authed,
        investigationsRemaining,
        accusationsRemaining,
      })
    }
    navigate(TODAY_INVESTIGATION_PATH)
  }

  const toggleRuledOut = (suspectId: number) => {
    const current = suspectNotes.get(suspectId)
    const newStatus = current?.noteStatus === 'ruled-out' ? 'suspect' : 'ruled-out'
    updateSuspectNote(suspectId, () => ({ noteStatus: newStatus }))
    apiClearSuspect(getTodayCaseId(), suspectId, newStatus === 'ruled-out').catch((err) =>
      console.error('Failed to sync suspect status:', err),
    )
  }

  const setSuspectNoteStatus = (suspectId: number, noteStatus: SuspectNoteStatus) => {
    updateSuspectNote(suspectId, () => ({ noteStatus }))
    apiClearSuspect(getTodayCaseId(), suspectId, noteStatus === 'ruled-out').catch((err) =>
      console.error('Failed to sync suspect status:', err),
    )
  }

  const inspectSuspect = (suspectId: number) => {
    navigate(suspectPath(suspectId))
  }

  const openAccusation = (suspectId: number) => {
    setAccusationTargetId(suspectId)
    navigate(accusationPath(suspectId))
  }

  const closeAccusation = () => {
    const suspectId = accusationTargetId
    setAccusationTargetId(null)
    navigate(suspectId ? suspectPath(suspectId) : TODAY_SUSPECTS_PATH)
  }

  const confirmAccusation = async () => {
    if (!caseData || !accusationTarget) return

    if (authed) {
      try {
        const caseId = getTodayCaseId()
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
          navigate(endingPath('solved'))
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
          navigate(endingPath('failed'))
        } else {
          navigate(suspectPath(accusationTarget.pokemonId))
        }
      } catch (err) {
        console.error('Accusation failed:', err)
      }
    } else {
      const caseId = getTodayCaseId()
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
        navigate(endingPath('solved'))
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
        navigate(endingPath('failed'))
      } else {
        navigate(suspectPath(accusationTarget.pokemonId))
      }
    }
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    navigate(investigationLocationPath(locationId))
  }

  const investigateLocation = async (locationId: string, actionId: string, witnessPokemonId?: number) => {
    if (!caseData) return

    if (authed) {
      try {
        const caseId = getTodayCaseId()
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
        const caseId = getTodayCaseId()
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
          <Navigate to={endingPath('solved')} replace />
        ) : currentCase.status === 'failed' ? (
          <Navigate to={endingPath('failed')} replace />
        ) : (
          <Navigate to={TODAY_SUSPECTS_PATH} replace />
        )
      ) : null,
    },
    ending: {
      url: TODAY_ENDING_ROUTE,
      title: dynamicCaseTitle('ending', 'Case Result'),
      outlet: currentCase ? (
        <EndingRoute
          currentCase={currentCase}
          caseId={getTodayCaseId()}
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
      outlet: <LoginRoute onLogin={() => login()} />,
    },
    pokedex: {
      url: POKEDEX_PATH,
      title: 'Pokedex',
      outlet: <PokedexRoute authed={authed} onLogin={handleLogin} />,
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
    document.title = `${getPageName(appRoutes, currentRoute, currentCase)} | PokéMystery`
  }, [appRoutes, currentRoute, currentCase])

  if (loading || !currentCase) {
    return (
      <main className="app-shell">
        <DesktopSidebar
          activeSection=""
          authed={authed}
          userProfile={userProfile}
          onSelectCase={() => {}}
          onSelectPokedex={() => {}}
          onSelectHowToPlay={() => {}}
          onSelectSettings={() => {}}
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
              <p className="placeholder-page">Loading today's puzzle...</p>
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
        caseStreak={caseStreak}
        onSelectCase={() => navigate(TODAY_PATH)}
        onSelectPokedex={() => navigate(POKEDEX_PATH)}
        onSelectHowToPlay={() => navigate(HOW_TO_PLAY_PATH)}
        onSelectSettings={() => navigate(SETTINGS_PATH)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <div className="app-content">
          <Header
            currentCase={currentCase}
            activeSection={activeSidebarSection}
            authed={authed}
            userProfile={userProfile}
            isMenuOpen={isMobileMenuOpen}
            onToggleMenu={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            onSelectCase={() => navigateAndCloseMenu(TODAY_PATH)}
            onSelectPokedex={() => navigateAndCloseMenu(POKEDEX_PATH)}
          onSelectHowToPlay={() => navigateAndCloseMenu(HOW_TO_PLAY_PATH)}
          onSelectSettings={() => navigateAndCloseMenu(SETTINGS_PATH)}
          onLogin={() => navigateAndCloseMenu(LOGIN_PATH)}
          onLogout={() => {
            setIsMobileMenuOpen(false)
            handleLogout()
          }}
        />

        {shouldRedirectFromInvalidCompletedEnding ? (
          <Navigate to={completedCaseStatus ? endingPath(completedCaseStatus) : TODAY_PATH} replace />
        ) : shouldRedirectToCompletedCase ? (
          <Navigate to={endingPath(completedCaseStatus)} replace />
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
