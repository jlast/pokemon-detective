import { useLocation, useNavigate } from 'react-router-dom'
import type { Case } from '../game/caseModel'
import { TODAY_INVESTIGATION_PATH, TODAY_PATH, TODAY_SUSPECTS_PATH } from '../paths'

const tabs = [
  { id: 'case', path: TODAY_PATH, label: 'Case Overview', mobileLabel: 'Case', iconClass: 'case-flow-tab-icon--file' },
  { id: 'evidence', path: TODAY_INVESTIGATION_PATH, label: 'Investigation Board', mobileLabel: 'Evidence', iconClass: 'case-flow-tab-icon--pin' },
  { id: 'suspects', path: TODAY_SUSPECTS_PATH, label: 'Suspects Lineup', mobileLabel: 'Suspects', iconClass: 'case-flow-tab-icon--files' },
]

interface CaseFlowNavProps {
  currentCase: Case
}

export function CaseFlowNav({ currentCase }: CaseFlowNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const hasLocationsToResearch = currentCase.locations.some((caseLocation) => !caseLocation.investigated)
  const notificationTab = hasLocationsToResearch ? 'evidence' : currentCase.status === 'active' ? 'suspects' : ''

  const isActiveTab = (path: string) => {
    if (path === TODAY_PATH) return location.pathname === TODAY_PATH
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="case-flow-nav" aria-label="Case pages">
      {tabs.map((tab) => {
        const isActive = isActiveTab(tab.path)
        return (
          <button
            key={tab.path}
            type="button"
            className={`case-flow-tab${isActive ? ' is-active' : ''}${notificationTab === tab.id ? ' has-notification' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(tab.path)}
          >
            <span className={`case-flow-tab-icon ${tab.iconClass}`} aria-hidden="true" />
            {notificationTab === tab.id ? <span className="case-flow-tab-notification" aria-hidden="true" /> : null}
            <span className="case-flow-tab-label">{tab.label}</span>
            <span className="case-flow-tab-mobile-label">{tab.mobileLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}
