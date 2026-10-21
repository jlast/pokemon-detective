import { BoardLocationDialog } from '../Evidence/BoardLocationDialog'
import { MugShot } from './MugShot'
import type { Suspect } from '../../game/caseModel'

interface AccusationsPanelProps {
  closeAccusation: () => void
  confirmAccusation: () => void
  accusationTarget: Suspect
  attemptsLeft: number
}

export function AccusationsPanel({
  closeAccusation,
  confirmAccusation,
  accusationTarget,
  attemptsLeft,
}: AccusationsPanelProps) {
  const attemptWarning = attemptsLeft <= 1
    ? 'A wrong accusation consumes your final attempt and ends the case.'
    : 'A wrong accusation consumes one attempt.'

  return (
    <BoardLocationDialog title={`Accuse ${accusationTarget.name}?`} className="accusation-confirmation"
      onClose={closeAccusation} closeLabel="Close accusation"
      footer={<div className="accusation-confirmation__actions">
        <button type="button" className="secondary-button" onClick={closeAccusation}>Cancel</button>
        <button type="button" className="primary-button" onClick={confirmAccusation} disabled={attemptsLeft <= 0}>
          Accuse {accusationTarget.name}
        </button>
      </div>}>
      <div className="accusation-confirmation__content">
        <div className="accusation-confirmation__portrait lineup-file__portrait"><MugShot suspect={accusationTarget} /></div>
        <div className="accusation-confirmation__copy">
          <p>A correct accusation ends the case.</p>
          <p className="accusation-confirmation__warning">
            {attemptWarning} You have {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} left.
          </p>
        </div>
      </div>
    </BoardLocationDialog>
  )
}
