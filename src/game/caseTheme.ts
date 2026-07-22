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
  shortStory: theme.kind === 'stolen-item'
    ? `A ${theme.name} was stolen from the scene.`
    : `${theme.name} has gone missing.`,
  crimeIcon: theme.kind === 'stolen-item' ? '🎒' : '❓',
})

export const getCaseThemeNote = (caseData: Case): string => {
  const theme = caseData.theme
  if (!theme) return caseData.shortStory

  return theme.kind === 'stolen-item'
    ? `A ${theme.name} was stolen from the scene.`
    : `${theme.name} has gone missing.`
}
