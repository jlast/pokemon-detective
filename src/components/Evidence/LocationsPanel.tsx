import type { Case } from "../../game/caseModel";
import { LocationCard } from "./LocationCard";

export function LocationsPanel({
    currentCase,
    isEvidenceTab,
    openLocation,
}: {
    currentCase: Case;
    isEvidenceTab: boolean;
    openLocation: (locationId: string) => void;
}) {
  return (
    <section
      className={`notebook-card evidence-board mobile-section ${isEvidenceTab ? "is-active" : ""}`}
    >
      <div className="section-heading">
        <div>
          <h2>Where to look next</h2>
        </div>
      </div>

      <div className="locations-grid">
        {currentCase.locations.map((location) => (
            <LocationCard location={location} openLocation={openLocation} />
        ))}
      </div>
    </section>
  );
}
