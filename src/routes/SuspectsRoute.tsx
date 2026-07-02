import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function SuspectsRoute({
  attemptsLeft,
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  openLocation,
  setActivePanel,
  startNewCase,
  giveUp,
}: SuspectsRouteProps) {
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
      <SuspectsPanel
        currentCase={currentCase}
        wrongAccusationIds={wrongAccusationIds}
        inspectSuspect={inspectSuspect}
      />
    </InvestigationRouteFrame>
  )
}
