import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
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
  getSolvedCaseStreak,
} from './analytics'
import { allCases } from './game/cases'
import type { Case, Suspect, SuspectNoteStatus } from './game/caseModel'
import {
  TODAY_ACCUSE_PATH,
  TODAY_ENDING_PATH,
  TODAY_INVESTIGATION_PATH,
  TODAY_PATH,
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
const ENABLE_DAILY_REMINDER_OPT_IN = false

const applyCurrentCaseAssets = (caseData: Case): Case => {
  const currentConfig = allCases.find((caseConfig) => caseConfig.id === caseData.id)
  if (!currentConfig) return caseData

  return {
    ...caseData,
    sceneImage: currentConfig.sceneImage,
    sceneImageAlt: currentConfig.sceneImageAlt,
  }
}

function NavigateToTodayInvestigation() {
  const { locationId } = useParams()
  return <Navigate to={locationId ? investigationLocationPath(locationId) : TODAY_INVESTIGATION_PATH} replace />
}

function NavigateToTodaySuspect() {
  const { id } = useParams()
  return <Navigate to={id ? `${TODAY_SUSPECTS_PATH}/${id}` : TODAY_SUSPECTS_PATH} replace />
}

function NavigateToTodayAccuse() {
  const { suspectId } = useParams()
  return <Navigate to={suspectId ? `${TODAY_ACCUSE_PATH}/${suspectId}` : TODAY_SUSPECTS_PATH} replace />
}

function NavigateToTodayEnding() {
  const { status } = useParams()
  return <Navigate to={status ? endingPath(status) : TODAY_PATH} replace />
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [investigationsRemaining, setInvestigationsRemaining] = useState(0)
  const [accusationsRemaining, setAccusationsRemaining] = useState(MAX_ACCUSATIONS)
  const [accusationHistory, setAccusationHistory] = useState<number[]>([])
  const [caseStats, setCaseStats] = useState<CaseStatsResponse | null>(null)
  const [caseStreak, setCaseStreak] = useState(getSolvedCaseStreak)

  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    authed ? getUserProfile() : null,
  )
  const [dailyReminderEmails, setDailyReminderEmails] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleLogout = useCallback(() => {
    authLogout()
    setDailyReminderEmails(false)
    setReminderStatus('idle')
  }, [])

  const handleToggleDailyReminderEmails = useCallback((enabled: boolean) => {
    if (!ENABLE_DAILY_REMINDER_OPT_IN) return

    setDailyReminderEmails(enabled)
    setReminderStatus('saving')

    updateReminderPreferences(enabled)
      .then((preferences) => {
        setDailyReminderEmails(preferences.dailyReminderEmails)
        setReminderStatus('idle')
      })
      .catch((err) => {
        console.error('Failed to save reminder preferences:', err)
        setDailyReminderEmails(!enabled)
        setReminderStatus('error')
      })
  }, [])

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
  const activeSidebarSection = currentRoute === '/' || currentRoute.startsWith(TODAY_PATH) || currentRoute.startsWith('/suspects') || currentRoute.startsWith('/investigation')
    ? 'case'
    : currentRoute.startsWith('/pokedex') ? 'pokedex' : currentRoute.startsWith('/how-to-play') ? 'how-to-play' : ''
  const activeCasePage: 'overview' | 'investigation' | 'suspects' | '' = currentRoute.startsWith(TODAY_INVESTIGATION_PATH) || currentRoute.startsWith('/investigation')
    ? 'investigation'
    : currentRoute.startsWith(TODAY_SUSPECTS_PATH) || currentRoute.startsWith(TODAY_ACCUSE_PATH) || currentRoute.startsWith('/suspects') || currentRoute.startsWith('/accuse')
      ? 'suspects'
      : currentRoute === '/' || currentRoute === TODAY_PATH || currentRoute === '/home' || currentRoute === '/case'
        ? 'overview'
        : ''

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
      setDailyReminderEmails(false)
      setReminderStatus('idle')
      return
    }

    if (!ENABLE_DAILY_REMINDER_OPT_IN) return

    setReminderStatus('loading')
    getReminderPreferences()
      .then((preferences) => {
        setDailyReminderEmails(preferences.dailyReminderEmails)
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
          setCaseStreak(trackStreak(caseId, 'solved'))
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
          setCaseStreak(trackStreak(caseId, 'failed'))
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
      let status: 'playing' | 'solved' | 'failed' = 'playing'
      try {
        const data = await apiAccuse(caseId, accusationTarget.pokemonId)
        status = data.status
        accusationHistoryAfterSubmit = data.accusationHistory ?? []
        accusationsRemainingAfterSubmit = data.accusationsRemaining ?? MAX_ACCUSATIONS

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
        setCaseStreak(trackStreak(caseId, 'solved'))
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
        setCaseStreak(trackStreak(caseId, 'failed'))
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

  if (loading || !currentCase) {
    return (
      <main className="app-shell">
        <DesktopSidebar
          activeSection=""
          authed={authed}
          userProfile={userProfile}
          showDailyReminderOptIn={ENABLE_DAILY_REMINDER_OPT_IN}
          dailyReminderEmails={dailyReminderEmails}
          reminderStatus={reminderStatus}
          onSelectCase={() => {}}
          onSelectPokedex={() => {}}
          onSelectHowToPlay={() => {}}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggleDailyReminderEmails={handleToggleDailyReminderEmails}
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
        </div>
      </main>
    )
  }

  const sharedInvestigationRouteProps = {
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
  }

  const completedCaseStatus = currentCase.status === 'solved' || currentCase.status === 'failed'
    ? currentCase.status
    : null
  const requestedEndingStatus = currentRoute.startsWith(`${TODAY_ENDING_PATH}/`)
    ? currentRoute.replace(`${TODAY_ENDING_PATH}/`, '').split('/')[0]
    : null
  const requestedCompletedEndingStatus =
    requestedEndingStatus === 'solved' || requestedEndingStatus === 'failed'
      ? requestedEndingStatus
      : null
  const shouldRedirectFromInvalidCompletedEnding =
    requestedCompletedEndingStatus !== null && requestedCompletedEndingStatus !== currentCase.status
  const shouldRedirectToCompletedCase =
    completedCaseStatus !== null &&
    currentRoute.startsWith(TODAY_PATH) &&
    !currentRoute.startsWith(TODAY_ENDING_PATH)

  return (
    <main className="app-shell">
      <DesktopSidebar
        activeSection={activeSidebarSection}
        authed={authed}
        userProfile={userProfile}
        caseStreak={caseStreak}
        showDailyReminderOptIn={ENABLE_DAILY_REMINDER_OPT_IN}
        dailyReminderEmails={dailyReminderEmails}
        reminderStatus={reminderStatus}
        onSelectCase={() => navigate(TODAY_PATH)}
        onSelectPokedex={() => navigate('/pokedex')}
        onSelectHowToPlay={() => navigate('/how-to-play')}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleDailyReminderEmails={handleToggleDailyReminderEmails}
      />

      <div className="app-content">
        <Header
          currentCase={currentCase}
          activeSection={activeSidebarSection}
          activeCasePage={activeCasePage}
          authed={authed}
          userProfile={userProfile}
          showDailyReminderOptIn={ENABLE_DAILY_REMINDER_OPT_IN}
          dailyReminderEmails={dailyReminderEmails}
          reminderStatus={reminderStatus}
          isMenuOpen={isMobileMenuOpen}
          onToggleMenu={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          onSelectCase={() => navigateAndCloseMenu(TODAY_PATH)}
          onSelectInvestigation={() => navigateAndCloseMenu(TODAY_INVESTIGATION_PATH)}
          onSelectSuspects={() => navigateAndCloseMenu(TODAY_SUSPECTS_PATH)}
          onSelectPokedex={() => navigateAndCloseMenu('/pokedex')}
          onSelectHowToPlay={() => navigateAndCloseMenu('/how-to-play')}
          onLogin={() => navigateAndCloseMenu('/login')}
          onLogout={() => {
            setIsMobileMenuOpen(false)
            handleLogout()
          }}
          onToggleDailyReminderEmails={handleToggleDailyReminderEmails}
        />

        {shouldRedirectFromInvalidCompletedEnding ? (
          <Navigate to={completedCaseStatus ? endingPath(completedCaseStatus) : TODAY_PATH} replace />
        ) : shouldRedirectToCompletedCase ? (
          <Navigate to={endingPath(completedCaseStatus)} replace />
        ) : <Routes>
          <Route
            path="/"
            element={
              <Navigate to={TODAY_PATH} replace />
            }
          />
          <Route
            path="/today"
            element={
              <CaseOverviewRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                startInvestigation={startInvestigation}
                inspectSuspect={inspectSuspect}
              />
            }
          />
          <Route path="/home" element={<Navigate to={TODAY_PATH} replace />} />
          <Route path="/case" element={<Navigate to={TODAY_PATH} replace />} />
          <Route path="/investigation" element={<Navigate to={TODAY_INVESTIGATION_PATH} replace />} />
          <Route path="/investigation/:locationId" element={<NavigateToTodayInvestigation />} />
          <Route path="/suspects" element={<Navigate to={TODAY_SUSPECTS_PATH} replace />} />
          <Route path="/suspects/:id" element={<NavigateToTodaySuspect />} />
          <Route path="/accuse/:suspectId" element={<NavigateToTodayAccuse />} />
          <Route path="/ending/:status" element={<NavigateToTodayEnding />} />
          <Route path={TODAY_INVESTIGATION_PATH} element={<CaseRoute {...sharedInvestigationRouteProps} />} />
          <Route path="/callback" element={null} />
          <Route
            path={`${TODAY_INVESTIGATION_PATH}/:locationId`}
            element={
              <InvestigationLocationRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                investigateLocation={investigateLocation}
                openLocation={openLocation}
                selectedLocationId={selectedLocationId}
              />
            }
          />
          <Route path={TODAY_SUSPECTS_PATH} element={<SuspectsRoute {...sharedInvestigationRouteProps} />} />
          <Route
            path={`${TODAY_SUSPECTS_PATH}/:id`}
            element={
              <SuspectFileRoute
                currentCase={currentCase}
                wrongAccusationIds={wrongAccusationIds}
                setSuspectNoteStatus={setSuspectNoteStatus}
                openAccusation={openAccusation}
                attemptsLeft={attemptsLeft}
              />
            }
          />
          <Route
            path={`${TODAY_ACCUSE_PATH}/:suspectId`}
            element={
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
            }
          />
          <Route
            path={`${TODAY_ENDING_PATH}/:status`}
            element={
              <EndingRoute
                currentCase={currentCase}
                caseId={getTodayCaseId()}
                culpritSuspect={culpritSuspect}
                caseStats={caseStats}
                caseStreak={caseStreak}
                playerGuessCount={accusationHistory.length || (completedCaseStatus === 'failed' ? MAX_ACCUSATIONS : 1)}
              />
            }
          />
          <Route path="/login" element={<LoginRoute onLogin={() => login()} />} />
          <Route path="/pokedex" element={<PokedexRoute authed={authed} onLogin={handleLogin} />} />
          <Route path="/how-to-play" element={<HowToPlayRoute />} />
          <Route path="*" element={<Navigate to={TODAY_PATH} replace />} />
        </Routes>}
      </div>
    </main>
  )
}

export default App
