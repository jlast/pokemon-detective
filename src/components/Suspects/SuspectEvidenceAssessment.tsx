import type { Evidence } from '../../game/caseModel'
import { getEvidenceIcon } from '../../game/evidenceMeta'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

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

const getChipContext = (evidence: Evidence) => {
  switch (evidence.rule.axis) {
    case 'height':
      return 'Height estimate'
    case 'weight':
      return 'Track estimate'
    case 'type':
      return 'Residue points to'
    case 'groundTrace':
      return 'Trace points to'
    case 'force':
      return 'Entry marks point to'
    case 'witness':
      return 'Witness account points to'
    case 'highestStat':
      return 'Strength clue'
    case 'lowestStat':
      return 'Limitation clue'
    case 'typeAffectedness':
      return 'Reaction points to'
    case 'scene':
      return undefined
  }
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
                  chipContext={getChipContext(evidence)}
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
