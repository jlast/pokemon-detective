import type { Pokemon } from '../../data/pokemon'
import type { Evidence } from '../../game/caseModel'
import type { SuspectEvidenceEvaluation } from '../../game/suspectCaseFile'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

interface SuspectEvidenceAssessmentProps {
  evidenceItems: Evidence[]
  pokemon: Pokemon
  evaluations: SuspectEvidenceEvaluation[]
}

const assessmentConfig = {
  match: {
    title: 'Evidence That Fits',
    empty: 'No fitting evidence yet.',
    icon: '✓',
  },
  conflict: {
    title: 'Evidence That Conflicts',
    empty: 'No conflicting evidence yet.',
    icon: '✕',
  },
  unknown: {
    title: 'Inconclusive',
    empty: '',
    icon: '?',
  },
} as const

export function SuspectEvidenceAssessment({ evidenceItems, pokemon, evaluations }: SuspectEvidenceAssessmentProps) {
  const evidenceById = new Map(evidenceItems.map((item) => [item.id, item]))
  const renderGroup = (result: SuspectEvidenceEvaluation['result'], showEmpty = true) => {
    const items = evaluations.filter((evaluation) => evaluation.result === result)
    const config = assessmentConfig[result]

    if (!items.length && !showEmpty) return null

    return (
      <section className={`suspect-evidence-assessment-group is-${result}`}>
        <h3>{config.title}</h3>
        {items.length ? (
          <div className="suspect-evidence-assessment-list">
            {items.map((evaluation) => {
              const evidence = evidenceById.get(evaluation.evidenceId)

              return (
                <article key={evaluation.evidenceId} className="suspect-evidence-assessment-card">
                  <span className="suspect-evidence-assessment-icon" aria-hidden="true">{config.icon}</span>
                  <div className="suspect-evidence-assessment-copy">
                    <strong>{evaluation.title}</strong>
                    <p>{evaluation.explanation}</p>
                    <EvidenceBadgeList badges={evidence?.badges} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="suspect-evidence-assessment-empty">{config.empty}</p>
        )}
      </section>
    )
  }

  return (
    <section className="suspect-evidence-assessment" aria-label={`Evidence assessment for ${pokemon.name}`}>
      {renderGroup('match')}
      {renderGroup('conflict')}
      {renderGroup('unknown', false)}
    </section>
  )
}
