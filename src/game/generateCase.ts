import { pokemonData, type Pokemon } from '../data/pokemon'
import { countMatchingSuspects, getCluesForPokemon, type Clue } from './clues'

export interface DetectiveCase {
  suspects: Pokemon[]
  culprit: Pokemon
  clues: Clue[]
}

type Rng = () => number

const CASE_SIZE = 6
const MAX_ATTEMPTS = 4000

const shuffle = <T,>(items: T[], rng: Rng): T[] => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

const chooseSuspects = (pool: Pokemon[], rng: Rng) => shuffle(pool, rng).slice(0, CASE_SIZE)

const combinationsOfThree = <T,>(items: T[]): [T, T, T][] => {
  const result: [T, T, T][] = []

  for (let first = 0; first < items.length - 2; first += 1) {
    for (let second = first + 1; second < items.length - 1; second += 1) {
      for (let third = second + 1; third < items.length; third += 1) {
        result.push([items[first], items[second], items[third]])
      }
    }
  }

  return result
}

const permutationsOfThree = <T,>(items: [T, T, T]): [T, T, T][] => {
  const [a, b, c] = items
  return [
    [a, b, c],
    [a, c, b],
    [b, a, c],
    [b, c, a],
    [c, a, b],
    [c, b, a],
  ]
}

const hasUniqueCategories = (clues: Clue[]) =>
  new Set(clues.map((clue) => clue.category)).size === clues.length

const scoreClueOrder = (suspects: Pokemon[], clues: [Clue, Clue, Clue]) => {
  const firstCount = countMatchingSuspects(suspects, [clues[0]])
  const secondCount = countMatchingSuspects(suspects, clues.slice(0, 2))
  const priorityScore = clues.reduce((total, clue) => total + clue.priority, 0)

  return Math.abs(firstCount - 3) + Math.abs(secondCount - 2) + priorityScore * 0.1
}

const pickCluesForCase = (suspects: Pokemon[], culprit: Pokemon, rng: Rng): Clue[] | null => {
  const cluePool = shuffle(getCluesForPokemon(culprit), rng)
  const clueTriples = combinationsOfThree(cluePool)
  let bestMatch: { clues: [Clue, Clue, Clue]; score: number } | null = null

  for (const triple of clueTriples) {
    if (!hasUniqueCategories(triple)) {
      continue
    }

    for (const orderedTriple of permutationsOfThree(triple)) {
      const firstCount = countMatchingSuspects(suspects, [orderedTriple[0]])
      const secondCount = countMatchingSuspects(suspects, orderedTriple.slice(0, 2))
      const thirdCount = countMatchingSuspects(suspects, orderedTriple)

      if (firstCount < 2 || secondCount < 2 || thirdCount !== 1) {
        continue
      }

      const score = scoreClueOrder(suspects, orderedTriple)

      if (!bestMatch || score < bestMatch.score) {
        bestMatch = { clues: orderedTriple, score }
      }
    }
  }

  return bestMatch?.clues ?? null
}

export const generateCase = (pool: Pokemon[] = pokemonData, rng: Rng = Math.random): DetectiveCase => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const suspects = chooseSuspects(pool, rng)

    for (const culprit of shuffle(suspects, rng)) {
      const clues = pickCluesForCase(suspects, culprit, rng)

      if (clues) {
        return { suspects, culprit, clues }
      }
    }
  }

  throw new Error('Unable to generate a detective case with useful clues.')
}
