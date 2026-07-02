import { LocationsDetailsPanel } from '../components/Evidence/LocationDetailsPanel'
import type { Case, Evidence, Location } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface LocationRouteProps {
  attemptsLeft: number
  currentCase: Case
  selectedLocation: Location
  selectedLocationEvidence: Evidence
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  closeLocation: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function LocationRoute({
  selectedLocation,
  closeLocation,
  ...props
}: LocationRouteProps) {
  return (
    <InvestigationRouteFrame activePanel="investigation" layout="locations" {...props}>
      <LocationsDetailsPanel
        closeLocation={closeLocation}
        selectedLocation={selectedLocation}
      />
    </InvestigationRouteFrame>
  )
}
