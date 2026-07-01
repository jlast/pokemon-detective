import { CaseOverview } from '../components/CaseOverview'
import type { Case } from '../game/caseModel'

interface CaseOverviewRouteProps {
  attemptsLeft: number
  currentCase: Case
}

export function CaseOverviewRoute({ attemptsLeft, currentCase }: CaseOverviewRouteProps) {
  return (
    <div className=" main-layout-single">
      <CaseOverview gameCase={currentCase} attemptsLeft={attemptsLeft} />
    </div>
  )
}
