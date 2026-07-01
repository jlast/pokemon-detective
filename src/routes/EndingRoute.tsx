import { EndingScreen } from '../components/EndingScreen'
import type { Case, Suspect } from '../game/caseModel'

interface EndingRouteProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  endingExplanation: string[]
  startNewCase: () => void
}

export function EndingRoute({ currentCase, culpritSuspect, endingExplanation, startNewCase }: EndingRouteProps) {
  return (
    <div className="">
      <EndingScreen
        culpritSuspect={culpritSuspect}
        endingExplanation={endingExplanation}
        startNewCase={startNewCase}
        currentCase={currentCase}
      />
    </div>
  )
}
