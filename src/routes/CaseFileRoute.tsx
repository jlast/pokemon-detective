import type { Case } from '../game/caseModel'
import { CaseOverview } from '../components/CaseOverview'

interface CaseFileRouteProps {
  attemptsLeft: number
  currentCase: Case
  startInvestigation: () => void
}

export function CaseFileRoute({ attemptsLeft, currentCase, startInvestigation }: CaseFileRouteProps) {
  return (
    <div className="main-layout">
      <CaseOverview
        gameCase={currentCase}
        attemptsLeft={attemptsLeft}
        startInvestigation={startInvestigation}
      />
    </div>
  )
}
