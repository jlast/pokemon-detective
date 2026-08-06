import { getSolutionClueBadges, type Case } from '../../src/game/caseModel'
import { isEvidenceSetSolvable } from '../../src/game/caseGeneration'

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

  if (!getSolutionClueBadges(gameCase.solution).length) {
    throw new Error(`Generated case ${gameCase.id} has no solution clue badges`)
  }

  if ((gameCase.maxInvestigations ?? 0) < gameCase.locations.length) {
    throw new Error(`Generated case ${gameCase.id} has fewer investigations than locations`)
  }

  const locationEvidenceIds = gameCase.locations.map((location) => {
    const evidenceActionIds = location.actions
      .filter((action) => action.outcomeType === 'evidence' || action.outcomeType === 'witness')
      .map((action) => action.evidenceId)
    const uniqueEvidenceIds = [...new Set(evidenceActionIds)]

    if (uniqueEvidenceIds.length !== 1 || !uniqueEvidenceIds[0]) {
      throw new Error(`Generated case ${gameCase.id} has inconsistent randomized clues at ${location.id}`)
    }

    return uniqueEvidenceIds[0]
  })

  if (!isEvidenceSetSolvable(
    gameCase.culpritPokemonId,
    gameCase.suspects.map((suspect) => suspect.pokemonId),
    gameCase.typeClueSlots,
    gameCase.typeClueGroups,
    locationEvidenceIds,
  )) {
    throw new Error(`Generated case ${gameCase.id} randomized location clues do not uniquely identify the culprit`)
  }
}
