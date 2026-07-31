import { useEffect, useMemo, useState } from 'react'
import {
  getAdminCaseProgress,
  getAdminSession,
  type AdminCaseProgressResponse,
  type AdminProgressPlayer,
} from '../api'

const getTodayUtc = () => new Date().toISOString().slice(0, 10)

interface AdminRouteProps {
  authed: boolean
  onLogin: () => void
}

const formatPlayerId = (player: AdminProgressPlayer): string => {
  if (player.playerKind === 'anonymous') return player.userId.replace(/^anonymous:/, 'Anonymous ')
  return player.userId
}

const getResultLabel = (player: AdminProgressPlayer): string => {
  if (player.succeeded) return 'Solved'
  if (player.failed) return 'Failed'
  return 'Playing'
}

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
    const players = progress?.players ?? []
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
          <h2>Login required</h2>
          <p className="subtle-text">Admin puzzle details require a Cognito account in the admins group.</p>
          <button type="button" className="primary-button" onClick={onLogin}>Login to admin</button>
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

            <div className="admin-page__case-note">
              <strong>{progress.caseTitle}</strong>
              <span>Culprit: {progress.culpritPokemonName} #{progress.culpritPokemonId}</span>
            </div>

            {progress.players.length === 0 ? (
              <p className="placeholder-page">No player progress records exist for this date.</p>
            ) : (
              <div className="admin-player-list">
                {progress.players.map((player) => (
                  <details key={player.userId} className="admin-player-card">
                    <summary>
                      <span className="admin-player-card__identity">{formatPlayerId(player)}</span>
                      <span className={`admin-player-card__status admin-player-card__status--${player.status}`}>
                        {getResultLabel(player)}
                      </span>
                      <span>{player.investigationsUsed} investigations</span>
                      <span>{player.accusationHistory.length} accusations</span>
                    </summary>

                    <div className="admin-player-card__details">
                      <section>
                        <h3>Evidence Gathered</h3>
                        {player.investigatedLocations.length === 0 ? (
                          <p className="subtle-text">No investigations recorded.</p>
                        ) : (
                          <div className="admin-detail-list">
                            {player.investigatedLocations.map((investigation) => (
                              <article key={`${investigation.locationId}:${investigation.actionId}`} className="admin-detail-card">
                                <strong>{investigation.evidenceTitle ?? investigation.actionLabel}</strong>
                                <span>{investigation.locationName} / {investigation.actionLabel}</span>
                                <p>{investigation.evidenceText ?? investigation.observationText}</p>
                                {investigation.witnessPokemonName ? (
                                  <small>Witness: {investigation.witnessPokemonName} #{investigation.witnessPokemonId}</small>
                                ) : null}
                                {investigation.evidenceBadges?.length ? (
                                  <div className="admin-badge-list">
                                    {investigation.evidenceBadges.map((badge) => (
                                      <span key={`${investigation.locationId}:${investigation.actionId}:${badge.text}`}>{badge.text}</span>
                                    ))}
                                  </div>
                                ) : null}
                              </article>
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
                                {accusation.pokemonName} #{accusation.pokemonId}{accusation.correct ? ' correct' : ' wrong'}
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
          </>
        ) : null}
      </section>
    </div>
  )
}
