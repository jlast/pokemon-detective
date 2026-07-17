export type LeadVisualType =
  | 'footprints'
  | 'object'
  | 'tool-marks'
  | 'dust'
  | 'sound'
  | 'scent'
  | 'high-surface'
  | 'ground'
  | 'container'
  | 'damage'
  | 'movement'
  | 'generic-search'

interface LeadVisualIconProps {
  visualType: LeadVisualType
}

export function LeadVisualIcon({ visualType }: LeadVisualIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <use href={`/lead-icons/${visualType}.svg#icon`} />
    </svg>
  )
}
