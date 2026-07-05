import { pokemonData, type Pokemon, type PokemonType } from '../data/pokemon'
import type { SuspectInvestigationGroup } from './caseModel'

const abilityByPrimaryType: Record<PokemonType, string> = {
  bug: 'Swarm',
  dark: 'Inner Focus',
  dragon: 'Shed Skin',
  electric: 'Static',
  fairy: 'Cute Charm',
  fighting: 'Guts',
  fire: 'Flash Fire',
  flying: 'Keen Eye',
  ghost: 'Levitate',
  grass: 'Overgrow',
  ground: 'Sand Veil',
  ice: 'Snow Cloak',
  normal: 'Run Away',
  poison: 'Poison Point',
  psychic: 'Synchronize',
  rock: 'Rock Head',
  steel: 'Sturdy',
  water: 'Torrent',
}

const evolutionLineByPokemonId: Record<number, string> = {
  27: 'Sandshrew -> Sandslash',
  37: 'Vulpix -> Ninetales',
  41: 'Zubat -> Golbat -> Crobat',
  43: 'Oddish -> Gloom -> Vileplume',
  52: 'Meowth -> Persian',
  54: 'Psyduck -> Golduck',
  58: 'Growlithe -> Arcanine',
  77: 'Ponyta -> Rapidash',
  163: 'Hoothoot -> Noctowl',
  190: 'Aipom',
  194: 'Wooper -> Quagsire',
  198: 'Murkrow',
  215: 'Sneasel',
  228: 'Houndour -> Houndoom',
  231: 'Phanpy -> Donphan',
  252: 'Treecko -> Grovyle -> Sceptile',
  302: 'Sableye',
  304: 'Aron -> Lairon -> Aggron',
  315: 'Roselia',
  322: 'Numel -> Camerupt',
  327: 'Spinda',
  328: 'Trapinch -> Vibrava -> Flygon',
  353: 'Shuppet -> Banette',
  399: 'Bidoof -> Bibarel',
}

const toTitle = (value: string) => value[0].toUpperCase() + value.slice(1)

export const getPokemonById = (pokemonId: number): Pokemon => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

export const getAbilityText = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId)

  return abilityByPrimaryType[pokemon.types[0]] ?? 'Unknown ability'
}

export const getHabitatNote = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId)
  const primaryType = pokemon.types[0]

  if (primaryType === 'water') {
    return 'Usually stays close to rivers, ponds, or damp campsites.'
  }

  if (primaryType === 'ground' || primaryType === 'rock') {
    return 'Feels most at home around dry ground, dust, and loose soil.'
  }

  if (primaryType === 'grass' || primaryType === 'bug') {
    return 'Often keeps to brush, roots, and shaded patches near camp.'
  }

  if (primaryType === 'fire') {
    return 'Prefers warm paths, campsites, and dry resting spots.'
  }

  if (primaryType === 'flying') {
    return 'Tends to watch from branches, rooftops, or high perches.'
  }

  if (primaryType === 'ghost' || primaryType === 'dark') {
    return 'Moves best in quiet corners and after the lanterns go dim.'
  }

  if (pokemon.heightM <= 0.6) {
    return 'Small enough to slip around campsites and tight spaces unnoticed.'
  }

  if (pokemon.heightM >= 1.4 || pokemon.weightKg >= 45) {
    return 'Would stand out in a cramped campsite and leave a stronger trail behind.'
  }

  return 'Can move comfortably through camp paths, brush, and open ground.'
}

export const getEvolutionLineText = (pokemon: Pokemon) =>
  evolutionLineByPokemonId[pokemon.id] ??
  `${pokemon.evolutionLineStages}-stage line, currently stage ${pokemon.evolutionStage}`

export const getAppearanceObservation = (pokemon: Pokemon) => {
  if (pokemon.heightM <= 0.6 && pokemon.weightKg <= 12) {
    return 'This Pokemon would leave small, light tracks.'
  }

  if (pokemon.heightM >= 1.4 || pokemon.weightKg >= 45) {
    return 'This Pokemon would leave larger, heavier tracks.'
  }

  return 'This Pokemon would leave medium-sized tracks.'
}

export const getSuspectGroupDetails = (pokemonId: number) => {
  const pokemon = getPokemonById(pokemonId)

  return {
    appearance: {
      icon: '🔎',
      title: 'Appearance check',
      prompt: 'Look for size, weight, and track clues.',
      rows: [
        { label: 'Height', value: `${pokemon.heightM} m` },
        { label: 'Weight', value: `${pokemon.weightKg} kg` },
        { label: 'Observation', value: getAppearanceObservation(pokemon) },
      ],
    },
    records: {
      icon: '📖',
      title: 'Pokedex records',
      prompt: 'Check type, region, and evolution records.',
      rows: [
        { label: 'Type', value: pokemon.types.map(toTitle).join(' / ') },
        { label: 'Region', value: pokemon.region },
        { label: 'Evolution line', value: getEvolutionLineText(pokemon) },
      ],
    },
    habitat: {
      icon: '🌿',
      title: 'Habitat check',
      prompt: 'Look at where this Pokemon is usually found.',
      rows: [{ label: 'Habitat note', value: getHabitatNote(pokemonId) }],
    },
    ability: {
      icon: '✨',
      title: 'Ability check',
      prompt: 'Check whether an ability could explain the evidence.',
      rows: [{ label: 'Ability', value: getAbilityText(pokemonId) }],
    },
  } satisfies Record<
    SuspectInvestigationGroup,
    { icon: string; title: string; prompt: string; rows: Array<{ label: string; value: string }> }
  >
}
