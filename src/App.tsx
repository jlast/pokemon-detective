import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { DesktopSidebar } from './components/DesktopSidebar'
import { createMissingCookiesCase } from './game/cases'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from './game/caseModel'
import { Header } from './components/Header'
import { AccuseRoute } from './routes/AccuseRoute'
import { CaseOverviewRoute } from './routes/CaseOverviewRoute'
import { CaseRoute } from './routes/CaseRoute'
import { EndingRoute } from './routes/EndingRoute'
import { InvestigationLocationRoute } from './routes/InvestigationLocationRoute'
import { SuspectFileRoute } from './routes/SuspectFileRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentCase, setCurrentCase] = useState<Case>(() => createMissingCookiesCase())
  const [, setHasStartedCase] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [accusationTargetId, setAccusationTargetId] = useState<number | null>(null)
  const [wrongAccusationIds, setWrongAccusationIds] = useState<number[]>([])
  const [lastInvestigatedLocationId, setLastInvestigatedLocationId] = useState<string | null>(null)
  const [, setActivePanel] = useState<'investigation' | 'suspects'>('investigation')
  const accusationTarget =
    currentCase.suspects.find((suspect) => suspect.pokemonId === accusationTargetId) ?? null
  const culpritSuspect =
    currentCase.suspects.find((suspect) => suspect.pokemonId === currentCase.culpritPokemonId) ?? null
  const currentRoute = location.pathname
  const activeSidebarSection =
    currentRoute === '/overview'
      ? 'overview'
      : currentRoute === '/suspects' || currentRoute.startsWith('/suspects/') || currentRoute.startsWith('/accuse/')
        ? 'suspects'
        : 'investigation'
  const canGiveUp = currentCase.status === 'active' && !currentRoute.startsWith('/ending/')

  const updateSuspect = (pokemonId: number, updater: (suspect: Suspect) => Suspect) => {
    setCurrentCase((caseState) => ({
      ...caseState,
      suspects: caseState.suspects.map((suspect) =>
        suspect.pokemonId === pokemonId ? updater(suspect) : suspect,
      ),
    }))
  }

  const clearScreenState = () => {
    setSelectedLocationId(null)
    setAccusationTargetId(null)
  }

  const resetTransientUi = () => {
    clearScreenState()
    setActivePanel('investigation')
  }

  const startNewCase = () => {
    setCurrentCase(createMissingCookiesCase())
    setHasStartedCase(false)
    setAttemptsLeft(3)
    setWrongAccusationIds([])
    setLastInvestigatedLocationId(null)
    resetTransientUi()
    navigate('/investigation')
  }

  const startInvestigation = () => {
    setHasStartedCase(true)
    setActivePanel('investigation')
    navigate('/investigation')
  }

  const toggleRuledOut = (suspectId: number) => {
    updateSuspect(suspectId, (suspect) => ({
      ...suspect,
      manuallyRuledOut: !suspect.manuallyRuledOut,
      noteStatus: suspect.manuallyRuledOut ? 'suspect' : 'ruled-out',
    }))
  }

  const setSuspectNoteStatus = (suspectId: number, noteStatus: SuspectNoteStatus) => {
    updateSuspect(suspectId, (suspect) => ({
      ...suspect,
      noteStatus,
      manuallyRuledOut: noteStatus === 'ruled-out',
    }))
  }

  const inspectSuspect = (suspectId: number) => {
    setActivePanel('suspects')
    navigate(`/suspects/${suspectId}`)
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

  const confirmAccusation = () => {
    if (!accusationTarget) {
      return
    }

    if (accusationTarget.pokemonId === currentCase.culpritPokemonId) {
      setCurrentCase((caseState) => ({ ...caseState, status: 'solved' }))
      resetTransientUi()
      navigate('/ending/solved')
      return
    }

    const nextAttempts = attemptsLeft - 1

    updateSuspect(accusationTarget.pokemonId, (suspect) => ({
      ...suspect,
      manuallyRuledOut: true,
      noteStatus: 'ruled-out',
    }))

    setWrongAccusationIds((ids) =>
      ids.includes(accusationTarget.pokemonId) ? ids : [...ids, accusationTarget.pokemonId],
    )
    setAttemptsLeft(nextAttempts)
    setAccusationTargetId(null)

    if (nextAttempts <= 0) {
      setCurrentCase((caseState) => ({ ...caseState, status: 'failed' }))
      resetTransientUi()
      navigate('/ending/failed')
      return
    }

    navigate(`/suspects/${accusationTarget.pokemonId}`)
  }

  const inspectGroup = (suspectId: number, groupKey: SuspectInvestigationGroup) => {
    updateSuspect(suspectId, (suspect) => ({
      ...suspect,
      inspectedGroups: {
        ...suspect.inspectedGroups,
        [groupKey]: true,
      },
    }))
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    setActivePanel('investigation')
    navigate(`/investigation/${locationId}`)
  }

  const investigateLocation = (locationId: string, actionId: string) => {
    const location = currentCase.locations.find((locationItem) => locationItem.id === locationId)
    const selectedAction = location?.actions.find((action) => action.id === actionId) ?? null

    if (location && selectedAction && !location.investigated) {
      setCurrentCase((caseState) => ({
        ...caseState,
        locations: caseState.locations.map((locationItem) =>
          locationItem.id === locationId
            ? {
                ...locationItem,
                investigated: true,
                selectedActionId: actionId,
                observationText: selectedAction.observationText,
                evidenceTitle: selectedAction.evidenceTitle ?? undefined,
                evidenceText: selectedAction.evidenceText ?? undefined,
              }
            : locationItem,
        ),
        evidence: caseState.evidence.map((evidenceItem) =>
          evidenceItem.id === selectedAction.evidenceId && (selectedAction.outcomeType === 'evidence' || selectedAction.outcomeType === 'witness')
            ? { ...evidenceItem, discovered: true }
            : evidenceItem,
        ),
      }))
      setLastInvestigatedLocationId(locationId)
    }
  }

  useEffect(() => {
    if (currentRoute === '/investigation') {
      clearScreenState()
      setHasStartedCase(true)
      setActivePanel('investigation')
      return
    }

    if (currentRoute === '/overview') {
      clearScreenState()
      setHasStartedCase(true)
      setActivePanel('investigation')
      return
    }

    if (currentRoute === '/suspects') {
      clearScreenState()
      setHasStartedCase(true)
      setActivePanel('suspects')
      return
    }

    if (currentRoute.startsWith('/suspects/')) {
      clearScreenState()
      setHasStartedCase(true)
      setActivePanel('suspects')
      return
    }

    if (currentRoute.startsWith('/investigation/')) {
      const locationId = currentRoute.replace('/investigation/', '')

      if (currentCase.locations.some((locationItem) => locationItem.id === locationId)) {
        clearScreenState()
        setHasStartedCase(true)
        setActivePanel('investigation')
        setSelectedLocationId(locationId)
      }
      return
    }

    if (currentRoute.startsWith('/accuse/')) {
      const suspectId = Number(currentRoute.replace('/accuse/', ''))

      if (currentCase.suspects.some((suspect) => suspect.pokemonId === suspectId)) {
        clearScreenState()
        setHasStartedCase(true)
        setActivePanel('suspects')
        setAccusationTargetId(suspectId)
      }
      return
    }

    if (currentRoute === '/ending/solved' && currentCase.status === 'solved') {
      clearScreenState()
      return
    }

    if (currentRoute === '/ending/failed' && currentCase.status === 'failed') {
      clearScreenState()
      return
    }

    if (currentRoute === '/ending/gave-up' && currentCase.status === 'gave-up') {
      clearScreenState()
    }
  }, [currentCase.locations, currentCase.status, currentCase.suspects, currentRoute])

  const giveUp = () => {
    setCurrentCase((caseState) => ({ ...caseState, status: 'gave-up' }))
    resetTransientUi()
    navigate('/ending/gave-up')
  }

  const setPrimaryPanel = (panel: 'investigation' | 'suspects') => {
    setActivePanel(panel)
    navigate(panel === 'suspects' ? '/suspects' : '/investigation')
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
    setActivePanel: setPrimaryPanel,
    startNewCase,
    giveUp,
  }

  return (
    <main className="app-shell">
      <DesktopSidebar
        activeSection={activeSidebarSection}
        canGiveUp={canGiveUp}
        onSelectOverview={() => navigate('/overview')}
        onSelectInvestigation={() => navigate('/investigation')}
        onSelectSuspects={() => navigate('/suspects')}
        onGiveUp={giveUp}
      />

      <div className="app-content">
        <Header currentCase={currentCase} />

        <Routes>
          <Route
            path="/overview"
            element={
              <CaseOverviewRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                startInvestigation={startInvestigation}
              />
            }
          />
          <Route path="/investigation" element={<CaseRoute {...sharedInvestigationRouteProps} />} />
          <Route
            path="/investigation/:locationId"
            element={
              <InvestigationLocationRoute
                attemptsLeft={attemptsLeft}
                currentCase={currentCase}
                investigateLocation={investigateLocation}
                openLocation={openLocation}
                selectedLocationId={selectedLocationId}
                setActivePanel={setPrimaryPanel}
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
              ) : currentCase.status === 'gave-up' ? (
                <Navigate to="/ending/gave-up" replace />
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
          <Route path="*" element={<Navigate to="/investigation" replace />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
