import type { ReactNode } from 'react'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  children?: ReactNode
}

export function SuspectsRoute({
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  children,
}: SuspectsRouteProps) {
  return (
    <InvestigationRouteFrame
      layout="none"
      currentCase={currentCase}
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
