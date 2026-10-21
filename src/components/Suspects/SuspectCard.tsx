import type { CSSProperties } from 'react'
import type { Suspect, SuspectNoteStatus } from '../../game/caseModel'
import { MugShot } from './MugShot'

interface SuspectCardProps {
  suspect: Suspect
  inspectSuspect: (suspectId: number) => void
  setSuspectNoteStatus: (suspectId: number, status: SuspectNoteStatus) => void
  suspectIndex: number
  isSelected: boolean
  hasWrongAccusation: boolean
  disabled?: boolean
}

export function SuspectCard({ suspect, inspectSuspect, setSuspectNoteStatus, suspectIndex,
  isSelected, hasWrongAccusation, disabled = false }: SuspectCardProps) {
  const ruledOut = suspect.noteStatus === 'ruled-out'
  const cleared = ruledOut || hasWrongAccusation
  return <article className={`suspect-card notebook-card lineup-file ${cleared ? 'is-ruled-out' : ''} ${isSelected ? 'is-selected' : ''}`}
    style={{ '--file-tilt': `${[-2, 1.5, -.8, 1.8, -1.3, .7][suspectIndex % 6]}deg` } as CSSProperties}>
    <div className="lineup-file__meta">
      <span className={`lineup-file__status ${cleared ? 'is-cleared' : ''}`}>
        {hasWrongAccusation ? 'False lead' : ruledOut ? 'Ruled out' : 'In lineup'}
      </span>
    </div>
    <button type="button" id={`lineup-suspect-${suspect.pokemonId}`} className="lineup-file__open"
      aria-haspopup="dialog" aria-label={`Open ${suspect.name}’s case file`}
      onClick={() => inspectSuspect(suspect.pokemonId)}>
      <div className="lineup-file__portrait"><MugShot suspect={suspect} />
        {cleared ? <span className="lineup-file__stamp" aria-hidden="true">{hasWrongAccusation ? 'FALSE LEAD' : 'RULED OUT'}</span> : null}
      </div>
      <h3>{suspect.name}</h3>
      <span className="lineup-file__view">View case file <span aria-hidden="true">↗</span></span>
    </button>
    <button type="button" className={`lineup-file__rule-out ${cleared ? 'is-checked' : ''}`}
      aria-label={`${ruledOut ? 'Restore' : 'Rule out'} ${suspect.name}${ruledOut ? ' to the lineup' : ''}`}
      aria-pressed={cleared} disabled={disabled || hasWrongAccusation}
      title={hasWrongAccusation ? 'Already eliminated by an incorrect accusation' : ruledOut ? `Restore ${suspect.name}` : `Rule out ${suspect.name}`}
      onClick={() => setSuspectNoteStatus(suspect.pokemonId, ruledOut ? 'suspect' : 'ruled-out')}>
      <span className="lineup-file__checkbox" aria-hidden="true">{cleared ? '✓' : ''}</span>
      <span className="sr-only">{hasWrongAccusation ? 'Eliminated' : ruledOut ? 'Ruled out · Undo' : 'Rule out'}</span>
    </button>
  </article>
}
