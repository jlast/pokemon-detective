import type { LocationAction } from '../../game/caseModel'

const leadTypeIcons: Record<LocationAction['leadType'], string> = {
  careful: '🔍',
  thorough: '⛺',
  quick: '📸',
  risky: '⚠️',
  uncertain: '🗣️',
  obvious: '🕵️',
}

const leadTypeLabels: Record<LocationAction['leadType'], string> = {
  careful: 'Careful',
  thorough: 'Thorough',
  quick: 'Quick',
  risky: 'Risky',
  uncertain: 'Uncertain',
  obvious: 'Obvious',
}

interface InvestigationActionChooserProps {
  actions: LocationAction[]
  chooseAction: (actionId: string) => void
}

export function InvestigationActionChooser({ actions, chooseAction }: InvestigationActionChooserProps) {
  return (
    <div className="investigation-action-chooser">
      <div className="investigation-action-header">
        <strong>Available leads</strong>
        <p className="investigation-action-hint">Choose carefully. This spends 1 action.</p>
      </div>
      <div className="investigation-action-list">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="investigation-action-option"
            onClick={() => chooseAction(action.id)}
          >
            <div className="investigation-action-meta">
              <span className="investigation-action-icon" aria-hidden="true">
                {leadTypeIcons[action.leadType]}
              </span>
              <span className="investigation-action-tag">{leadTypeLabels[action.leadType]}</span>
            </div>
            <span className="investigation-action-label">{action.label}</span>
            <span className="investigation-action-description">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
