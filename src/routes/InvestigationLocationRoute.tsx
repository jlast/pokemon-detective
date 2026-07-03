import { useEffect, useState } from 'react'
import { InvestigationLocationPage } from '../components/Evidence/InvestigationLocationPage'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface InvestigationLocationRouteProps {
  attemptsLeft: number
  currentCase: Case
  investigateLocation: (locationId: string, actionId: string) => void
  openLocation: (locationId: string) => void
  selectedLocationId: string | null
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
}

export function InvestigationLocationRoute({
  attemptsLeft,
  currentCase,
  investigateLocation,
  openLocation,
  selectedLocationId,
  setActivePanel,
  startNewCase,
  giveUp,
}: InvestigationLocationRouteProps) {
  const [searchingLocationId, setSearchingLocationId] = useState<string | null>(null)
  const selectedLocation =
    currentCase.locations.find((location) => location.id === selectedLocationId) ?? null
  const actionsUsed = currentCase.locations.filter((location) => location.investigated).length
  const pointsLeft = Math.max(currentCase.maxInvestigations - actionsUsed, 0)

  useEffect(() => {
    setSearchingLocationId(null)
  }, [selectedLocationId])

  const chooseAction = (locationId: string, actionId: string) => {
    setSearchingLocationId(locationId)

    window.setTimeout(() => {
      setSearchingLocationId((currentId) => (currentId === locationId ? null : currentId))
      investigateLocation(locationId, actionId)
    }, 650)
  }

  return (
    <InvestigationRouteFrame
      activePanel="investigation"
      layout="none"
      attemptsLeft={attemptsLeft}
      currentCase={currentCase}
      openLocation={openLocation}
      setActivePanel={setActivePanel}
      startNewCase={startNewCase}
      giveUp={giveUp}
    >
      <InvestigationLocationPage
        location={selectedLocation}
        pointsLeft={pointsLeft}
        isSearching={searchingLocationId === selectedLocationId}
        chooseAction={chooseAction}
      />
    </InvestigationRouteFrame>
  )
}
