import { EndingScreen } from '../components/EndingScreen'
import type { CaseStatsResponse } from '../api'
import type { Case, Suspect } from '../game/caseModel'

interface EndingRouteProps {
  currentCase: Case
  caseId: string
  culpritSuspect: Suspect | null
  caseStats: CaseStatsResponse | null
  caseStreak: number
  playerGuessCount: number
}

export function EndingRoute({
  currentCase,
  caseId,
  culpritSuspect,
  caseStats,
  caseStreak,
  playerGuessCount,
}: EndingRouteProps) {
  return (
    <div className="">
      <EndingScreen
        caseId={caseId}
        culpritSuspect={culpritSuspect}
        currentCase={currentCase}
        caseStats={caseStats}
        caseStreak={caseStreak}
        playerGuessCount={playerGuessCount}
      />
    </div>
  )
}
