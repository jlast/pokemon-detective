import type { Case, Suspect } from "../../game/caseModel";
import { MugShot } from "./MugShot";

interface SuspectsDetailsPanelProps {
    selectedSuspect: Suspect;
    closeSuspectSheet: () => void;
    wrongAccusationIds: number[];
    toggleRuledOut: (suspectId: number) => void;
    inspectFact: (suspectId: number, factKey: string) => void
    openAccusation: (suspectId: number) => void
    currentCase: Case;
    attemptsLeft: number;
}

export function SuspectsDetailsPanel({
    selectedSuspect,
    closeSuspectSheet,
    wrongAccusationIds,
    toggleRuledOut,
    inspectFact,
    openAccusation,
    currentCase,
    attemptsLeft
}: SuspectsDetailsPanelProps) {
    return (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-labelledby="suspect-sheet-title">
          <div className="overlay-backdrop" onClick={closeSuspectSheet} />
          <section className="crime-scene-sheet notebook-card">
            <div className="section-heading">
              <div>
                <h2 id="suspect-sheet-title">{selectedSuspect.name}</h2>
              </div>
            </div>

            <div className="suspect-sheet-top">
              <MugShot suspect={selectedSuspect} />
              <div className="inspect-summary-block">
                <p className="subtle-text">Inspect one fact at a time. Nothing here confirms guilt by itself.</p>
                <p className="subtle-text">
                  {wrongAccusationIds.includes(selectedSuspect.pokemonId)
                    ? 'You already accused this suspect and were wrong.'
                    : selectedSuspect.manuallyRuledOut
                    ? 'Ruled out by you. You can still restore this suspect.'
                    : 'Still active in your suspect list.'}
                </p>
              </div>
            </div>

            <div className="inspect-list">
              {selectedSuspect.inspectedFacts.map((fact) => (
                <div key={fact.key} className="inspect-item inspect-fact-row">
                  <div>
                    <strong>{fact.label}</strong>
                    <p>{fact.discovered ? fact.value : '???'}</p>
                  </div>
                  {fact.discovered ? null : (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => inspectFact(selectedSuspect.pokemonId, fact.key)}
                    >
                      Inspect
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="overlay-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => toggleRuledOut(selectedSuspect.pokemonId)}
              >
                {selectedSuspect.manuallyRuledOut ? 'Restore' : 'Rule out'}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => openAccusation(selectedSuspect.pokemonId)}
                disabled={
                  currentCase.status !== 'active' ||
                  attemptsLeft <= 0 ||
                  wrongAccusationIds.includes(selectedSuspect.pokemonId)
                }
              >
                Accuse this Pokemon
              </button>
              <button type="button" className="secondary-button" onClick={closeSuspectSheet}>
                Close
              </button>
            </div>
          </section>
        </div>
    );
}