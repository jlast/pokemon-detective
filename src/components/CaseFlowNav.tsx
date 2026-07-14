import { useLocation, useNavigate } from 'react-router-dom'
import { TODAY_INVESTIGATION_PATH, TODAY_PATH, TODAY_SUSPECTS_PATH } from '../paths'

const tabs = [
  { path: TODAY_PATH, label: 'Case Overview' },
  { path: TODAY_INVESTIGATION_PATH, label: 'Investigation Board' },
  { path: TODAY_SUSPECTS_PATH, label: 'Suspects Lineup' },
]

export function CaseFlowNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="case-flow-nav" aria-label="Case pages">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            type="button"
            className={`case-flow-tab${isActive ? ' is-active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
