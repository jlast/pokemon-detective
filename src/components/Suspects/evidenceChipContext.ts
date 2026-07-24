import type { Evidence } from '../../game/caseModel'

export const getEvidenceChipContext = (evidence: Evidence) => {
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
