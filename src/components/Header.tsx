import type { Case } from '../game/caseModel'

interface HeaderProps {
  currentCase: Case
  attemptsLeft: number
}

export function Header({ currentCase, attemptsLeft }: HeaderProps) {
  return (
    <header className="app-header notebook-card">
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
          <p className="eyebrow">Pokemon Detective</p>
          <h1>{currentCase.title}</h1>
          <p className="subtle-text">{currentCase.shortStory}</p>
        </div>
      </div>

      <div className="header-meta">
        <div className="status-pill-group">
          <span className="status-pill">
            {currentCase.crimeIcon} {currentCase.difficulty}
          </span>
          <span className="status-pill">Attempts: {attemptsLeft}</span>
        </div>
      </div>
    </header>
  )
}
