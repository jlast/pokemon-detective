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
  onSelectFeedback: () => void
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
  onSelectFeedback,
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
            <p className="sidebar-brand-subtitle">Daily Pokémon mysteries</p>
          </div>
        </div>
      </div>

      <nav className="desktop-sidebar-section sidebar-nav" aria-label="Primary navigation">
        <div className="sidebar-nav-group">
          <p className="sidebar-nav-section-label">Today</p>

          <button
            type="button"
            className={`sidebar-nav-button ${activeSection === 'case' ? 'is-active' : ''}`}
            onClick={onSelectCase}
          >
            Today's case
          </button>
        </div>

        <div className="sidebar-nav-group">
          <p className="sidebar-nav-section-label">Collection</p>

          <button
            type="button"
            className={`sidebar-nav-button ${activeSection === 'pokedex' ? 'is-active' : ''}`}
            onClick={onSelectPokedex}
          >
            Pokédex
          </button>

        </div>

        <div className="sidebar-nav-group">
          <p className="sidebar-nav-section-label">Support</p>

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
      </nav>

      <div className="desktop-sidebar-section desktop-sidebar-actions">
        {authed && userProfile ? (
          <SidebarProfile
            name={userProfile.name ?? userProfile.email ?? 'Detective'}
            streak={caseStreak}
            onOpenSettings={onSelectSettings}
            onReportBug={onSelectFeedback}
            onLogout={onLogout}
          />
        ) : (
          <div className="sidebar-guest-actions">
            <button
              type="button"
              className="sidebar-guest-action sidebar-guest-action--primary"
              onClick={onLogin}
            >
              Sign in
            </button>
            <button
              type="button"
              className="sidebar-guest-action"
              onClick={onSelectFeedback}
            >
              Report Bug
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
