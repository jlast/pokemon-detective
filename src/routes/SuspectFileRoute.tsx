import { SuspectActions } from '../components/Suspects/SuspectActions'
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

  const suspectNavigation = (
    <nav className="suspect-file-adjacent-nav" aria-label="Adjacent suspects">
        {previousSuspect ? (
          <Link to={withSearch(suspectPath(previousSuspect.pokemonId))} className="suspect-file-arrow-link suspect-file-arrow-link-left" aria-label={`Previous suspect: ${previousSuspect.name}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            <span>Previous</span>
          </Link>
        ) : <span />}
        {nextSuspect ? (
          <Link to={withSearch(suspectPath(nextSuspect.pokemonId))} className="suspect-file-arrow-link suspect-file-arrow-link-right" aria-label={`Next suspect: ${nextSuspect.name}`}>
            <span>Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </Link>
        ) : <span />}
      </nav>
  )

  const dossier = (
    <section className="suspect-file-page">
      {selectedSuspectOverride ? <Link to={withSearch(backLinkTo)} className="subtle-link suspect-file-back-link">
        ← Back to Suspects Lineup
      </Link> : null}

      {selectedSuspectOverride ? suspectNavigation : null}

      <div className="dossier-shell">
        <span className="dossier-shell-tab">Suspect Dossier</span>
        <SelectedSuspectCaseFile
          selectedSuspect={selectedSuspect}
          currentCase={currentCase}
          wrongAccusationIds={wrongAccusationIds}
          setSuspectNoteStatus={setSuspectNoteStatus}
          openAccusation={openAccusation}
          attemptsLeft={attemptsLeft}
          showMobileActions={Boolean(selectedSuspectOverride)}
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
      headerNavigation={suspectNavigation}
      footer={<SuspectActions suspect={selectedSuspect} caseStatus={currentCase.status}
        isFalseLead={wrongAccusationIds.includes(selectedSuspect.pokemonId)} attemptsLeft={attemptsLeft}
        setSuspectNoteStatus={setSuspectNoteStatus} openAccusation={openAccusation} className="suspect-dialog-actions" />}
      className="suspect-dossier-dialog" closeLabel="Close dossier and return to suspects lineup"
      onClose={() => navigate(withSearch(backLinkTo), { state: { focusSuspectId: selectedSuspect.pokemonId } })}>
      {dossier}
    </BoardLocationDialog>
  </SuspectsRoute>
}
