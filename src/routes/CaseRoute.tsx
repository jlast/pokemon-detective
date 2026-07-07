import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface CaseRouteProps {
  attemptsLeft: number
  currentCase: Case
  openLocation: (locationId: string) => void
  startNewCase: () => void
  giveUp: () => void
}

export function CaseRoute(props: CaseRouteProps) {
  return <InvestigationRouteFrame layout="locations" {...props} />
}
