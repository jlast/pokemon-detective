import { Link } from 'react-router-dom'
import { EvidenceBadge } from '../Evidence/EvidenceBadge'
import { getDiscoveredEvidence, type Case } from '../../game/caseModel'
import { TODAY_INVESTIGATION_PATH } from '../../paths'
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
  const discoveredEvidence = getDiscoveredEvidence(currentCase)

  return (
    <section className="notebook-card evidence-board mobile-section is-active">
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
                  <EvidenceBadge text={evidenceItem.badgeText} type={evidenceItem.badgeType} fallback={evidenceItem.clueText} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="suspect-evidence-empty">
            <p className="overview-section-hook">Start at the locations board to collect your first clue.</p>
            <Link to={TODAY_INVESTIGATION_PATH} className="primary-button suspect-evidence-cta">
              Investigate locations
            </Link>
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
