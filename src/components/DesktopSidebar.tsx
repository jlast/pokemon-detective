import type { UserProfile } from '../auth'
import { SidebarProfile } from './SidebarProfile'

interface DesktopSidebarProps {
  activeSection: string
  authed: boolean
  userProfile: UserProfile | null
  isAdmin: boolean
  caseStreak?: number
  onSelectCase: () => void
  onSelectPokedex: () => void
  onSelectHowToPlay: () => void
  onSelectSettings: () => void
  onSelectAdmin: () => void
  onLogin: () => void
  onLogout: () => void
}

export function DesktopSidebar({
  activeSection,
  authed,
  userProfile,
  isAdmin,
  caseStreak,
  onSelectCase,
  onSelectPokedex,
  onSelectHowToPlay,
  onSelectSettings,
  onSelectAdmin,
  onLogin,
  onLogout,
}: DesktopSidebarProps) {
  return (
    <aside className="desktop-sidebar notebook-card" aria-label="Primary navigation">
      <div className="desktop-sidebar-brand">
        <div className="brand-lockup">
          <div className="brand-icon" aria-hidden="true">
            <span className="hat"></span>
            <span className="ear ear-left"></span>
            <span className="ear ear-right"></span>
            <span className="face"></span>
            <span className="glass"></span>
            <span className="handle"></span>
          </div>

          <div>
            <h2 className="sidebar-brand-title">
              <span className="sidebar-brand-title-top">Poké</span>
              <span className="sidebar-brand-title-bottom">Mystery</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="desktop-sidebar-section">
        <button
          type="button"
          className={`sidebar-nav-button ${activeSection === 'case' ? 'is-active' : ''}`}
          onClick={onSelectCase}
        >
          Today's case
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${activeSection === 'pokedex' ? 'is-active' : ''}`}
          onClick={onSelectPokedex}
        >
          Pokedex
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${activeSection === 'how-to-play' ? 'is-active' : ''}`}
          onClick={onSelectHowToPlay}
        >
          How to play
        </button>

        {isAdmin ? (
          <button
            type="button"
            className={`sidebar-nav-button ${activeSection === 'admin' ? 'is-active' : ''}`}
            onClick={onSelectAdmin}
          >
            Admin
          </button>
        ) : null}
      </div>

      <div className="desktop-sidebar-section desktop-sidebar-actions">
        {authed && userProfile ? (
          <SidebarProfile
            name={userProfile.name ?? userProfile.email ?? 'Detective'}
            streak={caseStreak}
            onOpenSettings={onSelectSettings}
            onLogout={onLogout}
          />
        ) : (
          <button
            type="button"
            className="sidebar-nav-button"
            onClick={onLogin}
          >
            Login
          </button>
        )}
      </div>
    </aside>
  )
}
