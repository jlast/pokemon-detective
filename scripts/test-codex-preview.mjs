import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from '../api/node_modules/esbuild/lib/main.js'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = resolve(import.meta.dirname, '..')
const outfile = resolve(root, 'node_modules/.cache/test-preview.mjs')
await build({entryPoints:[resolve(root,'src/preview/api.ts')],bundle:true,platform:'node',format:'esm',outfile})
const { previewFetch } = await import(pathToFileURL(outfile).href)
const templates = JSON.parse(await readFile(resolve(root,'node_modules/.cache/preview-cases.json'),'utf8'))
const storage = new Map()
globalThis.localStorage = {getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v)}
globalThis.window = {location: {origin:'https://preview.invalid'}}
globalThis.fetch = async url => { assert.equal(url,'/preview-cases.json'); return Response.json(templates) }
async function request(path, body) {
  return previewFetch('/api/'+path,body === undefined ? undefined : {method:'POST',body:JSON.stringify(body)})
}
for (const difficulty of ['easy','hard']) {
  const id = '2026-10-20-'+difficulty, base = 'cases/'+id
  const game = templates[difficulty]
  let session = await (await request(base)).json()
  assert.equal(session.case.culpritPokemonId,0)
  assert.equal(session.case.solution,undefined)
  assert.equal(session.case.difficulty,difficulty)
  assert.equal((await request(base+'/accuse/999999',{})).status,400)
  const collected = new Set()
  for (const location of game.locations) {
    const key = a => a.cluePreview.label+':'+(a.cluePreview.subtitle??'')
    const action = location.actions.find(a=>!collected.has(key(a)))
    assert.ok(action, 'Each remaining location has an enabled clue')
    const path = base+'/investigate/'+location.id+'/'+action.id
    if (action.outcomeType === 'witness') assert.equal((await request(path,{})).status,400)
    const body = action.outcomeType === 'witness' ? {witnessPokemonId:action.witnessPokemonIds[0]} : {}
    const result = await request(path,body)
    assert.equal(result.status,200)
    const data = await result.json()
    assert.ok(data.result.evidenceText,'Investigation returns real evidence')
    collected.add(key(action))
    assert.equal((await request(path,body)).status,400)
  }
  session = await (await request(base)).json()
  assert.equal(session.investigationsRemaining,game.maxInvestigations-game.locations.length)
  assert.ok(session.case.locations.every(l=>l.investigated),'Progress survives reload')
  const wrong = game.suspects.filter(s=>s.pokemonId!==game.culpritPokemonId).map(s=>s.pokemonId)
  let result = await (await request(base+'/accuse/'+wrong[0],{})).json()
  assert.equal(result.accusationsRemaining,2)
  assert.equal((await request(base+'/accuse/'+wrong[0],{})).status,400)
  result = await (await request(base+'/accuse/'+game.culpritPokemonId,{})).json()
  assert.equal(result.status,'solved');assert.ok(result.case.solution)
  assert.equal(result.case.culpritPokemonId,game.culpritPokemonId)
  assert.equal((await request(base+'/accuse/'+wrong[1],{})).status,400)
  const failedBase='cases/2026-10-19-'+difficulty
  for(const suspect of wrong.slice(0,3)) result=await (await request(failedBase+'/accuse/'+suspect,{})).json()
  assert.equal(result.status,'failed');assert.equal(result.accusationsRemaining,0)
  console.log(difficulty+': investigate, witness validation, persistence, accusation limits, win and loss passed')
}
assert.equal((await request('feedback',{})).status,501)
assert.equal((await (await request('history')).json()).items.length,4)
console.log('History and backend isolation passed')
