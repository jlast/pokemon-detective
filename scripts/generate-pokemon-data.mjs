import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'src/data/pokemon.ts')

const API_ROOT = 'https://pokeapi.co/api/v2'
const POKEDOKU_POKEMON_URL = 'https://www.pokedoku-helper.com/data/pokemon.json'
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const CONCURRENCY = 16

const starterIds = new Set([1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912])

const regionByGeneration = {
  'generation-i': 'Kanto',
  'generation-ii': 'Johto',
  'generation-iii': 'Hoenn',
  'generation-iv': 'Sinnoh',
  'generation-v': 'Unova',
  'generation-vi': 'Kalos',
  'generation-vii': 'Alola',
  'generation-viii': 'Galar',
  'generation-ix': 'Paldea',
}

const supportedRegions = new Set(['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'])

const supportedTypes = new Set([
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
])

const fetchJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.json()
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

const createEmptyEvolutionEntry = () => ({
  stage: 1,
  lineStages: 1,
  evolvesByStone: false,
})

const createPokedokuEvolutionMap = (pokedokuEntries) => {
  const defaultEntryById = new Map(
    pokedokuEntries
      .filter((entry) => entry.formId === entry.id && entry.evolutionStage)
      .map((entry) => [entry.id, entry]),
  )
  const entryByFormId = new Map(pokedokuEntries.map((entry) => [entry.formId, entry]))
  const stageByFormId = new Map()
  const lineStagesByFormId = new Map()

  const getStage = (entry, seenFormIds = new Set()) => {
    const cached = stageByFormId.get(entry.formId)
    if (cached) return cached
    if (seenFormIds.has(entry.formId)) return 1

    const parentStages = (entry.evolution?.from ?? [])
      .map((formId) => entryByFormId.get(formId))
      .filter(Boolean)
      .map((parentEntry) => getStage(parentEntry, new Set([...seenFormIds, entry.formId])))
    const stage = parentStages.length > 0 ? Math.max(...parentStages) + 1 : 1

    stageByFormId.set(entry.formId, stage)
    return stage
  }

  const getLineStages = (entry) => {
    const cached = lineStagesByFormId.get(entry.formId)
    if (cached) return cached

    const stage = getStage(entry)
    const childStages = (entry.evolution?.to ?? [])
      .map((formId) => entryByFormId.get(formId))
      .filter(Boolean)
      .map(getLineStages)
    const lineStages = childStages.length > 0 ? Math.max(stage, ...childStages) : stage

    lineStagesByFormId.set(entry.formId, lineStages)
    return lineStages
  }

  return new Map([...defaultEntryById].map(([id, entry]) => [id, {
    stage: getStage(entry),
    lineStages: getLineStages(entry),
  }]))
}

const visitEvolutionNode = (node, stage, chainMap) => {
  const speciesId = parseIdFromUrl(node.species.url)
  const evolvesByStone = node.evolves_to.some((evolution) =>
    evolution.evolution_details.some(
      (detail) => detail.trigger?.name === 'use-item' && detail.item?.name?.endsWith('-stone'),
    ),
  )

  const childLineStages = node.evolves_to.map((evolution) => visitEvolutionNode(evolution, stage + 1, chainMap))
  const lineStages = childLineStages.length > 0 ? Math.max(...childLineStages) : stage

  chainMap.set(speciesId, {
    stage,
    lineStages,
    evolvesByStone,
  })

  return lineStages
}

const serializeDataFile = (pokemonEntries) => {
  const typeUnion = [...new Set(pokemonEntries.flatMap((entry) => entry.types))].sort()
  const regionUnion = [...new Set(pokemonEntries.map((entry) => entry.region))].sort()
  const chunkSize = 100
  const chunks = Array.from(
    { length: Math.ceil(pokemonEntries.length / chunkSize) },
    (_, index) => pokemonEntries.slice(index * chunkSize, (index + 1) * chunkSize),
  )
  const serializedChunks = chunks
    .map((chunk, index) => `const pokemonDataChunk${index + 1}: Pokemon[] = ${JSON.stringify(chunk, null, 2)}`)
    .join('\n\n')
  const chunkNames = chunks.map((_, index) => `pokemonDataChunk${index + 1}`).join(', ')

  return `export type PokemonType =\n${typeUnion
    .map((type) => `  | '${type}'`)
    .join('\n')}\n\nexport type PokemonRegion =\n${regionUnion
    .map((region) => `  | '${region}'`)
    .join('\n')}\n\nexport interface Pokemon {\n  id: number\n  name: string\n  region: PokemonRegion\n  types: PokemonType[]\n  heightM: number\n  weightKg: number\n  hp: number\n  attack: number\n  defense: number\n  specialAttack: number\n  specialDefense: number\n  speed: number\n  evolutionStage: 1 | 2 | 3\n  evolutionLineStages: 1 | 2 | 3\n  evolvesByStone: boolean\n  isStarter: boolean\n  isLegendary: boolean\n  isMythical: boolean\n  sprite: string\n  shinySprite?: string\n}\n\nexport const getShinySpriteUrl = (pokemonId: number): string =>\n  \`/sprites/shiny/\${pokemonId}.png\`\n\n${serializedChunks}\n\nexport const pokemonData: Pokemon[] = [${chunkNames}].flat()\n`
}

const main = async () => {
  const generationResponses = await Promise.all(
    GENERATIONS.map((generation) => fetchJson(`${API_ROOT}/generation/${generation}/`)),
  )
  const pokedokuPokemon = await fetchJson(POKEDOKU_POKEMON_URL)
  const pokedokuDefaultEntryById = new Map(
    pokedokuPokemon
      .filter((entry) => entry.formId === entry.id)
      .map((entry) => [entry.id, entry]),
  )

  const speciesEntries = generationResponses.flatMap((generationResponse) =>
    generationResponse.pokemon_species.map((species) => ({
      id: parseIdFromUrl(species.url),
      region: regionByGeneration[generationResponse.name],
    })),
  )

  speciesEntries.sort((left, right) => left.id - right.id)

  const pokemonDetails = await runWithConcurrency(speciesEntries, async ({ id }) =>
    fetchJson(`${API_ROOT}/pokemon/${id}/`),
  )

  const speciesDetails = await runWithConcurrency(speciesEntries, async ({ id }) =>
    fetchJson(`${API_ROOT}/pokemon-species/${id}/`),
  )

  const evolutionChainUrls = [...new Set(speciesDetails.map((species) => species.evolution_chain.url))]
  const evolutionChains = await runWithConcurrency(evolutionChainUrls, (url) => fetchJson(url))

  const evolutionMap = new Map()
  const pokedokuEvolutionMap = createPokedokuEvolutionMap(pokedokuPokemon)

  for (const chain of evolutionChains) {
    visitEvolutionNode(chain.chain, 1, evolutionMap)
  }

  const pokemonEntries = speciesEntries.map(({ id, region }, index) => {
    const pokemon = pokemonDetails[index]
    const species = speciesDetails[index]
    const evolution = evolutionMap.get(id) ?? createEmptyEvolutionEntry()
    const pokedokuEvolution = pokedokuEvolutionMap.get(id)
    const pokedokuRegion = pokedokuDefaultEntryById.get(id)?.region?.[0]
    const resolvedRegion = pokedokuRegion ?? region
    const statByName = Object.fromEntries(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]))
    const types = pokemon.types
      .slice()
      .sort((left, right) => left.slot - right.slot)
      .map((entry) => entry.type.name)

    for (const type of types) {
      if (!supportedTypes.has(type)) {
        throw new Error(`Unsupported type '${type}' for Pokemon ${pokemon.name}`)
      }
    }

    if (!supportedRegions.has(resolvedRegion)) {
      throw new Error(`Unsupported region '${resolvedRegion}' for Pokemon ${pokemon.name}`)
    }

    return {
      id,
      name: toTitleCase(pokemon.name),
      region: resolvedRegion,
      types,
      heightM: pokemon.height / 10,
      weightKg: pokemon.weight / 10,
      hp: statByName.hp,
      attack: statByName.attack,
      defense: statByName.defense,
      specialAttack: statByName['special-attack'],
      specialDefense: statByName['special-defense'],
      speed: statByName.speed,
      evolutionStage: Math.min(pokedokuEvolution?.stage ?? evolution.stage, 3),
      evolutionLineStages: Math.min(pokedokuEvolution?.lineStages ?? evolution.lineStages, 3),
      evolvesByStone: evolution.evolvesByStone,
      isStarter: starterIds.has(id),
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
      sprite: `/sprites/${id}.png`,
    }
  })

  await writeFile(outputPath, serializeDataFile(pokemonEntries), 'utf8')

  console.log(`Wrote ${pokemonEntries.length} Pokemon to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
