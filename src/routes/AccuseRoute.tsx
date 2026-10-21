import { useLocation, useNavigate } from 'react-router-dom'
import { AccusationsPanel } from '../components/Suspects/AccusationsPanel'
import type { Case, Suspect, SuspectNoteStatus } from '../game/caseModel'
import { suspectPath } from '../paths'
import { SuspectsRoute } from './SuspectsRoute'

interface AccuseRouteProps {
  attemptsLeft: number
  currentCase: Case
  accusationTarget: Suspect
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  closeAccusation: () => void
  confirmAccusation: () => void
}

export function AccuseRoute({
  attemptsLeft,
  currentCase,
  accusationTarget,
  wrongAccusationIds,
  setSuspectNoteStatus,
  closeAccusation,
  confirmAccusation,
}: AccuseRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <SuspectsRoute currentCase={currentCase} wrongAccusationIds={wrongAccusationIds}
      attemptsLeft={attemptsLeft} setSuspectNoteStatus={setSuspectNoteStatus}
      inspectSuspect={id => navigate(`${suspectPath(id)}${location.search}`)}>
      <AccusationsPanel closeAccusation={closeAccusation} confirmAccusation={confirmAccusation}
        accusationTarget={accusationTarget} attemptsLeft={attemptsLeft} />
    </SuspectsRoute>
  )
}
