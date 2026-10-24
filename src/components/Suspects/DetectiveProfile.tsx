import type { DetectiveProfileData, DetectiveProfileRow } from '../../game/suspectCaseFile'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'

interface DetectiveProfileProps {
  profile: DetectiveProfileData
}

const ProfileRow = ({ row }: { row: DetectiveProfileRow }) => (
  <div className="detective-profile-row">
    <span className="detective-profile-label">{row.label}</span>
    <span className="detective-profile-value">
      {row.badges ? <EvidenceBadgeList badges={row.badges} /> : row.color
        ? <span className="profile-color-value" data-color={row.color}>{row.value}</span> : row.value}
      {row.source ? <small>{row.source}</small> : null}
    </span>
  </div>
)

export function DetectiveProfile({ profile }: DetectiveProfileProps) {
  return (
    <section className="detective-profile" aria-label="Detective profile">
      <div className="detective-profile-card">
        <h3>Profile</h3>
        <div className="detective-profile-rows">
          {profile.investigativeTraits.map((row) => <ProfileRow key={row.label} row={row} />)}
        </div>
      </div>
    </section>
  )
}
