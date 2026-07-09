import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { DesktopSidebar } from './components/DesktopSidebar'
import { Header } from './components/Header'
import { AccuseRoute } from './routes/AccuseRoute'
import { CaseOverviewRoute } from './routes/CaseOverviewRoute'
import { CaseRoute } from './routes/CaseRoute'
import { EndingRoute } from './routes/EndingRoute'
import { InvestigationLocationRoute } from './routes/InvestigationLocationRoute'
import { SuspectFileRoute } from './routes/SuspectFileRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'
import { startDaily, investigate as apiInvestigate, accuse as apiAccuse } from './api'
import type { SessionData } from './api'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from './game/caseModel'
import {
  isAuthenticated,
  login,
  logout as authLogout,
  handleCallback,
  getUserProfile,
  type UserProfile,
} from './auth'

const SESSION_STORAGE_KEY = 'daily-session-id'

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  const [authed, setAuthed] = useState(() => isAuthenticated())
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    authed ? getUserProfile() : null,
  )

  const handleLogin = useCallback(() => {
    login()
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    authLogout()
  }, [])

  const wrongAccusationIds = useMemo(() => {
    if (!session) return []
    if (session.status === 'solved' && session.accusationHistory.length > 0) {
      return session.accusationHistory.slice(0, -1)
    }
    return session.accusationHistory
  }, [session])

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
    if (!session) return null
    const c = JSON.parse(JSON.stringify(session.case)) as Case
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
  }, [session, suspectNotes])

  const attemptsLeft = session?.accusationsRemaining ?? 0

  const culpritSuspect: Suspect | null = useMemo(() => {
    if (!currentCase || currentCase.culpritPokemonId === -1) return null
    return currentCase.suspects.find((s) => s.pokemonId === currentCase.culpritPokemonId) ?? null
  }, [currentCase])

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [accusationTargetId, setAccusationTargetId] = useState<number | null>(null)
  const [lastInvestigatedLocationId, setLastInvestigatedLocationId] = useState<string | null>(null)
  const [, setActivePanel] = useState<'investigation' | 'suspects'>('investigation')

  const accusationTarget = currentCase?.suspects.find((s) => s.pokemonId === accusationTargetId) ?? null

  const currentRoute = location.pathname
  const activeSidebarSection = currentRoute === '/' ? 'home' : ''

  const clearScreenState = () => {
    setSelectedLocationId(null)
    setAccusationTargetId(null)
  }

  const resetTransientUi = () => {
    clearScreenState()
    setActivePanel('investigation')
  }

  const loadSession = useCallback(async (sessionId?: string) => {
    setLoading(true)
    try {
      const data = await startDaily(sessionId)
      localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId)
      setSession(data)
    } catch (err) {
      console.error('Failed to load daily puzzle:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentRoute === '/callback') {
      const ok = handleCallback()
      if (ok) {
        setAuthed(true)
        setUserProfile(getUserProfile())
      }
      navigate('/', { replace: true })
      return
    }
  }, [currentRoute, navigate])

  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_STORAGE_KEY)
    loadSession(savedId || undefined)
  }, [loadSession])

  const startNewCase = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSuspectNotes(new Map())
    resetTransientUi()
    await loadSession()
    navigate('/investigation')
  }

  const startInvestigation = () => {
    navigate('/investigation')
  }

  const toggleRuledOut = (suspectId: number) => {
    updateSuspectNote(suspectId, (prev) => ({
      noteStatus: prev.noteStatus === 'ruled-out' ? 'suspect' : 'ruled-out',
      inspectedGroups: prev.inspectedGroups,
    }))
  }

  const setSuspectNoteStatus = (suspectId: number, noteStatus: SuspectNoteStatus) => {
    updateSuspectNote(suspectId, (prev) => ({
      noteStatus,
      inspectedGroups: prev.inspectedGroups,
    }))
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
    if (!session || !accusationTarget) return

    try {
      const data = await apiAccuse(session.sessionId, accusationTarget.pokemonId)
      setSession(data)
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
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    navigate(`/investigation/${locationId}`)
  }

  const investigateLocation = async (locationId: string, actionId: string) => {
    if (!session) return

    try {
      const data = await apiInvestigate(session.sessionId, locationId, actionId)
      setSession(data)
      setLastInvestigatedLocationId(locationId)
    } catch (err) {
      console.error('Investigation failed:', err)
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
          onSelectHome={() => {}}
          onSelectCase={() => {}}
          onSelectHowToPlay={() => {}}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div className="app-content">
          <div className="main-layout-single">
            <p className="placeholder-page">Loading today's puzzle...</p>
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
        onSelectHome={() => navigate('/')}
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
          <Route path="/how-to-play" element={<div className="main-layout-single"><p className="placeholder-page">How to play — coming soon</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
