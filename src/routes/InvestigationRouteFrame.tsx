import type { ReactNode } from 'react'
import type { Case } from '../game/caseModel'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import { LocationsPanel } from '../components/Evidence/LocationsPanel'

interface InvestigationRouteFrameProps {
  activePanel: 'investigation' | 'suspects' | 'notebook'
  layout: 'locations' | 'suspects' | 'none'
  attemptsLeft: number
  currentCase: Case
  inspectSuspect: (suspectId: number) => void
  openLocation: (locationId: string) => void
  openNotebook: () => void
  setActivePanel: (panel: 'investigation' | 'suspects') => void
  startNewCase: () => void
  giveUp: () => void
  children?: ReactNode
}

export function InvestigationRouteFrame({
  activePanel,
  layout,
  currentCase,
  inspectSuspect,
  openLocation,
  openNotebook,
  setActivePanel,
  startNewCase,
  giveUp,
  children,
}: InvestigationRouteFrameProps) {
  const isInvestigationTab = activePanel === 'investigation'
  const isSuspectsTab = activePanel === 'suspects'
  const isNotebookTab = activePanel === 'notebook'

  return (
    <>
      <div className="main-layout-single">
        {layout === 'suspects' ? (
          <SuspectsPanel currentCase={currentCase} inspectSuspect={inspectSuspect} />
        ) : null}
        {layout === 'locations' ? (
          <LocationsPanel isEvidenceTab currentCase={currentCase} openLocation={openLocation} />
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
        <button
          type="button"
          className={`secondary-button ${isNotebookTab ? 'is-pressed' : ''}`}
          onClick={openNotebook}
        >
          Notes
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
