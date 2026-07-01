import { LinedOverview } from './LinedOverview'
import { PostIt } from './PostIt'
import { MugShot } from './Suspects/MugShot'
import type { Case } from "../game/caseModel";

interface CaseOverviewProps {
  gameCase: Case
  attemptsLeft: number
  startInvestigation?: () => void
}

export function CaseOverview({
  gameCase: selectedCase,
  attemptsLeft,
  startInvestigation,
}: CaseOverviewProps) {
  return (
    <section className="notebook-card landing-screen">
      <div className="section-heading">
        <div>
          <h2>{selectedCase.title}</h2>
          <p className="subtle-text">{selectedCase.shortStory}</p>
        </div>
      </div>

      <div className="inspect-list">
        <div className="inspect-item overview-suspects-panel">
          <strong>Suspects</strong>
          <div className="overview-suspect-row">
            {selectedCase.suspects.map((suspect) => (
              <div key={suspect.pokemonId} className="suspect-card notebook-card">
                <div className="suspect-card-top">
                  <MugShot suspect={suspect} />
                  <span className="suspect-name">{suspect.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="overview-meta-grid">
          <LinedOverview title="Case details">
            <span>Difficulty: {selectedCase.difficulty}</span>
            <span>Suspects: {selectedCase.suspects.length}</span>
            <span>Locations to investigate: {selectedCase.locations.length}</span>
            <span>Attempts available: {attemptsLeft}</span>
          </LinedOverview>
          <PostIt title="Known scene notes">
            <span>The camp woke up to a missing stash of cookies.</span>
            <span>
              You will need to search locations, inspect suspects, and decide who
              does not belong.
            </span>
          </PostIt>
        </div>
      </div>

      {startInvestigation ? (
        <div className="overlay-actions">
          <button type="button" className="primary-button" onClick={startInvestigation}>
            Start investigation
          </button>
        </div>
      ) : null}
    </section>
  )
}
