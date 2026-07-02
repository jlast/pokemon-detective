import { pokemonData, type Pokemon } from '../data/pokemon'
import type { SuspectInvestigationGroup } from './caseModel'

const suspectExtras: Record<number, { ability: string; habitatNote: string }> = {
  27: { ability: 'Sand Veil', habitatNote: 'Usually feels at home in dry ground and dusty places.' },
  37: { ability: 'Flash Fire', habitatNote: 'Likes warm dens and often curls up near dry brush.' },
  41: { ability: 'Inner Focus', habitatNote: 'Drifts through caves and dim places after sunset.' },
  43: { ability: 'Chlorophyll', habitatNote: 'Stays close to damp soil and shady patches of grass.' },
  52: { ability: 'Pickup', habitatNote: 'Wanders around camps and cottages in search of shiny things.' },
  54: { ability: 'Damp', habitatNote: 'Often spotted near ponds, rivers, and other wet spots.' },
  58: { ability: 'Intimidate', habitatNote: 'Tends to patrol open routes and stay alert to strangers.' },
  77: { ability: 'Run Away', habitatNote: 'Roams open plains and dislikes cramped spaces.' },
  163: { ability: 'Insomnia', habitatNote: 'Keeps watch from tree branches during the night.' },
  190: { ability: 'Run Away', habitatNote: 'Climbs beams, trees, and shelves with ease.' },
  194: { ability: 'Damp', habitatNote: 'Settles near cool mud and shallow water.' },
  198: { ability: 'Insomnia', habitatNote: 'Glides around rooftops and dark places looking for trinkets.' },
  215: { ability: 'Inner Focus', habitatNote: 'Prefers cold, shadowy routes and moves very quietly.' },
  228: { ability: 'Early Bird', habitatNote: 'Lingers near charred fields and warm paths.' },
  231: { ability: 'Pickup', habitatNote: 'Follows simple trails and sniffs around gardens and farms.' },
  252: { ability: 'Overgrow', habitatNote: 'Prefers leafy cover and quick movement through brush.' },
  302: { ability: 'Keen Eye', habitatNote: 'Hides in caves and is drawn to glittering stones.' },
  304: { ability: 'Rock Head', habitatNote: 'Lives in rocky tunnels and old mine paths.' },
  315: { ability: 'Natural Cure', habitatNote: 'Appears in tidy gardens and flower beds.' },
  322: { ability: 'Oblivious', habitatNote: 'Handles hot, dry terrain well and stores energy for long walks.' },
  327: { ability: 'Own Tempo', habitatNote: 'Staggers around camps in unpredictable little circles.' },
  328: { ability: 'Hyper Cutter', habitatNote: 'Lurks in sandy ground and likes to wait near loose soil.' },
  353: { ability: 'Insomnia', habitatNote: 'Lingers in quiet corners once the lanterns go out.' },
  399: { ability: 'Simple', habitatNote: 'Gnaws on wood near streams and camp supplies.' },
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

export const getAbilityText = (pokemonId: number) => suspectExtras[pokemonId]?.ability ?? 'Unknown ability'

export const getHabitatNote = (pokemonId: number) =>
  suspectExtras[pokemonId]?.habitatNote ?? 'No habitat note recorded.'

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
  } satisfies Record<SuspectInvestigationGroup, { icon: string; title: string; prompt: string; rows: Array<{ label: string; value: string }> }>
}
