import { pokemonData } from '../data/pokemon'
import type { Case, Evidence, InspectedFact, Location, Suspect } from './caseModel'
import { getAbilityText, getEvolutionLineText, getHabitatNote } from './suspectCaseFile'

const getPokemon = (pokemonId: number) => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

const createHiddenFacts = (pokemonId: number): InspectedFact[] => {
  const pokemon = getPokemon(pokemonId)

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
      value: getAbilityText(pokemonId),
      discovered: false,
    },
    {
      key: 'evolution-line',
      label: 'Evolution line',
      value: getEvolutionLineText(pokemon),
      discovered: false,
    },
    {
      key: 'habitat-note',
      label: 'Habitat note',
      value: getHabitatNote(pokemonId),
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
    noteStatus: 'suspect',
    inspectedGroups: {
      appearance: false,
      records: false,
      habitat: false,
      ability: false,
    },
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
    teaserText: 'The crime started here.',
    observationText: 'Blankets are messy and crumbs are scattered around the cold fire pit.',
    evidenceTitle: 'Cookie crumbs',
    evidenceText: 'A trail of sand crossed the campsite.',
    evidenceId: 'sand-trail',
    investigated: false,
  },
  {
    id: 'footprints',
    name: 'Footprints',
    icon: '👣',
    teaserText: 'Something unusual was found near the tents.',
    observationText: 'Tiny tracks loop behind the tents before fading into the dirt.',
    evidenceTitle: 'Small footprints',
    evidenceText: 'The footprints were small and low to the ground.',
    evidenceId: 'small-footprints',
    investigated: false,
  },
  {
    id: 'forest-edge',
    name: 'Forest Edge',
    icon: '🌲',
    teaserText: 'The edge of camp needs a closer look.',
    observationText: 'The edge of camp is quiet, with loose soil under the roots.',
    evidenceTitle: 'Midnight digging',
    evidenceText: 'The witness heard quiet digging after midnight.',
    evidenceId: 'midnight-digging',
    investigated: false,
  },
  {
    id: 'cookie-jar',
    name: 'Cookie Jar',
    icon: '🍪',
    teaserText: 'The scene looks disturbed.',
    observationText: 'The lid hangs crooked, and the table bears fresh marks.',
    evidenceTitle: 'Cookie jar scratches',
    evidenceText: 'Someone scratched near the cookie jar.',
    evidenceId: 'jar-scratches',
    investigated: false,
  },
  {
    id: 'witness-tent',
    name: 'Witness Tent',
    icon: '🛏️',
    teaserText: 'Someone might have seen or heard something.',
    observationText: 'A sleepy camper points toward the wash bucket by the lantern.',
    evidenceTitle: 'Avoided water',
    evidenceText: 'The culprit avoided the water bucket.',
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
    inspectedGroups: { ...suspect.inspectedGroups },
    inspectedFacts: suspect.inspectedFacts.map((fact) => ({ ...fact })),
  })),
  locations: missingCookiesCase.locations.map((location) => ({ ...location })),
  evidence: missingCookiesCase.evidence.map((evidenceItem) => ({ ...evidenceItem })),
})
