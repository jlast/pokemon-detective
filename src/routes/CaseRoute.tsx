import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface CaseRouteProps {
  attemptsLeft: number
  currentCase: Case
  inspectSuspect: (suspectId: number) => void
  investigateLocation: (locationId: string) => void
  openLocation: (locationId: string) => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function CaseRoute(props: CaseRouteProps) {
  return <InvestigationRouteFrame activePanel="investigation" layout="locations" {...props} />
}
