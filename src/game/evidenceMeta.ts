const evidenceMetaById: Record<string, { icon: string; title: string }> = {
  'height-clue': { icon: '📏', title: 'Height Clue' },
  'weight-clue': { icon: '👣', title: 'Weight Clue' },
  'type-residue-clue': { icon: '✨', title: 'Type Clue' },
  'ground-trace-clue': { icon: '🪨', title: 'Type Clue' },
  'force-clue': { icon: '🔐', title: 'Type Clue' },
  'witness-clue': { icon: '🗣️', title: 'Type Clue' },
  'highest-stat-clue': { icon: '💪', title: 'Stat Clue' },
  'lowest-stat-clue': { icon: '🧭', title: 'Stat Clue' },
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
