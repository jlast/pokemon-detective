import type { DetectiveProfileData, DetectiveProfileRow } from '../../game/suspectCaseFile'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

interface DetectiveProfileProps {
  profile: DetectiveProfileData
}

const ProfileRow = ({ row }: { row: DetectiveProfileRow }) => (
  <div className="detective-profile-row">
    <span className="detective-profile-label">{row.label}</span>
    <span className="detective-profile-value">
      {row.badges ? <EvidenceBadgeList badges={row.badges} /> : row.value}
    </span>
  </div>
)

export function DetectiveProfile({ profile }: DetectiveProfileProps) {
  return (
    <section className="detective-profile" aria-label="Detective profile">
      <div className="detective-profile-card">
        <h3>Scene Measurements</h3>
        <div className="detective-profile-rows">
          {profile.physicalRows.map((row) => <ProfileRow key={row.label} row={row} />)}
        </div>
      </div>

      <div className="detective-profile-card">
        <h3>Detective Read</h3>
        <div className="detective-profile-rows">
          {profile.traitRows.map((row) => <ProfileRow key={row.label} row={row} />)}
        </div>
      </div>
    </section>
  )
}
