import type { Case } from '../game/caseModel'
import type { UserProfile } from '../auth'

interface HeaderProps {
  currentCase: Case
  activeSection: string
  activePuzzleDifficulty: 'easy' | 'hard'
  authed: boolean
  userProfile: UserProfile | null
  isAdmin: boolean
  isMenuOpen: boolean
  onChangePuzzleDifficulty: (difficulty: 'easy' | 'hard') => void
  onToggleMenu: () => void
  onSelectCase: () => void
  onSelectPokedex: () => void
  onSelectHistory: () => void
  onSelectHowToPlay: () => void
  onSelectFeedback: () => void
  onSelectSettings: () => void
  onSelectAdmin: () => void
  onLogin: () => void
  onLogout: () => void
}

export function Header({
  currentCase,
  activeSection,
  activePuzzleDifficulty,
  authed,
  userProfile,
  isAdmin,
  isMenuOpen,
  onChangePuzzleDifficulty,
  onToggleMenu,
  onSelectCase,
  onSelectPokedex,
  onSelectHistory,
  onSelectHowToPlay,
  onSelectFeedback,
  onSelectSettings,
  onSelectAdmin,
  onLogin,
  onLogout,
}: HeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Close main navigation' : 'Open main navigation'
  const nextPuzzleDifficulty = activePuzzleDifficulty === 'easy' ? 'hard' : 'easy'
  const activeDifficultyLabel = activePuzzleDifficulty[0].toUpperCase() + activePuzzleDifficulty.slice(1)
  const suspectCount = activePuzzleDifficulty === 'hard' ? 9 : 6

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

        <div className="app-header-actions">
          <div className="difficulty-topbar" aria-label="Current puzzle difficulty">
            <p className="difficulty-topbar__label">Difficulty</p>
            <div className={`difficulty-topbar__value difficulty-topbar__value--${activePuzzleDifficulty}`}>
              <span className="difficulty-topbar__status" aria-hidden="true" />
              <strong>{activeDifficultyLabel}</strong>
              <span aria-hidden="true">·</span>
              <span>{suspectCount} suspects</span>
            </div>
          </div>
          <div className="difficulty-change-shell">
            <button
              type="button"
              className="difficulty-topbar__change"
              aria-label="Change difficulty"
              onClick={() => onChangePuzzleDifficulty(nextPuzzleDifficulty)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7.2 7.4h8.3l-2.3-2.3 1.4-1.4L19.3 8l-4.7 4.3-1.4-1.4 2.3-2.1H7.2c-1.4 0-2.6 1.2-2.6 2.6 0 .6.2 1.1.5 1.6L3.6 14.3a4.4 4.4 0 0 1-.9-2.9c0-2.5 2-4 4.5-4Zm9.6 9.2H8.5l2.3 2.3-1.4 1.4L4.7 16l4.7-4.3 1.4 1.4-2.3 2.1h8.3c1.4 0 2.6-1.2 2.6-2.6 0-.6-.2-1.1-.5-1.6l1.5-1.3c.6.8.9 1.8.9 2.9 0 2.5-2 4-4.5 4Z" />
              </svg>
            </button>
            <span className="difficulty-change-shell__tooltip">Change difficulty</span>
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
            <p className="mobile-main-menu-section-label">Today</p>
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
            <p className="mobile-main-menu-section-label">Collection</p>
            <button
              type="button"
              className={`mobile-main-menu-item ${activeSection === 'pokedex' ? 'is-active' : ''}`}
              onClick={onSelectPokedex}
            >
              <span className="mobile-main-menu-icon mobile-main-menu-icon--pokedex" aria-hidden="true" />
              <span>
                <strong>Pokédex</strong>
                <small>Review discovered Pokemon</small>
              </span>
            </button>
            <button
              type="button"
              className={`mobile-main-menu-item ${activeSection === 'history' ? 'is-active' : ''}`}
              onClick={onSelectHistory}
            >
              <span className="mobile-main-menu-icon mobile-main-menu-icon--history" aria-hidden="true" />
              <span>
                <strong>Archived cases</strong>
                <small>Review solved case files</small>
              </span>
            </button>
            <p className="mobile-main-menu-section-label">Support</p>
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
                <small>{authed ? 'Detective' : 'Sign in'}</small>
              </span>
            </div>
            <div className="mobile-main-menu-account-actions">
              {authed ? (
                <>
                  <button type="button" className="mobile-main-menu-profile-link" onClick={onSelectSettings}>
                    Settings
                  </button>
                  <button type="button" className="mobile-main-menu-profile-link" onClick={onSelectFeedback}>
                    Report Bug
                  </button>
                </>
              ) : null}
              <button type="button" className={`mobile-main-menu-auth ${authed ? '' : 'mobile-main-menu-auth--primary'}`} onClick={authed ? onLogout : onLogin}>
                {authed ? 'Logout' : 'Sign in'}
              </button>
              {!authed ? (
                <button type="button" className="mobile-main-menu-auth" onClick={onSelectFeedback}>
                  Report Bug
                </button>
              ) : null}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
