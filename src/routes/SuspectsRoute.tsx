import type { ReactNode } from 'react'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case, SuspectNoteStatus } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  setSuspectNoteStatus: (suspectId: number, status: SuspectNoteStatus) => void
  children?: ReactNode
}

export function SuspectsRoute({
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  setSuspectNoteStatus,
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
        setSuspectNoteStatus={setSuspectNoteStatus}
      />
      {children}
    </InvestigationRouteFrame>
  )
}
