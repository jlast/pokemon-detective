import type { DetectiveProfileData, DetectiveProfileRow, SceneMeasurementComparisonData } from '../../game/suspectCaseFile'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

interface DetectiveProfileProps {
  profile: DetectiveProfileData
}

const ProfileRow = ({ row }: { row: DetectiveProfileRow }) => (
  <div className="detective-profile-row">
    <span className="detective-profile-label">{row.label}</span>
    <span className="detective-profile-value">
      {row.badges ? <EvidenceBadgeList badges={row.badges} /> : row.value}
      {row.source ? <small>{row.source}</small> : null}
    </span>
  </div>
)

const getComparisonLabel = (result: SceneMeasurementComparisonData['result']) => {
  switch (result) {
    case 'match':
      return '✓ Fits the estimate'
    case 'possible':
      return '? Possible fit'
    case 'conflict':
      return '✕ Conflicts with estimate'
    case 'unknown':
      return '? No estimate yet'
  }
}

export function SceneMeasurementComparison({ comparison }: { comparison: SceneMeasurementComparisonData }) {
  return (
    <article className={`scene-measurement-comparison is-${comparison.result}`}>
      <h4>{comparison.label}</h4>
      <div className="scene-measurement-row">
        <span>Scene estimate</span>
        <strong>{comparison.sceneEstimate}</strong>
      </div>
      <div className="scene-measurement-row">
        <span>This suspect</span>
        <strong>{comparison.suspectValue} · {comparison.suspectClassification}</strong>
      </div>
      <p>{getComparisonLabel(comparison.result)}</p>
    </article>
  )
}

export function DetectiveProfile({ profile }: DetectiveProfileProps) {
  return (
    <section className="detective-profile" aria-label="Detective profile">
      <div className="detective-profile-card">
        <h3>Scene Measurements</h3>
        {profile.measurementComparisons.length ? (
          <div className="scene-measurement-list">
            {profile.measurementComparisons.map((comparison) => <SceneMeasurementComparison key={comparison.label} comparison={comparison} />)}
          </div>
        ) : <p className="detective-profile-empty">No scene measurement clues collected yet.</p>}
      </div>

      <div className="detective-profile-card">
        <h3>Investigative Profile</h3>
        <div className="detective-profile-rows">
          {profile.investigativeTraits.map((row) => <ProfileRow key={row.label} row={row} />)}
        </div>
      </div>
    </section>
  )
}
