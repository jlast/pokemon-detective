import type { ReactNode } from 'react'
import type { Case } from '../game/caseModel'
import { LocationsPanel } from '../components/Evidence/LocationsPanel'

interface InvestigationRouteFrameProps {
  activePanel: 'investigation' | 'suspects'
  layout: 'locations' | 'none'
  attemptsLeft: number
  currentCase: Case
  openLocation?: (locationId: string) => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
  children?: ReactNode
}

export function InvestigationRouteFrame({
  activePanel,
  layout,
  currentCase,
  openLocation,
  setActivePanel,
  startNewCase,
  giveUp,
  children,
}: InvestigationRouteFrameProps) {
  const isInvestigationTab = activePanel === 'investigation'
  const isSuspectsTab = activePanel === 'suspects'

  return (
    <>
      <div className="main-layout-single">
        {layout === 'locations' ? (
          <LocationsPanel
            isEvidenceTab
            currentCase={currentCase}
            openLocation={openLocation ?? (() => {})}
          />
        ) : null}
        {layout === 'none' ? children : null}
      </div>

      <footer className="bottom-bar notebook-card">
        <button
          type="button"
          className={`secondary-button ${isInvestigationTab ? 'is-pressed' : ''}`}
          onClick={() => setActivePanel('investigation')}
        >
          Investigation
        </button>
        <button
          type="button"
          className={`secondary-button ${isSuspectsTab ? 'is-pressed' : ''}`}
          onClick={() => setActivePanel('suspects')}
        >
          Suspects
        </button>
      </footer>

      <footer className="utility-bar notebook-card">
        <button type="button" className="secondary-button" onClick={startNewCase}>
          New case
        </button>
        <button type="button" className="secondary-button danger-button" onClick={giveUp}>
          Give up
        </button>
      </footer>

      {layout !== 'none' ? children : null}
    </>
  )
}
