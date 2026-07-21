const evidenceMetaById: Record<string, { icon: string; title: string }> = {
  'height-clue': { icon: '📏', title: 'Height Clue' },
  'weight-clue': { icon: '👣', title: 'Track Clue' },
  'type-residue-clue': { icon: '✨', title: 'Residue Clue' },
  'ground-trace-clue': { icon: '🪨', title: 'Ground Clue' },
  'force-clue': { icon: '🔐', title: 'Entry Clue' },
  'witness-clue': { icon: '🗣️', title: 'Witness Clue' },
  'highest-stat-clue': { icon: '💪', title: 'Strength Clue' },
  'lowest-stat-clue': { icon: '🧭', title: 'Limitation Clue' },
}

export const evidenceIcons: Record<string, string> = Object.fromEntries(
  Object.entries(evidenceMetaById).map(([id, meta]) => [id, meta.icon]),
)

const evidenceTitleIcons: Record<string, string> = Object.fromEntries(
  Object.values(evidenceMetaById).map((meta) => [meta.title, meta.icon]),
)

export const getEvidenceIcon = (evidenceId: string | null | undefined, evidenceTitle?: string | null, fallback = '🔎') => {
  if (evidenceId && evidenceIcons[evidenceId]) return evidenceIcons[evidenceId]
  if (evidenceTitle && evidenceTitleIcons[evidenceTitle]) return evidenceTitleIcons[evidenceTitle]
  return fallback
}
