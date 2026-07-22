import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'src/data/items.ts')
const spriteOutputDir = path.join(projectRoot, 'public/item-sprites')

const API_ROOT = 'https://pokeapi.co/api/v2'
const CONCURRENCY = 12
const themeItemCategories = new Set([
  'standard-balls',
  'special-balls',
  'apricorn-balls',
  'loot',
  'jewels',
  'collectibles',
  'evolution',
])

const fetchJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

const fetchBuffer = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

const runWithConcurrency = async (items, worker) => {
  const results = new Array(items.length)
  let cursor = 0

  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor
      cursor += 1
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  })

  await Promise.all(runners)
  return results
}

const parseIdFromUrl = (url) => Number(url.split('/').filter(Boolean).at(-1))

const toTitleCase = (value) =>
  value
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const getEnglishName = (item) => item.names.find((entry) => entry.language.name === 'en')?.name

const isThemeItem = (item) => item.slug.endsWith('-berry') || themeItemCategories.has(item.category)

const removeStaleSprites = async (items) => {
  const expectedFiles = new Set(items.map((item) => `${item.id}.png`))
  const existingFiles = await readdir(spriteOutputDir)

  await Promise.all(existingFiles
    .filter((fileName) => fileName.endsWith('.png') && !expectedFiles.has(fileName))
    .map((fileName) => rm(path.join(spriteOutputDir, fileName))))
}

const serializeDataFile = (items) => `export interface Item {
  id: number
  name: string
  slug: string
  category: string
  sprite: string
}

export const itemData: Item[] = ${JSON.stringify(items, null, 2)}
`

const main = async () => {
  await mkdir(spriteOutputDir, { recursive: true })

  const itemList = await fetchJson(`${API_ROOT}/item/?limit=10000`)
  const itemRefs = itemList.results
    .map((item) => ({ id: parseIdFromUrl(item.url), url: item.url }))
    .filter((item) => Number.isFinite(item.id))
    .sort((left, right) => left.id - right.id)

  console.log(`Fetching ${itemRefs.length} item detail records...`)
  const details = await runWithConcurrency(itemRefs, ({ url }) => fetchJson(url))

  const items = details
    .map((detail) => {
      const name = getEnglishName(detail) ?? toTitleCase(detail.name)
      const spriteUrl = detail.sprites?.default
      if (!name || !spriteUrl) return null

      return {
        id: detail.id,
        name,
        slug: detail.name,
        category: detail.category?.name ?? 'unknown',
        remoteSprite: spriteUrl,
        sprite: `/item-sprites/${detail.id}.png`,
      }
    })
    .filter(Boolean)
    .filter(isThemeItem)

  console.log(`Downloading ${items.length} item sprites...`)
  await runWithConcurrency(items, async (item) => {
    const spritePath = path.join(spriteOutputDir, `${item.id}.png`)
    if (existsSync(spritePath)) return
    await writeFile(spritePath, await fetchBuffer(item.remoteSprite))
  })

  const dataItems = items.map(({ remoteSprite: _remoteSprite, ...item }) => item)
  await removeStaleSprites(dataItems)
  await writeFile(outputPath, serializeDataFile(dataItems), 'utf8')

  console.log(`Wrote ${dataItems.length} items to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
