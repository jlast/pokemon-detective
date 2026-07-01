import { pokemonData } from '../data/pokemon'
import type { Case, Evidence, InspectedFact, Location, Suspect } from './caseModel'

const getPokemon = (pokemonId: number) => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

const suspectExtras: Record<number, { ability: string; habitatNote: string }> = {
  27: {
    ability: 'Sand Veil',
    habitatNote: 'Usually feels at home in dry ground and dusty places.',
  },
  54: {
    ability: 'Damp',
    habitatNote: 'Often spotted near ponds, rivers, and other wet spots.',
  },
  58: {
    ability: 'Intimidate',
    habitatNote: 'Tends to patrol open routes and stay alert to strangers.',
  },
  252: {
    ability: 'Overgrow',
    habitatNote: 'Prefers leafy cover and quick movement through brush.',
  },
  322: {
    ability: 'Oblivious',
    habitatNote: 'Handles hot, dry terrain well and stores energy for long walks.',
  },
  328: {
    ability: 'Hyper Cutter',
    habitatNote: 'Lurks in sandy ground and likes to wait near loose soil.',
  },
}

const createHiddenFacts = (pokemonId: number): InspectedFact[] => {
  const pokemon = getPokemon(pokemonId)
  const extras = suspectExtras[pokemonId]

  return [
    {
      key: 'type',
      label: 'Type',
      value: pokemon.types.map((type) => type[0].toUpperCase() + type.slice(1)).join(' / '),
      discovered: false,
    },
    {
      key: 'region',
      label: 'Region',
      value: pokemon.region,
      discovered: false,
    },
    {
      key: 'height',
      label: 'Height',
      value: `${pokemon.heightM} m`,
      discovered: false,
    },
    {
      key: 'weight',
      label: 'Weight',
      value: `${pokemon.weightKg} kg`,
      discovered: false,
    },
    {
      key: 'ability',
      label: 'Ability',
      value: extras?.ability ?? 'Unknown ability',
      discovered: false,
    },
    {
      key: 'evolution-line',
      label: 'Evolution line',
      value: `${pokemon.evolutionLineStages}-stage line, currently stage ${pokemon.evolutionStage}`,
      discovered: false,
    },
    {
      key: 'habitat-note',
      label: 'Habitat note',
      value: extras?.habitatNote ?? 'No habitat note recorded.',
      discovered: false,
    },
  ]
}

const createSuspect = (pokemonId: number): Suspect => {
  const pokemon = getPokemon(pokemonId)

  return {
    pokemonId,
    name: pokemon.name,
    sprite: pokemon.sprite,
    manuallyRuledOut: false,
    inspectedFacts: createHiddenFacts(pokemonId),
  }
}

const evidence: Evidence[] = [
  {
    id: 'sand-trail',
    title: 'Sand Trail',
    clueText: 'A trail of sand crossed the campsite.',
    hiddenTrait: 'ground_or_sand',
    endExplanation: 'Sandshrew is associated with dry ground and sand.',
    discovered: false,
  },
  {
    id: 'small-footprints',
    title: 'Small Footprints',
    clueText: 'The footprints were small and low to the ground.',
    hiddenTrait: 'small_low',
    endExplanation: 'Sandshrew is a small Pokemon close to the ground.',
    discovered: false,
  },
  {
    id: 'jar-scratches',
    title: 'Cookie Jar Scratches',
    clueText: 'Someone scratched near the cookie jar.',
    hiddenTrait: 'claws_or_scratching',
    endExplanation: 'Sandshrew uses sharp claws that could leave scratch marks near the jar.',
    discovered: false,
  },
  {
    id: 'midnight-digging',
    title: 'Midnight Digging',
    clueText: 'The witness heard quiet digging after midnight.',
    hiddenTrait: 'digging',
    endExplanation: 'Sandshrew is known for digging quietly through loose soil.',
    discovered: false,
  },
  {
    id: 'avoided-water',
    title: 'Avoided Water',
    clueText: 'The culprit avoided the water bucket.',
    hiddenTrait: 'dry_ground_dislike_water',
    endExplanation: 'Sandshrew is more at ease in dry ground than around water.',
    discovered: false,
  },
]

const locations: Location[] = [
  {
    id: 'campsite',
    name: 'Campsite',
    icon: '⛺',
    description: 'Blankets are messy and crumbs are scattered around the cold fire pit.',
    evidenceId: 'sand-trail',
    investigated: false,
  },
  {
    id: 'footprints',
    name: 'Footprints',
    icon: '👣',
    description: 'Tiny tracks loop behind the tents before fading into the dirt.',
    evidenceId: 'small-footprints',
    investigated: false,
  },
  {
    id: 'forest-edge',
    name: 'Forest Edge',
    icon: '🌲',
    description: 'The edge of camp is quiet, with loose soil under the roots.',
    evidenceId: 'midnight-digging',
    investigated: false,
  },
  {
    id: 'cookie-jar',
    name: 'Cookie Jar',
    icon: '🍪',
    description: 'The lid hangs crooked, and the table bears fresh marks.',
    evidenceId: 'jar-scratches',
    investigated: false,
  },
  {
    id: 'witness-tent',
    name: 'Witness Tent',
    icon: '🛏️',
    description: 'A sleepy camper points toward the wash bucket by the lantern.',
    evidenceId: 'avoided-water',
    investigated: false,
  },
]

export const missingCookiesCase: Case = {
  id: 'missing-cookies',
  title: 'The Missing Cookies',
  shortStory: 'Someone snuck into camp overnight and ate all the cookies.',
  crimeIcon: '🍪',
  difficulty: 'easy',
  culpritPokemonId: 27,
  suspects: [54, 27, 58, 252, 322, 328].map(createSuspect),
  locations,
  evidence,
  status: 'active',
}

export const starterCases: Case[] = [missingCookiesCase]

export const createMissingCookiesCase = (): Case => ({
  ...missingCookiesCase,
  suspects: missingCookiesCase.suspects.map((suspect) => ({
    ...suspect,
    inspectedFacts: suspect.inspectedFacts.map((fact) => ({ ...fact })),
  })),
  locations: missingCookiesCase.locations.map((location) => ({ ...location })),
  evidence: missingCookiesCase.evidence.map((evidenceItem) => ({ ...evidenceItem })),
})
