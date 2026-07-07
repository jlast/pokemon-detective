import { CaseFlowNav } from '../components/CaseFlowNav'
import { CaseOverview } from '../components/CaseOverview'
import type { Case } from '../game/caseModel'

interface CaseOverviewRouteProps {
  attemptsLeft: number
  currentCase: Case
  startInvestigation: () => void
  startNewCase: () => void
  giveUp: () => void
  inspectSuspect?: (suspectId: number) => void
}

export function CaseOverviewRoute({ attemptsLeft, currentCase, startInvestigation, startNewCase, giveUp, inspectSuspect }: CaseOverviewRouteProps) {
  return (
    <div className="main-layout-single">
      <CaseFlowNav />
      <CaseOverview
        gameCase={currentCase}
        attemptsLeft={attemptsLeft}
        startInvestigation={startInvestigation}
        onSelectSuspect={inspectSuspect}
      />
      <footer className="utility-bar notebook-card">
        <button type="button" className="secondary-button" onClick={startNewCase}>
          New case
        </button>
        <button type="button" className="secondary-button danger-button" onClick={giveUp}>
          Give up
        </button>
      </footer>
    </div>
  )
}
