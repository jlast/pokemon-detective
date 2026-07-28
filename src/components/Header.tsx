import type { Case } from '../game/caseModel'
import type { UserProfile } from '../auth'

interface HeaderProps {
  currentCase: Case
  activeSection: string
  activeCasePage: 'overview' | 'investigation' | 'suspects' | ''
  authed: boolean
  userProfile: UserProfile | null
  dailyReminderEmails: boolean
  reminderStatus: 'idle' | 'loading' | 'saving' | 'error'
  isMenuOpen: boolean
  onToggleMenu: () => void
  onSelectCase: () => void
  onSelectInvestigation: () => void
  onSelectSuspects: () => void
  onSelectPokedex: () => void
  onSelectHowToPlay: () => void
  onLogin: () => void
  onLogout: () => void
  onToggleDailyReminderEmails: (enabled: boolean) => void
}

export function Header({
  currentCase,
  activeSection,
  activeCasePage,
  authed,
  userProfile,
  dailyReminderEmails,
  reminderStatus,
  isMenuOpen,
  onToggleMenu,
  onSelectCase,
  onSelectInvestigation,
  onSelectSuspects,
  onSelectPokedex,
  onSelectHowToPlay,
  onLogin,
  onLogout,
  onToggleDailyReminderEmails,
}: HeaderProps) {
  const menuButtonLabel = isMenuOpen ? 'Close main navigation' : 'Open main navigation'
  const reminderDisabled = reminderStatus === 'loading' || reminderStatus === 'saving'

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
            <div className="mobile-main-submenu" aria-label="Case pages">
              <button
                type="button"
                className={`mobile-main-submenu-item ${activeCasePage === 'overview' ? 'is-active' : ''}`}
                onClick={onSelectCase}
              >
                Case overview
              </button>
              <button
                type="button"
                className={`mobile-main-submenu-item ${activeCasePage === 'investigation' ? 'is-active' : ''}`}
                onClick={onSelectInvestigation}
              >
                Investigation board
              </button>
              <button
                type="button"
                className={`mobile-main-submenu-item ${activeCasePage === 'suspects' ? 'is-active' : ''}`}
                onClick={onSelectSuspects}
              >
                Suspects lineup
              </button>
            </div>
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
          </div>

          <div className="mobile-main-menu-account">
            <div className="mobile-main-menu-account-topline">
              <span>{authed ? userProfile?.name ?? userProfile?.email ?? 'Detective' : 'Guest detective'}</span>
              <button type="button" className="mobile-main-menu-auth" onClick={authed ? onLogout : onLogin}>
                {authed ? 'Logout' : 'Login'}
              </button>
            </div>
            {authed ? (
              <label className="mobile-main-menu-reminder">
                <input
                  type="checkbox"
                  checked={dailyReminderEmails}
                  disabled={reminderDisabled}
                  onChange={(event) => onToggleDailyReminderEmails(event.currentTarget.checked)}
                />
                <span>Daily reminder emails</span>
              </label>
            ) : null}
            {reminderStatus === 'error' ? (
              <small className="mobile-main-menu-reminder-error" role="status">Could not save reminder setting.</small>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  )
}
