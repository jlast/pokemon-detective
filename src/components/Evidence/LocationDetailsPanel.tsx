import type { Location } from '../../game/caseModel'

interface LocationsDetailsPanelProps {
  selectedLocation: Location
  closeLocation: () => void
}

export function LocationsDetailsPanel({
  selectedLocation,
  closeLocation,
}: LocationsDetailsPanelProps) {
  const observationText = selectedLocation.observationText ?? selectedLocation.description ?? ''
  const evidenceTitle = selectedLocation.evidenceTitle ?? 'Clue discovered'
  const evidenceText = selectedLocation.evidenceText ?? ''

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
            <strong>Observation</strong>
            <span>{observationText}</span>
          </div>
          <div className="inspect-item">
            <strong>Investigation</strong>
            <span>
              {selectedLocation.id === "footprints"
                ? "You kneel beside the tracks near the tents."
                : selectedLocation.id === "campsite"
                  ? "You sweep your lantern across the sleeping area and the disturbed ground."
                  : selectedLocation.id === "forest-edge"
                    ? "You part the brush and check the loose soil at the edge of camp."
                    : selectedLocation.id === "cookie-jar"
                      ? "You crouch by the table and inspect the cookie jar under the lantern light."
                      : "You listen carefully inside the witness tent while the camper recalls the noise."}
            </span>
          </div>
          <div className="inspect-item evidence-reveal">
            <strong>{evidenceTitle}</strong>
            <span>{evidenceText}</span>
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
