interface DesktopSidebarProps {
  activeSection: string
  onSelectHome: () => void
  onSelectCase: () => void
  onSelectHowToPlay: () => void
  onSelectLogin: () => void
}

export function DesktopSidebar({
  activeSection,
  onSelectHome,
  onSelectCase,
  onSelectHowToPlay,
  onSelectLogin,
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
        <button
          type="button"
          className="sidebar-nav-button"
          onClick={onSelectLogin}
        >
          Login
        </button>
      </div>
    </aside>
  )
}
