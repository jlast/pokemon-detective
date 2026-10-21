import type { Case, Suspect, SuspectNoteStatus } from '../../game/caseModel'

interface SuspectActionsProps {
  suspect: Suspect
  caseStatus: Case['status']
  isFalseLead: boolean
  attemptsLeft: number
  setSuspectNoteStatus: (id: number, status: SuspectNoteStatus) => void
  openAccusation: (id: number) => void
  className?: string
}

export function SuspectActions({ suspect, caseStatus, isFalseLead, attemptsLeft,
  setSuspectNoteStatus, openAccusation, className = 'suspect-mobile-action-strip' }: SuspectActionsProps) {
  const isSuspect = suspect.noteStatus !== 'ruled-out'
  const disabled = caseStatus !== 'active' || isFalseLead
  return <div className={className} aria-label={`Your theory about ${suspect.name}`}>
    <button type="button" className={`suspect-verdict-toggle ${isSuspect ? 'is-cleared' : 'is-suspect'} is-selected`}
      disabled={disabled} onClick={() => setSuspectNoteStatus(suspect.pokemonId, isSuspect ? 'ruled-out' : 'suspect')}>
      {isSuspect ? 'Clear' : 'Mark Suspect'}
    </button>
    <button type="button" className="primary-button suspect-verdict-accuse-button"
      disabled={disabled || attemptsLeft <= 0 || !isSuspect} onClick={() => openAccusation(suspect.pokemonId)}>
      Accuse
    </button>
  </div>
}
