export const locationSceneNames = {
  altering_cave: 'Altering Cave', berry_forest: 'Berry Forest',
  cerulean_cave: 'Cerulean Cave', digletts_cave: 'Diglett’s Cave',
  dotted_hole: 'Dotted Hole', icefall_cave: 'Icefall Cave', lost_cave: 'Lost Cave',
  monean_chamber: 'Monean Chamber', mt_ember: 'Mt. Ember', mt_moon: 'Mt. Moon',
  pokemon_mansion: 'Pokémon Mansion', pokemon_tower: 'Pokémon Tower',
  power_plant: 'Power Plant', rock_tunnel: 'Rock Tunnel',
  rocket_hideout: 'Rocket Hideout', rocket_warehouse: 'Rocket Warehouse',
  safari_zone: 'Safari Zone', seafoam_islands: 'Seafoam Islands',
  silph_co: 'Silph Co.', victory_road: 'Victory Road', viridian_forest: 'Viridian Forest',
} as const
export type LocationSceneId = keyof typeof locationSceneNames

const interiors: LocationSceneId[] = ['pokemon_mansion', 'silph_co', 'rocket_warehouse', 'rocket_hideout', 'power_plant', 'pokemon_tower']
const rules: [RegExp, LocationSceneId[]][] = [
  [/lab|research|sample|specimen|school|academy/i, ['silph_co', 'power_plant', 'rocket_hideout', 'pokemon_mansion', 'rocket_warehouse']],
  [/radio|signal|power|control|workshop|mechanic|gear|clock|observatory/i, ['power_plant', 'silph_co', 'rocket_hideout', 'rocket_warehouse']],
  [/warehouse|storage|crate|cargo|parcel|supply|market|cart|stall|shelf|locker/i, ['rocket_warehouse', 'rocket_hideout', 'pokemon_mansion', 'silph_co']],
  [/shrine|tower|bell|reliquary|temple|totem|ruin|stone|statue/i, ['pokemon_tower', 'monean_chamber', 'dotted_hole', 'lost_cave']],
  [/snow|ice|cold|frozen/i, ['icefall_cave', 'seafoam_islands', 'cerulean_cave']],
  [/dock|harbor|ferry|sea|water|fishing|aquarium|lighthouse|fountain|wash|rinse|bucket|sink/i, ['seafoam_islands', 'cerulean_cave', 'icefall_cave', 'safari_zone']],
  [/garden|greenhouse|flower|orchard|berry|apiary|honey|plant/i, ['berry_forest', 'safari_zone', 'viridian_forest']],
  [/forest|camp|trail|ranger|tent|ground|tracks|path/i, ['viridian_forest', 'safari_zone', 'berry_forest', 'digletts_cave', 'rock_tunnel']],
  [/cave|quarry|mining|tunnel/i, ['rock_tunnel', 'digletts_cave', 'mt_moon', 'victory_road', 'mt_ember', 'altering_cave']],
  [/desk|office|book|library|room|reception|counter|cabinet|window|door|lock|jar|bakery|kitchen|cafe|museum|gallery|inn|lodge/i, interiors],
]
export function chooseLocationScene(name: string, context = ''): LocationSceneId {
  const normalName = name.replace(/-/g, ' ')
  const normalContext = context.replace(/-/g, ' ')
  // Match the location itself first. Case context only fills in unknown settings.
  const candidates = rules.find(([pattern]) => pattern.test(normalName))?.[1]
    ?? rules.find(([pattern]) => pattern.test(normalContext))?.[1]
    ?? interiors
  return candidates[0]
}

export function assignLocationScenes(locations: { id: string; name: string }[]): Record<string, LocationSceneId> {
  return Object.fromEntries(locations.map(location => [location.id, chooseLocationScene(location.name, location.id)]))
}
