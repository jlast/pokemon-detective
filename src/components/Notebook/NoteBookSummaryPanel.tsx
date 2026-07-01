import type { Evidence, Suspect } from "../../game/caseModel";

export function NoteBookSummaryPanel({
    selectedSuspect,
    discoveredEvidence
}: {
    readonly selectedSuspect: Suspect | null;
    readonly discoveredEvidence: Evidence[]; 
}) {
    return (
          <section className="evidence-board notebook-card">
            <div className="section-heading">
              <div>
                <h2>Case notes</h2>
              </div>
            </div>

            <div className="inspect-list">
              <div className="inspect-item">
                <span>
                  {selectedSuspect
                    ? `${selectedSuspect.name} is selected for inspection. Full suspect notes arrive in the next step.`
                    : 'Inspect a suspect to start building your notes.'}
                </span>
              </div>
              <div className="inspect-item">
                <span>{discoveredEvidence.length} evidence items collected so far.</span>
              </div>
            </div>
          </section>
    );
}