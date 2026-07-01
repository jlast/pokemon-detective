import type { Case } from "../../game/caseModel";
import { SuspectCard } from "./SuspectCard";

interface SuspectsProps {
  currentCase: Case;
  inspectSuspect: (suspectId: number) => void;
}

export function SuspectsPanel({
  currentCase,
  inspectSuspect,
}: SuspectsProps) {
  return (
    <section className={`notebook-card evidence-board mobile-section`}>
      <div className="section-heading">
        <div>
          <h2>Suspects Lineup</h2>
        </div>
      </div>

      <div className="suspect-grid">
        {currentCase.suspects.map((suspect) => (
          <SuspectCard
            key={suspect.pokemonId}
            suspect={suspect}
            inspectSuspect={inspectSuspect}
          />
        ))}
      </div>
    </section>
  );
}
