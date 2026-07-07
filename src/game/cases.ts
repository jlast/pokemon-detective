import { getShinySpriteUrl, pokemonData } from '../data/pokemon'
import type { Case, CaseDifficulty, Evidence, InspectedFact, Location, LocationAction, LocationActionLeadType, Suspect } from './caseModel'
import { generateCaseLineup } from './caseGeneration'
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
  const isShiny = Math.random() < 0.01

  return {
    pokemonId,
    name: pokemon.name,
    sprite: isShiny ? getShinySpriteUrl(pokemonId) : pokemon.sprite,
    isShiny,
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
    id: 'cookie-crumbs',
    title: 'Cookie Crumbs',
    clueText: 'Fresh crumbs were scattered low across the ground.',
    hiddenTrait: 'small_low',
    endExplanation: 'The culprit moved close to the ground while eating near the campfire.',
    discovered: false,
  },
  {
    id: 'quiet-digging',
    title: 'Quiet Digging',
    clueText: 'Someone heard soft scraping after midnight.',
    hiddenTrait: 'digging',
    endExplanation: 'The culprit spent time scratching or digging near camp overnight.',
    discovered: false,
  },
  {
    id: 'small-tracks',
    title: 'Small Tracks',
    clueText: 'The tracks were small and close to the ground.',
    hiddenTrait: 'small_low',
    endExplanation: 'The culprit left small, low tracks near the tents.',
    discovered: false,
  },
  {
    id: 'sand-trail',
    title: 'Sand Trail',
    clueText: 'A faint trail of dry grit pulled away from the camp.',
    hiddenTrait: 'ground_or_sand',
    endExplanation: 'The culprit carried dry grit away from the tracks.',
    discovered: false,
  },
  {
    id: 'loose-soil',
    title: 'Loose Soil',
    clueText: 'Fresh soil had been disturbed under the tree roots.',
    hiddenTrait: 'digging',
    endExplanation: 'Something recently dug into the loose soil at the forest edge.',
    discovered: false,
  },
  {
    id: 'scratch-marks',
    title: 'Scratch Marks',
    clueText: 'Narrow marks scored the cookie jar lid.',
    hiddenTrait: 'claws_or_scratching',
    endExplanation: 'The culprit left narrow scratch marks while opening the jar.',
    discovered: false,
  },
  {
    id: 'low-crumbs',
    title: 'Low Crumbs',
    clueText: 'Crumbs had fallen low along the edge of the table.',
    hiddenTrait: 'small_low',
    endExplanation: 'The culprit moved low beside the table while carrying crumbs away.',
    discovered: false,
  },
  {
    id: 'avoided-water',
    title: 'Avoided Water',
    clueText: 'The camper remembered the culprit skirting around the water bucket.',
    hiddenTrait: 'dry_ground_dislike_water',
    endExplanation: 'The culprit deliberately avoided the wettest part of camp.',
    discovered: false,
  },
  {
    id: 'dry-trail',
    title: 'Dry Trail',
    clueText: 'A dry path of grit led away from the wash bucket.',
    hiddenTrait: 'ground_or_sand',
    endExplanation: 'The culprit carried dry grit even near the water station.',
    discovered: false,
  },
  {
    id: 'ash-scatter',
    title: 'Ash Scatter',
    clueText: 'A fine dusting of residue settled near the fire pit.',
    hiddenTrait: 'ash_or_scorch',
    endExplanation: 'The culprit brushed against the ashes and left a trail.',
    discovered: false,
  },
  {
    id: 'static-mark',
    title: 'Static Mark',
    clueText: 'A faint burn mark blackened the edge of the lid.',
    hiddenTrait: 'fire_heat',
    endExplanation: 'The culprit left a scorched mark while forcing the jar open.',
    discovered: false,
  },
  {
    id: 'frost-trail',
    title: 'Frost Trail',
    clueText: 'A trail of frost sparkled behind the tents.',
    hiddenTrait: 'moisture_residue',
    endExplanation: 'The culprit left a glittering line of frost in the night air.',
    discovered: false,
  },
  {
    id: 'pollen-scent',
    title: 'Pollen Scent',
    clueText: 'The air near the roots carried a strange hint of plant matter.',
    hiddenTrait: 'plant_residue',
    endExplanation: 'The culprit disturbed the ground and stirred up plant matter.',
    discovered: false,
  },
  {
    id: 'psychic-echo',
    title: 'Psychic Echo',
    clueText: 'The witness felt an odd chill while describing the culprit.',
    hiddenTrait: 'psychic_trace',
    endExplanation: 'Something about the culprit left an uneasy sensation in the air.',
    discovered: false,
  },
  {
    id: 'metal-shaving',
    title: 'Metal Shaving',
    clueText: 'Thin curls of metal were found near the jar lid.',
    hiddenTrait: 'metal_scrape',
    endExplanation: 'The culprit left metal shavings while scraping against the jar.',
    discovered: false,
  },
  {
    id: 'slime-trail',
    title: 'Slime Trail',
    clueText: 'A slick ribbon of residue traced away from the camp.',
    hiddenTrait: 'toxic_residue',
    endExplanation: 'The culprit left a viscous trail as it moved through the scene.',
    discovered: false,
  },
  {
    id: 'feather-drift',
    title: 'Feather Drift',
    clueText: 'A few specks of down drifted down near the tracks.',
    hiddenTrait: 'air_movement',
    endExplanation: 'The culprit scattered light debris while moving through the brush.',
    discovered: false,
  },
]

const location = (
  id: string,
  name: string,
  icon: string,
  teaserText: string,
  ...actions: LocationAction[]
): Location => ({ id, name, icon, teaserText, investigated: false, selectedActionId: null, actions })

const ev = (
  id: string, label: string, description: string,
  observationText: string,
  sizeOverrides?: { small?: string; medium?: string; large?: string },
): LocationAction => ({
  id, label, leadType: 'careful', description, outcomeType: 'evidence',
  evidenceId: evidenceDefaults[id as keyof typeof evidenceDefaults]?.evidenceId ?? null,
  evidenceTitle: evidenceDefaults[id as keyof typeof evidenceDefaults]?.title ?? null,
  evidenceText: evidenceDefaults[id as keyof typeof evidenceDefaults]?.text ?? null,
  observationText,
  observationTextSmall: sizeOverrides?.small,
  observationTextMedium: sizeOverrides?.medium,
  observationTextLarge: sizeOverrides?.large,
  unlocksLocationIds: [], isUseful: true,
})

const wit = (
  id: string, label: string, description: string,
  observationText: string,
): LocationAction => ({
  id, label, leadType: 'uncertain', description, outcomeType: 'witness',
  evidenceId: evidenceDefaults[id as keyof typeof evidenceDefaults]?.evidenceId ?? null,
  evidenceTitle: evidenceDefaults[id as keyof typeof evidenceDefaults]?.title ?? null,
  evidenceText: evidenceDefaults[id as keyof typeof evidenceDefaults]?.text ?? null,
  observationText, unlocksLocationIds: [], isUseful: true,
})

const noth = (id: string, label: string, description: string, observationText: string): LocationAction => ({
  id, label, leadType: 'thorough', description, outcomeType: 'nothing',
  evidenceId: null, evidenceTitle: null, evidenceText: null,
  observationText, unlocksLocationIds: [], isUseful: false,
})

const leadByActionId: Record<string, LocationActionLeadType> = {
  'follow-tracks': 'risky', 'photograph-tracks': 'quick',
  'inspect-lid': 'obvious', 'smell-jar': 'risky',
  'tents': 'thorough', 'search-branches': 'thorough',
  'search-bedding': 'thorough',
}

// Override leadType per action for convenience
const act = <T extends LocationAction>(action: T): T => {
  const leadType = leadByActionId[action.id]
  if (leadType) (action as LocationAction).leadType = leadType
  return action
}

const evidenceDefaults: Record<string, { evidenceId: string; title: string; text: string }> = {
  crumbs: { evidenceId: 'cookie-crumbs', title: 'Cookie Crumbs', text: 'Fresh crumbs were scattered low across the ground.' },
  campers: { evidenceId: 'quiet-digging', title: 'Quiet Digging', text: 'Someone heard soft scraping after midnight.' },
  'measure-tracks': { evidenceId: 'small-tracks', title: 'Small Tracks', text: 'The tracks were small and close to the ground.' },
  'follow-tracks': { evidenceId: 'sand-trail', title: 'Sand Trail', text: 'A faint trail of dry grit pulled away from the camp.' },
  'check-roots': { evidenceId: 'loose-soil', title: 'Loose Soil', text: 'Fresh soil had been disturbed under the tree roots.' },
  'inspect-lid': { evidenceId: 'scratch-marks', title: 'Scratch Marks', text: 'Narrow marks scored the cookie jar lid.' },
  'check-table': { evidenceId: 'low-crumbs', title: 'Low Crumbs', text: 'Crumbs had fallen low along the edge of the table.' },
  'interview-camper': { evidenceId: 'avoided-water', title: 'Avoided Water', text: 'The camper remembered the culprit skirting around the water bucket.' },
  'check-wash-bucket': { evidenceId: 'dry-trail', title: 'Dry Trail', text: 'A dry path of grit led away from the wash bucket.' },
}

const campsiteLocations: Location[] = [
  location('campsite', 'Campsite', '🏕️', 'The campsite looks recently disturbed.',
    ev('crumbs', 'Examine the crumbs', 'Inspect traces near the fire pit.', 'The snack area was disturbed {movementWord}.'),
    act(noth('tents', 'Search the tents', 'Check sleeping bags and gear.', 'The tents are messy, but nothing points to the culprit.')),
    wit('campers', 'Interview nearby campers', 'Ask what they heard overnight.', 'The witness sounded sleepy, but consistent.'),
  ),
  location('tracks', 'Tracks', '👣', 'Something passed behind the tents.',
    ev('measure-tracks', 'Measure the tracks', 'Check the size of the tracks.', 'The tracks are steady and medium-sized through the dirt.',
      { small: 'The prints stay tight and shallow beside the tents.', large: 'The prints press deeper into the dirt than expected.' }),
    act(ev('follow-tracks', 'Follow the tracks', 'Follow where the trail breaks away.', 'The tracks break apart into {textureWord} behind the tents.')),
    act(noth('photograph-tracks', 'Photograph the tracks', 'Capture the tracks before they blur.', 'The picture is clear, but it gives you nothing new.')),
  ),
  location('forest-edge', 'Forest Edge', '🌲', 'The soil near the roots looks unusual.',
    ev('check-roots', 'Check the tree roots', 'Inspect the soil under the roots.', 'Something recently worked through the {groundWord} under the roots.'),
    act(noth('search-branches', 'Search the branches', 'Check the branches above eye level.', 'Broken twigs and leaves make noise, but reveal nothing useful.')),
    noth('listen-quietly', 'Listen quietly', 'Pause and listen for movement.', 'The woods stay still. If someone was here, they are long gone.'),
  ),
  location('cookie-jar', 'Cookie Jar', '🍪', 'The empty jar sits slightly crooked.',
    act(ev('inspect-lid', 'Inspect the lid', 'Study where the lid was forced open.', 'Something scraped hard against the lid before it gave way.')),
    act(noth('smell-jar', 'Smell the jar', 'Check for any lingering scent.', 'It only smells sweet and stale. Nothing useful lingers.')),
    ev('check-table', 'Check the table', 'Look along the table edge.', 'Whoever reached the jar left crumbs {movementWord} along the edge.'),
  ),
  location('witness-tent', 'Witness Tent', '🛏️', 'A sleepy camper remembers something.',
    wit('interview-camper', 'Interview the sleepy camper', 'Ask what the camper remembers.', 'The witness is tired, but certain about that detail.'),
    ev('check-wash-bucket', 'Check the wash bucket', 'Inspect the ground by the bucket.', 'Even near the water, a line of {textureWord} stayed behind.'),
    act(noth('search-bedding', 'Search the bedding', 'Check the blankets and bedding.', 'The bedding is warm and crumpled, but it hides nothing useful.')),
  ),
]

const libraryLocations: Location[] = [
  location('reading-room', 'Reading Room', '📚', 'Books are scattered across the floor.',
    ev('crumbs', 'Check the floor', 'Look for dropped items near the shelves.', 'Books were disturbed {movementWord} from their shelves.'),
    act(noth('tents', 'Search the armchairs', 'Check between the cushions.', 'The armchairs are rumpled, but nothing is hidden here.')),
    wit('campers', 'Interview the librarian', 'Ask what they heard last night.', 'The librarian overheard soft footsteps after hours.'),
  ),
  location('front-desk', 'Front Desk', '📋', 'The desk surface looks disturbed.',
    ev('measure-tracks', 'Measure the marks', 'Check the scuff marks on the counter.', 'The scuffs are even and mid-height across the counter.',
      { small: 'Small scuff marks sit low on the desk front.', large: 'Deep scuff marks line the top of the counter.' }),
    act(ev('follow-tracks', 'Follow the traces', 'See where the trail leads.', 'A thin line of {textureWord} trails away from the desk.')),
    act(noth('photograph-tracks', 'Photograph the desk', 'Capture the surface before it is cleaned.', 'The photo shows nothing beyond what you already saw.')),
  ),
  location('rare-books', 'Rare Books', '📜', 'The restricted section has been disturbed.',
    ev('check-roots', 'Check the bookcase base', 'Inspect the floor under the shelves.', 'The {groundWord} near the bookcase has been disturbed.'),
    act(noth('search-branches', 'Search the high shelves', 'Check the topmost books.', 'The high shelves are dusty but undisturbed.')),
    noth('listen-quietly', 'Listen for sounds', 'Pause and listen.', 'The library is silent. No one is hiding here.'),
  ),
  location('study-nook', 'Study Nook', '🪑', 'The display case latch looks damaged.',
    act(ev('inspect-lid', 'Inspect the display case', 'Check where the latch was forced.', 'Fresh scoring marks scratch the glass case latch.')),
    act(noth('smell-jar', 'Check the inkwell', 'Sniff for any unusual scent.', 'It smells only of old paper and dust. Nothing stands out.')),
    ev('check-table', 'Check the desk', 'Look along the writing desk.', 'Whoever took the book left traces {movementWord} along the desk.'),
  ),
  location('staff-office', 'Staff Office', '🚪', 'A staff member remembers something odd.',
    wit('interview-camper', 'Talk to the assistant', 'Ask what they noticed.', 'The assistant is certain about that detail.'),
    ev('check-wash-bucket', 'Check the coat rack', 'Inspect the floor by the rack.', 'Even by the door, a line of {textureWord} stayed behind.'),
    act(noth('search-bedding', 'Search the staff cot', 'Check the rest area.', 'The cot is undisturbed and holds no clues.')),
  ),
]

const gymLocations: Location[] = [
  location('locker-room', 'Locker Room', '🏋️', 'The locker room shows signs of a struggle.',
    ev('crumbs', 'Search the benches', 'Look for dropped items on the benches.', 'Gear was scattered {movementWord} across the benches.'),
    act(noth('tents', 'Check the lockers', 'Open unlocked lockers.', 'The lockers are messy but reveal nothing useful.')),
    wit('campers', 'Question the attendant', 'Ask who was here last night.', 'The attendant remembers hearing scuffling after hours.'),
  ),
  location('gym-floor', 'Gym Floor', '🏀', 'The floor has fresh marks.',
    ev('measure-tracks', 'Measure the scuffs', 'Check the size of the floor marks.', 'Mid-sized scuff marks trail across the gym floor.',
      { small: 'Small, light scuff marks near the equipment rack.', large: 'Heavy, deep scuff marks near center court.' }),
    act(ev('follow-tracks', 'Follow the marks', 'See where the trail goes.', 'A line of {textureWord} cuts across the gym floor.')),
    act(noth('photograph-tracks', 'Photograph the floor', 'Document the marks.', 'The photos are clear but add nothing new.')),
  ),
  location('equipment-room', 'Equipment Room', '🏐', 'Equipment has been knocked over.',
    ev('check-roots', 'Check under the racks', 'Inspect the floor beneath equipment.', 'The {groundWord} under the rack has been disturbed.'),
    act(noth('search-branches', 'Search the top shelves', 'Check above eye level.', 'The top shelves are dusty but untouched.')),
    noth('listen-quietly', 'Listen for movement', 'Stand still and listen.', 'The room is quiet. No one is here.'),
  ),
  location('trophy-case', 'Trophy Case', '🏆', 'The trophy case lock is damaged.',
    act(ev('inspect-lid', 'Inspect the lock', 'Check how the lock was forced.', 'The lock has fresh scoring marks around the edge.')),
    act(noth('smell-jar', 'Smell the case', 'Check for unusual odors.', 'It smells like polished metal. Nothing unusual.')),
    ev('check-table', 'Check the display table', 'Look along the display surface.', 'Whoever opened the case left traces {movementWord} along the glass.'),
  ),
  location('coach-office', 'Coach Office', '📋', 'The coach recalls a strange detail.',
    wit('interview-camper', 'Interview the coach', 'Ask what they remember.', 'The coach is tired but clear on that detail.'),
    ev('check-wash-bucket', 'Check the sink area', 'Look by the washbasin.', 'Even by the sink, a line of {textureWord} remained.'),
    act(noth('search-bedding', 'Search the couch', 'Check the office couch.', 'The couch is rumpled but holds nothing useful.')),
  ),
]

const kitchenLocations: Location[] = [
  location('pantry', 'Pantry', '🥫', 'Shelves have been rummaged through.',
    ev('crumbs', 'Check the floor', 'Look for dropped food on the floor.', 'Spilled goods scatter {movementWord} across the pantry floor.'),
    act(noth('tents', 'Search the shelves', 'Check the stacked boxes.', 'The shelves are disorganized but reveal no suspect.')),
    wit('campers', 'Ask the chef', 'Who was in the kitchen last?', 'The chef recalls hearing rustling after closing.'),
  ),
  location('kitchen-counter', 'Kitchen Counter', '🔪', 'The counter has fresh traces.',
    ev('measure-tracks', 'Measure the marks', 'Check marks on the countertop.', 'Medium marks run across the stainless steel counter.',
      { small: 'Fine light marks sit low on the counter edge.', large: 'Deep gouges run across the counter surface.' }),
    act(ev('follow-tracks', 'Follow the trail', 'See where the residue leads.', 'A streak of {textureWord} trails across the counter.')),
    act(noth('photograph-tracks', 'Photograph the counter', 'Document the surface.', 'The photo captures it but reveals nothing more.')),
  ),
  location('walk-in-fridge', 'Walk-in Fridge', '🧊', 'The cold room floor shows signs of activity.',
    ev('check-roots', 'Check under the shelving', 'Inspect the floor beneath racks.', 'The {groundWord} near the fridge base was disturbed.'),
    act(noth('search-branches', 'Check the top shelves', 'Reach above head height.', 'The top shelves are frosted but undisturbed.')),
    noth('listen-quietly', 'Listen for drips', 'Pause and listen.', 'The fridge hums quietly. No one is inside.'),
  ),
  location('dining-room', 'Dining Room', '🍽️', 'The locked cabinet door was tampered with.',
    act(ev('inspect-lid', 'Inspect the cabinet lock', 'Check how the lock was forced.', 'Fine scratch marks circle the cabinet lock.')),
    act(noth('smell-jar', 'Smell the cabinet', 'Check for lingering scents.', 'It smells of old wood and polish. Nothing useful.')),
    ev('check-table', 'Check the dining table', 'Look along the table edge.', 'Whoever took from the cabinet worked {movementWord} along the table.'),
  ),
  location('back-alley', 'Back Alley', '🚮', 'A delivery person noticed something odd.',
    wit('interview-camper', 'Interview the delivery person', 'Ask what they saw.', 'The delivery person is certain about the detail.'),
    ev('check-wash-bucket', 'Check the drain', 'Inspect the ground near the drain.', 'Even near the drain, a line of {textureWord} stayed behind.'),
    act(noth('search-bedding', 'Check the delivery crates', 'Look through stacked crates.', 'The crates are stacked neatly. Nothing is hidden.')),
  ),
]

const museumLocations: Location[] = [
  location('main-hall', 'Main Hall', '🏛️', 'The grand hall shows signs of movement.',
    ev('crumbs', 'Scan the floor', 'Look for items dropped on the floor.', 'Debris was scattered {movementWord} across the marble floor.'),
    act(noth('tents', 'Search the alcoves', 'Check the side alcoves.', 'The alcoves are dusty but hold no clues.')),
    wit('campers', 'Talk to the guard', 'Ask what they noticed during rounds.', 'The guard heard something shift near closing time.'),
  ),
  location('exhibit-room', 'Exhibit Room', '🖼️', 'The exhibit floor has fresh scuffs.',
    ev('measure-tracks', 'Measure the scuffs', 'Check the scuff marks on the floor.', 'Mid-sized scuffs mark the floor near the exhibit.',
      { small: 'Small, light scuffs near the display base.', large: 'Heavy scuffs mark the floor around the exhibit.' }),
    act(ev('follow-tracks', 'Follow the trail', 'See where the scuffs lead.', 'A trace of {textureWord} leads away from the exhibit.')),
    act(noth('photograph-tracks', 'Photograph the floor', 'Capture the scuff pattern.', 'The photo shows the pattern clearly but adds nothing.')),
  ),
  location('storage-vault', 'Storage Vault', '🔐', 'The vault floor shows disturbance.',
    ev('check-roots', 'Check under the shelves', 'Inspect the floor under storage.', 'The {groundWord} in the vault has been disturbed.'),
    act(noth('search-branches', 'Check the high cabinets', 'Reach the top cabinets.', 'The high cabinets are dusty but untouched.')),
    noth('listen-quietly', 'Listen for echoes', 'Stand still in the vault.', 'The vault is silent. No one is here.'),
  ),
  location('security-office', 'Security Office', '📹', 'The security panel was tampered with.',
    act(ev('inspect-lid', 'Inspect the panel', 'Check how the panel was forced.', 'The security panel has fresh scoring around its edge.')),
    act(noth('smell-jar', 'Smell the panel', 'Check for unusual odors.', 'It smells of electronics and dust. Nothing stands out.')),
    ev('check-table', 'Check the desk', 'Search the security desk.', 'Whoever reached the panel left traces {movementWord} along the desk.'),
  ),
  location('rooftop', 'Rooftop', '🌙', 'The rooftop guard has a curious memory.',
    wit('interview-camper', 'Interview the rooftop guard', 'Ask what they recall.', 'The guard is tired but certain about that memory.'),
    ev('check-wash-bucket', 'Check the drainpipe', 'Inspect the ground near the pipe.', 'Even near the drainpipe, a line of {textureWord} stayed behind.'),
    act(noth('search-bedding', 'Check the rooftop shed', 'Search the storage shed.', 'The shed is empty and holds nothing useful.')),
  ),
]

type EvidenceOverride = { title?: string; clueText?: string; endExplanation?: string }

const libraryOverrides: Record<string, EvidenceOverride> = {
  'cookie-crumbs': { title: 'Scattered Pages', clueText: 'Torn pages were scattered {movementWord} near the shelf.' },
  'low-crumbs': { title: 'Paper Fragments', clueText: 'Paper fragments fell {movementWord} beside the desk.' },
  'quiet-digging': { title: 'Quiet Rustling', clueText: 'Someone heard soft rustling after closing hours.' },
  'small-tracks': { title: 'Small Impressions', clueText: 'Small impressions dented the library carpet {movementWord}.' },
  'sand-trail': { title: 'Dust Trail', clueText: 'A trail of {textureWord} led between the shelves.' },
  'loose-soil': { title: 'Binding Dust', clueText: 'Fine dust from the binding settled {movementWord} under the shelf.' },
  'scratch-marks': { title: 'Score Marks', clueText: 'Fine score marks circled the display case lock.' },
  'dry-trail': { title: 'Dry Trace', clueText: 'A line of {textureWord} led away from the reading nook.' },
  'ash-scatter': { title: 'Debris', clueText: 'A fine dusting of {textureWord} settled near the reference desk.' },
  'frost-trail': { clueText: 'A trail of {textureWord} glistened down the aisle.' },
  'pollen-scent': { clueText: 'The air carried a strange hint of {textureWord} from the old paper.' },
  'slime-trail': { clueText: 'A slick ribbon of {textureWord} traced across the reading room floor.' },
  'static-mark': { clueText: 'A faint scorch mark blackened the edge of the bookcase.' },
  'metal-shaving': { clueText: 'Thin curls of metal were found near the display lock.' },
  'feather-drift': { clueText: 'A few specks of {textureWord} drifted down near the stacks.' },
}

const gymOverrides: Record<string, EvidenceOverride> = {
  'cookie-crumbs': { title: 'Scattered Gear', clueText: 'Training gear was dropped {movementWord} across the floor.' },
  'low-crumbs': { title: 'Dropped Items', clueText: 'Small items had fallen {movementWord} along the bench.' },
  'quiet-digging': { title: 'Locker Scraping', clueText: 'Someone heard scraping against the lockers after hours.' },
  'small-tracks': { clueText: 'Small scuffs marked the floor {movementWord}.' },
  'sand-trail': { title: 'Gym Dust', clueText: 'A trail of {textureWord} stretched across the gym floor.' },
  'loose-soil': { title: 'Mat Disturbance', clueText: 'The {groundWord} near the equipment rack was disturbed.' },
  'scratch-marks': { title: 'Scored Marks', clueText: 'Fine score marks circled the trophy case lock.' },
  'dry-trail': { title: 'Dry Path', clueText: 'A line of {textureWord} led away from the water fountain.' },
  'ash-scatter': { title: 'Residue', clueText: 'A dusting of {textureWord} settled near the weight rack.' },
  'frost-trail': { clueText: 'A trail of {textureWord} glistened on the gym floor.' },
  'pollen-scent': { clueText: 'The air carried a strange hint of {textureWord}.' },
  'slime-trail': { clueText: 'A slick ribbon of {textureWord} traced across the locker room.' },
  'static-mark': { clueText: 'A faint scorch mark blackened the edge of the locker.' },
  'metal-shaving': { clueText: 'Thin curls of metal were found near the trophy case lock.' },
  'feather-drift': { clueText: 'A few specks of {textureWord} drifted down near the bleachers.' },
}

const museumOverrides: Record<string, EvidenceOverride> = {
  'cookie-crumbs': { title: 'Debris', clueText: 'Tiny fragments were scattered {movementWord} across the hall.' },
  'low-crumbs': { title: 'Trace Fragments', clueText: 'Small particles fell {movementWord} beside the exhibit.' },
  'quiet-digging': { title: 'Faint Scraping', clueText: 'The guard heard a faint scraping near the exhibit.' },
  'small-tracks': { clueText: 'Small marks pressed into the museum floor {movementWord}.' },
  'sand-trail': { title: 'Display Dust', clueText: 'A trace of {textureWord} led between the displays.' },
  'loose-soil': { title: 'Floor Disturbance', clueText: 'The {groundWord} near the display base showed disturbance.' },
  'scratch-marks': { title: 'Display Score Marks', clueText: 'Fine score marks circled the display case lock.' },
  'static-mark': { clueText: 'A faint scorch mark blackened the edge of the display case.' },
  'metal-shaving': { clueText: 'Thin curls of metal were found near the display lock.' },
  'dry-trail': { title: 'Dry Trace', clueText: 'A line of {textureWord} led away from the exhibit hall.' },
  'ash-scatter': { title: 'Display Dust', clueText: 'A dusting of {textureWord} settled near the display case.' },
  'frost-trail': { clueText: 'A trail of {textureWord} shimmered on the museum floor.' },
  'pollen-scent': { clueText: 'The air carried a strange hint of {textureWord}.' },
  'slime-trail': { clueText: 'A slick ribbon of {textureWord} traced across the gallery floor.' },
  'feather-drift': { clueText: 'A few specks of {textureWord} drifted down near the artifact.' },
}

const kitchenOverrides: Record<string, EvidenceOverride> = {
  'scratch-marks': { clueText: 'Fine scratch marks circled the pantry lock.', endExplanation: 'The culprit left scratch marks while forcing the pantry open.' },
  'static-mark': { clueText: 'A faint scorch mark blackened the edge of the cabinet.', endExplanation: 'The culprit left a scorched mark while forcing the cabinet open.' },
  'metal-shaving': { clueText: 'Thin curls of metal were found near the cabinet lock.', endExplanation: 'The culprit left metal shavings while scraping against the cabinet.' },
}

type CaseConfig = { id: string; title: string; shortStory: string; crimeIcon: string; difficulty: CaseDifficulty; maxInvestigations: number; locations: Location[]; evidenceOverrides?: Record<string, EvidenceOverride> }

const allCases: CaseConfig[] = [
  { id: 'missing-cookies', title: 'The Missing Cookies', shortStory: 'Someone snuck into camp overnight and ate all the cookies.', crimeIcon: '🍪', difficulty: 'easy', maxInvestigations: 5, locations: campsiteLocations },
  { id: 'purloined-page', title: 'The Purloined Page', shortStory: 'A rare page was torn from a locked book in the library.', crimeIcon: '📖', difficulty: 'easy', maxInvestigations: 5, locations: libraryLocations, evidenceOverrides: libraryOverrides },
  { id: 'missing-medal', title: 'The Missing Medal', shortStory: 'A championship medal vanished from the locked trophy case overnight.', crimeIcon: '🏅', difficulty: 'easy', maxInvestigations: 5, locations: gymLocations, evidenceOverrides: gymOverrides },
  { id: 'ravaged-pantry', title: 'The Ravaged Pantry', shortStory: 'Someone raided the restaurant pantry after closing hours.', crimeIcon: '🥘', difficulty: 'easy', maxInvestigations: 5, locations: kitchenLocations, evidenceOverrides: kitchenOverrides },
  { id: 'stolen-artifact', title: 'The Stolen Artifact', shortStory: 'A priceless artifact was taken from a sealed museum exhibit.', crimeIcon: '🗿', difficulty: 'easy', maxInvestigations: 5, locations: museumLocations, evidenceOverrides: museumOverrides },
]

const createBaseCase = (caseConfig: CaseConfig): Omit<Case, 'culpritPokemonId' | 'suspects' | 'solution'> => ({
  ...caseConfig,
  locations: caseConfig.locations.map((locationItem) => ({
    ...locationItem,
    actions: locationItem.actions.map((action) => ({ ...action })),
  })),
  evidence: evidence.map((evidenceItem) => ({ ...evidenceItem })),
  status: 'active' as const,
})

const buildCase = (caseConfig: CaseConfig): Case => {
  const baseCase = createBaseCase(caseConfig)
  const generated = generateCaseLineup(baseCase.evidence, baseCase.locations, caseConfig.evidenceOverrides)

  return {
    ...baseCase,
    culpritPokemonId: generated.culpritPokemonId,
    suspects: generated.suspectPokemonIds.map(createSuspect).map((suspect) => ({
      ...suspect,
      inspectedGroups: { ...suspect.inspectedGroups },
      inspectedFacts: suspect.inspectedFacts.map((fact) => ({ ...fact })),
    })),
    locations: generated.locations.map((locationItem) => ({
      ...locationItem,
      actions: locationItem.actions.map((action) => ({ ...action })),
    })),
    evidence: generated.evidence.map((evidenceItem) => ({ ...evidenceItem })),
    solution: {
      ...generated.solution,
      evidenceExplanation: generated.solution.evidenceExplanation.map((item) => ({ ...item })),
      clearedSuspects: generated.solution.clearedSuspects.map((item) => ({ ...item })),
    },
  }
}

export const createMissingCookiesCase = (): Case => buildCase(allCases[0])
export const createPurloinedPageCase = (): Case => buildCase(allCases[1])
export const createMissingMedalCase = (): Case => buildCase(allCases[2])
export const createRavagedPantryCase = (): Case => buildCase(allCases[3])
export const createStolenArtifactCase = (): Case => buildCase(allCases[4])

export const getCaseList = () => allCases.map((c) => ({ id: c.id, title: c.title, shortStory: c.shortStory, crimeIcon: c.crimeIcon, difficulty: c.difficulty }))

export const createCaseById = (id: string): Case | undefined => {
  const config = allCases.find((c) => c.id === id)
  return config ? buildCase(config) : undefined
}
