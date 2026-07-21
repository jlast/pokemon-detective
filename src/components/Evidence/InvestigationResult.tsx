import type { LocationAction } from '../../game/caseModel'
import { EvidenceBadgeList } from './EvidenceBadge'

interface InvestigationResultProps {
  action: LocationAction
  highlightResult: boolean
  isExpanded: boolean
  onContinue: () => void
  showContinue?: boolean
}

export function InvestigationResult({
  action,
  highlightResult,
  isExpanded,
  onContinue,
  showContinue = true,
}: InvestigationResultProps) {
  const hasEvidence = action.outcomeType === 'evidence' || action.outcomeType === 'witness'
  const summaryText = hasEvidence
    ? `Evidence recovered: ${action.evidenceTitle}`
    : 'Lead closed without primary evidence.'

  return (
    <div className={`location-evidence-preview ${highlightResult ? 'is-revealed' : ''}`}>
      <div className="location-evidence-summary-row">
        <strong>{action.label}</strong>
        <span className="location-evidence-count">{hasEvidence ? 'Complete' : 'Closed lead'}</span>
      </div>

      {!isExpanded ? (
        <div className="location-evidence-list">
          <span>{summaryText}</span>
          <span>{hasEvidence ? action.observationText : 'This route can be ruled out.'}</span>
        </div>
      ) : (
        hasEvidence ? (
          <div className="location-evidence-list">
            <span>✓ {action.evidenceTitle}</span>
            <EvidenceBadgeList
              badges={action.evidenceBadges}
            />
            <span className="location-evidence-copy">Observation</span>
            <span>{action.observationText}</span>
            <span className="location-evidence-copy">Evidence details</span>
            <span>{action.evidenceText}</span>
            {action.implicationText ? (
              <>
                <span className="location-evidence-copy">Possible implication</span>
                <span>{action.implicationText}</span>
              </>
            ) : null}
          </div>
        ) : (
          <div className="location-evidence-list">
            <span>Lead closed without primary evidence.</span>
            <span>{action.observationText}</span>
            <span className="location-evidence-copy">Observation</span>
            <span>This route can be ruled out while you focus on stronger clue paths.</span>
          </div>
        )
      )}

      {isExpanded && showContinue ? (
        <button type="button" className="secondary-button location-continue-button" onClick={onContinue}>
          Continue
        </button>
      ) : null}
    </div>
  )
}
