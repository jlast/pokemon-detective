import { getDiscoveredEvidence, type Case, type EvidenceNoteStatus, type Suspect, type SuspectNoteStatus } from '../../game/caseModel'
import { getDetectiveProfile, getPokemonById, getSceneMeasurementComparisons, getSuspectEvidenceEvaluations } from '../../game/suspectCaseFile'
import { DetectiveProfile } from './DetectiveProfile'
import { MugShot } from './MugShot'
import { SuspectEvidenceAssessment } from './SuspectEvidenceAssessment'
import { SuspectVerdictPanel } from './SuspectVerdictPanel'

interface SelectedSuspectCaseFileProps {
  selectedSuspect: Suspect | null
  currentCase: Case
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
  evidenceNotes: Record<string, EvidenceNoteStatus>
  evidenceFilter: 'all' | 'important' | 'revisit'
  setEvidenceFilter: (filter: 'all' | 'important' | 'revisit') => void
  setEvidenceNoteStatus: (evidenceId: string, status: EvidenceNoteStatus) => void
}

export function SelectedSuspectCaseFile({
  selectedSuspect,
  currentCase,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
  evidenceNotes,
  evidenceFilter,
  setEvidenceFilter,
  setEvidenceNoteStatus,
}: SelectedSuspectCaseFileProps) {
  if (!selectedSuspect) {
    return (
      <div className="suspect-notebook-shell">
        <div className="suspect-notebook-tabs" aria-label="Suspect file">
          <span className="suspect-notebook-tab is-active">Suspect File</span>
        </div>
        <section className="selected-suspect-casefile dossier-panel notebook-card">
          <div className="suspect-notebook-body">
            <div className="selected-suspect-empty inspect-item">
              <strong>Select a suspect to open their case file.</strong>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const isFalseLead = wrongAccusationIds.includes(selectedSuspect.pokemonId)
  const statusText = isFalseLead ? 'False Lead' : selectedSuspect.noteStatus === 'ruled-out' ? 'Cleared' : 'Suspect'
  const statusClassName = isFalseLead ? 'is-false-lead' : selectedSuspect.noteStatus === 'ruled-out' ? 'is-cleared' : 'is-suspect'
  const suspectIndex = currentCase.suspects.findIndex((suspect) => suspect.pokemonId === selectedSuspect.pokemonId)
  const caseFileNumber = String(selectedSuspect.caseFileNumber ?? suspectIndex + 1).padStart(2, '0')
  const caseNote = selectedSuspect.witnessNote ?? selectedSuspect.lastKnownDetail
  const discoveredEvidence = getDiscoveredEvidence(currentCase)
  const pokemon = getPokemonById(selectedSuspect.pokemonId)
  const detectiveProfile = {
    ...getDetectiveProfile(selectedSuspect.pokemonId),
    measurementComparisons: getSceneMeasurementComparisons(pokemon, discoveredEvidence),
  }
  const evidenceEvaluations = getSuspectEvidenceEvaluations(pokemon, discoveredEvidence)

  return (
    <div className="suspect-notebook-shell">
      <div className="suspect-notebook-tabs" aria-label="Suspect file">
        <span className="suspect-notebook-tab is-active">{selectedSuspect.name}</span>
      </div>

      <section className="selected-suspect-casefile dossier-panel notebook-card">
        <div className="suspect-notebook-body">
          <div className="selected-suspect-overview-grid">
            <section className="selected-suspect-section selected-suspect-section-plain inspect-item suspect-overview-identity">
              <p className="dossier-file-number">Case File #{caseFileNumber}</p>
              <div className="selected-suspect-mugshot mugshot-frame">
                <MugShot suspect={selectedSuspect} />
                <span className="mugshot-label">{selectedSuspect.name}</span>
              </div>
              <div className="selected-suspect-status-row">
                <span className="selected-suspect-status-label">Status</span>
                <span className={`status-stamp ${statusClassName}`}>{statusText}</span>
                </div>
              {caseNote ? (
                <aside className="suspect-case-note-slip">
                  <strong>{selectedSuspect.witnessNote ? 'Witness note' : 'Last known sighting'}</strong>
                  <p>{caseNote}</p>
                </aside>
              ) : null}
            </section>

            <SuspectVerdictPanel
              suspectName={selectedSuspect.name}
              status={selectedSuspect.noteStatus === 'ruled-out' ? 'cleared' : 'suspect'}
              onStatusChange={(noteStatus) => setSuspectNoteStatus(selectedSuspect.pokemonId, noteStatus)}
              onAccuse={() => openAccusation(selectedSuspect.pokemonId)}
              attemptsLeft={attemptsLeft}
              disabled={currentCase.status !== 'active'}
              isFalseLead={isFalseLead}
            />

            <SuspectEvidenceAssessment
              evidenceItems={discoveredEvidence}
              pokemon={pokemon}
              evaluations={evidenceEvaluations}
              evidenceNotes={evidenceNotes}
              evidenceFilter={evidenceFilter}
              onEvidenceFilterChange={setEvidenceFilter}
              onEvidenceNoteChange={setEvidenceNoteStatus}
            />

            <DetectiveProfile profile={detectiveProfile} />
          </div>
        </div>
      </section>
    </div>
  )
}
