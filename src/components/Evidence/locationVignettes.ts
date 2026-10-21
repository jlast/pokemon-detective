export interface LocationVignette {
  layout: 'tracks' | 'jar' | 'shelf' | 'box' | 'cabinet' | 'desk' | 'console' | 'display'
  sprites: string[]
  palette: 'wood' | 'lab' | 'garden' | 'stone'
}

function settingObjects(context: string): string[] {
  const themes: [RegExp, string[]][] = [
    [/cookies|bakery|pantry|picnic/, ['lava-cookie', 'honey', 'old-gateau']],
    [/honey|apiary/, ['honey', 'honey', 'berry-juice']],
    [/tea|cafe/, ['tea', 'berry-juice', 'lava-cookie']],
    [/candy|sweet/, ['rage-candy-bar', 'old-gateau', 'lava-cookie']],
    [/lab|sample|specimen|aquarium/, ['potion', 'fresh-water', 'berry-juice']],
    [/flower|garden|greenhouse|orchard|berry/, ['honey', 'pretty-wing', 'soft-sand']],
    [/radio|signal|clock|workshop/, ['electirizer', 'metal-coat', 'grip-claw']],
    [/map|ship|archive|register|page|book/, ['journal', 'town-map', 'dubious-disc']],
    [/lens|observatory|telescope/, ['wide-lens', 'silph-scope', 'town-map']],
    [/key|inn/, ['storage-key', 'journal', 'storage-key']],
    [/ticket|token|coin|market/, ['amulet-coin', 'journal', 'storage-key']],
    [/badge|medal|gym|dojo/, ['muscle-band', 'focus-band', 'amulet-coin']],
  ]
  return themes.find(([pattern]) => pattern.test(context))?.[1] ?? ['journal', 'wide-lens', 'storage-key']
}

export function getLocationVignette(name: string, context: string): LocationVignette | null {
  const label = name.toLowerCase()
  const setting = `${context} ${label}`.toLowerCase()
  const palette = /lab|sample|specimen|fridge|aquarium/.test(setting) ? 'lab'
    : /garden|flower|orchard|forest|camp|berry|greenhouse/.test(setting) ? 'garden'
    : /shrine|stone|museum|reliquary/.test(setting) ? 'stone' : 'wood'
  if (/\b(tracks?|footprints?|ground marks)\b/.test(label)) return { layout: 'tracks', sprites: [], palette: 'garden' }
  if (/cookie jar/.test(label)) return { layout: 'jar', sprites: ['honey', 'lava-cookie', 'lava-cookie'], palette: 'wood' }
  if (/honey.*(jar|cabinet)|jar shelf/.test(label)) return { layout: 'jar', sprites: ['honey', 'honey', 'honey'], palette }
  if (/cash|coin|donation|token|ticket drawer/.test(label)) return { layout: 'box', sprites: ['amulet-coin', 'amulet-coin', 'storage-key'], palette }
  if (/lab counter|sample shelf|specimen fridge/.test(label)) return { layout: /fridge/.test(label) ? 'cabinet' : 'shelf', sprites: ['potion', 'fresh-water', 'berry-juice'], palette: 'lab' }
  if (/console|mixer|mechanism panel/.test(label)) return { layout: 'console', sprites: ['electirizer', 'dubious-disc'], palette }
  if (/witness/.test(label)) return { layout: 'desk', sprites: ['journal', 'tea'], palette: 'wood' }
  if (/shelf|rack|rare books|crate|stand|notice board/.test(label)) return { layout: 'shelf', sprites: settingObjects(setting), palette }
  if (/fridge|cabinet|locker|vault|cage|reliquary/.test(label)) return { layout: 'cabinet', sprites: settingObjects(setting), palette }
  if (/box|chest|trunk|drawer|cache|jar/.test(label)) return { layout: 'box', sprites: settingObjects(setting), palette }
  if (/case|display|plinth|nook|hook/.test(label)) return { layout: 'display', sprites: settingObjects(setting), palette }
  if (/desk|counter|bench|table/.test(label)) return { layout: 'desk', sprites: settingObjects(setting), palette }
  return null
}
