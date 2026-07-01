import type { Case, Suspect } from "../../game/caseModel";

interface NotebookDetailsPanelProps {
    closeNotebook: () => void;
    currentCase: Case;
    ruledOutSuspects: Suspect[];
    activeSuspects: Suspect[];
}

export function NotebookDetailsPanel({
    closeNotebook,
    currentCase,
    ruledOutSuspects,
    activeSuspects,
}: NotebookDetailsPanelProps) {
  return (
    <section className="notebook-card evidence-board" aria-labelledby="notebook-title">
      <div className="section-heading">
        <div>
          <h2 id="notebook-title">Case notes</h2>
        </div>
      </div>

      <div className="inspect-list">
        <div className="inspect-item">
          <strong>{currentCase.title}</strong>
          <span>{currentCase.shortStory}</span>
        </div>

        <div className="inspect-item">
          <strong>Evidence</strong>
          <div className="notebook-sublist">
            {currentCase.evidence.map((evidenceItem, index) => (
              <span key={evidenceItem.id}>
                {evidenceItem.discovered
                  ? `${index + 1}. ${evidenceItem.clueText}`
                  : `${index + 1}. Unknown evidence`}
              </span>
            ))}
          </div>
        </div>

        <div className="inspect-item">
          <strong>Ruled out by you</strong>
          <div className="notebook-sublist">
            {ruledOutSuspects.length > 0 ? (
              ruledOutSuspects.map((suspect) => <span key={suspect.pokemonId}>{suspect.name}</span>)
            ) : (
              <span>No suspects ruled out yet.</span>
            )}
          </div>
        </div>

        <div className="inspect-item">
          <strong>Suspects still active</strong>
          <div className="notebook-sublist">
            {activeSuspects.map((suspect) => (
              <span key={suspect.pokemonId}>{suspect.name}</span>
            ))}
          </div>
        </div>

        <div className="inspect-item">
          <strong>Notes</strong>
          <span>Use evidence and inspected facts to decide who could have done it.</span>
        </div>
      </div>

      <div className="overlay-actions">
        <button type="button" className="secondary-button" onClick={closeNotebook}>
          Back to investigation
        </button>
      </div>
    </section>
  )
}
