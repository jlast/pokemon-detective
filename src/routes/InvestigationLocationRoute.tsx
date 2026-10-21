import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { InvestigationLocationPage } from '../components/Evidence/InvestigationLocationPage'
import { getClueCollectionKey, type Case } from '../game/caseModel'
import { TODAY_INVESTIGATION_PATH } from '../paths'
import { BoardLocationDialog } from '../components/Evidence/BoardLocationDialog'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface InvestigationLocationRouteProps {
  attemptsLeft: number
  currentCase: Case
  investigateLocation: (locationId: string, actionId: string, witnessPokemonId?: number) => Promise<void>
  openLocation: (locationId: string) => void
  selectedLocationId: string | null
}

export function InvestigationLocationRoute({
  currentCase,
  investigateLocation,
  openLocation,
  selectedLocationId,
}: InvestigationLocationRouteProps) {
  const pendingPin = useRef(false)
  const [searchingLocationId, setSearchingLocationId] = useState<string | null>(null)
  const selectedLocation =
    currentCase.locations.find((location) => location.id === selectedLocationId) ?? null
  const actionsUsed = currentCase.locations.filter((location) => location.investigated).length
  const collectedEvidenceIds = currentCase.locations.flatMap((location) => (
    location.investigated && location.evidenceId ? [location.evidenceId] : []
  ))
  const collectedClueLabels = currentCase.locations.flatMap((location) => {
    if (!location.investigated || !location.selectedActionId) return []
    const action = location.actions.find((locationAction) => locationAction.id === location.selectedActionId)
    return action ? [getClueCollectionKey(action)] : []
  })
  const pointsLeft = Math.max(currentCase.maxInvestigations - actionsUsed, 0)

  useEffect(() => {
    setSearchingLocationId(null)
  }, [selectedLocationId])

  const chooseAction = (locationId: string, actionId: string, witnessPokemonId?: number) => {
    if (searchingLocationId !== null) return

    pendingPin.current = true
    setSearchingLocationId(locationId)
    void (async () => {
      try {
        await investigateLocation(locationId, actionId, witnessPokemonId)
      } finally {
        setSearchingLocationId((currentId) => (currentId === locationId ? null : currentId))
      }
    })()
  }

  const navigate = useNavigate()
  const routeLocation = useLocation()
  const investigationPath = `${TODAY_INVESTIGATION_PATH}${routeLocation.search}`

  useEffect(() => {
    if (!pendingPin.current || !selectedLocation?.investigated) return
    pendingPin.current = false
    navigate(investigationPath, { replace: true, state: { pinnedLocationId: selectedLocation.id } })
  }, [selectedLocation?.investigated, selectedLocation?.id, navigate, investigationPath])

  const closeLocation = () => navigate(investigationPath, {
    state: { focusLocationId: selectedLocationId },
  })

  return (
    <InvestigationRouteFrame
      layout="locations"
      currentCase={currentCase}
      openLocation={openLocation}
      showCaseFlowNav
    >
      <BoardLocationDialog title={selectedLocation?.name ?? 'Location'}
        onClose={closeLocation}>
        <InvestigationLocationPage
          location={selectedLocation}
          pointsLeft={pointsLeft}
          resolvedCount={actionsUsed}
          totalLocations={currentCase.locations.length}
          isSearching={searchingLocationId === selectedLocationId}
          interviewedWitnessPokemonIds={currentCase.locations.flatMap((location) => location.witnessPokemonId ? [location.witnessPokemonId] : [])}
          collectedEvidenceIds={collectedEvidenceIds}
          collectedClueLabels={collectedClueLabels}
          chooseAction={chooseAction}
        />
      </BoardLocationDialog>
    </InvestigationRouteFrame>
  )
}
