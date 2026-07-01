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
            <span>You can still change your mind.</span>
          </div>
          <div className="inspect-item">
            <span>
              Wrong accusations cost one attempt. You have {attemptsLeft} left.
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
            Accuse
          </button>
        </div>
      </section>
    </div>
  );
}
