import type { Pokemon } from '../../data/pokemon'
import type { Evidence, EvidenceEvaluationResult, EvidenceNoteStatus } from '../../game/caseModel'
import type { SuspectEvidenceEvaluation } from '../../game/suspectCaseFile'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

type EvidenceFilter = 'all' | 'important' | 'revisit'

interface SuspectEvidenceAssessmentProps {
  evidenceItems: Evidence[]
  pokemon: Pokemon
  evaluations: SuspectEvidenceEvaluation[]
  evidenceNotes: Record<string, EvidenceNoteStatus>
  evidenceFilter: EvidenceFilter
  onEvidenceFilterChange: (filter: EvidenceFilter) => void
  onEvidenceNoteChange: (evidenceId: string, status: EvidenceNoteStatus) => void
}

const assessmentConfig = {
  match: {
    title: 'Evidence That Fits',
    empty: 'No fitting evidence yet.',
    icon: '✓',
  },
  possible: {
    title: 'Evidence That May Fit',
    empty: '',
    icon: '?',
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

const noteLabels: Record<Exclude<EvidenceNoteStatus, null>, string> = {
  important: '★ Important',
  revisit: '? Revisit',
  ignored: '× Ignored',
}

interface DetectiveEvidenceCardProps {
  title: string
  observation: string
  interpretation: string
  result: EvidenceEvaluationResult
  resultLabel: string
  supportingValues?: Evidence['badges']
  noteStatus?: EvidenceNoteStatus
  onNoteStatusChange?: (status: EvidenceNoteStatus) => void
}

function DetectiveEvidenceCard({
  title,
  observation,
  interpretation,
  result,
  resultLabel,
  supportingValues,
  noteStatus = null,
  onNoteStatusChange,
}: DetectiveEvidenceCardProps) {
  return (
    <article className={`detective-evidence-card is-${result} ${noteStatus ? `has-note-${noteStatus}` : ''}`}>
      <span className="detective-evidence-result-icon" aria-hidden="true">{assessmentConfig[result].icon}</span>
      <div className="detective-evidence-main">
        <div className="detective-evidence-heading">
          <strong>{title}</strong>
          <label className="detective-evidence-note-control">
            <span>{noteStatus ? noteLabels[noteStatus] : 'Mark evidence'}</span>
            <select
              value={noteStatus ?? ''}
              onChange={(event) => onNoteStatusChange?.((event.target.value || null) as EvidenceNoteStatus)}
            >
              <option value="">Clear note</option>
              <option value="important">Important</option>
              <option value="revisit">Revisit later</option>
              <option value="ignored">Ignore</option>
            </select>
          </label>
        </div>
        <p className="detective-evidence-observation">{observation}</p>
        <p className="detective-evidence-interpretation">{interpretation}</p>
        <span className="detective-evidence-result-label">{resultLabel}</span>
        <EvidenceBadgeList badges={supportingValues} />
      </div>
    </article>
  )
}

export function SuspectEvidenceAssessment({
  evidenceItems,
  pokemon,
  evaluations,
  evidenceNotes,
  evidenceFilter,
  onEvidenceFilterChange,
  onEvidenceNoteChange,
}: SuspectEvidenceAssessmentProps) {
  const evidenceById = new Map(evidenceItems.map((item) => [item.id, item]))
  const filteredEvaluations = evaluations.filter((evaluation) => {
    if (evidenceFilter === 'all') return evidenceNotes[evaluation.evidenceId] !== 'ignored'
    return evidenceNotes[evaluation.evidenceId] === evidenceFilter
  })

  const renderGroup = (result: SuspectEvidenceEvaluation['result'], showEmpty = true) => {
    const items = filteredEvaluations.filter((evaluation) => evaluation.result === result)
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
                <DetectiveEvidenceCard
                  key={evaluation.evidenceId}
                  title={evaluation.title}
                  observation={evaluation.observation}
                  interpretation={evaluation.interpretation}
                  result={evaluation.result}
                  resultLabel={evaluation.resultLabel}
                  supportingValues={evidence?.badges}
                  noteStatus={evidenceNotes[evaluation.evidenceId] ?? null}
                  onNoteStatusChange={(status) => onEvidenceNoteChange(evaluation.evidenceId, status)}
                />
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
      <div className="suspect-evidence-filter-row" aria-label="Evidence filters">
        <span>Show:</span>
        {(['all', 'important', 'revisit'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            className={evidenceFilter === filter ? 'is-selected' : ''}
            onClick={() => onEvidenceFilterChange(filter)}
          >
            {filter === 'all' ? 'All' : filter === 'important' ? 'Important' : 'Revisit'}
          </button>
        ))}
      </div>
      {renderGroup('match')}
      {renderGroup('possible', false)}
      {renderGroup('conflict')}
      {renderGroup('unknown', false)}
    </section>
  )
}
