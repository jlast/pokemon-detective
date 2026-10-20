import { build } from '../api/node_modules/esbuild/lib/main.js'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
await mkdir(resolve(root, 'node_modules/.cache'), { recursive: true })
const bundle = resolve(root, 'node_modules/.cache/preview-cases.mjs')
await build({
  stdin: { contents: `export { createCaseById, allCases } from './src/game/cases/index'; export { pokemonData } from './src/data/pokemon'`, resolveDir: root },
  bundle: true, platform: 'node', format: 'esm', outfile: bundle,
})
const { createCaseById, allCases, pokemonData } = await import(pathToFileURL(bundle).href)
const fixtures = {}
for (const difficulty of ['easy', 'hard']) {
  const game = createCaseById(allCases[0].id, difficulty)
  const witnesses = pokemonData.filter(p => !game.suspects.some(s => s.pokemonId === p.id)).map(p => p.id)
  let index = 0
  for (const location of game.locations) {
    for (const action of location.actions) {
      if (action.outcomeType === 'witness') {
        action.witnessPokemonIds = witnesses.slice(index, index += 1)
      }
    }
  }
  game.witnessPokemonIds = game.locations.flatMap(l => l.actions.flatMap(a => a.witnessPokemonIds ?? []))
  fixtures[difficulty] = game
  console.log(`Prepared ${difficulty} preview: ${game.title}`)
}
await writeFile(resolve(root, 'node_modules/.cache/preview-cases.json'), JSON.stringify(fixtures))
