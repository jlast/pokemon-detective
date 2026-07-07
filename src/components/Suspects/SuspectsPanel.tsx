import type { Case } from '../../game/caseModel'
import { SuspectCard } from './SuspectCard'

interface SuspectsProps {
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
}

export function SuspectsPanel({
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
}: SuspectsProps) {
  const discoveredEvidence = currentCase.evidence.filter((evidenceItem) => evidenceItem.discovered)

  return (
    <section className={`notebook-card evidence-board mobile-section`}>
      <div className="section-heading">
        <div>
          <h2>Suspects Lineup</h2>
        </div>
      </div>

      <section className="suspect-evidence-strip suspect-evidence-board inspect-item">
        <div className="suspect-evidence-board-header">
          <strong>📎 Evidence Collected</strong>
        </div>

        {discoveredEvidence.length > 0 ? (
          <div className="suspect-evidence-list suspect-evidence-board-list">
            {discoveredEvidence.map((evidenceItem) => (
              <article key={evidenceItem.id} className="suspect-evidence-tag evidence-note-card">
                <span className="suspect-evidence-tag-icon" aria-hidden="true">
                  📎
                </span>
                <div className="suspect-evidence-tag-copy">
                  <strong>{evidenceItem.title}</strong>
                  <span>{evidenceItem.clueText}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="suspect-evidence-empty">
            <p className="overview-section-hook">No evidence collected yet.</p>
            <p className="overview-section-hook">Search investigation locations to collect your first clue.</p>
          </div>
        )}
      </section>

      <div className="suspect-grid suspect-grid-lineup">
        {currentCase.suspects.map((suspect, index) => (
          <SuspectCard
            key={suspect.pokemonId}
            suspect={suspect}
            inspectSuspect={inspectSuspect}
            suspectIndex={index}
            isSelected={false}
            hasWrongAccusation={wrongAccusationIds.includes(suspect.pokemonId)}
          />
        ))}
      </div>

    </section>
  )
}
