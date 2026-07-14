import { AccusationsPanel } from '../components/Suspects/AccusationsPanel'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from '../game/caseModel'
import { TODAY_SUSPECTS_PATH } from '../paths'
import { SuspectFileRoute } from './SuspectFileRoute'

interface AccuseRouteProps {
  attemptsLeft: number
  currentCase: Case
  accusationTarget: Suspect
  wrongAccusationIds: number[]
  inspectGroup: (suspectId: number, groupKey: SuspectInvestigationGroup) => void
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  closeAccusation: () => void
  confirmAccusation: () => void
}

export function AccuseRoute({
  attemptsLeft,
  currentCase,
  accusationTarget,
  wrongAccusationIds,
  inspectGroup,
  setSuspectNoteStatus,
  openAccusation,
  closeAccusation,
  confirmAccusation,
}: AccuseRouteProps) {
  return (
    <>
      <SuspectFileRoute
        currentCase={currentCase}
        selectedSuspectOverride={accusationTarget}
        backLinkTo={TODAY_SUSPECTS_PATH}
        wrongAccusationIds={wrongAccusationIds}
        inspectGroup={inspectGroup}
        setSuspectNoteStatus={setSuspectNoteStatus}
        openAccusation={openAccusation}
        attemptsLeft={attemptsLeft}
      />
        <AccusationsPanel
          closeAccusation={closeAccusation}
          confirmAccusation={confirmAccusation}
          accusationTarget={accusationTarget}
          attemptsLeft={attemptsLeft}
        />
    </>
  )
}
