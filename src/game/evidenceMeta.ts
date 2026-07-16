export const evidenceIcons: Record<string, string> = {
  'height-clue': '📏',
  'weight-clue': '👣',
  'type-residue-clue': '✨',
  'ground-trace-clue': '🪨',
  'force-clue': '🔐',
  'witness-clue': '🗣️',
  'highest-stat-clue': '💪',
  'lowest-stat-clue': '🧭',
}

const evidenceTitleIcons: Record<string, string> = {
  'Height Clue': '📏',
  'Track Clue': '👣',
  'Residue Clue': '✨',
  'Ground Clue': '🪨',
  'Entry Clue': '🔐',
  'Witness Clue': '🗣️',
  'Strength Clue': '💪',
  'Limitation Clue': '🧭',
}

export const getEvidenceIcon = (evidenceId: string | null | undefined, evidenceTitle?: string | null, fallback = '🔎') => {
  if (evidenceId && evidenceIcons[evidenceId]) return evidenceIcons[evidenceId]
  if (evidenceTitle && evidenceTitleIcons[evidenceTitle]) return evidenceTitleIcons[evidenceTitle]
  return fallback
}

export const getEvidenceCategory = (title: string) => {
  const text = title.toLowerCase()
  if (text.includes('height') || text.includes('reach')) return 'Height evidence'
  if (text.includes('track') || text.includes('print')) return 'Footprint evidence'
  if (text.includes('residue') || text.includes('trace')) return 'Residue evidence'
  if (text.includes('entry') || text.includes('force')) return 'Entry evidence'
  if (text.includes('witness')) return 'Witness evidence'
  if (text.includes('strength')) return 'Strength evidence'
  if (text.includes('limitation')) return 'Limitation evidence'
  if (text.includes('crumb') || text.includes('cookie')) return 'Food evidence'
  if (text.includes('scratch') || text.includes('mark')) return 'Surface evidence'
  if (text.includes('soil') || text.includes('stone')) return 'Ground evidence'
  if (text.includes('ash') || text.includes('burn')) return 'Heat evidence'
  if (text.includes('frost') || text.includes('cold')) return 'Cold evidence'
  if (text.includes('pollen')) return 'Plant evidence'
  if (text.includes('slime')) return 'Trail evidence'
  if (text.includes('static')) return 'Energy evidence'
  return 'Discovered clue'
}

export const getClearedSuspectEvidenceLabel = (reason?: string) => {
  if (!reason) return 'Ruled out'

  const text = reason.toLowerCase()
  if (text.includes('too tall') || text.includes('taller')) return 'Too tall'
  if (text.includes('too short') || text.includes('shorter')) return 'Too short'
  if (text.includes('too heavy') || text.includes('heavier')) return 'Too heavy'
  if (text.includes('too light') || text.includes('lighter')) return 'Too light'
  if (text.includes('deep')) return 'Tracks too deep'
  if (text.includes('shallow')) return 'Tracks too shallow'
  if (text.includes('scratch') || text.includes('scrape')) return 'Scratch marks'
  if (text.includes('crumb')) return 'Crumb trail'
  if (text.includes('water')) return 'Water clue'
  if (text.includes('heat') || text.includes('burn')) return 'Heat evidence'
  if (text.includes('cold') || text.includes('frost')) return 'Cold trace'
  if (text.includes('type')) return 'Type clue'
  if (text.includes('habitat')) return 'Habitat clue'
  if (text.includes('low-height')) return 'Low-height clues'
  if (text.includes('medium-height')) return 'Medium-height clues'
  if (text.includes('high-reach')) return 'High-reach clues'
  if (text.includes('light-track')) return 'Light tracks'
  if (text.includes('medium-depth')) return 'Medium tracks'
  if (text.includes('deep-print') || text.includes('heavy-pressure')) return 'Deep prints'
  if (text.includes('dry grit') || text.includes('loose soil')) return 'Loose soil'
  if (text.includes('digging')) return 'Digging signs'
  if (text.includes('dry ground')) return 'Dry ground clues'
  if (text.includes('damp') || text.includes('moisture')) return 'Damp evidence'
  if (text.includes('scorched') || text.includes('ashy')) return 'Ashy traces'
  if (text.includes('airborne') || text.includes('elevated')) return 'Air movement'
  if (text.includes('plant') || text.includes('leaf')) return 'Plant traces'
  if (text.includes('eerie')) return 'Eerie signature'
  if (text.includes('metal scraping')) return 'Metal scraping'
  if (text.includes('caustic') || text.includes('viscous')) return 'Slime trail'
  if (text.includes('disturbed lights')) return 'Disturbed lights'
  if (text.includes('heavy dents') || text.includes('deep impressions')) return 'Heavy dents'
  if (text.includes('glowing')) return 'Glowing residue'
  if (text.includes('splashed water')) return 'Splashed water'
  if (text.includes('stone chips')) return 'Stone chips'
  if (text.includes('unusual chill')) return 'Cold trace'
  if (text.includes('endurance')) return 'Endurance signs'
  if (text.includes('direct-force')) return 'Force clues'
  if (text.includes('sturdier')) return 'Sturdy clues'
  if (text.includes('energy traces')) return 'Energy traces'
  if (text.includes('stayed calm')) return 'Calmness clue'
  if (text.includes('faster-moving')) return 'Speed clues'
  if (text.includes('tire more quickly')) return 'Stamina clue'
  if (text.includes('less forceful')) return 'Force mismatch'
  if (text.includes('fragile suspect')) return 'Rough contact'
  if (text.includes('unusual-energy')) return 'Energy signature'
  if (text.includes('easily rattled')) return 'Composure clue'
  if (text.includes('deliberate route')) return 'Slow route'

  return reason
    .replace(/^did not (?:fit|match|explain|show signs of) (?:the )?/iu, '')
    .replace(/(?: found| left| at| pointing| related).*/iu, '')
    .replace(/[.!,;:]$/u, '')
    .split(/\s+/u)
    .slice(0, 5)
    .join(' ')
}
