import { EndingScreen } from '../components/EndingScreen'
import type { Case, Suspect } from '../game/caseModel'

interface EndingRouteProps {
  currentCase: Case
  caseId: string
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
}

export function EndingRoute({
  currentCase,
  caseId,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
}: EndingRouteProps) {
  return (
    <div className="">
      <EndingScreen
        caseId={caseId}
        culpritSuspect={culpritSuspect}
        attemptsLeft={attemptsLeft}
        wrongAccusationCount={wrongAccusationCount}
        currentCase={currentCase}
      />
    </div>
  )
}
