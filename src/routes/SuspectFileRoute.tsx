import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SelectedSuspectCaseFile } from '../components/Suspects/SelectedSuspectCaseFile'
import type { Case, SuspectInvestigationGroup, SuspectNoteStatus } from '../game/caseModel'

interface SuspectFileRouteProps {
  currentCase: Case
  wrongAccusationIds: number[]
  inspectGroup: (suspectId: number, groupKey: SuspectInvestigationGroup) => void
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  toggleRuledOut: (suspectId: number) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
}

export function SuspectFileRoute({
  currentCase,
  wrongAccusationIds,
  inspectGroup,
  setSuspectNoteStatus,
  toggleRuledOut,
  openAccusation,
  attemptsLeft,
}: SuspectFileRouteProps) {
  const { id } = useParams()
  const [expandedGroup, setExpandedGroup] = useState<SuspectInvestigationGroup | null>(null)
  const suspectId = Number(id)
  const selectedSuspect = currentCase.suspects.find((suspect) => suspect.pokemonId === suspectId) ?? null

  if (!selectedSuspect) {
    return (
      <section className="suspect-file-page notebook-card">
        <Link to="/suspects" className="subtle-link">
          ← Back to suspects
        </Link>
        <div className="inspect-item">
          <strong>Suspect not found</strong>
          <p className="overview-section-hook">This suspect file could not be opened.</p>
          <Link to="/suspects" className="secondary-button suspect-file-back-button">
            Back to suspects
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="suspect-file-page">
      <Link to="/suspects" className="subtle-link suspect-file-back-link">
        ← Back to suspects
      </Link>

      <div className="dossier-shell">
        <SelectedSuspectCaseFile
          selectedSuspect={selectedSuspect}
          currentCase={currentCase}
          wrongAccusationIds={wrongAccusationIds}
          expandedGroup={expandedGroup}
          inspectGroup={inspectGroup}
          setExpandedGroup={setExpandedGroup}
          setSuspectNoteStatus={setSuspectNoteStatus}
          toggleRuledOut={toggleRuledOut}
          openAccusation={openAccusation}
          attemptsLeft={attemptsLeft}
        />
      </div>
    </section>
  )
}
