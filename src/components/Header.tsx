import type { Case } from '../game/caseModel'
import type { UserProfile } from '../auth'

interface HeaderProps {
  currentCase: Case
  activeSection: string
  authed: boolean
  userProfile: UserProfile | null
  isAdmin: boolean
  isMenuOpen: boolean
  onToggleMenu: () => void
  onSelectCase: () => void
  onSelectPokedex: () => void
  onSelectHowToPlay: () => void
  onSelectSettings: () => void
  onSelectAdmin: () => void
  onLogin: () => void
  onLogout: () => void
}

export function Header({
  currentCase,
  activeSection,
  authed,
  userProfile,
  isAdmin,
  isMenuOpen,
  onToggleMenu,
  onSelectCase,
  onSelectPokedex,
  onSelectHowToPlay,
  onSelectSettings,
  onSelectAdmin,
  onLogin,
  onLogout,
}: HeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Close main navigation' : 'Open main navigation'

  return (
    <header className="app-header notebook-card">
      <div className="app-header-topline">
        <div className="brand-lockup">
          <div>
            <p className="eyebrow">PokéMystery</p>
            <h1>{currentCase.title}</h1>
            <p className="subtle-text">{currentCase.shortStory}</p>
          </div>
        </div>

        <button
          type="button"
          className={`mobile-menu-button ${isMenuOpen ? 'is-open' : ''}`}
          aria-label={menuButtonLabel}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-main-menu"
          onClick={onToggleMenu}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div className={`mobile-drawer-shell ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <button type="button" className="mobile-drawer-backdrop" aria-label="Close main navigation" onClick={onToggleMenu} />
        <nav
          id="mobile-main-menu"
          className="mobile-main-menu"
          aria-label="Primary navigation"
        >
          <div className="mobile-main-menu-header">
            <div>
              <p className="mobile-main-menu-kicker">Detective desk</p>
              <strong>PokéMystery</strong>
            </div>
            <button type="button" className="mobile-drawer-close" aria-label="Close main navigation" onClick={onToggleMenu}>
              ×
            </button>
          </div>

          <div className="mobile-main-menu-list">
            <button
              type="button"
              className={`mobile-main-menu-item ${activeSection === 'case' ? 'is-active' : ''}`}
              onClick={onSelectCase}
            >
              <span className="mobile-main-menu-icon mobile-main-menu-icon--case" aria-hidden="true" />
              <span>
                <strong>Today's case</strong>
                <small>Open the active investigation</small>
              </span>
            </button>
            <button
              type="button"
              className={`mobile-main-menu-item ${activeSection === 'pokedex' ? 'is-active' : ''}`}
              onClick={onSelectPokedex}
            >
              <span className="mobile-main-menu-icon mobile-main-menu-icon--pokedex" aria-hidden="true" />
              <span>
                <strong>Pokedex</strong>
                <small>Review discovered Pokemon</small>
              </span>
            </button>
            <button
              type="button"
              className={`mobile-main-menu-item ${activeSection === 'how-to-play' ? 'is-active' : ''}`}
              onClick={onSelectHowToPlay}
            >
              <span className="mobile-main-menu-icon mobile-main-menu-icon--help" aria-hidden="true" />
              <span>
                <strong>How to play</strong>
                <small>Rules, clues, accusations</small>
              </span>
            </button>
            {isAdmin ? (
              <button
                type="button"
                className={`mobile-main-menu-item ${activeSection === 'admin' ? 'is-active' : ''}`}
                onClick={onSelectAdmin}
              >
                <span className="mobile-main-menu-icon mobile-main-menu-icon--admin" aria-hidden="true" />
                <span>
                  <strong>Admin</strong>
                  <small>Review player puzzle details</small>
                </span>
              </button>
            ) : null}
          </div>

          <div className="mobile-main-menu-account">
            <div className="mobile-main-menu-account-topline">
              <span className="mobile-main-menu-account-avatar" aria-hidden="true">D</span>
              <span className="mobile-main-menu-account-copy">
                <strong>{authed ? userProfile?.name ?? userProfile?.email ?? 'Detective' : 'Guest detective'}</strong>
                <small>{authed ? 'Detective' : 'Login to save progress'}</small>
              </span>
            </div>
            <div className="mobile-main-menu-account-actions">
              {authed ? (
                <button type="button" className="mobile-main-menu-profile-link" onClick={onSelectSettings}>
                  Settings
                </button>
              ) : null}
              <button type="button" className="mobile-main-menu-auth" onClick={authed ? onLogout : onLogin}>
                {authed ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
