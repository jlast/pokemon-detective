interface DesktopSidebarProps {
  activeSection: 'overview' | 'investigation' | 'suspects' | 'notes'
  canGiveUp: boolean
  onSelectOverview: () => void
  onSelectInvestigation: () => void
  onSelectSuspects: () => void
  onSelectNotes: () => void
  onGiveUp: () => void
}

export function DesktopSidebar({
  activeSection,
  canGiveUp,
  onSelectOverview,
  onSelectInvestigation,
  onSelectSuspects,
  onSelectNotes,
  onGiveUp,
}: DesktopSidebarProps) {
  const isOverviewActive = activeSection === 'overview'
  const isInvestigationActive = activeSection === 'investigation'
  const isSuspectsActive = activeSection === 'suspects'
  const isNotesActive = activeSection === 'notes'

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
          className={`sidebar-nav-button ${isOverviewActive ? 'is-active' : ''}`}
          onClick={onSelectOverview}
        >
          Overview
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${isInvestigationActive ? 'is-active' : ''}`}
          onClick={onSelectInvestigation}
        >
          Investigation
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${isSuspectsActive ? 'is-active' : ''}`}
          onClick={onSelectSuspects}
        >
          Suspects
        </button>

        <button
          type="button"
          className={`sidebar-nav-button ${isNotesActive ? 'is-active' : ''}`}
          onClick={onSelectNotes}
        >
          Notes
        </button>
      </div>

      <div className="desktop-sidebar-section desktop-sidebar-actions">
        <button
          type="button"
          className="secondary-button danger-button"
          onClick={onGiveUp}
          disabled={!canGiveUp}
        >
          Give up
        </button>
      </div>
    </aside>
  )
}
