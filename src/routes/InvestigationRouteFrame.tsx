import type { ReactNode } from 'react'
import type { Case } from '../game/caseModel'
import { CaseFlowNav } from '../components/CaseFlowNav'
import { LocationsPanel } from '../components/Evidence/LocationsPanel'

interface InvestigationRouteFrameProps {
  layout: 'locations' | 'none'
  currentCase: Case
  openLocation?: (locationId: string) => void
  startNewCase: () => void
  giveUp: () => void
  children?: ReactNode
  showCaseFlowNav?: boolean
}

export function InvestigationRouteFrame({
  layout,
  currentCase,
  openLocation,
  startNewCase,
  giveUp,
  children,
  showCaseFlowNav = true,
}: InvestigationRouteFrameProps) {
  return (
    <div className="main-layout-single">
      {showCaseFlowNav ? <CaseFlowNav /> : null}
      {layout === 'locations' ? (
        <LocationsPanel
          isEvidenceTab
          currentCase={currentCase}
          openLocation={openLocation ?? (() => {})}
        />
      ) : null}
      {layout === 'none' ? children : null}

      <footer className="utility-bar notebook-card">
        <button type="button" className="secondary-button" onClick={startNewCase}>
          New case
        </button>
        <button type="button" className="secondary-button danger-button" onClick={giveUp}>
          Give up
        </button>
      </footer>

      {layout !== 'none' ? children : null}
    </div>
  )
}
