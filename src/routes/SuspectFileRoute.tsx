import { Link, useParams } from 'react-router-dom'
import { SelectedSuspectCaseFile } from '../components/Suspects/SelectedSuspectCaseFile'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from '../game/caseModel'

interface SuspectFileRouteProps {
  currentCase: Case
  selectedSuspectOverride?: Suspect | null
  backLinkTo?: string
  wrongAccusationIds: number[]
  inspectGroup: (suspectId: number, groupKey: SuspectInvestigationGroup) => void
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
}

export function SuspectFileRoute({
  currentCase,
  selectedSuspectOverride = null,
  backLinkTo = '/suspects',
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
}: SuspectFileRouteProps) {
  const { id } = useParams()
  const suspectId = Number(id)
  const selectedSuspect =
    selectedSuspectOverride ??
    currentCase.suspects.find((suspect) => suspect.pokemonId === suspectId) ??
    null

  if (!selectedSuspect) {
    return (
      <section className="suspect-file-page notebook-card">
        <Link to={backLinkTo} className="subtle-link suspect-file-back-link">
          ← Back to Suspects Lineup
        </Link>
        <div className="inspect-item">
          <strong>Suspect not found</strong>
          <p className="overview-section-hook">This suspect file could not be opened.</p>
          <Link to={backLinkTo} className="secondary-button suspect-file-back-button">
            Back to Suspects Lineup
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="suspect-file-page">
      <Link to={backLinkTo} className="subtle-link suspect-file-back-link">
        ← Back to Suspects Lineup
      </Link>

      <div className="dossier-shell">
        <SelectedSuspectCaseFile
          selectedSuspect={selectedSuspect}
          currentCase={currentCase}
          wrongAccusationIds={wrongAccusationIds}
          setSuspectNoteStatus={setSuspectNoteStatus}
          openAccusation={openAccusation}
          attemptsLeft={attemptsLeft}
        />
      </div>
    </section>
  )
}
