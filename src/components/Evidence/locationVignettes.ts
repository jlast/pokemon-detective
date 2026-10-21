export interface LocationVignette {
  layout: 'tracks' | 'jar' | 'shelf' | 'box' | 'cabinet' | 'desk' | 'console' | 'display'
  sprites: string[]
  palette: 'wood' | 'lab' | 'garden' | 'stone'
}

function hash(value: string): number {
  let result = 2166136261
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619)
  return result >>> 0
}

function settingObjects(name: string, context: string): string[] {
  const themes: [RegExp, string[]][] = [
    [/shrine|moonstone|offering|reliquary|ceremonial|totem|bell/, ['pure-incense', 'spell-tag', 'cleanse-tag', 'stardust', 'pretty-wing', 'pearl', 'heart-scale']],
    [/cookies|bakery|pantry|picnic|bread|flour/, ['lava-cookie', 'honey', 'old-gateau', 'berry-juice', 'fresh-water', 'oran-berry', 'cheri-berry']],
    [/honey|apiary|jar/, ['honey', 'berry-juice', 'pure-incense', 'pretty-wing', 'oran-berry', 'fresh-water']],
    [/tea|cafe/, ['tea', 'berry-juice', 'lava-cookie', 'honey', 'old-gateau', 'fresh-water']],
    [/candy|sweet|treat/, ['rage-candy-bar', 'old-gateau', 'lava-cookie', 'cheri-berry', 'sitrus-berry', 'honey']],
    [/lab|sample|specimen|aquarium|feed|filter/, ['potion', 'fresh-water', 'berry-juice', 'ether', 'antidote', 'burn-heal', 'paralyze-heal']],
    [/flower|garden|greenhouse|orchard|berry|seed|planter|bloom|apple/, ['honey', 'pretty-wing', 'soft-sand', 'oran-berry', 'cheri-berry', 'sitrus-berry', 'green-shard']],
    [/radio|signal|clock|workshop|gear|tool|repair|parts|mechanism|cable/, ['electirizer', 'metal-coat', 'grip-claw', 'dubious-disc', 'wide-lens', 'storage-key', 'red-shard']],
    [/map|ship|archive|register|page|book|document|record|catalog|chart/, ['journal', 'town-map', 'dubious-disc', 'storage-key', 'wide-lens', 'pretty-wing', 'heart-scale']],
    [/lens|observatory|telescope|star/, ['wide-lens', 'silph-scope', 'town-map', 'stardust', 'pearl', 'dubious-disc']],
    [/key|inn|luggage/, ['storage-key', 'journal', 'town-map', 'tea', 'fresh-water', 'amulet-coin']],
    [/ticket|token|coin|market|cash/, ['amulet-coin', 'journal', 'storage-key', 'town-map', 'pearl', 'rage-candy-bar']],
    [/badge|medal|gym|dojo|equipment|gear rack/, ['muscle-band', 'focus-band', 'amulet-coin', 'fresh-water', 'potion', 'revive']],
    [/fish|net|bait|dock|pier|harbor/, ['heart-scale', 'fresh-water', 'pearl', 'grip-claw', 'escape-rope', 'storage-key']],
  ]
  const pool = themes.find(([pattern]) => pattern.test(name))?.[1]
    ?? themes.find(([pattern]) => pattern.test(context))?.[1]
    ?? ['journal', 'wide-lens', 'storage-key', 'town-map', 'fresh-water', 'pretty-wing']
  const seed = `${context}:${name}`
  const count = hash(seed) % 3 === 0 ? 2 : 3
  return [...pool].sort((left, right) => hash(`${seed}:${left}`) - hash(`${seed}:${right}`)).slice(0, count)
}

export function getLocationVignette(name: string, context: string): LocationVignette | null {
  const label = name.toLowerCase()
  const setting = `${context} ${label}`.toLowerCase()
  const palette = /lab|sample|specimen|fridge|aquarium/.test(setting) ? 'lab'
    : /garden|flower|orchard|forest|camp|berry|greenhouse/.test(setting) ? 'garden'
    : /shrine|stone|museum|reliquary/.test(setting) ? 'stone' : 'wood'
  if (/\b(tracks?|footprints?|ground marks)\b/.test(label)) return { layout: 'tracks', sprites: [], palette: 'garden' }
  if (/cookie jar/.test(label)) return { layout: 'jar', sprites: ['honey', 'lava-cookie', 'lava-cookie'], palette: 'wood' }
  if (/honey.*(jar|cabinet)|jar shelf/.test(label)) return { layout: 'jar', sprites: ['honey', ...settingObjects(label, context).filter(sprite => sprite !== 'honey').slice(0, 2)], palette }
  if (/cash|coin|donation|token|ticket drawer/.test(label)) return { layout: 'box', sprites: ['amulet-coin', ...settingObjects(label, context).filter(sprite => sprite !== 'amulet-coin').slice(0, 2)], palette }
  if (/lab counter|sample shelf|specimen fridge/.test(label)) return { layout: /fridge/.test(label) ? 'cabinet' : 'shelf', sprites: settingObjects(label, context), palette: 'lab' }
  if (/console|mixer|mechanism panel/.test(label)) return { layout: 'console', sprites: settingObjects(label, context).slice(0, 2), palette }
  if (/offering shelf/.test(label)) return { layout: 'shelf', sprites: ['pure-incense', 'pretty-wing', 'oran-berry'], palette: 'stone' }
  if (/stone reliquary/.test(label)) return { layout: 'cabinet', sprites: ['spell-tag', 'stardust'], palette: 'stone' }
  if (/witness/.test(label)) return { layout: 'desk', sprites: ['journal', 'tea'], palette: 'wood' }
  if (/shelf|rack|rare books|crate|stand|notice board/.test(label)) return { layout: 'shelf', sprites: settingObjects(label, context), palette }
  if (/fridge|cabinet|locker|vault|cage|reliquary/.test(label)) return { layout: 'cabinet', sprites: settingObjects(label, context), palette }
  if (/box|chest|trunk|drawer|cache|jar/.test(label)) return { layout: 'box', sprites: settingObjects(label, context), palette }
  if (/case|display|plinth|nook|hook/.test(label)) return { layout: 'display', sprites: settingObjects(label, context), palette }
  if (/desk|counter|bench|table/.test(label)) return { layout: 'desk', sprites: settingObjects(label, context), palette }
  return null
}
