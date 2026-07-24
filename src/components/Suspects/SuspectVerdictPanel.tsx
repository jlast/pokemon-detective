import type { SuspectNoteStatus } from '../../game/caseModel'

interface SuspectVerdictPanelProps {
  suspectName: string
  status: 'suspect' | 'cleared'
  onStatusChange: (status: SuspectNoteStatus) => void
  attemptsLeft: number
  disabled?: boolean
  isFalseLead?: boolean
}

export function SuspectVerdictPanel({
  suspectName,
  status,
  onStatusChange,
  attemptsLeft,
  disabled = false,
  isFalseLead = false,
}: SuspectVerdictPanelProps) {
  const isSuspect = status === 'suspect'
  const assessmentText = isFalseLead
    ? 'Already ruled out by a wrong accusation'
    : isSuspect
      ? 'Still suspicious'
      : 'Currently cleared'
  return (
    <section className="suspect-verdict-panel" aria-label={`Your theory about ${suspectName}`}>
      <div className="suspect-verdict-label">Current Theory</div>

      <div className="suspect-verdict-status-controls" aria-label="Set current assessment">
        <button
          type="button"
          className={`suspect-verdict-toggle is-suspect ${isSuspect ? 'is-selected' : ''}`}
          onClick={() => onStatusChange('suspect')}
          disabled={disabled || isFalseLead}
        >
          Suspect
        </button>
        <button
          type="button"
          className={`suspect-verdict-toggle is-cleared ${!isSuspect ? 'is-selected' : ''}`}
          onClick={() => onStatusChange('ruled-out')}
          disabled={disabled || isFalseLead}
        >
          Cleared
        </button>
      </div>

      <div className="suspect-verdict-assessment">
        <span>Current assessment:</span>
        <strong>{isSuspect ? '⚠ ' : ''}{assessmentText}</strong>
      </div>

      {isSuspect && !isFalseLead && attemptsLeft <= 0 ? (
        <p className="suspect-verdict-no-attempts">No accusation attempts left.</p>
      ) : null}
    </section>
  )
}
