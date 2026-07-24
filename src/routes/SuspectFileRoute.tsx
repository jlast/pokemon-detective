import { Link, useParams } from 'react-router-dom'
import { SelectedSuspectCaseFile } from '../components/Suspects/SelectedSuspectCaseFile'
import type { Case, EvidenceNoteStatus, Suspect, SuspectNoteStatus } from '../game/caseModel'
import { suspectPath, TODAY_SUSPECTS_PATH } from '../paths'

interface SuspectFileRouteProps {
  currentCase: Case
  selectedSuspectOverride?: Suspect | null
  backLinkTo?: string
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
  evidenceNotes: Record<string, EvidenceNoteStatus>
  evidenceFilter: 'all' | 'important' | 'revisit'
  setEvidenceFilter: (filter: 'all' | 'important' | 'revisit') => void
  setEvidenceNoteStatus: (evidenceId: string, status: EvidenceNoteStatus) => void
}

export function SuspectFileRoute({
  currentCase,
  selectedSuspectOverride = null,
  backLinkTo = TODAY_SUSPECTS_PATH,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
  evidenceNotes,
  evidenceFilter,
  setEvidenceFilter,
  setEvidenceNoteStatus,
}: SuspectFileRouteProps) {
  const { id } = useParams()
  const suspectId = Number(id)
  const selectedSuspect =
    selectedSuspectOverride ??
    currentCase.suspects.find((suspect) => suspect.pokemonId === suspectId) ??
    null
  const selectedSuspectIndex = selectedSuspect
    ? currentCase.suspects.findIndex((suspect) => suspect.pokemonId === selectedSuspect.pokemonId)
    : -1
  const previousSuspect = selectedSuspectIndex > 0 ? currentCase.suspects[selectedSuspectIndex - 1] : null
  const nextSuspect = selectedSuspectIndex >= 0 && selectedSuspectIndex < currentCase.suspects.length - 1
    ? currentCase.suspects[selectedSuspectIndex + 1]
    : null

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

      <nav className="suspect-file-adjacent-nav" aria-label="Adjacent suspects">
        {previousSuspect ? (
          <Link to={suspectPath(previousSuspect.pokemonId)} className="suspect-file-arrow-link suspect-file-arrow-link-left">
            <span aria-hidden="true">←</span>
            <span>Previous suspect</span>
          </Link>
        ) : <span />}
        {nextSuspect ? (
          <Link to={suspectPath(nextSuspect.pokemonId)} className="suspect-file-arrow-link suspect-file-arrow-link-right">
            <span>Next suspect</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : <span />}
      </nav>

      <div className="dossier-shell">
        <SelectedSuspectCaseFile
          selectedSuspect={selectedSuspect}
          currentCase={currentCase}
          wrongAccusationIds={wrongAccusationIds}
          setSuspectNoteStatus={setSuspectNoteStatus}
          openAccusation={openAccusation}
          attemptsLeft={attemptsLeft}
          evidenceNotes={evidenceNotes}
          evidenceFilter={evidenceFilter}
          setEvidenceFilter={setEvidenceFilter}
          setEvidenceNoteStatus={setEvidenceNoteStatus}
        />
      </div>
    </section>
  )
}
