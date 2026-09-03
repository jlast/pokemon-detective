import { useEffect, useMemo, useState } from 'react'
import {
  getAdminCaseProgress,
  getAdminSession,
  type AdminCaseProgressCase,
  type AdminCaseProgressResponse,
  type AdminProgressPlayer,
} from '../api'
import { EvidenceBadgeList } from '../components/Evidence/EvidenceBadge'
import { getClueBadgeGroupsFromBadges } from '../game/caseModel'

const getTodayUtc = () => new Date().toISOString().slice(0, 10)

interface AdminRouteProps {
  authed: boolean
  onLogin: () => void
}

const formatPlayerId = (player: AdminProgressPlayer): string => {
  if (player.email) return player.email

  const userIdWithoutDate = player.userId.replace(/:\d{4}-\d{2}-\d{2}(?:-(?:easy|hard))?$/, '')
  if (player.playerKind === 'anonymous') return userIdWithoutDate.replace(/^anonymous:/, 'Anonymous ')
  return userIdWithoutDate
}

const formatActivityTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return 'No timestamp'

  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const formatDifficulty = (difficulty: string | undefined): string => (
  difficulty ? difficulty[0].toUpperCase() + difficulty.slice(1) : 'Unknown'
)

const getResultLabel = (player: AdminProgressPlayer): string => {
  if (player.succeeded) return 'Solved'
  if (player.failed) return 'Failed'
  return 'Playing'
}

const getPlayerClueBadgeGroups = (player: AdminProgressPlayer) => (
  getClueBadgeGroupsFromBadges(player.investigatedLocations.flatMap((investigation) => (
    investigation.evidenceBadges ?? []
  )))
)

const getCaseStats = (adminCase: AdminCaseProgressCase) => ({
  total: adminCase.players.length,
  solved: adminCase.players.filter((player) => player.status === 'solved').length,
  failed: adminCase.players.filter((player) => player.status === 'failed').length,
  playing: adminCase.players.filter((player) => player.status === 'playing').length,
})

export function AdminRoute({ authed, onLogin }: AdminRouteProps) {
  const [caseId, setCaseId] = useState(getTodayUtc)
  const [progress, setProgress] = useState<AdminCaseProgressResponse | null>(null)
  const [loading, setLoading] = useState(authed)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) {
      setLoading(false)
      setProgress(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void getAdminSession()
      .then(() => getAdminCaseProgress(caseId))
      .then((data) => {
        if (!cancelled) setProgress(data)
      })
      .catch((err) => {
        console.error('Failed to load admin case progress:', err)
        if (!cancelled) {
          setProgress(null)
          setError(err instanceof Error && err.message.includes('403')
            ? 'Your account is not in the Cognito admins group.'
            : 'Could not load admin puzzle details.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authed, caseId])

  const stats = useMemo(() => {
    const players = progress?.cases.flatMap((adminCase) => adminCase.players) ?? []
    return {
      total: players.length,
      solved: players.filter((player) => player.status === 'solved').length,
      failed: players.filter((player) => player.status === 'failed').length,
      playing: players.filter((player) => player.status === 'playing').length,
    }
  }, [progress])

  if (!authed) {
    return (
      <div className="main-layout-single">
        <section className="notebook-card admin-page admin-page--signed-out">
          <p className="eyebrow">Admin desk</p>
          <h2>Sign in required</h2>
          <p className="subtle-text">Admin puzzle details require a Cognito account in the admins group.</p>
          <button type="button" className="primary-button" onClick={onLogin}>Sign in to continue</button>
        </section>
      </div>
    )
  }

  return (
    <div className="main-layout-single">
      <section className="notebook-card admin-page">
        <div className="admin-page__header">
          <div>
            <p className="eyebrow">Admin desk</p>
            <h2>User puzzle details</h2>
            <p className="subtle-text">Open every recorded player puzzle for a selected UTC date.</p>
          </div>
          <label className="admin-page__date-field">
            <span>Case date</span>
            <input
              type="date"
              value={caseId}
              onChange={(event) => setCaseId(event.currentTarget.value)}
            />
          </label>
        </div>

        {loading ? (
          <p className="placeholder-page">Loading admin case records...</p>
        ) : error ? (
          <p className="placeholder-page" role="status">{error}</p>
        ) : progress ? (
          <>
            <div className="admin-page__summary" aria-label="Case progress summary">
              <span>{stats.total} players</span>
              <span>{stats.solved} solved</span>
              <span>{stats.failed} failed</span>
              <span>{stats.playing} playing</span>
            </div>

            {progress.cases.every((adminCase) => adminCase.players.length === 0) ? (
              <p className="placeholder-page">No player progress records exist for this date.</p>
            ) : (
              <div className="admin-case-list">
                {progress.cases.map((adminCase) => {
                  const caseStats = getCaseStats(adminCase)

                  return (
                    <section key={adminCase.caseId} className="admin-case-section">
                      <div className="admin-page__case-note">
                        <strong>{formatDifficulty(adminCase.difficulty)}</strong>
                        <span>{adminCase.caseTitle}</span>
                        <span>Culprit: {adminCase.culpritPokemonName}</span>
                        <span>{caseStats.total} players</span>
                        <span>{caseStats.solved} solved</span>
                        <span>{caseStats.failed} failed</span>
                        <span>{caseStats.playing} playing</span>
                      </div>

                      {adminCase.players.length === 0 ? (
                        <p className="placeholder-page">No player progress records exist for this case.</p>
                      ) : (
                        <div className="admin-player-list">
                          {adminCase.players.map((player) => (
                            <details key={player.userId} className="admin-player-card">
                              <summary>
                                <span className="admin-player-card__identity">{formatPlayerId(player)}</span>
                                <span className={`admin-player-card__status admin-player-card__status--${player.status}`}>
                                  {getResultLabel(player)}
                                </span>
                                <span>{formatActivityTimestamp(player.lastActivityAt)} -</span>
                                <span>{player.investigationsUsed} investigations -</span>
                                <span>{player.accusationHistory.length} accusations</span>
                              </summary>

                              <div className="admin-player-card__details">
                                <section>
                                  <h3>Evidence Gathered</h3>
                                  {getPlayerClueBadgeGroups(player).length === 0 ? (
                                    <p className="subtle-text">No clue badges recorded.</p>
                                  ) : (
                                    <div className="case-clue-list admin-case-clue-list">
                                      {getPlayerClueBadgeGroups(player).map((group) => (
                                        <div key={group.evidenceId ?? group.hintType} className="solution-clue-badge-group is-discovered">
                                          <span className="solution-clue-badge-group__label">{group.hintType}</span>
                                          <EvidenceBadgeList badges={group.badges} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </section>

                                <section>
                                  <h3>Accusations</h3>
                                  {player.accusationHistory.length === 0 ? (
                                    <p className="subtle-text">No accusations recorded.</p>
                                  ) : (
                                    <div className="admin-accusation-list">
                                      {player.accusationHistory.map((accusation) => (
                                        <span
                                          key={`${player.userId}:${accusation.pokemonId}`}
                                          className={accusation.correct ? 'is-correct' : undefined}
                                        >
                                          {accusation.pokemonName}{accusation.correct ? ' correct' : ' wrong'}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </section>
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </section>
    </div>
  )
}
