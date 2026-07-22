import { LinedOverview } from './LinedOverview'
import { PostIt } from './PostIt'
import { MugShot } from './Suspects/MugShot'
import type { Case } from '../game/caseModel'
import { getCaseThemeNote } from '../game/caseTheme'

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
                  <path
                    d="M12 20.2l-1.2-1.08C6.12 14.88 3 12.05 3 8.58 3 5.9 5.08 4 7.7 4c1.5 0 2.94.7 3.86 1.82C12.48 4.7 13.92 4 15.42 4 18.04 4 20.12 5.9 20.12 8.58c0 3.47-3.12 6.3-7.8 10.56L12 20.2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="case-detail-label">Accusations left</span>
              <span className="case-detail-value">{attemptsLeft ?? 0}</span>
            </div>
          </LinedOverview>
          <PostIt title="Known scene notes">
            <span>INITIAL REPORT</span>
            <span>{getCaseThemeNote(selectedCase)}</span>
          </PostIt>
          {startInvestigation ? (
            <div className="case-overview-cta">
              <p className="case-overview-cta-lead">WORKING THEORY</p>
              <p className="case-overview-cta-copy">The culprit must have left evidence at the scene.</p>
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
