import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { SuspectFileRoute } from './routes/SuspectFileRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'
import { getCurrentCase, investigate as apiInvestigate, accuse as apiAccuse, clearSuspect as apiClearSuspect } from './api'
import { allCases } from './game/cases'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from './game/caseModel'
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

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [investigationsRemaining, setInvestigationsRemaining] = useState(0)
  const [accusationsRemaining, setAccusationsRemaining] = useState(3)
  const [accusationHistory, setAccusationHistory] = useState<number[]>([])

  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    authed ? getUserProfile() : null,
  )

  const handleLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleLogout = useCallback(() => {
    authLogout()
  }, [])

  const wrongAccusationIds = useMemo(() => {
    return accusationHistory
  }, [accusationHistory])

  const [suspectNotes, setSuspectNotes] = useState<Map<number, {
    noteStatus: SuspectNoteStatus
    inspectedGroups: Record<SuspectInvestigationGroup, boolean>
  }>>(new Map())

  const updateSuspectNote = (
    pokemonId: number,
    updater: (prev: {
      noteStatus: SuspectNoteStatus
      inspectedGroups: Record<SuspectInvestigationGroup, boolean>
    }) => {
      noteStatus: SuspectNoteStatus
      inspectedGroups: Record<SuspectInvestigationGroup, boolean>
    },
  ) => {
    setSuspectNotes((prev) => {
      const next = new Map(prev)
      const current = next.get(pokemonId) ?? {
        noteStatus: 'suspect' as const,
        inspectedGroups: { appearance: false, records: false, habitat: false, ability: false },
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
        inspectedGroups: notes.inspectedGroups,
        manuallyRuledOut: s.manuallyRuledOut || notes.noteStatus === 'ruled-out',
      }
    })
    return c
  }, [caseData, suspectNotes])

  const attemptsLeft = accusationsRemaining

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
  const activeSidebarSection = currentRoute === '/' || currentRoute.startsWith('/investigation') ? 'case' : ''

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
      setCaseData(data)
      setInvestigationsRemaining(data.maxInvestigations)
      setAccusationsRemaining(3)
      setAccusationHistory([])
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
        navigate('/', { replace: true })
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
    loadCase()
  }, [loadCase])

  const startNewCase = async () => {
    setSuspectNotes(new Map())
    resetTransientUi()
    await loadCase()
    navigate('/investigation')
  }

  const startInvestigation = () => {
    navigate('/investigation')
  }

  const toggleRuledOut = (suspectId: number) => {
    const current = suspectNotes.get(suspectId)
    const newStatus = current?.noteStatus === 'ruled-out' ? 'suspect' : 'ruled-out'
    updateSuspectNote(suspectId, (prev) => ({
      noteStatus: newStatus,
      inspectedGroups: prev.inspectedGroups,
    }))
    if (authed) {
      apiClearSuspect(getTodayCaseId(), suspectId, newStatus === 'ruled-out').catch((err) =>
        console.error('Failed to sync suspect status:', err),
      )
    }
  }

  const setSuspectNoteStatus = (suspectId: number, noteStatus: SuspectNoteStatus) => {
    updateSuspectNote(suspectId, (prev) => ({
      noteStatus,
      inspectedGroups: prev.inspectedGroups,
    }))
    if (authed) {
      apiClearSuspect(getTodayCaseId(), suspectId, noteStatus === 'ruled-out').catch((err) =>
        console.error('Failed to sync suspect status:', err),
      )
    }
  }

  const inspectSuspect = (suspectId: number) => {
    navigate(`/suspects/${suspectId}`)
  }

  const inspectGroup = (suspectId: number, groupKey: SuspectInvestigationGroup) => {
    updateSuspectNote(suspectId, (prev) => ({
      ...prev,
      inspectedGroups: { ...prev.inspectedGroups, [groupKey]: true },
    }))
  }

  const openAccusation = (suspectId: number) => {
    setAccusationTargetId(suspectId)
    navigate(`/accuse/${suspectId}`)
  }

  const closeAccusation = () => {
    const suspectId = accusationTargetId
    setAccusationTargetId(null)
    navigate(suspectId ? `/suspects/${suspectId}` : '/suspects')
  }

  const confirmAccusation = async () => {
    if (!caseData || !accusationTarget) return

    if (authed) {
      try {
        const caseId = getTodayCaseId()
        const data = await apiAccuse(caseId, accusationTarget.pokemonId)
        setCaseData(data.case)
        setAccusationHistory(data.accusationHistory)
        setAccusationsRemaining(data.accusationsRemaining)
        setAccusationTargetId(null)

        updateSuspectNote(accusationTarget.pokemonId, (prev) => ({
          ...prev,
          noteStatus: 'ruled-out',
        }))

        if (data.status === 'solved') {
          resetTransientUi()
          navigate('/ending/solved')
        } else if (data.status === 'failed') {
          resetTransientUi()
          navigate('/ending/failed')
        } else {
          navigate(`/suspects/${accusationTarget.pokemonId}`)
        }
      } catch (err) {
        console.error('Accusation failed:', err)
      }
    } else {
      const correct = accusationTarget.pokemonId === caseData.culpritPokemonId
      const newHistory = [...accusationHistory, accusationTarget.pokemonId]
      const remaining = correct ? accusationsRemaining : accusationsRemaining - 1
      let status: 'playing' | 'solved' | 'failed' = 'playing'
      if (correct) status = 'solved'
      else if (remaining <= 0) status = 'failed'

      setAccusationHistory(newHistory)
      setAccusationsRemaining(remaining)
      setCaseData({
        ...caseData,
        status: status === 'playing' ? 'active' : status,
        ...(status !== 'playing' ? { culpritPokemonId: accusationTarget.pokemonId } : {}),
        solution: status !== 'playing'
          ? { culpritRevealText: '', detectiveConclusion: '', evidenceExplanation: [], clearedSuspects: [] }
          : undefined,
      })
      setAccusationTargetId(null)

      updateSuspectNote(accusationTarget.pokemonId, (prev) => ({
        ...prev,
        noteStatus: 'ruled-out',
      }))

      if (status === 'solved') {
        resetTransientUi()
        navigate('/ending/solved')
      } else if (status === 'failed') {
        resetTransientUi()
        navigate('/ending/failed')
      } else {
        navigate(`/suspects/${accusationTarget.pokemonId}`)
      }
    }
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    navigate(`/investigation/${locationId}`)
  }

  const investigateLocation = async (locationId: string, actionId: string) => {
    if (!caseData) return

    if (authed) {
      try {
        const caseId = getTodayCaseId()
        const data = await apiInvestigate(caseId, locationId, actionId)
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
                  }
                : location,
              ),
            }
          : prev,
        )
        setInvestigationsRemaining(data.investigationsRemaining)
        setAccusationsRemaining(data.accusationsRemaining)
        setAccusationHistory(data.accusationHistory)
        setLastInvestigatedLocationId(locationId)
      } catch (err) {
        console.error('Investigation failed:', err)
      }
    } else {
      if (investigationsRemaining <= 0) return
      const location = caseData.locations.find((l) => l.id === locationId)
      if (!location || location.investigated) return
      const action = location.actions.find((a) => a.id === actionId)
      if (!action) return
      const rawAction = allCases
        .find((c) => c.id === caseData.id)
        ?.locations.find((l) => l.id === locationId)
        ?.actions.find((a) => a.id === actionId)
      setCaseData({
        ...caseData,
        locations: caseData.locations.map((l) =>
          l.id === locationId
            ? {
                ...l,
                investigated: true,
                selectedActionId: actionId,
                observationText: rawAction?.observationText,
                evidenceId: rawAction?.evidenceId ?? undefined,
                evidenceTitle: rawAction?.evidenceTitle ?? undefined,
                evidenceText: rawAction?.evidenceText ?? undefined,
              }
            : l,
        ),
      })
      setInvestigationsRemaining(investigationsRemaining - 1)
      setLastInvestigatedLocationId(locationId)
    }
  }

  const giveUp = () => {
    if (!currentCase) return
    navigate('/ending/gave-up')
  }

  useEffect(() => {
    if (!currentCase) return

    if (currentRoute === '/investigation' || currentRoute === '/') {
      clearScreenState()
      return
    }

    if (currentRoute === '/suspects') {
      clearScreenState()
      return
    }

    if (currentRoute.startsWith('/suspects/')) {
      clearScreenState()
      return
    }

    if (currentRoute.startsWith('/investigation/')) {
      const locationId = currentRoute.replace('/investigation/', '')
      if (currentCase.locations.some((loc) => loc.id === locationId)) {
        clearScreenState()
        setSelectedLocationId(locationId)
      }
      return
    }

    if (currentRoute.startsWith('/accuse/')) {
      const suspectId = Number(currentRoute.replace('/accuse/', ''))
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
          onSelectCase={() => {}}
          onSelectHowToPlay={() => {}}
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
    inspectGroup,
    setSuspectNoteStatus,
    toggleRuledOut,
    openAccusation,
    investigateLocation,
    openLocation,
    startNewCase,
    giveUp,
  }

  return (
    <main className="app-shell">
      <DesktopSidebar
        activeSection={activeSidebarSection}
          authed={authed}
          userProfile={userProfile}
          onSelectCase={() => navigate('/')}
          onSelectHowToPlay={() => navigate('/how-to-play')}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <div className="app-content">
        <Header currentCase={currentCase} />

        <Routes>
          <Route
            path="/"
            element={
              <CaseOverviewRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                startInvestigation={startInvestigation}
                startNewCase={startNewCase}
                giveUp={giveUp}
                inspectSuspect={inspectSuspect}
              />
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/case" element={<Navigate to="/" replace />} />
          <Route path="/investigation" element={<CaseRoute {...sharedInvestigationRouteProps} />} />
          <Route path="/callback" element={null} />
          <Route
            path="/investigation/:locationId"
            element={
              <InvestigationLocationRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                investigateLocation={investigateLocation}
                openLocation={openLocation}
                selectedLocationId={selectedLocationId}
                startNewCase={startNewCase}
                giveUp={giveUp}
              />
            }
          />
          <Route path="/suspects" element={<SuspectsRoute {...sharedInvestigationRouteProps} />} />
          <Route
            path="/suspects/:id"
            element={
              <SuspectFileRoute
                currentCase={currentCase}
                wrongAccusationIds={wrongAccusationIds}
                inspectGroup={inspectGroup}
                setSuspectNoteStatus={setSuspectNoteStatus}
                openAccusation={openAccusation}
                attemptsLeft={attemptsLeft}
              />
            }
          />
          <Route
            path="/accuse/:suspectId"
            element={
              accusationTarget ? (
                <AccuseRoute
                  {...sharedInvestigationRouteProps}
                  accusationTarget={accusationTarget}
                  closeAccusation={closeAccusation}
                  confirmAccusation={confirmAccusation}
                />
              ) : currentCase.status === 'solved' ? (
                <Navigate to="/ending/solved" replace />
              ) : currentCase.status === 'failed' ? (
                <Navigate to="/ending/failed" replace />
              ) : (
                <Navigate to="/suspects" replace />
              )
            }
          />
          <Route
            path="/ending/:status"
            element={
              <EndingRoute
                currentCase={currentCase}
                culpritSuspect={culpritSuspect}
                attemptsLeft={attemptsLeft}
                wrongAccusationCount={wrongAccusationIds.length}
                startNewCase={startNewCase}
              />
            }
          />
          <Route path="/login" element={<LoginRoute onLogin={() => login()} />} />
          <Route path="/how-to-play" element={<div className="main-layout-single"><p className="placeholder-page">How to play — coming soon</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
