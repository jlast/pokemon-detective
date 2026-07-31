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

export const getCaseThemeTitle = (theme: CaseTheme): string => {
  switch (theme.kind) {
    case 'stolen-item':
      return `The Stolen ${theme.name}`
    case 'damaged-item':
      return `The Damaged ${theme.name}`
    case 'misplaced-item':
      return `The Misplaced ${theme.name}`
    case 'missing-pokemon':
      return `The Missing ${theme.name}`
    case 'frightened-pokemon':
      return `The Frightened ${theme.name}`
    case 'trapped-pokemon':
      return `The Trapped ${theme.name}`
  }
}

const getCaseThemeStory = (theme: CaseTheme): string => {
  switch (theme.kind) {
    case 'stolen-item':
      return `${getIndefiniteArticle(theme.name)} ${theme.name} was stolen during the incident.`
    case 'damaged-item':
      return `${getIndefiniteArticle(theme.name)} ${theme.name} was found damaged after the incident.`
    case 'misplaced-item':
      return `${getIndefiniteArticle(theme.name)} ${theme.name} was moved from where it belonged.`
    case 'missing-pokemon':
      return `${theme.name} has gone missing.`
    case 'frightened-pokemon':
      return `${theme.name} was frightened away during the incident.`
    case 'trapped-pokemon':
      return `${theme.name} was trapped and needed help getting free.`
  }
}

const getCaseThemeIcon = (theme: CaseTheme): string => {
  switch (theme.kind) {
    case 'stolen-item':
      return '🎒'
    case 'damaged-item':
      return '🔨'
    case 'misplaced-item':
      return '📦'
    case 'missing-pokemon':
      return '❓'
    case 'frightened-pokemon':
      return '💨'
    case 'trapped-pokemon':
      return '🪤'
  }
}

export const getCaseThemeExhibitLabel = (theme: CaseTheme | undefined): string => {
  switch (theme?.kind) {
    case 'stolen-item':
      return 'Exhibit A: Stolen Item'
    case 'damaged-item':
      return 'Exhibit A: Damaged Item'
    case 'misplaced-item':
      return 'Exhibit A: Misplaced Item'
    case 'missing-pokemon':
      return 'Exhibit A: Missing Pokemon'
    case 'frightened-pokemon':
      return 'Exhibit A: Frightened Pokemon'
    case 'trapped-pokemon':
      return 'Exhibit A: Trapped Pokemon'
    default:
      return 'Exhibit A'
  }
}

export const createCaseTheme = (suspectPokemonIds: number[] = []): CaseTheme => {
  const kind = pickRandom<CaseTheme['kind']>([
    'stolen-item',
    'damaged-item',
    'misplaced-item',
    'missing-pokemon',
    'frightened-pokemon',
    'trapped-pokemon',
  ])

  if (kind === 'stolen-item' || kind === 'damaged-item' || kind === 'misplaced-item') {
    const item = pickRandom(themeItems)
    return {
      kind,
      name: item.name,
      image: item.sprite,
      alt: `Sprite for ${item.name}`,
    }
  }

  const suspectIds = new Set(suspectPokemonIds)
  const pokemonPool = pokemonData.filter((pokemon) => !suspectIds.has(pokemon.id))
  const pokemon = pickRandom(pokemonPool.length > 0 ? pokemonPool : pokemonData)
  return {
    kind,
    pokemonId: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprite,
    alt: `Sprite for ${pokemon.name}`,
  }
}

export const applyCaseTheme = (caseData: Case, theme: CaseTheme): Case => ({
  ...caseData,
  theme,
  title: getCaseThemeTitle(theme),
  shortStory: getCaseThemeStory(theme),
  crimeIcon: getCaseThemeIcon(theme),
})

export const getCaseThemeNote = (caseData: Case): string => {
  const theme = caseData.theme
  if (!theme) return caseData.shortStory

  return getCaseThemeStory(theme)
}
