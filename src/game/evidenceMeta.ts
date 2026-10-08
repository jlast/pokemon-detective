const evidenceMetaById: Record<string, { icon: string; title: string }> = {
  'height-clue': { icon: '📏', title: 'Height Clue' },
  'weight-clue': { icon: '👣', title: 'Track Clue' },
  'type-residue-clue': { icon: '✨', title: 'Type Clue' },
  'ground-trace-clue': { icon: '🪨', title: 'Type Clue' },
  'force-clue': { icon: '🔐', title: 'Type Clue' },
  'witness-clue': { icon: '🗣️', title: 'Type Clue' },
  'highest-stat-clue': { icon: '💪', title: 'Strength Clue' },
  'lowest-stat-clue': { icon: '🧭', title: 'Limitation Clue' },
  'type-affectedness-clue': { icon: '🧪', title: 'Reaction Clue' },
  'region-clue': { icon: '🗺️', title: 'Region Clue' },
  'region-clue-a': { icon: '🗺️', title: 'Region Clue' },
  'region-clue-b': { icon: '🗺️', title: 'Region Clue' },
  'region-clue-c': { icon: '🗺️', title: 'Region Clue' },
  'color-clue': { icon: '🎨', title: 'Color Clue' },
  'evolution-chain-clue': { icon: '🔁', title: 'Evolution Clue' },
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
