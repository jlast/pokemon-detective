import { useLocation, useNavigate } from 'react-router-dom'
import { TODAY_INVESTIGATION_PATH, TODAY_PATH, TODAY_SUSPECTS_PATH } from '../paths'

const tabs = [
  { path: TODAY_PATH, label: 'Case Overview', mobileLabel: 'Case File', iconClass: 'case-flow-tab-icon--file' },
  { path: TODAY_INVESTIGATION_PATH, label: 'Investigation Board', mobileLabel: 'Evidence Board', iconClass: 'case-flow-tab-icon--pin' },
  { path: TODAY_SUSPECTS_PATH, label: 'Suspects Lineup', mobileLabel: 'Suspect Files', iconClass: 'case-flow-tab-icon--files' },
]

export function CaseFlowNav() {
  const location = useLocation()
  const navigate = useNavigate()

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
            className={`case-flow-tab${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(tab.path)}
          >
            <span className={`case-flow-tab-icon ${tab.iconClass}`} aria-hidden="true" />
            <span className="case-flow-tab-label">{tab.label}</span>
            <span className="case-flow-tab-mobile-label">{tab.mobileLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}
