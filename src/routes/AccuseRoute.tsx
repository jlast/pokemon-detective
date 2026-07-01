import { AccusationsPanel } from '../components/Suspects/AccusationsPanel'
import type { Case, Suspect } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface AccuseRouteProps {
  attemptsLeft: number
  currentCase: Case
  accusationTarget: Suspect
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  openNotebook: () => void
  closeAccusation: () => void
  confirmAccusation: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function AccuseRoute({
  attemptsLeft,
  currentCase,
  accusationTarget,
  inspectSuspect,
  openLocation,
  openNotebook,
  closeAccusation,
  confirmAccusation,
  setActivePanel,
  startNewCase,
  giveUp,
}: AccuseRouteProps) {
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
      <AccusationsPanel
        closeAccusation={closeAccusation}
        confirmAccusation={confirmAccusation}
        accusationTarget={accusationTarget}
        attemptsLeft={attemptsLeft}
      />
    </InvestigationRouteFrame>
  )
}
