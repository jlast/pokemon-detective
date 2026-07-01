import { SuspectsDetailsPanel } from '../components/Suspects/SuspectsDetailsPanel'
import type { Case, Suspect } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectRouteProps {
  attemptsLeft: number
  currentCase: Case
  selectedSuspect: Suspect
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  openNotebook: () => void
  closeSuspectSheet: () => void
  inspectFact: (suspectId: number, factKey: string) => void
  openAccusation: (suspectId: number) => void
  toggleRuledOut: (suspectId: number) => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function SuspectRoute({
  attemptsLeft,
  currentCase,
  selectedSuspect,
  wrongAccusationIds,
  inspectSuspect,
  openLocation,
  openNotebook,
  closeSuspectSheet,
  inspectFact,
  openAccusation,
  toggleRuledOut,
  setActivePanel,
  startNewCase,
  giveUp,
}: SuspectRouteProps) {
  return (
    <InvestigationRouteFrame
      activePanel="suspects"
      layout="suspects"
      attemptsLeft={attemptsLeft}
      currentCase={currentCase}
      inspectSuspect={inspectSuspect}
      openLocation={openLocation}
      openNotebook={openNotebook}
      setActivePanel={setActivePanel}
      startNewCase={startNewCase}
      giveUp={giveUp}
    >
      <SuspectsDetailsPanel
        attemptsLeft={attemptsLeft}
        closeSuspectSheet={closeSuspectSheet}
        currentCase={currentCase}
        inspectFact={inspectFact}
        openAccusation={openAccusation}
        selectedSuspect={selectedSuspect}
        toggleRuledOut={toggleRuledOut}
        wrongAccusationIds={wrongAccusationIds}
      />
    </InvestigationRouteFrame>
  )
}
