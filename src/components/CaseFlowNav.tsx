import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Case Overview' },
  { path: '/investigation', label: 'Investigation Board' },
  { path: '/suspects', label: 'Suspects Lineup' },
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
