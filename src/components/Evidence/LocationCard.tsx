import type { Location } from "../../game/caseModel";

export function LocationCard({
    location,
    openLocation,
}: {
    location: Location;
    openLocation: (locationId: string) => void;
}) {
  return (
    <article key={location.id} className="location-card">
    <div className="location-card-top">
        <span className="location-icon" aria-hidden="true">
        {location.icon}
        </span>
        <div>
        <h3>{location.name}</h3>
        <p className="subtle-text">{location.description}</p>
        </div>
    </div>

    <button
        type="button"
        className="secondary-button"
        onClick={() => openLocation(location.id)}
    >
        {location.investigated ? "Evidence found" : "Investigate"}
    </button>
    </article>
  );
}
