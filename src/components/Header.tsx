import type { Case } from '../game/caseModel'

interface HeaderProps {
  currentCase: Case
}

export function Header({ currentCase }: HeaderProps) {
  return (
    <header className="app-header notebook-card">
      <div className="brand-lockup">
        <div>
          <p className="eyebrow">Pokemon Detective</p>
          <h1>{currentCase.title}</h1>
          <p className="subtle-text">{currentCase.shortStory}</p>
        </div>
      </div>
    </header>
  )
}
