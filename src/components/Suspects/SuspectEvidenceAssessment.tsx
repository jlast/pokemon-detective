import type { Evidence } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'
import { getEvidenceChipContext } from './evidenceChipContext'

interface SuspectEvidenceAssessmentProps {
  evidenceItems: Evidence[]
}

interface DetectiveEvidenceCardProps {
  evidenceId: string
  title: string
  chipContext?: string
  supportingValues?: Evidence['badges']
}

function DetectiveEvidenceCard({
  evidenceId,
  title,
  chipContext,
  supportingValues,
}: DetectiveEvidenceCardProps) {
  return (
    <article className="detective-evidence-card">
      <span className="detective-evidence-result-icon" aria-hidden="true">{getEvidenceIcon(evidenceId, title, '⌕')}</span>
      <div className="detective-evidence-main">
        <div className="detective-evidence-heading">
          <strong>{title}</strong>
        </div>
        {chipContext && supportingValues?.length ? <span className="detective-evidence-chip-context">{chipContext}</span> : null}
        <EvidenceBadgeList badges={supportingValues} />
      </div>
    </article>
  )
}

export function SuspectEvidenceAssessment({ evidenceItems }: SuspectEvidenceAssessmentProps) {
  return (
    <section className="suspect-evidence-assessment" aria-label="Collected evidence">
      <section className="suspect-evidence-assessment-group">
        <h3>Forensic Report</h3>
        {evidenceItems.length ? (
          <div className="suspect-evidence-assessment-list">
            {evidenceItems.map((evidence) => {
              return (
                <DetectiveEvidenceCard
                  key={evidence.id}
                  evidenceId={evidence.id}
                  title={evidence.title}
                  chipContext={getEvidenceChipContext(evidence)}
                  supportingValues={evidence.badges}
                />
              )
            })}
          </div>
        ) : (
          <p className="suspect-evidence-assessment-empty">No evidence collected yet.</p>
        )}
      </section>
    </section>
  )
}
