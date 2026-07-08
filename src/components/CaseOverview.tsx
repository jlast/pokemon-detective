import { LinedOverview } from './LinedOverview'
import { PostIt } from './PostIt'
import { MugShot } from './Suspects/MugShot'
import type { Case } from "../game/caseModel";

interface CaseOverviewProps {
  gameCase: Case
  attemptsLeft: number
  startInvestigation?: () => void
  onSelectSuspect?: (suspectId: number) => void
}

export function CaseOverview({
  gameCase: selectedCase,
  attemptsLeft,
  startInvestigation,
  onSelectSuspect,
}: CaseOverviewProps) {
  const suspectBoardStyles = [
    'is-tilted-left has-tape',
    'is-tilted-right',
    'is-tilted-left-soft',
    'is-tilted-right-soft',
    'is-tilted-left',
    'is-tilted-right-soft has-tape',
  ]

  return (
    <section className="notebook-card landing-screen">
      <div className="section-heading overview-heading">
        <div>
          <h2>Case file</h2>
        </div>
      </div>

      <div className="inspect-list">
        <div className="inspect-item overview-suspects-panel">
          <div className="overview-section-copy">
            <strong>Suspects</strong>
            <p className="overview-section-hook">These Pokemon are the persons of interest.</p>
          </div>
          <div className="overview-suspect-row">
            {selectedCase.suspects.map((suspect, index) => (
                <div
                  key={suspect.pokemonId}
                  className={`suspect-card notebook-card overview-suspect-card ${suspectBoardStyles[index % suspectBoardStyles.length]}`}
                  onClick={() => onSelectSuspect?.(suspect.pokemonId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectSuspect?.(suspect.pokemonId) }}
                >
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
            <div className="case-detail-row">
              <span className="case-detail-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="case-detail-icon-svg" focusable="false">
                  <path
                    d="M12 2.5l2.8 5.67 6.26.91-4.53 4.42 1.07 6.25L12 16.77 6.4 19.75l1.07-6.25L2.94 9.08l6.26-.91L12 2.5z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="case-detail-label">Difficulty</span>
              <span className="case-detail-value">{selectedCase.difficulty}</span>
            </div>
            <div className="case-detail-row">
              <span className="case-detail-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="case-detail-icon-svg" focusable="false">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M3 12h18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3.1" fill="currentColor" />
                </svg>
              </span>
              <span className="case-detail-label">Suspects</span>
              <span className="case-detail-value">{selectedCase.suspects.length}</span>
            </div>
            <div className="case-detail-row">
              <span className="case-detail-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="case-detail-icon-svg" focusable="false">
                  <path
                    d="M10.2 21c-2.7 0-4.7-2.1-4.7-4.9 0-2.2 1.1-4.2 2.6-5.9 1.1-1.2 2.2-2.6 3.4-2.6 1.7 0 3.2 2.8 3.2 5.8 0 4.2-1.9 7.6-4.5 7.6z"
                    fill="currentColor"
                  />
                  <circle cx="7.7" cy="7.2" r="1.45" fill="currentColor" />
                  <circle cx="10.6" cy="5.3" r="1.3" fill="currentColor" />
                  <circle cx="13.7" cy="5.6" r="1.2" fill="currentColor" />
                  <circle cx="16.1" cy="7.9" r="1.25" fill="currentColor" />
                </svg>
              </span>
              <span className="case-detail-label">Locations</span>
              <span className="case-detail-value">{selectedCase.locations.length}</span>
            </div>
            <div className="case-detail-row">
              <span className="case-detail-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="case-detail-icon-svg" focusable="false">
                  <path
                    d="M12 20.2l-1.2-1.08C6.12 14.88 3 12.05 3 8.58 3 5.9 5.08 4 7.7 4c1.5 0 2.94.7 3.86 1.82C12.48 4.7 13.92 4 15.42 4 18.04 4 20.12 5.9 20.12 8.58c0 3.47-3.12 6.3-7.8 10.56L12 20.2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="case-detail-label">Attempts</span>
              <span className="case-detail-value">{attemptsLeft}</span>
            </div>
          </LinedOverview>
          <PostIt title="Known scene notes">
            <span>{selectedCase.shortStory}</span>
            <span>
              You will need to search locations, inspect suspects, and decide who
              does not belong.
            </span>
          </PostIt>
          {startInvestigation ? (
            <div className="case-overview-cta">
              <p className="case-overview-cta-lead">Your first task is to search the area for clues.</p>
              <p className="case-overview-cta-copy">Search locations and collect your first clue.</p>
              <p className="case-overview-cta-copy">
                The culprit won't reveal themselves. Search locations, collect evidence, then inspect the suspects.
              </p>
              <button type="button" className="primary-button case-overview-cta-button" onClick={startInvestigation}>
                Begin the Investigation
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
