const locationIconRules: Array<[RegExp, string]> = [
  [/gate|door|office|desk|counter|booth|window|front desk|service window|reception/i, '🚪'],
  [/tool|repair|workshop|mechanic|parts|gear|mechanism|supply|mining|quarry/i, '🧰'],
  [/cabinet|case|locker|drawer|vault|chest|box|reliquary|trunk|cage|plinth|hook/i, '🗄️'],
  [/shelf|rack|stand|crate|cart|stall|display|counter/i, '🧺'],
  [/walkway|puddle|fountain|basin|hose|sink|bucket|wash|tide|harbor|dock|pier|aquarium|tank|water|wet/i, '💧'],
  [/greenhouse|seedling|plant|planter|potting|garden|flower|bloom|orchard|berry|apiary|hive|herb/i, '🌱'],
  [/stage|theater|green room|prop|costume/i, '🎭'],
  [/shrine|prayer|offering|reliquary/i, '⛩️'],
  [/bakery|pastry|bread|flour|kitchen|cafe|tea|candy|honey/i, '🥐'],
  [/museum|gallery|exhibit|curator|artifact|archive|record/i, '🏛️'],
  [/radio|tower|control|signal|studio|broadcast|mixer/i, '📡'],
  [/lab|sample|specimen|research|rinse/i, '🧪'],
  [/observatory|telescope|star|chart/i, '🔭'],
  [/train|station|platform|luggage/i, '🚂'],
  [/clock|bell|town hall/i, '🕰️'],
  [/lighthouse|lens|seawater/i, '🛟'],
  [/circus|tent|ring|ticket/i, '🎪'],
  [/school|academy|classroom|lecture|art room/i, '🎨'],
  [/forest|trail|cache|ranger|cabin|camp|fire/i, '🌲'],
  [/market|vendor|merchant|produce/i, '🛒'],
  [/mail|parcel|post|delivery/i, '📮'],
  [/map|ranger desk|lookout/i, '🗺️'],
  [/roof|rooftop/i, '🏠'],
  [/dojo|training|practice|badge/i, '🥋'],
  [/harbor|ferry|ship|gangway|boardwalk/i, '⚓'],
  [/village|totem|carving|ceremonial/i, '🪵'],
  [/lantern|festival|parade/i, '🏮'],
  [/snow|lodge|souvenir/i, '❄️'],
  [/arcade|game|token|prize/i, '🎟️'],
  [/fishing|net|bait/i, '🎣'],
  [/stone|courtyard|statue|plaque/i, '🗿'],
]

const broadTemplateIcons = new Set(['🔎', '🔍', '👣', '📦', '🔐', '🗣️', '🗣'])

export const getLocationIcon = (locationName: string, fallbackIcon: string) => {
  if (!broadTemplateIcons.has(fallbackIcon)) return fallbackIcon

  const matchedRule = locationIconRules.find(([pattern]) => pattern.test(locationName))
  return matchedRule?.[1] ?? fallbackIcon
}
