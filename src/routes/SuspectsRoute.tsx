import type { ReactNode } from 'react'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
  children?: ReactNode
}

export function SuspectsRoute({
  attemptsLeft,
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  setActivePanel,
  startNewCase,
  giveUp,
  children,
}: SuspectsRouteProps) {
  return (
    <InvestigationRouteFrame
      activePanel="suspects"
      layout="none"
      attemptsLeft={attemptsLeft}
      currentCase={currentCase}
      setActivePanel={setActivePanel}
      startNewCase={startNewCase}
      giveUp={giveUp}
    >
      <SuspectsPanel
        currentCase={currentCase}
        wrongAccusationIds={wrongAccusationIds}
        inspectSuspect={inspectSuspect}
      />
      {children}
    </InvestigationRouteFrame>
  )
}
