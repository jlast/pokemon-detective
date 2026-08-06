import { getSolutionClueHintType, type Evidence } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

interface SuspectEvidenceAssessmentProps {
  evidenceItems: Evidence[]
}

interface DetectiveEvidenceCardProps {
  evidenceId: string
  title: string
  supportingValues?: Evidence['badges']
  clueType: Evidence['rule']['axis']
}

function DetectiveEvidenceCard({
  evidenceId,
  title,
  supportingValues,
  clueType,
}: DetectiveEvidenceCardProps) {
  return (
    <article className="detective-evidence-card">
      <span className="detective-evidence-result-icon" aria-hidden="true">{getEvidenceIcon(evidenceId, title, '⌕')}</span>
      <div className="detective-evidence-main">
        <div className="detective-evidence-heading">
          <strong>{title}</strong>
        </div>
        <EvidenceBadgeList badges={supportingValues} clueType={clueType} />
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
              const clueTitle = getSolutionClueHintType(evidence.rule.axis) ?? evidence.title

              return (
                <DetectiveEvidenceCard
                  key={evidence.id}
                  evidenceId={evidence.id}
                  title={clueTitle}
                  supportingValues={evidence.badges}
                  clueType={evidence.rule.axis}
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
