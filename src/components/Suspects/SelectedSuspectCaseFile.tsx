import { getDiscoveredEvidence, type Case, type Suspect, type SuspectNoteStatus } from '../../game/caseModel'
import { getDetectiveProfile } from '../../game/suspectCaseFile'
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
}

export function SelectedSuspectCaseFile({
  selectedSuspect,
  currentCase,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
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
  const stampText = isFalseLead ? 'False Accusation' : selectedSuspect.noteStatus === 'ruled-out' ? 'Cleared' : 'Suspect'
  const stampClassName = isFalseLead ? 'is-false-lead' : selectedSuspect.noteStatus === 'ruled-out' ? 'is-cleared' : 'is-suspect'
  const suspectIndex = currentCase.suspects.findIndex((suspect) => suspect.pokemonId === selectedSuspect.pokemonId)
  const caseFileNumber = String(selectedSuspect.caseFileNumber ?? suspectIndex + 1).padStart(2, '0')
  const discoveredEvidence = getDiscoveredEvidence(currentCase)
  const detectiveProfile = getDetectiveProfile(selectedSuspect.pokemonId)
  const isSuspect = selectedSuspect.noteStatus !== 'ruled-out'
  const verdictDisabled = currentCase.status !== 'active'
  const accuseDisabled = verdictDisabled || attemptsLeft <= 0 || selectedSuspect.noteStatus === 'ruled-out' || isFalseLead
  const showDetectiveProfile = currentCase.difficulty !== 'hard'

  return (
    <div className="suspect-notebook-shell">
      <section className="selected-suspect-casefile dossier-panel notebook-card">
        <div className="suspect-notebook-body">
          <div className="suspect-mobile-action-strip" aria-label={`Your theory about ${selectedSuspect.name}`}>
            <button
              type="button"
              className={`suspect-verdict-toggle ${isSuspect ? 'is-cleared' : 'is-suspect'} is-selected`}
              onClick={() => setSuspectNoteStatus(selectedSuspect.pokemonId, isSuspect ? 'ruled-out' : 'suspect')}
              disabled={verdictDisabled || isFalseLead}
            >
              {isSuspect ? 'Clear' : 'Mark Suspect'}
            </button>
            <button
              type="button"
              className="primary-button suspect-verdict-accuse-button"
              onClick={() => openAccusation(selectedSuspect.pokemonId)}
              disabled={accuseDisabled}
            >
              Accuse
            </button>
          </div>

          <footer className="suspect-dossier-footer">
            <div>
              <strong>⚠ Final Decision</strong>
              <span>Sign off only when the clues point here.</span>
            </div>
            <button
              type="button"
              className="primary-button suspect-verdict-accuse-button"
              onClick={() => openAccusation(selectedSuspect.pokemonId)}
              disabled={accuseDisabled}
            >
              Accuse {selectedSuspect.name}
            </button>
          </footer>

          <div className="selected-suspect-overview-grid">
            <div className="suspect-left-column">
              <section className="selected-suspect-section selected-suspect-section-plain inspect-item suspect-overview-identity">
                <span className="suspect-identity-folder-tab">{selectedSuspect.name}</span>
                <span className={`suspect-dossier-stamp ${stampClassName}`} aria-hidden="true">{stampText}</span>
                <p className="dossier-file-number">Case File #{caseFileNumber}</p>
                <div className="selected-suspect-mugshot mugshot-frame">
                  <span className="suspect-photo-paperclip" aria-hidden="true" />
                  <MugShot suspect={selectedSuspect} />
                  <span className="mugshot-label">{selectedSuspect.name}</span>
                </div>
              </section>

              <SuspectVerdictPanel
                suspectName={selectedSuspect.name}
                status={selectedSuspect.noteStatus === 'ruled-out' ? 'cleared' : 'suspect'}
                onStatusChange={(noteStatus) => setSuspectNoteStatus(selectedSuspect.pokemonId, noteStatus)}
                attemptsLeft={attemptsLeft}
                disabled={verdictDisabled}
                isFalseLead={isFalseLead}
              />
            </div>

            <div className="suspect-evidence-column">
              {showDetectiveProfile ? (
                <DetectiveProfile profile={detectiveProfile} />
              ) : (
                <section className="detective-profile" aria-label="Detective profile unavailable">
                  <div className="detective-profile-card detective-profile-card--unavailable">
                    <h3>Suspect Dossier</h3>
                    <p>Not available on hard mode.</p>
                  </div>
                </section>
              )}
              <SuspectEvidenceAssessment
                evidenceItems={discoveredEvidence}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
