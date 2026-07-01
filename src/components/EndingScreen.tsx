import type { Case, Suspect } from "../game/caseModel";
import { MugShot } from "./Suspects/MugShot";

interface EndingScreenProps {
  currentCase: Case,
  culpritSuspect: Suspect | null,
  endingExplanation: string[],
  startNewCase: (() => void),
};

export function EndingScreen({
  currentCase,
  culpritSuspect,
  endingExplanation,
  startNewCase,
}: EndingScreenProps ) {
  return (
    <section className="notebook-card ending-screen">
      <h2>
        {currentCase.status === "solved"
          ? "Case solved!"
          : currentCase.status === "gave-up"
            ? "You gave up the case."
            : "The culprit escaped!"}
      </h2>
      <p>The culprit was {culpritSuspect?.name ?? "the culprit"}.</p>

      <div className="ending-sprites">
        {culpritSuspect ? (
          <MugShot suspect={culpritSuspect}></MugShot>
        ) : null}
      </div>

      <div className="inspect-list">
        {endingExplanation.map((line) => (
          <div key={line} className="inspect-item">
            <span>{line}</span>
          </div>
        ))}
      </div>

      <div className="overlay-actions">
        <button type="button" className="primary-button" onClick={startNewCase}>
          New case
        </button>
        {currentCase.status === "solved" ? (
          <button
            type="button"
            className="secondary-button"
            onClick={startNewCase}
          >
            Play again
          </button>
        ) : null}
      </div>
    </section>
  );
};
