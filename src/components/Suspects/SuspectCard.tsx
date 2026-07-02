import type { Suspect } from '../../game/caseModel'
import { MugShot } from './MugShot'

interface SuspectCardProps {
  suspect: Suspect
  inspectSuspect: (suspectId: number) => void
  suspectIndex: number
  isSelected: boolean
  hasWrongAccusation: boolean
}

export function SuspectCard({
  suspect,
  inspectSuspect,
  suspectIndex,
  isSelected,
  hasWrongAccusation,
}: SuspectCardProps) {
  const boardStyles = [
    'lineup-suspect-card is-tilted-left',
    'lineup-suspect-card is-tilted-right-soft',
    'lineup-suspect-card is-tilted-left-soft',
    'lineup-suspect-card is-tilted-right',
    'lineup-suspect-card is-tilted-left-soft',
    'lineup-suspect-card is-tilted-right-soft',
  ]
  const caseFileNumber = String(suspectIndex + 1).padStart(2, '0')
  const statusText = hasWrongAccusation
    ? 'False Lead'
    : suspect.noteStatus === 'ruled-out'
      ? 'Cleared'
      : 'Suspect'
  const stampClassName = hasWrongAccusation
    ? 'is-false-lead'
    : suspect.noteStatus === 'ruled-out'
      ? 'is-cleared'
      : 'is-suspect'
  const usesStrongStamp = true

  return (
    <button
      type="button"
      className={`suspect-card notebook-card ${boardStyles[suspect.pokemonId % boardStyles.length]} ${suspect.manuallyRuledOut ? 'is-ruled-out' : ''} ${isSelected ? 'is-selected' : ''} ${hasWrongAccusation ? 'is-latest-miss' : ''}`}
      onClick={() => inspectSuspect(suspect.pokemonId)}
    >
      <span className="suspect-file-tab" aria-hidden="true" />
      <span className="suspect-file-number">Case File #{caseFileNumber}</span>
      {usesStrongStamp ? <span className={`suspect-status-stamp ${stampClassName}`}>{statusText}</span> : null}
      <div className="suspect-card-top">
        <div className="suspect-mugshot">
          <MugShot suspect={suspect} />
        </div>
        <h3 className="suspect-name">{suspect.name}</h3>
      </div>
      <p className="suspect-card-status">Status: {statusText}</p>
      <span className="suspect-card-link">Open case file →</span>
    </button>
  )
}
