import { EndingScreen } from '../components/EndingScreen'
import type { Case, Suspect } from '../game/caseModel'

interface EndingRouteProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
}

export function EndingRoute({
  currentCase,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
}: EndingRouteProps) {
  return (
    <div className="">
      <EndingScreen
        culpritSuspect={culpritSuspect}
        attemptsLeft={attemptsLeft}
        wrongAccusationCount={wrongAccusationCount}
        currentCase={currentCase}
      />
    </div>
  )
}
