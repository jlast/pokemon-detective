import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BoardLocationDialog } from '../components/Evidence/BoardLocationDialog'
import { SuspectsRoute } from './SuspectsRoute'
import { SelectedSuspectCaseFile } from '../components/Suspects/SelectedSuspectCaseFile'
import type { Case, Suspect, SuspectNoteStatus } from '../game/caseModel'
import { suspectPath, TODAY_SUSPECTS_PATH } from '../paths'

interface SuspectFileRouteProps {
  currentCase: Case
  selectedSuspectOverride?: Suspect | null
  backLinkTo?: string
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
}

export function SuspectFileRoute({
  currentCase,
  selectedSuspectOverride = null,
  backLinkTo = TODAY_SUSPECTS_PATH,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
}: SuspectFileRouteProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const routeLocation = useLocation()
  const withSearch = (path: string) => `${path}${routeLocation.search}`
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
        <Link to={withSearch(backLinkTo)} className="subtle-link suspect-file-back-link">
          ← Back to Suspects Lineup
        </Link>
        <div className="inspect-item">
          <strong>Suspect not found</strong>
          <p className="overview-section-hook">This suspect file could not be opened.</p>
          <Link to={withSearch(backLinkTo)} className="secondary-button suspect-file-back-button">
            Back to Suspects Lineup
          </Link>
        </div>
      </section>
    )
  }

  const dossier = (
    <section className="suspect-file-page">
      {selectedSuspectOverride ? <Link to={withSearch(backLinkTo)} className="subtle-link suspect-file-back-link">
        ← Back to Suspects Lineup
      </Link> : null}

      <nav className="suspect-file-adjacent-nav" aria-label="Adjacent suspects">
        {previousSuspect ? (
          <Link to={withSearch(suspectPath(previousSuspect.pokemonId))} className="suspect-file-arrow-link suspect-file-arrow-link-left">
            <span aria-hidden="true">←</span>
            <span>Previous suspect</span>
          </Link>
        ) : <span />}
        {nextSuspect ? (
          <Link to={withSearch(suspectPath(nextSuspect.pokemonId))} className="suspect-file-arrow-link suspect-file-arrow-link-right">
            <span>Next suspect</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : <span />}
      </nav>

      <div className="dossier-shell">
        <span className="dossier-shell-tab">Suspect Dossier</span>
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
  // Accusation confirmation retains its existing page and confirmation overlay.
  if (selectedSuspectOverride) return dossier
  return <SuspectsRoute currentCase={currentCase} wrongAccusationIds={wrongAccusationIds}
    attemptsLeft={attemptsLeft} setSuspectNoteStatus={setSuspectNoteStatus}
    inspectSuspect={id => navigate(withSearch(suspectPath(id)))}>
    <BoardLocationDialog title={selectedSuspect.name}
      subtitle={`Case file ${String(selectedSuspectIndex + 1).padStart(2, '0')} · ${selectedSuspectIndex + 1} of ${currentCase.suspects.length}`}
      className="suspect-dossier-dialog" closeLabel="Close dossier and return to suspects lineup"
      onClose={() => navigate(withSearch(backLinkTo), { state: { focusSuspectId: selectedSuspect.pokemonId } })}>
      {dossier}
    </BoardLocationDialog>
  </SuspectsRoute>
}
