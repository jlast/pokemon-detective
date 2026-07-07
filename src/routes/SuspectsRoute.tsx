import type { ReactNode } from 'react'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  startNewCase: () => void
  giveUp: () => void
  children?: ReactNode
}

export function SuspectsRoute({
  attemptsLeft,
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  startNewCase,
  giveUp,
  children,
}: SuspectsRouteProps) {
  return (
    <InvestigationRouteFrame
      layout="none"
      attemptsLeft={attemptsLeft}
      currentCase={currentCase}
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
