import type { Suspect } from "../../game/caseModel";

interface AccusationsPanelProps {
  closeAccusation: () => void;
  confirmAccusation: () => void;
  accusationTarget: Suspect;
  attemptsLeft: number;
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
    <div
      className="overlay-shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accusation-title"
    >
      <div className="overlay-backdrop" onClick={closeAccusation} />
      <section className="crime-scene-sheet notebook-card">
        <div className="section-heading">
          <div>
            <h2 id="accusation-title">Accuse {accusationTarget.name}?</h2>
          </div>
        </div>

        <div className="inspect-list">
          <div className="inspect-item">
            <span>A correct accusation ends the case.</span>
          </div>
          <div className="inspect-item">
            <span>
              {attemptWarning} You have {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} left.
            </span>
          </div>
        </div>

        <div className="overlay-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={closeAccusation}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={confirmAccusation}
          >
            Accuse {accusationTarget.name}
          </button>
        </div>
      </section>
    </div>
  );
}
