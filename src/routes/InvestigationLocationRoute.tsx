import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InvestigationLocationPage } from '../components/Evidence/InvestigationLocationPage'
import type { Case } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface InvestigationLocationRouteProps {
  attemptsLeft: number
  currentCase: Case
  investigateLocation: (locationId: string, actionId: string) => Promise<void>
  openLocation: (locationId: string) => void
  selectedLocationId: string | null
  startNewCase: () => void
  giveUp: () => void
}

export function InvestigationLocationRoute({
  currentCase,
  investigateLocation,
  openLocation,
  selectedLocationId,
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
    if (searchingLocationId !== null) return

    setSearchingLocationId(locationId)

    window.setTimeout(() => {
      void (async () => {
        try {
          await investigateLocation(locationId, actionId)
        } finally {
          setSearchingLocationId((currentId) => (currentId === locationId ? null : currentId))
        }
      })()
    }, 650)
  }

  const navigate = useNavigate()

  return (
    <InvestigationRouteFrame
      layout="none"
      currentCase={currentCase}
      openLocation={openLocation}
      startNewCase={startNewCase}
      giveUp={giveUp}
      showCaseFlowNav={false}
    >
      <div className="detail-back-link" onClick={() => navigate('/investigation')}>← Back to Investigation Board</div>
      <InvestigationLocationPage
        location={selectedLocation}
        pointsLeft={pointsLeft}
        resolvedCount={actionsUsed}
        maxInvestigations={currentCase.maxInvestigations}
        isSearching={searchingLocationId === selectedLocationId}
        chooseAction={chooseAction}
      />
    </InvestigationRouteFrame>
  )
}
