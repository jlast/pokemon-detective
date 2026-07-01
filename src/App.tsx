import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { DesktopSidebar } from './components/DesktopSidebar'
import { createMissingCookiesCase } from './game/cases'
import type { Case, Suspect } from './game/caseModel'
import { Header } from './components/Header'
import { AccuseRoute } from './routes/AccuseRoute'
import { CaseOverviewRoute } from './routes/CaseOverviewRoute'
import { CaseRoute } from './routes/CaseRoute'
import { EndingRoute } from './routes/EndingRoute'
import { LocationRoute } from './routes/LocationRoute'
import { NotesRoute } from './routes/NotesRoute'
import { SuspectRoute } from './routes/SuspectRoute'
import { SuspectsRoute } from './routes/SuspectsRoute'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentCase, setCurrentCase] = useState<Case>(() => createMissingCookiesCase())
  const [, setHasStartedCase] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [accusationTargetId, setAccusationTargetId] = useState<number | null>(null)
  const [wrongAccusationIds, setWrongAccusationIds] = useState<number[]>([])
  const [, setActivePanel] = useState<'investigation' | 'suspects' | 'notebook'>('investigation')

  const ruledOutSuspects = currentCase.suspects.filter((suspect) => suspect.manuallyRuledOut)
  const activeSuspects = currentCase.suspects.filter((suspect) => !suspect.manuallyRuledOut)
  const selectedSuspect =
    currentCase.suspects.find((suspect) => suspect.pokemonId === selectedSuspectId) ?? null
  const accusationTarget =
    currentCase.suspects.find((suspect) => suspect.pokemonId === accusationTargetId) ?? null
  const selectedLocation =
    currentCase.locations.find((location) => location.id === selectedLocationId) ?? null
  const selectedLocationEvidence = selectedLocation
    ? currentCase.evidence.find((evidenceItem) => evidenceItem.id === selectedLocation.evidenceId) ?? null
    : null
  const culpritSuspect =
    currentCase.suspects.find((suspect) => suspect.pokemonId === currentCase.culpritPokemonId) ?? null
  const endingExplanation = currentCase.evidence.map((evidenceItem) => evidenceItem.endExplanation)
  const currentRoute = location.pathname
  const activeSidebarSection =
    currentRoute === '/overview'
      ? 'overview'
      : currentRoute === '/notes'
      ? 'notes'
        : currentRoute === '/suspects' || currentRoute.startsWith('/suspect/') || currentRoute.startsWith('/accuse/')
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
    setSelectedSuspectId(null)
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
    resetTransientUi()
    navigate('/investigation')
  }

  const toggleRuledOut = (suspectId: number) => {
    updateSuspect(suspectId, (suspect) => ({
      ...suspect,
      manuallyRuledOut: !suspect.manuallyRuledOut,
    }))
  }

  const inspectSuspect = (suspectId: number) => {
    setSelectedSuspectId(suspectId)
    setActivePanel('suspects')
    navigate(`/suspect/${suspectId}`)
  }

  const closeSuspectSheet = () => {
    setSelectedSuspectId(null)
    navigate('/suspects')
  }

  const openAccusation = (suspectId: number) => {
    setAccusationTargetId(suspectId)
    navigate(`/accuse/${suspectId}`)
  }

  const closeAccusation = () => {
    setAccusationTargetId(null)
    navigate('/suspects')
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

    navigate('/suspects')
  }

  const openNotebook = () => {
    setActivePanel('notebook')
    navigate('/notes')
  }

  const closeNotebook = () => {
    setActivePanel('investigation')
    navigate('/investigation')
  }

  const inspectFact = (suspectId: number, factKey: string) => {
    updateSuspect(suspectId, (suspect) => ({
      ...suspect,
      inspectedFacts: suspect.inspectedFacts.map((fact) =>
        fact.key === factKey ? { ...fact, discovered: true } : fact,
      ),
    }))
  }

  const openLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    setActivePanel('investigation')
    navigate(`/location/${locationId}`)
  }

  const closeLocation = () => {
    setSelectedLocationId(null)
    navigate('/investigation')
  }

  const addEvidenceToNotebook = () => {
    if (!selectedLocation || !selectedLocationEvidence) {
      return
    }

    setCurrentCase((caseState) => ({
      ...caseState,
      locations: caseState.locations.map((location) =>
        location.id === selectedLocation.id ? { ...location, investigated: true } : location,
      ),
      evidence: caseState.evidence.map((evidenceItem) =>
        evidenceItem.id === selectedLocationEvidence.id
          ? { ...evidenceItem, discovered: true }
          : evidenceItem,
      ),
    }))

    setSelectedLocationId(null)
    setActivePanel('notebook')
    navigate('/notes')
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

    if (currentRoute === '/notes') {
      clearScreenState()
      setHasStartedCase(true)
      setActivePanel('notebook')
      return
    }

    if (currentRoute.startsWith('/location/')) {
      const locationId = currentRoute.replace('/location/', '')

      if (currentCase.locations.some((locationItem) => locationItem.id === locationId)) {
        clearScreenState()
        setHasStartedCase(true)
        setActivePanel('investigation')
        setSelectedLocationId(locationId)
      }
      return
    }

    if (currentRoute.startsWith('/suspect/')) {
      const suspectId = Number(currentRoute.replace('/suspect/', ''))

      if (currentCase.suspects.some((suspect) => suspect.pokemonId === suspectId)) {
        clearScreenState()
        setHasStartedCase(true)
        setActivePanel('suspects')
        setSelectedSuspectId(suspectId)
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
    inspectSuspect,
    openLocation,
    openNotebook,
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
        onSelectNotes={() => navigate('/notes')}
        onGiveUp={giveUp}
      />

      <div className="app-content">
        <Header currentCase={currentCase} attemptsLeft={attemptsLeft} />

        <Routes>
          <Route
            path="/overview"
            element={<CaseOverviewRoute attemptsLeft={attemptsLeft} currentCase={currentCase} />}
          />
          <Route path="/investigation" element={<CaseRoute {...sharedInvestigationRouteProps} />} />
          <Route path="/suspects" element={<SuspectsRoute {...sharedInvestigationRouteProps} />} />
          <Route
            path="/notes"
            element={
              <NotesRoute
                {...sharedInvestigationRouteProps}
                activeSuspects={activeSuspects}
                ruledOutSuspects={ruledOutSuspects}
                closeNotebook={closeNotebook}
              />
            }
          />
          <Route
            path="/location/:locationId"
            element={
              selectedLocation && selectedLocationEvidence ? (
                <LocationRoute
                  {...sharedInvestigationRouteProps}
                  selectedLocation={selectedLocation}
                  selectedLocationEvidence={selectedLocationEvidence}
                  closeLocation={closeLocation}
                  addEvidenceToNotebook={addEvidenceToNotebook}
                />
              ) : (
                <Navigate to="/investigation" replace />
              )
            }
          />
          <Route
            path="/suspect/:suspectId"
            element={
              selectedSuspect ? (
                <SuspectRoute
                  {...sharedInvestigationRouteProps}
                  selectedSuspect={selectedSuspect}
                  wrongAccusationIds={wrongAccusationIds}
                  closeSuspectSheet={closeSuspectSheet}
                  inspectFact={inspectFact}
                  openAccusation={openAccusation}
                  toggleRuledOut={toggleRuledOut}
                />
              ) : (
                <Navigate to="/suspects" replace />
              )
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
                endingExplanation={endingExplanation}
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
