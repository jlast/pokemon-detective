import type { Case } from '../../src/game/caseModel'

export const validateGeneratedCase = (gameCase: Case): void => {
  const evidenceIds = new Set(gameCase.evidence.map((evidence) => evidence.id))
  const invalidActions = gameCase.locations.flatMap((location) => location.actions.flatMap((action) => {
    if (action.outcomeType !== 'evidence' && action.outcomeType !== 'witness') return []
    if (!action.evidenceId) return [`${location.id}/${action.id}: missing evidenceId`]
    if (!evidenceIds.has(action.evidenceId)) return [`${location.id}/${action.id}: unknown evidenceId ${action.evidenceId}`]
    if (!action.evidenceTitle) return [`${location.id}/${action.id}: missing evidenceTitle`]
    if (!action.evidenceText) return [`${location.id}/${action.id}: missing evidenceText`]
    if (!action.evidenceBadges?.length) return [`${location.id}/${action.id}: missing evidenceBadges`]
    if (!action.clueRule?.matchingValues.length) return [`${location.id}/${action.id}: missing clueRule`]
    return []
  }))

  if (invalidActions.length > 0) {
    throw new Error(`Generated case ${gameCase.id} has invalid evidence actions: ${invalidActions.join('; ')}`)
  }
}
