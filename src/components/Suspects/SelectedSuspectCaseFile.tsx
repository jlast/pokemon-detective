import { SuspectActions } from './SuspectActions'
import { getDiscoveredEvidence, type Case, type Suspect, type SuspectNoteStatus } from '../../game/caseModel'
import { getDetectiveProfile } from '../../game/suspectCaseFile'
import { DetectiveProfile } from './DetectiveProfile'
import { SuspectEvidenceAssessment } from './SuspectEvidenceAssessment'

interface SelectedSuspectCaseFileProps {
  selectedSuspect: Suspect | null
  currentCase: Case
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
  showMobileActions?: boolean
}

export function SelectedSuspectCaseFile({ selectedSuspect, currentCase, wrongAccusationIds,
  setSuspectNoteStatus, openAccusation, attemptsLeft, showMobileActions = true,
}: SelectedSuspectCaseFileProps) {
  if (!selectedSuspect) return <p>Select a suspect to open their file.</p>

  const isHard = currentCase.difficulty === 'hard'
  const isFalseLead = wrongAccusationIds.includes(selectedSuspect.pokemonId)
  const isCleared = selectedSuspect.noteStatus === 'ruled-out'
  const status = isFalseLead ? 'False lead' : isCleared ? 'Cleared' : 'In lineup'

  return <div className={`suspect-record${isHard ? ' suspect-record--compact' : ''}`}>
    <div className="suspect-record__overview">
      <figure className={`suspect-record__photo${isFalseLead || isCleared ? ' is-cleared' : ''}`}>
        <div className="suspect-record__image">
          <img src={selectedSuspect.sprite} alt={selectedSuspect.name} />
          {selectedSuspect.isShiny ? <span className="shiny-stamp" aria-label="Shiny Pokémon">✨</span> : null}
        </div>
        <figcaption>{selectedSuspect.name}</figcaption>
        <span className={`suspect-record__status${isFalseLead ? ' is-false-lead' : isCleared ? ' is-cleared' : ''}`}>{status}</span>
      </figure>
      {!isHard ? <DetectiveProfile profile={getDetectiveProfile(selectedSuspect.pokemonId)} /> : (
        <section className="detective-profile" aria-label="Profile unavailable">
          <div className="detective-profile-card detective-profile-card--unavailable">
            <h3>Profile</h3>
            <p>Not available on hard mode.</p>
          </div>
        </section>
      )}
    </div>
    <SuspectEvidenceAssessment evidenceItems={getDiscoveredEvidence(currentCase)} />
    {showMobileActions ? <SuspectActions suspect={selectedSuspect} caseStatus={currentCase.status}
      isFalseLead={isFalseLead} attemptsLeft={attemptsLeft} setSuspectNoteStatus={setSuspectNoteStatus}
      openAccusation={openAccusation} className="suspect-dialog-actions" /> : null}
  </div>
}
