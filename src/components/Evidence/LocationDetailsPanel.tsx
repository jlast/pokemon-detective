import type { Location } from '../../game/caseModel'

interface LocationsDetailsPanelProps {
  selectedLocation: Location
  closeLocation: () => void
}

export function LocationsDetailsPanel({
  selectedLocation,
  closeLocation,
}: LocationsDetailsPanelProps) {
  const selectedAction = selectedLocation.actions.find((action) => action.id === selectedLocation.selectedActionId) ?? null
  const observationText = selectedAction?.observationText ?? selectedLocation.observationText ?? selectedLocation.description ?? ''
  const evidenceTitle = selectedAction?.evidenceTitle ?? selectedLocation.evidenceTitle ?? 'Clue discovered'
  const evidenceText = selectedAction?.evidenceText ?? selectedLocation.evidenceText ?? ''
  const actionLabel = selectedAction?.label ?? 'Review result'
  const hasEvidence = selectedAction?.outcomeType === 'evidence' || selectedAction?.outcomeType === 'witness'

  return (
    <div
      className="overlay-shell"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crime-scene-title"
    >
      <div className="overlay-backdrop" onClick={closeLocation} />
      <section className="crime-scene-sheet notebook-card">
        <div className="section-heading">
          <div>
            <h2 id="crime-scene-title">{selectedLocation.name}</h2>
          </div>
        </div>

        <div className="inspect-list">
          <div className="inspect-item">
            <strong>Chosen action</strong>
            <span>{actionLabel}</span>
          </div>
          <div className="inspect-item">
            <strong>Observation</strong>
            <span>{observationText}</span>
          </div>
          <div className="inspect-item">
            <strong>Investigation</strong>
            <span>
              {selectedAction?.description ?? 'You review the notes from this location carefully.'}
            </span>
          </div>
          <div className="inspect-item evidence-reveal">
            <strong>{hasEvidence ? evidenceTitle : 'No useful evidence found.'}</strong>
            <span>{hasEvidence ? evidenceText : observationText}</span>
          </div>
        </div>

        <div className="overlay-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={closeLocation}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  )
}
