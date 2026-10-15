import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({
  stdin: {
    contents: `
      export { createCaseById, rebuildFullCase } from '../../src/game/cases/index'
      export { validateGeneratedCase } from '../src/validateGeneratedCase'
    `,
    resolveDir: fileURLToPath(new URL('.', import.meta.url)),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
})
const { createCaseById, rebuildFullCase, validateGeneratedCase } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
)

// Reproducible lineups, with different random state when their profiles rebuild.
let seed = 123456789
const originalRandom = Math.random
Math.random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  return seed / 0x100000000
}

try {
  for (const difficulty of ['easy', 'hard']) {
    for (let index = 0; index < 5; index += 1) {
      const gameCase = createCaseById('ransacked-art-room', difficulty)
      validateGeneratedCase(gameCase)
      const actionEvidenceMap = Object.fromEntries(gameCase.locations.flatMap((location) => (
        location.actions.map((action) => [action.id, action.evidenceId])
      )))
      for (let reload = 0; reload < 3; reload += 1) {
        const rebuilt = rebuildFullCase(
          gameCase.id,
          gameCase.culpritPokemonId,
          gameCase.suspects.map((suspect) => suspect.pokemonId),
          {},
          actionEvidenceMap,
          gameCase.solution,
          undefined,
          'primary',
          gameCase.typeClueSlots,
          gameCase.typeClueGroups,
          gameCase.regionClueGroups,
          gameCase.theme,
          difficulty,
        )
        validateGeneratedCase(rebuilt)
        assert.deepEqual(
          rebuilt.locations.map((location) => location.actions.map((action) => action.clueRule)),
          gameCase.locations.map((location) => location.actions.map((action) => action.clueRule)),
          `${difficulty} lineup ${index}: clue rules changed on reload ${reload}`,
        )
      }
    }
    console.log(`${difficulty}: 5 lineups validated with stable rules across 3 reloads each`)
  }
} finally {
  Math.random = originalRandom
}
