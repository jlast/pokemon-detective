import { MugShot } from './Suspects/MugShot'
import { getDiscoveredEvidence, type Case } from '../game/caseModel'
import { EvidenceBadgeList } from './Evidence/EvidenceBadge'

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
  const evidence = getDiscoveredEvidence(selectedCase)
  const investigatedCount = selectedCase.locations.filter(location => location.investigated).length
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
        <section className="overview-evidence" aria-labelledby="overview-evidence-title">
          <div className="overview-evidence__heading">
            <h3 id="overview-evidence-title">Collected clues</h3>
            <span>{evidence.length} collected</span>
          </div>
          {evidence.length ? (
            <div className="overview-evidence__groups">
              {evidence.map(item => (
                <div className="overview-evidence__group" key={item.id}>
                  <EvidenceBadgeList badges={item.badges} clueType={item.rule.axis} />
                </div>
              ))}
            </div>
          ) : <p className="overview-evidence__empty">Investigate a location to collect your first clue.</p>}
        </section>
        <div className="overview-evidence__footer">
          <span>{selectedCase.difficulty} · {attemptsLeft} accusations left</span>
          {startInvestigation ? (
            <button type="button" className="primary-button" onClick={startInvestigation}>
              {investigatedCount > 0 ? 'Continue investigation' : 'Begin investigation'}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
