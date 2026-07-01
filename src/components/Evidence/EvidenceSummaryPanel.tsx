import type { Evidence } from "../../game/caseModel";

interface EvidenceSummaryPanelProps {
    latestEvidence: Evidence | null;
}

export function EvidenceSummaryPanel({
    latestEvidence,
} : EvidenceSummaryPanelProps) {
    return (          <section className={`clue-panel notebook-card mobile-section`}>
            <div className="section-heading">
              <div>
                <h2>Current lead</h2>
              </div>
            </div>

            <div className="current-clue">
              {latestEvidence ? (
                <div className="clue-copy">
                  <p>
                    <strong>{latestEvidence.title}</strong>
                  </p>
                  <p>{latestEvidence.clueText}</p>
                </div>
              ) : (
                <p>No evidence collected yet. Investigate a location to find the first clue.</p>
              )}
            </div>
          </section>
    )
}