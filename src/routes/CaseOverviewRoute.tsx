import { CaseFlowNav } from '../components/CaseFlowNav'
import { CaseOverview } from '../components/CaseOverview'
import type { Case } from '../game/caseModel'

interface CaseOverviewRouteProps {
  attemptsLeft: number
  currentCase: Case
  startInvestigation: () => void
  inspectSuspect?: (suspectId: number) => void
}

export function CaseOverviewRoute({ attemptsLeft, currentCase, startInvestigation, inspectSuspect }: CaseOverviewRouteProps) {
  return (
    <div className="main-layout-single">
      <CaseFlowNav currentCase={currentCase} />
      <CaseOverview
        gameCase={currentCase}
        attemptsLeft={attemptsLeft}
        startInvestigation={startInvestigation}
        onSelectSuspect={inspectSuspect}
      />
    </div>
  )
}
