import { AccusationsPanel } from '../components/Suspects/AccusationsPanel'
import type { Case, Suspect } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface AccuseRouteProps {
  attemptsLeft: number
  currentCase: Case
  accusationTarget: Suspect
  openLocation: (locationId: string) => void
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
  openLocation,
  closeAccusation,
  confirmAccusation,
  setActivePanel,
  startNewCase,
  giveUp,
}: AccuseRouteProps) {
  return (
    <InvestigationRouteFrame
      activePanel="suspects"
      layout="none"
      attemptsLeft={attemptsLeft}
      currentCase={currentCase}
      openLocation={openLocation}
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
