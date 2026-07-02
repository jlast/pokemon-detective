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
          <p className="investigation-board-subtitle">
            Open a suspect dossier to inspect facts and update your notes.
          </p>
        </div>
      </div>

      <div className="suspect-evidence-strip inspect-item">
        <strong>Evidence collected</strong>
        {discoveredEvidence.length > 0 ? (
          <div className="suspect-evidence-list">
            {discoveredEvidence.map((evidenceItem) => (
              <span key={evidenceItem.id} className="suspect-evidence-pill">
                ✓ {evidenceItem.title}
              </span>
            ))}
          </div>
        ) : (
          <p className="overview-section-hook">No evidence collected yet. Search locations to build your case.</p>
        )}
      </div>

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
