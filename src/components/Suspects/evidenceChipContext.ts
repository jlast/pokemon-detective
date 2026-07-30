import { getClueHintType, type Evidence } from '../../game/caseModel'

export const getEvidenceChipContext = (evidence: Evidence) => getClueHintType(evidence.rule.axis)
