import { EndingScreen } from '../components/EndingScreen'
import type { Case, Suspect } from '../game/caseModel'

interface EndingRouteProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
  startNewCase: () => void
}

export function EndingRoute({
  currentCase,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
  startNewCase,
}: EndingRouteProps) {
  return (
    <div className="">
      <EndingScreen
        culpritSuspect={culpritSuspect}
        attemptsLeft={attemptsLeft}
        wrongAccusationCount={wrongAccusationCount}
        startNewCase={startNewCase}
        currentCase={currentCase}
      />
    </div>
  )
}
