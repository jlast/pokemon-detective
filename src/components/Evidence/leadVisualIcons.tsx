import type { LeadVisualType } from '../../game/caseModel'

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
