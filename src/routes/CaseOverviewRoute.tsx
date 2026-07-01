import { CaseOverview } from '../components/CaseOverview'
import type { Case } from '../game/caseModel'

interface CaseOverviewRouteProps {
  attemptsLeft: number
  currentCase: Case
  startInvestigation: () => void
}

export function CaseOverviewRoute({ attemptsLeft, currentCase, startInvestigation }: CaseOverviewRouteProps) {
  return (
    <div className="main-layout-single">
      <CaseOverview
        gameCase={currentCase}
        attemptsLeft={attemptsLeft}
        startInvestigation={startInvestigation}
      />
    </div>
  )
}
