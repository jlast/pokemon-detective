import { AccusationsPanel } from '../components/Suspects/AccusationsPanel'
import type { Case, EvidenceNoteStatus, Suspect, SuspectNoteStatus } from '../game/caseModel'
import { TODAY_SUSPECTS_PATH } from '../paths'
import { SuspectFileRoute } from './SuspectFileRoute'

interface AccuseRouteProps {
  attemptsLeft: number
  currentCase: Case
  accusationTarget: Suspect
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  closeAccusation: () => void
  confirmAccusation: () => void
  evidenceNotes: Record<string, EvidenceNoteStatus>
  evidenceFilter: 'all' | 'important' | 'revisit'
  setEvidenceFilter: (filter: 'all' | 'important' | 'revisit') => void
  setEvidenceNoteStatus: (evidenceId: string, status: EvidenceNoteStatus) => void
}

export function AccuseRoute({
  attemptsLeft,
  currentCase,
  accusationTarget,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  closeAccusation,
  confirmAccusation,
  evidenceNotes,
  evidenceFilter,
  setEvidenceFilter,
  setEvidenceNoteStatus,
}: AccuseRouteProps) {
  return (
    <>
      <SuspectFileRoute
        currentCase={currentCase}
        selectedSuspectOverride={accusationTarget}
        backLinkTo={TODAY_SUSPECTS_PATH}
        wrongAccusationIds={wrongAccusationIds}
        setSuspectNoteStatus={setSuspectNoteStatus}
        openAccusation={openAccusation}
        attemptsLeft={attemptsLeft}
        evidenceNotes={evidenceNotes}
        evidenceFilter={evidenceFilter}
        setEvidenceFilter={setEvidenceFilter}
        setEvidenceNoteStatus={setEvidenceNoteStatus}
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
