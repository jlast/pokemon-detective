import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const OUTPUT_DIR = path.join(projectRoot, 'public', 'sprites')
const CONCURRENCY = 4
const MAX_ID = 493

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const fetchWithRetry = async (url, retries = 5) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url)
    if (response.ok) return response
    if (response.status === 404) return null
    const delay = 2000 * (attempt + 1)
    console.warn(`  Retry ${attempt + 1}/${retries} for ${url} (${response.status}), waiting ${delay}ms`)
    await sleep(delay)
  }
  return null
}

const downloadSprite = async (id, isShiny) => {
  const url = isShiny ? `${SPRITE_BASE}/shiny/${id}.png` : `${SPRITE_BASE}/${id}.png`
  const outDir = isShiny ? path.join(OUTPUT_DIR, 'shiny') : OUTPUT_DIR
  const outPath = path.join(outDir, `${id}.png`)

  if (existsSync(outPath)) {
    return { id, status: 'cached' }
  }

  const response = await fetchWithRetry(url)
  if (!response) {
    return { id, status: 'missing' }
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(outPath, buffer)
  return { id, status: 'downloaded' }
}

const main = async () => {
  console.log('Downloading Pokemon sprites...')

  await mkdir(OUTPUT_DIR, { recursive: true })
  await mkdir(path.join(OUTPUT_DIR, 'shiny'), { recursive: true })

  const ids = Array.from({ length: MAX_ID }, (_, i) => i + 1)

  console.log(`\nDownloading ${MAX_ID} normal sprites (concurrency=${CONCURRENCY})...`)
  let normalDownloaded = 0
  let normalCached = 0
  let normalMissing = 0
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map((id) => downloadSprite(id, false)))
    for (const r of results) {
      if (r.status === 'downloaded') normalDownloaded++
      else if (r.status === 'cached') normalCached++
      else normalMissing++
    }
    process.stdout.write(`\r  ${i + batch.length}/${MAX_ID} (${normalDownloaded} new, ${normalCached} cached, ${normalMissing} missing)`)
    await sleep(100)
  }
  console.log(`\n  Normal done: ${normalDownloaded} downloaded, ${normalCached} cached, ${normalMissing} missing`)

  console.log(`\nDownloading ${MAX_ID} shiny sprites (concurrency=${CONCURRENCY})...`)
  let shinyDownloaded = 0
  let shinyCached = 0
  let shinyMissing = 0
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map((id) => downloadSprite(id, true)))
    for (const r of results) {
      if (r.status === 'downloaded') shinyDownloaded++
      else if (r.status === 'cached') shinyCached++
      else shinyMissing++
    }
    process.stdout.write(`\r  ${i + batch.length}/${MAX_ID} (${shinyDownloaded} new, ${shinyCached} cached, ${shinyMissing} missing)`)
    await sleep(100)
  }
  console.log(`\n  Shiny done: ${shinyDownloaded} downloaded, ${shinyCached} cached, ${shinyMissing} missing`)

  console.log(`\nDone! Sprites saved to ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
