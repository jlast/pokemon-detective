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
  openNotebook: () => void
  closeLocation: () => void
  addEvidenceToNotebook: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function LocationRoute({
  selectedLocation,
  selectedLocationEvidence,
  closeLocation,
  addEvidenceToNotebook,
  ...props
}: LocationRouteProps) {
  return (
    <InvestigationRouteFrame activePanel="investigation" layout="locations" {...props}>
      <LocationsDetailsPanel
        addEvidenceToNotebook={addEvidenceToNotebook}
        closeLocation={closeLocation}
        selectedLocation={selectedLocation}
        selectedLocationEvidence={selectedLocationEvidence}
      />
    </InvestigationRouteFrame>
  )
}
