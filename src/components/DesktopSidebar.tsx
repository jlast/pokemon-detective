import type { UserProfile } from '../auth'

interface DesktopSidebarProps {
  activeSection: string
  authed: boolean
  userProfile: UserProfile | null
  onSelectHome: () => void
  onSelectCase: () => void
  onSelectHowToPlay: () => void
  onLogin: () => void
  onLogout: () => void
}

export function DesktopSidebar({
  activeSection,
  authed,
  userProfile,
  onSelectHome,
  onSelectCase,
  onSelectHowToPlay,
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
              <span className="sidebar-brand-title-top">Pokemon</span>
              <span className="sidebar-brand-title-bottom">Detective</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="desktop-sidebar-section">
        <button
          type="button"
          className={`sidebar-nav-button ${activeSection === 'home' ? 'is-active' : ''}`}
          onClick={onSelectHome}
        >
          Home
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${activeSection === 'case' ? 'is-active' : ''}`}
          onClick={onSelectCase}
        >
          Today's case
        </button>

        <button
          type="button"
          className="sidebar-nav-button"
          onClick={onSelectHowToPlay}
        >
          How to play
        </button>
      </div>

      <div className="desktop-sidebar-section desktop-sidebar-actions">
        {authed && userProfile ? (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {userProfile.name ?? userProfile.email ?? 'User'}
              </span>
            </div>
            <button
              type="button"
              className="sidebar-nav-button sidebar-logout"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
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
