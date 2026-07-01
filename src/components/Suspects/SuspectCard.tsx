import type { Suspect } from "../../game/caseModel";
import { MugShot } from "./MugShot";

interface SuspectCardProps {
  suspect: Suspect;
  inspectSuspect: (suspectId: number) => void;
}

export function SuspectCard({
  suspect,
  inspectSuspect,
}: SuspectCardProps) {
  return (
    <article
      key={suspect.pokemonId}
      className={`suspect-card notebook-card ${suspect.manuallyRuledOut ? "is-ruled-out" : ""}`}
      onClick={() => inspectSuspect(suspect.pokemonId)}
    >
      <div className="suspect-card-top">
        <MugShot suspect={suspect}></MugShot>
        <h3 className="suspect-name">{suspect.name}</h3>
      </div>
    </article>
  );
}
