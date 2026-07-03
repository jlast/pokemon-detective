import { pokemonData, type Pokemon } from '../data/pokemon'
import type { CaseDifficulty, Evidence, InspectedFact, Location, Suspect } from './caseModel'
import { getAbilityText, getEvolutionLineText, getHabitatNote } from './suspectCaseFile'

export interface CaseEvidenceTemplate {
  id: string
  title: string
  clueText: string
  hiddenTrait: string
  endExplanation: string
}

export interface CaseLocationTemplate {
  id: string
  name: string
  icon: string
  description?: string
  teaserText?: string
  observationText?: string
  evidenceTitle?: string
  evidenceText?: string
  evidenceId?: string
}

export interface CaseTemplate {
  id: string
  title: string
  shortStory: string
  crimeIcon: string
  difficulty: CaseDifficulty
  culpritPokemonId: number
  maxInvestigations?: number
  suspectPokemonIds: number[]
  locations: CaseLocationTemplate[]
  evidence: CaseEvidenceTemplate[]
}

const getPokemon = (pokemonId: number) => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found in local data.`)
  }

  return pokemon
}

const toTitle = (value: string) => value[0].toUpperCase() + value.slice(1)

const createInspectedFacts = (pokemon: Pokemon): InspectedFact[] => {
  return [
    { key: 'type', label: 'Type', value: pokemon.types.map(toTitle).join(' / '), discovered: false },
    { key: 'region', label: 'Region', value: pokemon.region, discovered: false },
    { key: 'height', label: 'Height', value: `${pokemon.heightM} m`, discovered: false },
    { key: 'weight', label: 'Weight', value: `${pokemon.weightKg} kg`, discovered: false },
    { key: 'ability', label: 'Ability', value: getAbilityText(pokemon.id), discovered: false },
    {
      key: 'evolution-line',
      label: 'Evolution line',
      value: getEvolutionLineText(pokemon),
      discovered: false,
    },
    {
      key: 'habitat-note',
      label: 'Habitat note',
      value: getHabitatNote(pokemon.id),
      discovered: false,
    },
  ]
}

export const createSuspectFromPokemonId = (pokemonId: number): Suspect => {
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
    inspectedFacts: createInspectedFacts(pokemon),
  }
}

export const createEvidenceFromTemplate = (evidence: CaseEvidenceTemplate): Evidence => ({
  ...evidence,
  discovered: false,
})

export const createLocationFromTemplate = (location: CaseLocationTemplate): Location => ({
  ...location,
  selectedActionId: null,
  actions: [
    {
      id: `${location.id}-default`,
      label: 'Search the area',
      leadType: 'obvious',
      description: location.teaserText ?? location.description ?? 'Look for anything that stands out.',
      outcomeType: location.evidenceId ? 'evidence' : 'nothing',
      evidenceId: location.evidenceId ?? null,
      evidenceTitle: location.evidenceTitle ?? null,
      evidenceText: location.evidenceText ?? null,
      observationText: location.observationText ?? location.description ?? 'Nothing useful turns up here.',
      unlocksLocationIds: [],
      isUseful: Boolean(location.evidenceId),
    },
  ],
  investigated: false,
})

export const caseTemplates: CaseTemplate[] = [
  {
    id: 'missing-cookies',
    title: 'The Missing Cookies',
    shortStory: 'Someone snuck into camp overnight and ate all the cookies.',
    crimeIcon: '🍪',
    difficulty: 'easy',
    culpritPokemonId: 27,
    suspectPokemonIds: [54, 27, 58, 252, 322, 328],
    locations: [
      { id: 'campsite', name: 'Campsite', icon: '⛺', teaserText: 'The crime started here.', observationText: 'Blankets are messy and crumbs are scattered around the cold fire pit.', evidenceTitle: 'Cookie crumbs', evidenceText: 'A trail of sand crossed the campsite.', evidenceId: 'sand-trail' },
      { id: 'footprints', name: 'Footprints', icon: '👣', teaserText: 'Something unusual was found near the tents.', observationText: 'Tiny tracks loop behind the tents before fading into the dirt.', evidenceTitle: 'Small footprints', evidenceText: 'The footprints were small and low to the ground.', evidenceId: 'small-footprints' },
      { id: 'forest-edge', name: 'Forest Edge', icon: '🌲', teaserText: 'The edge of camp needs a closer look.', observationText: 'The edge of camp is quiet, with loose soil under the roots.', evidenceTitle: 'Midnight digging', evidenceText: 'The witness heard quiet digging after midnight.', evidenceId: 'midnight-digging' },
      { id: 'cookie-jar', name: 'Cookie Jar', icon: '🍪', teaserText: 'The scene looks disturbed.', observationText: 'The lid hangs crooked, and the table bears fresh marks.', evidenceTitle: 'Cookie jar scratches', evidenceText: 'Someone scratched near the cookie jar.', evidenceId: 'jar-scratches' },
      { id: 'witness-tent', name: 'Witness Tent', icon: '🛏️', teaserText: 'Someone might have seen or heard something.', observationText: 'A sleepy camper points toward the wash bucket by the lantern.', evidenceTitle: 'Avoided water', evidenceText: 'The culprit avoided the water bucket.', evidenceId: 'avoided-water' },
    ],
    evidence: [
      { id: 'sand-trail', title: 'Sand Trail', clueText: 'A trail of sand crossed the campsite.', hiddenTrait: 'ground_or_sand', endExplanation: 'Sandshrew is associated with dry ground and sand.' },
      { id: 'small-footprints', title: 'Small Footprints', clueText: 'The footprints were small and low to the ground.', hiddenTrait: 'small_low', endExplanation: 'Sandshrew is a small Pokemon close to the ground.' },
      { id: 'jar-scratches', title: 'Cookie Jar Scratches', clueText: 'Someone scratched near the cookie jar.', hiddenTrait: 'claws_or_scratching', endExplanation: 'Sandshrew uses sharp claws that could leave scratch marks near the jar.' },
      { id: 'midnight-digging', title: 'Midnight Digging', clueText: 'The witness heard quiet digging after midnight.', hiddenTrait: 'digging', endExplanation: 'Sandshrew is known for digging quietly through loose soil.' },
      { id: 'avoided-water', title: 'Avoided Water', clueText: 'The culprit avoided the water bucket.', hiddenTrait: 'dry_ground_dislike_water', endExplanation: 'Sandshrew is more at ease in dry ground than around water.' },
    ],
  },
  {
    id: 'stolen-gem',
    title: 'The Stolen Gem',
    shortStory: 'The camp\'s prize gem vanished from its display before sunrise.',
    crimeIcon: '💎',
    difficulty: 'medium',
    culpritPokemonId: 302,
    suspectPokemonIds: [52, 198, 302, 304, 41, 215],
    locations: [
      { id: 'display-case', name: 'Display Case', icon: '🪟', description: 'The velvet stand is empty, but the glass latch is untouched.', evidenceId: 'glitter-dust' },
      { id: 'mine-path', name: 'Mine Path', icon: '⛏️', description: 'Loose stones crunch underfoot near the camp\'s old cave trail.', evidenceId: 'cave-route' },
      { id: 'lantern-post', name: 'Lantern Post', icon: '🏮', description: 'A lantern swings gently as though something brushed past it.', evidenceId: 'silent-passing' },
      { id: 'supply-crate', name: 'Supply Crate', icon: '📦', description: 'The lock is fine, but one shiny button is missing.', evidenceId: 'drawn-to-shine' },
      { id: 'cave-mouth', name: 'Cave Mouth', icon: '🕳️', description: 'The shadows inside the cave swallow the last bit of dawn light.', evidenceId: 'shadow-hiding' },
    ],
    evidence: [
      { id: 'glitter-dust', title: 'Glitter Dust', clueText: 'A faint sprinkle of glitter dust was left behind.', hiddenTrait: 'shiny_hoarder', endExplanation: 'Sableye is famously drawn to glittering gems and crystals.' },
      { id: 'cave-route', title: 'Cave Route', clueText: 'The thief slipped away toward the old cave path.', hiddenTrait: 'gem_cave_dweller', endExplanation: 'Sableye hides in caves where gems and stones are easy to find.' },
      { id: 'silent-passing', title: 'Silent Passing', clueText: 'Nobody heard heavy steps, only a soft brush past the lantern post.', hiddenTrait: 'silent_night_sneak', endExplanation: 'Sableye moves quietly through the dark without much noise.' },
      { id: 'drawn-to-shine', title: 'Drawn to Shine', clueText: 'The missing button was the shiniest thing in the whole supply crate.', hiddenTrait: 'shiny_hoarder', endExplanation: 'Sableye would notice and pocket even small shiny objects.' },
      { id: 'shadow-hiding', title: 'Shadow Hiding', clueText: 'Whatever took the gem seemed comfortable disappearing into deep shadow.', hiddenTrait: 'deep_shadow_comfort', endExplanation: 'Sableye is comfortable lurking in darkness and slipping out of sight.' },
    ],
  },
  {
    id: 'ruined-garden',
    title: 'The Ruined Garden',
    shortStory: 'By dawn, the prize flower bed was trampled, scorched, and full of bitten stems.',
    crimeIcon: '🌼',
    difficulty: 'medium',
    culpritPokemonId: 322,
    suspectPokemonIds: [37, 58, 77, 231, 315, 322],
    locations: [
      { id: 'flower-bed', name: 'Flower Bed', icon: '🌸', description: 'Wilted petals cling to the dirt where the blooms used to stand.', evidenceId: 'warm-ash' },
      { id: 'garden-gate', name: 'Garden Gate', icon: '🚪', description: 'The latch is open and the soil beyond it is deeply pressed.', evidenceId: 'round-tracks' },
      { id: 'watering-can', name: 'Watering Can', icon: '🪣', description: 'The can sits untouched, but the path beside it is dry.', evidenceId: 'dry-path' },
      { id: 'stone-border', name: 'Stone Border', icon: '🪨', description: 'The border stones feel strangely warm compared to the night air.', evidenceId: 'lingering-heat' },
      { id: 'seed-shed', name: 'Seed Shed', icon: '🏚️', description: 'A few dry stems are missing from the basket by the door.', evidenceId: 'dry-stems' },
    ],
    evidence: [
      { id: 'warm-ash', title: 'Warm Ash', clueText: 'A soft dusting of warm ash clung to the ruined flowers.', hiddenTrait: 'heat_soot', endExplanation: 'Numel carries heat and soot that could scorch a flower bed.' },
      { id: 'round-tracks', title: 'Round Tracks', clueText: 'The tracks were round, heavy, and not especially quick.', hiddenTrait: 'round_heavy_steps', endExplanation: 'Numel leaves steady, rounded tracks and is built low and stocky.' },
      { id: 'dry-path', title: 'Dry Path', clueText: 'The path through the garden stayed oddly dry beside the watering can.', hiddenTrait: 'dry_field_grazer', endExplanation: 'Numel is more comfortable in dry heat than around fresh water.' },
      { id: 'lingering-heat', title: 'Lingering Heat', clueText: 'The stones by the border still held warmth after sunrise.', hiddenTrait: 'heat_soot', endExplanation: 'Numel\'s body heat fits the warmth left behind in the garden.' },
      { id: 'dry-stems', title: 'Dry Stems', clueText: 'Whatever passed through seemed more interested in the driest stems than the fresh leaves.', hiddenTrait: 'dry_field_grazer', endExplanation: 'Numel would be more at ease around dry brush and stems than lush wet plants.' },
    ],
  },
  {
    id: 'broken-trophy',
    title: 'The Broken Trophy',
    shortStory: 'The camp tournament trophy toppled from its shelf during the night and shattered on the floor.',
    crimeIcon: '🏆',
    difficulty: 'easy',
    culpritPokemonId: 54,
    suspectPokemonIds: [54, 194, 190, 327, 353, 399],
    locations: [
      { id: 'trophy-shelf', name: 'Trophy Shelf', icon: '🪜', description: 'The wooden shelf leans slightly, and the trophy pieces glitter across the floor.', evidenceId: 'water-drops' },
      { id: 'puddle-edge', name: 'Puddle Edge', icon: '💧', description: 'A few drops still cling to the ground beside the hall entrance.', evidenceId: 'webbed-tracks' },
      { id: 'sleeping-bags', name: 'Sleeping Bags', icon: '🛌', description: 'One camper swears they heard a drowsy mutter in the dark.', evidenceId: 'sleepy-muttering' },
      { id: 'hallway-rug', name: 'Hallway Rug', icon: '🧶', description: 'The rug is wrinkled where someone shuffled across it.', evidenceId: 'awkward-shuffle' },
      { id: 'wash-basin', name: 'Wash Basin', icon: '🫧', description: 'The wash basin still ripples as if someone brushed it on the way out.', evidenceId: 'basin-brush' },
    ],
    evidence: [
      { id: 'water-drops', title: 'Water Drops', clueText: 'Tiny water drops led away from the broken trophy.', hiddenTrait: 'water_link', endExplanation: 'Psyduck is closely linked to water and could leave damp traces behind.' },
      { id: 'webbed-tracks', title: 'Webbed Tracks', clueText: 'The tracks looked soft and spread-out rather than sharp.', hiddenTrait: 'webbed_feet', endExplanation: 'Psyduck\'s broad, webbed feet fit the shape of the tracks.' },
      { id: 'sleepy-muttering', title: 'Sleepy Muttering', clueText: 'Someone nearby heard a drowsy muttering sound after the crash.', hiddenTrait: 'sleepy_muttering', endExplanation: 'Psyduck is known for absent-minded muttering and dazed late-night wandering.' },
      { id: 'awkward-shuffle', title: 'Awkward Shuffle', clueText: 'The rug showed an awkward little shuffle instead of a quick sprint.', hiddenTrait: 'stubby_clumsy_reach', endExplanation: 'Psyduck\'s clumsy movements fit the awkward shuffle near the shelf.' },
      { id: 'basin-brush', title: 'Basin Brush', clueText: 'The wash basin had been nudged just enough to send ripples across the top.', hiddenTrait: 'water_link', endExplanation: 'Psyduck would naturally end up close to the basin and leave the water disturbed.' },
    ],
  },
  {
    id: 'missing-egg',
    title: 'The Missing Egg',
    shortStory: 'One of the camp\'s care eggs disappeared from its nest before breakfast.',
    crimeIcon: '🥚',
    difficulty: 'medium',
    culpritPokemonId: 252,
    suspectPokemonIds: [43, 163, 190, 200, 252, 315],
    locations: [
      { id: 'nest-basket', name: 'Nest Basket', icon: '🧺', description: 'Only a ring of soft bedding remains where the egg was tucked in.', evidenceId: 'leaf-scrap' },
      { id: 'rafters', name: 'Rafters', icon: '🪵', description: 'High beams cross the nursery tent just above the lantern line.', evidenceId: 'high-scratch' },
      { id: 'tree-line', name: 'Tree Line', icon: '🌿', description: 'Fresh bark scuffs mark a route between the nursery and the woods.', evidenceId: 'light-climb' },
      { id: 'window-flap', name: 'Window Flap', icon: '🪟', description: 'The flap is open, but only by a narrow little gap.', evidenceId: 'narrow-gap' },
      { id: 'nesting-stool', name: 'Nesting Stool', icon: '🪑', description: 'The stool beneath the nest was nudged, but not toppled.', evidenceId: 'careful-balance' },
    ],
    evidence: [
      { id: 'leaf-scrap', title: 'Leaf Scrap', clueText: 'A torn leaf scrap was caught in the bedding.', hiddenTrait: 'leafy_hideaway', endExplanation: 'Treecko carries the scent and scraps of leafy cover wherever it slips through.' },
      { id: 'high-scratch', title: 'High Scratch', clueText: 'There was a tiny scratch high up on the rafters.', hiddenTrait: 'tree_climber', endExplanation: 'Treecko can climb high surfaces with ease, even inside a nursery tent.' },
      { id: 'light-climb', title: 'Light Climb', clueText: 'The bark marks were light, neat, and easy to miss.', hiddenTrait: 'light_frame', endExplanation: 'Treecko is light and agile enough to leave only faint climbing marks.' },
      { id: 'narrow-gap', title: 'Narrow Gap', clueText: 'Whoever left used only the tiniest gap in the flap.', hiddenTrait: 'light_frame', endExplanation: 'Treecko\'s slim frame would let it slip through the narrow opening.' },
      { id: 'careful-balance', title: 'Careful Balance', clueText: 'The stool beneath the nest shifted, but not enough to fall over.', hiddenTrait: 'forest_dexterity', endExplanation: 'Treecko is nimble enough to move around the nest without causing a bigger crash.' },
    ],
  },
]

export const hiddenTraitMatchers: Record<string, (pokemon: Pokemon) => boolean> = {
  ground_or_sand: (pokemon) => pokemon.types.includes('ground'),
  small_low: (pokemon) => pokemon.heightM <= 0.8,
  claws_or_scratching: (pokemon) => [27, 52, 58, 215, 252, 302, 328].includes(pokemon.id),
  digging: (pokemon) => [27, 322, 328].includes(pokemon.id),
  dry_ground_dislike_water: (pokemon) => [27, 322, 328].includes(pokemon.id),
  shiny_hoarder: (pokemon) => [52, 198, 302].includes(pokemon.id),
  gem_cave_dweller: (pokemon) => [41, 302, 304].includes(pokemon.id),
  silent_night_sneak: (pokemon) => [41, 198, 215, 302].includes(pokemon.id),
  deep_shadow_comfort: (pokemon) => [41, 198, 215, 302, 353].includes(pokemon.id),
  heat_soot: (pokemon) => [37, 58, 77, 228, 322].includes(pokemon.id),
  round_heavy_steps: (pokemon) => [77, 231, 322].includes(pokemon.id),
  dry_field_grazer: (pokemon) => [231, 322].includes(pokemon.id),
  water_link: (pokemon) => [54, 194].includes(pokemon.id),
  webbed_feet: (pokemon) => [54, 194].includes(pokemon.id),
  sleepy_muttering: (pokemon) => [54].includes(pokemon.id),
  stubby_clumsy_reach: (pokemon) => [54, 327, 399].includes(pokemon.id),
  leafy_hideaway: (pokemon) => [43, 252, 315].includes(pokemon.id),
  tree_climber: (pokemon) => [190, 252].includes(pokemon.id),
  light_frame: (pokemon) => [163, 190, 252].includes(pokemon.id),
  forest_dexterity: (pokemon) => [190, 252].includes(pokemon.id),
}
