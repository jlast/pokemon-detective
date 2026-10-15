import { allCases, createCaseById } from '../../src/game/cases/index'
import type { Case, CaseDifficulty } from '../../src/game/caseModel'
import { validateGeneratedCase } from './validateGeneratedCase'

export const createValidatedCase = (difficulty: CaseDifficulty): Case => {
  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const config = allCases[Math.floor(Math.random() * allCases.length)]
    if (!config) throw new Error('No case configs available')
    try {
      const gameCase = createCaseById(config.id, difficulty)
      if (!gameCase) throw new Error(`Failed to generate case for config: ${config.id}`)
      validateGeneratedCase(gameCase)
      return gameCase
    } catch (error) {
      lastError = error
      console.warn('Case generation attempt failed', { configId: config.id, difficulty, attempt, error })
    }
  }
  throw new Error(`Failed to generate a validated ${difficulty} case after 3 attempts`, { cause: lastError })
}
