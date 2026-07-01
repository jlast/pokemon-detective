import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface CaseRouteProps {
  attemptsLeft: number
  currentCase: Case
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  openNotebook: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function CaseRoute(props: CaseRouteProps) {
  return <InvestigationRouteFrame activePanel="investigation" layout="locations" {...props} />
}
