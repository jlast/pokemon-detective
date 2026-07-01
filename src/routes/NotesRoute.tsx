import { NotebookDetailsPanel } from '../components/Notebook/NotebookDetailsPanel'
import type { Case, Suspect } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface NotesRouteProps {
  attemptsLeft: number
  activeSuspects: Suspect[]
  ruledOutSuspects: Suspect[]
  currentCase: Case
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  openNotebook: () => void
  closeNotebook: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function NotesRoute({
  activeSuspects,
  ruledOutSuspects,
  currentCase,
  closeNotebook,
  ...props
}: NotesRouteProps) {
  return (
    <InvestigationRouteFrame
      activePanel="notebook"
      layout="none"
      currentCase={currentCase}
      {...props}
    >
      <NotebookDetailsPanel
        activeSuspects={activeSuspects}
        ruledOutSuspects={ruledOutSuspects}
        currentCase={currentCase}
        closeNotebook={closeNotebook}
      />
    </InvestigationRouteFrame>
  )
}
