import type { Pokemon, PokemonType } from '../data/pokemon'

export interface Clue {
  id: string
  category: string
  text: string
  summary: string
  evidenceIntro: string
  hint: string
  propertyLabel: string
  priority: number
  revealValue: (pokemon: Pokemon) => string
  matches: (pokemon: Pokemon) => boolean
}

const titleCase = (value: string) => value[0].toUpperCase() + value.slice(1)

const typeClue = (type: PokemonType): Clue => ({
  id: `type-${type}`,
  category: 'type',
  text: `The suspect carries ${titleCase(type)}-type traces.`,
  summary: `${titleCase(type)} type`,
  evidenceIntro: 'Forensics dusted the disguise for elemental residue.',
  hint: 'Compare each suspect\'s type against the evidence.',
  propertyLabel: 'Type',
  priority: 1,
  revealValue: (pokemon) => pokemon.types.map(titleCase).join(' / '),
  matches: (pokemon) => pokemon.types.includes(type),
})

const regionClue = (region: Pokemon['region']): Clue => ({
  id: `region-${region.toLowerCase()}`,
  category: 'region',
  text: `The suspect was first seen in ${region}.`,
  summary: `${region}`,
  evidenceIntro: 'Officer Jenny interviewed witnesses.',
  hint: 'Check which suspect belongs to that region.',
  propertyLabel: 'Region',
  priority: 1,
  revealValue: (pokemon) => pokemon.region,
  matches: (pokemon) => pokemon.region === region,
})

const starterClue = (isStarter: boolean): Clue => ({
  id: isStarter ? 'starter-yes' : 'starter-no',
  category: 'starter',
  text: isStarter
    ? 'The suspect is a starter Pokemon.'
    : 'The suspect is not a starter Pokemon.',
  summary: isStarter ? 'Starter Pokemon' : 'Not a starter',
  evidenceIntro: 'Professor Oak reviewed old training records.',
  hint: isStarter ? 'Only starters fit this lead.' : 'Cross off any known starters.',
  propertyLabel: 'Starter status',
  priority: 2,
  revealValue: (pokemon) => (pokemon.isStarter ? 'Starter' : 'Not a starter'),
  matches: (pokemon) => pokemon.isStarter === isStarter,
})

const dualTypeClue = (hasTwoTypes: boolean): Clue => ({
  id: hasTwoTypes ? 'dual-type-yes' : 'dual-type-no',
  category: 'type-count',
  text: hasTwoTypes
    ? 'The suspect has a dual-typing profile.'
    : 'The suspect has a single-typing profile.',
  summary: hasTwoTypes ? 'Dual type' : 'Single type',
  evidenceIntro: 'Lab analysis flagged the suspect\'s battle aura.',
  hint: hasTwoTypes ? 'Look for suspects showing two types.' : 'Only single-type suspects fit.',
  propertyLabel: 'Type profile',
  priority: 2,
  revealValue: (pokemon) => (pokemon.types.length === 2 ? 'Dual type' : 'Single type'),
  matches: (pokemon) => (pokemon.types.length === 2) === hasTwoTypes,
})

const stageLineClue = (hasThreeStages: boolean): Clue => ({
  id: hasThreeStages ? 'line-three-stage' : 'line-not-three-stage',
  category: 'evolution-line',
  text: hasThreeStages
    ? 'The suspect belongs to a three-stage evolution line.'
    : 'The suspect does not belong to a three-stage evolution line.',
  summary: hasThreeStages ? 'Three-stage line' : 'Shorter evolution line',
  evidenceIntro: 'The daycare staff reviewed the family records.',
  hint: 'Count the full evolution family, not just the current stage.',
  propertyLabel: 'Evolution line',
  priority: 3,
  revealValue: (pokemon) =>
    pokemon.evolutionLineStages === 3 ? 'Three-stage line' : 'Shorter evolution line',
  matches: (pokemon) => (pokemon.evolutionLineStages === 3) === hasThreeStages,
})

const stageClue = (stage: Pokemon['evolutionStage']): Clue => ({
  id: `evolution-stage-${stage}`,
  category: 'evolution-stage',
  text:
    stage === 1
      ? 'The suspect is at the first stage of its evolution line.'
      : stage === 2
        ? 'The suspect is at the middle stage of its evolution line.'
        : 'The suspect is at the final stage of its evolution line.',
  summary: stage === 1 ? 'First-stage evolution' : stage === 2 ? 'Middle-stage evolution' : 'Final-stage evolution',
  evidenceIntro: 'Nurse Joy compared the suspect against growth records.',
  hint:
    stage === 3
      ? 'This clue eliminates unevolved suspects.'
      : stage === 2
        ? 'Look for suspects with exactly one form before and after.'
        : 'This clue rules out evolved suspects.',
  propertyLabel: 'Evolution stage',
  priority: 4,
  revealValue: (pokemon) =>
    pokemon.evolutionStage === 1
      ? 'First stage'
      : pokemon.evolutionStage === 2
        ? 'Middle stage'
        : 'Final stage',
  matches: (pokemon) => pokemon.evolutionStage === stage,
})

const stoneClue = (evolvesByStone: boolean): Clue => ({
  id: evolvesByStone ? 'stone-yes' : 'stone-no',
  category: 'evolution-method',
  text: evolvesByStone
    ? 'The suspect evolves by stone.'
    : 'The suspect does not evolve by stone.',
  summary: evolvesByStone ? 'Stone evolution' : 'Not a stone evolution',
  evidenceIntro: 'A museum curator checked the evolution archives.',
  hint: 'Look closely at evolution methods.',
  propertyLabel: 'Evolution method',
  priority: 2,
  revealValue: (pokemon) => (pokemon.evolvesByStone ? 'Stone evolution' : 'Other method'),
  matches: (pokemon) => pokemon.evolvesByStone === evolvesByStone,
})

const heightClue = (isSmall: boolean): Clue => ({
  id: isSmall ? 'height-small' : 'height-tall',
  category: 'height',
  text: isSmall
    ? 'The suspect stands under 1 meter tall.'
    : 'The suspect stands at least 1 meter tall.',
  summary: isSmall ? 'Under 1 meter' : 'At least 1 meter',
  evidenceIntro: 'A witness sketched the suspect\'s silhouette on the wall.',
  hint: 'This clue separates small suspects from taller ones.',
  propertyLabel: 'Height',
  priority: 3,
  revealValue: (pokemon) => (pokemon.heightM < 1 ? 'Under 1 meter' : 'At least 1 meter'),
  matches: (pokemon) => (pokemon.heightM < 1) === isSmall,
})

const weightClue = (isLight: boolean): Clue => ({
  id: isLight ? 'weight-light' : 'weight-heavy',
  category: 'weight',
  text: isLight
    ? 'The suspect weighs under 30 kg.'
    : 'The suspect weighs 30 kg or more.',
  summary: isLight ? 'Under 30 kg' : '30 kg or more',
  evidenceIntro: 'The floorboards creaked just enough to estimate the weight.',
  hint: 'Heavy suspects and light suspects separate cleanly here.',
  propertyLabel: 'Weight',
  priority: 4,
  revealValue: (pokemon) => (pokemon.weightKg < 30 ? 'Under 30 kg' : '30 kg or more'),
  matches: (pokemon) => (pokemon.weightKg < 30) === isLight,
})

const legendaryClue = (isLegendaryOrMythical: boolean): Clue => ({
  id: isLegendaryOrMythical ? 'legendary-yes' : 'legendary-no',
  category: 'legendary',
  text: isLegendaryOrMythical
    ? 'The suspect is legendary or mythical.'
    : 'The suspect is not legendary or mythical.',
  summary: isLegendaryOrMythical ? 'Legendary or mythical' : 'Not legendary or mythical',
  evidenceIntro: 'League officials checked the rare-species registry.',
  hint: isLegendaryOrMythical
    ? 'Only rare registry entries fit this clue.'
    : 'Legendary and mythical suspects can be ruled out.',
  propertyLabel: 'Registry status',
  priority: 5,
  revealValue: (pokemon) =>
    pokemon.isLegendary || pokemon.isMythical ? 'Legendary or mythical' : 'Standard registry',
  matches: (pokemon) => (pokemon.isLegendary || pokemon.isMythical) === isLegendaryOrMythical,
})

export const getCluesForPokemon = (pokemon: Pokemon): Clue[] => {
  const clues: Clue[] = [
    regionClue(pokemon.region),
    starterClue(pokemon.isStarter),
    dualTypeClue(pokemon.types.length === 2),
    stageLineClue(pokemon.evolutionLineStages === 3),
    stageClue(pokemon.evolutionStage),
    stoneClue(pokemon.evolvesByStone),
    heightClue(pokemon.heightM < 1),
    weightClue(pokemon.weightKg < 30),
    legendaryClue(pokemon.isLegendary || pokemon.isMythical),
    ...pokemon.types.map(typeClue),
  ]

  return clues.filter(
    (clue, index) => clues.findIndex((candidate) => candidate.id === clue.id) === index,
  )
}

export const matchesAllClues = (pokemon: Pokemon, clues: Clue[]) =>
  clues.every((clue) => clue.matches(pokemon))

export const countMatchingSuspects = (suspects: Pokemon[], clues: Clue[]) =>
  suspects.filter((suspect) => matchesAllClues(suspect, clues)).length
