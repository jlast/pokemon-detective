import { itemData } from '../data/items'
import { pokemonData } from '../data/pokemon'
import type { Case, CaseTheme } from './caseModel'

const themeItemCategories = new Set([
  'standard-balls',
  'special-balls',
  'apricorn-balls',
  'loot',
  'jewels',
  'collectibles',
  'evolution',
])

const themeItems = itemData.filter((item) => item.slug.endsWith('-berry') || themeItemCategories.has(item.category))

const pickRandom = <T,>(items: T[]): T => {
  const item = items[Math.floor(Math.random() * items.length)]
  if (!item) throw new Error('Cannot pick from an empty list.')
  return item
}

const getIndefiniteArticle = (value: string): 'A' | 'An' => (
  /^[aeiou]/i.test(value.trim()) ? 'An' : 'A'
)

const getCaseSceneName = (caseData: Case): string => caseData.locations[0]?.name ?? 'the scene'

const getCaseThemeStory = (theme: CaseTheme, sceneName: string): string => (
  theme.kind === 'stolen-item'
    ? `${getIndefiniteArticle(theme.name)} ${theme.name} was stolen from ${sceneName}.`
    : `${theme.name} has gone missing. They were last seen around ${sceneName}.`
)

export const createCaseTheme = (suspectPokemonIds: number[] = []): CaseTheme => {
  if (Math.random() < 0.5) {
    const item = pickRandom(themeItems)
    return {
      kind: 'stolen-item',
      name: item.name,
      image: item.sprite,
      alt: `Sprite for ${item.name}`,
    }
  }

  const suspectIds = new Set(suspectPokemonIds)
  const pokemonPool = pokemonData.filter((pokemon) => !suspectIds.has(pokemon.id))
  const pokemon = pickRandom(pokemonPool.length > 0 ? pokemonPool : pokemonData)
  return {
    kind: 'missing-pokemon',
    pokemonId: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprite,
    alt: `Sprite for ${pokemon.name}`,
  }
}

export const applyCaseTheme = (caseData: Case, theme: CaseTheme): Case => ({
  ...caseData,
  theme,
  title: theme.kind === 'stolen-item' ? `The Stolen ${theme.name}` : `The Missing ${theme.name}`,
  shortStory: getCaseThemeStory(theme, getCaseSceneName(caseData)),
  crimeIcon: theme.kind === 'stolen-item' ? '🎒' : '❓',
})

export const getCaseThemeNote = (caseData: Case): string => {
  const theme = caseData.theme
  if (!theme) return caseData.shortStory

  return getCaseThemeStory(theme, getCaseSceneName(caseData))
}
