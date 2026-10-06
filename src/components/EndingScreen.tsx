import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getPuzzleHistory, submitCaseFeedback, type CaseStatsResponse } from '../api'
import { getSolutionClueBadgeGroups, type Case, type Suspect } from '../game/caseModel'
import { EvidenceBadgeList } from './Evidence/EvidenceBadge'
import { ShareResultButton } from './ShareResultButton'
import { MugShot } from './Suspects/MugShot'

const getMsUntilNextUtcDay = () => {
  const now = new Date()
  const nextUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return Math.max(nextUtcDay - now.getTime(), 0)
}

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

const ratingOptions = [1, 2, 3, 4, 5]
const COMPLETED_CASE_IDS_KEY = 'pokemystery:completed-case-ids'
const LEGACY_SOLVED_CASE_IDS_KEY = 'pokemystery:solved-case-ids'

const getCaseDate = (caseId: string): string => caseId.slice(0, 10)

const getDailyCaseId = (date: string, difficulty: 'easy' | 'hard'): string => `${date}-${difficulty}`

const getCaseDifficulty = (caseId: string, fallbackDifficulty: Case['difficulty']): 'easy' | 'hard' => {
  if (caseId.endsWith('-hard')) return 'hard'
  if (caseId.endsWith('-easy')) return 'easy'
  return fallbackDifficulty === 'hard' ? 'hard' : 'easy'
}

const getStoredCaseIds = (key: string): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((caseId): caseId is string => typeof caseId === 'string') : []
  } catch {
    return []
  }
}

const storeCompletedCaseId = (caseId: string): void => {
  if (typeof window === 'undefined') return

  const completedCaseIds = getStoredCaseIds(COMPLETED_CASE_IDS_KEY)
  if (completedCaseIds.includes(caseId)) return

  window.localStorage.setItem(COMPLETED_CASE_IDS_KEY, JSON.stringify([...completedCaseIds, caseId]))
}

interface EndingScreenProps {
  currentCase: Case
  caseId: string
  culpritSuspect: Suspect | null
  caseStats: CaseStatsResponse | null
  caseStreak: number
  playerGuessCount?: number
  authed: boolean
  onLogin: () => void
}

const getDisplayCaseStats = (
  caseStats: CaseStatsResponse | null,
  isSolved: boolean,
  playerGuessCount?: number,
): CaseStatsResponse => {
  if (caseStats && caseStats.completedCount > 0) return caseStats

  return {
    completedCount: 1,
    solvedCount: isSolved ? 1 : 0,
    totalGuessCount: playerGuessCount ?? 0,
    solveRate: isSolved ? 1 : 0,
    averageGuesses: playerGuessCount ?? null,
  }
}

const getCorrectGuessRatePercent = (caseStats: CaseStatsResponse): number | null => {
  if (caseStats.totalGuessCount <= 0) return null
  return Math.round((caseStats.solvedCount / caseStats.totalGuessCount) * 100)
}

const formatCorrectGuessRate = (caseStats: CaseStatsResponse) => {
  const correctGuessRatePercent = getCorrectGuessRatePercent(caseStats)
  return correctGuessRatePercent === null ? '--' : `${correctGuessRatePercent}%`
}

export function EndingScreen({
  currentCase,
  caseId,
  culpritSuspect,
  caseStats,
  caseStreak,
  playerGuessCount,
  authed,
  onLogin,
}: EndingScreenProps) {
  const [timeUntilNextCase, setTimeUntilNextCase] = useState(getMsUntilNextUtcDay)
  const [enjoymentRating, setEnjoymentRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'saving' | 'submitted' | 'error'>('idle')
  const feedbackCardRef = useRef<HTMLElement | null>(null)
  const isSolved = currentCase.status === 'solved'
  const isFinished = currentCase.status === 'solved' || currentCase.status === 'failed'
  const currentDifficulty = getCaseDifficulty(caseId, currentCase.difficulty)
  const otherDifficulty = currentDifficulty === 'hard' ? 'easy' : 'hard'
  const otherDifficultyLabel = otherDifficulty[0].toUpperCase() + otherDifficulty.slice(1)
  const otherCaseId = getDailyCaseId(getCaseDate(caseId), otherDifficulty)
  const [hasSolvedOtherCase, setHasSolvedOtherCase] = useState(false)
  const displayCaseStats = getDisplayCaseStats(caseStats, isSolved, playerGuessCount)
  const solution = currentCase.solution
  const culpritName = culpritSuspect?.name ?? 'The culprit'
  const solutionClueBadgeGroups = getSolutionClueBadgeGroups(solution)
  const discoveredEvidenceIds = new Set(currentCase.locations.flatMap((location) => (
    location.investigated && location.evidenceId ? [location.evidenceId] : []
  )))
  const sortedSolutionClueBadgeGroups = [...solutionClueBadgeGroups].sort((left, right) => {
    const leftDiscovered = left.evidenceId ? discoveredEvidenceIds.has(left.evidenceId) : false
    const rightDiscovered = right.evidenceId ? discoveredEvidenceIds.has(right.evidenceId) : false
    return Number(rightDiscovered) - Number(leftDiscovered)
  })
  const clearedSuspects = solution?.clearedSuspects ?? []
  const correctGuessRatePercent = getCorrectGuessRatePercent(displayCaseStats)
  const nonCulpritSuspects = currentCase.suspects.filter(
    (suspect) => suspect.pokemonId !== currentCase.culpritPokemonId,
  )
  const canSubmitFeedback = enjoymentRating !== null && feedbackStatus !== 'saving'

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeUntilNextCase(getMsUntilNextUtcDay())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (enjoymentRating === null) return

    const handleClickOutside = (event: MouseEvent) => {
      if (feedbackCardRef.current && !feedbackCardRef.current.contains(event.target as Node)) {
        setEnjoymentRating(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [enjoymentRating])

  useEffect(() => {
    if (!isFinished) return

    storeCompletedCaseId(caseId)
  }, [caseId, isFinished])

  useEffect(() => {
    if (!isFinished) return

    getPuzzleHistory()
      .then((history) => {
        const solvedCaseIds = history.items
          .filter((item) => item.status === 'solved')
          .map((item) => item.caseId)
        for (const solvedCaseId of [...getStoredCaseIds(LEGACY_SOLVED_CASE_IDS_KEY), ...solvedCaseIds]) {
          storeCompletedCaseId(solvedCaseId)
        }
        setHasSolvedOtherCase(solvedCaseIds.includes(otherCaseId))
      })
      .catch(() => setHasSolvedOtherCase(false))
  }, [isFinished, otherCaseId])

  const renderSuspectRow = (suspect: Suspect) => {
    const explanation = clearedSuspects.find((item) => item.pokemonId === suspect.pokemonId)

    return (
      <div key={suspect.pokemonId} className="cleared-suspect-row">
        <MugShot suspect={suspect} />
        <span className="cleared-suspect-copy">
          <strong>{suspect.name}</strong>
          <span><span className="cleared-suspect-cross" aria-hidden="true">×</span>{explanation?.evidenceLabel ?? 'Evidence mismatch'}</span>
        </span>
      </div>
    )
  }

  const renderStarRating = () => (
    <div className="feedback-rating-field">
      <div className="feedback-rating-buttons" role="radiogroup" aria-label="Enjoyed this case?">
        {ratingOptions.map((rating) => (
          <button
            key={rating}
            type="button"
            className={`feedback-rating-button ${enjoymentRating !== null && enjoymentRating >= rating ? 'is-selected' : ''}`}
            role="radio"
            aria-checked={enjoymentRating === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
            onClick={() => setEnjoymentRating(rating)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )

  const handleFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmitFeedback || enjoymentRating === null) return

    setFeedbackStatus('saving')
    try {
      await submitCaseFeedback(caseId, {
        enjoymentRating,
        comment: comment.trim() || undefined,
      })
      setFeedbackStatus('submitted')
    } catch {
      setFeedbackStatus('error')
    }
  }

  return (
    <section className={`notebook-card ending-screen solved-case-screen ${isSolved ? 'victory-screen' : 'failed-case-screen'}`}>
      <section className="case-closed-hero culprit-reveal-card">
        <ShareResultButton
          caseId={caseId}
          isSolved={isSolved}
          playerGuessCount={playerGuessCount}
          caseStreak={caseStreak}
        />

        <div className="ending-hero-copy">
          <h2>{isSolved ? 'Case solved' : 'Investigation failed'}</h2>
          <strong className="ending-culprit-name">{culpritName}</strong>
          <p>{culpritName} was the culprit.</p>
        </div>

        <div className="ending-culprit-visuals">
          {culpritSuspect ? (
            <div className="ending-mugshot-frame mugshot-frame">
              <MugShot suspect={culpritSuspect} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="post-hero-utility-row">
        {isFinished && !hasSolvedOtherCase ? (
          <section className="post-game-next" aria-label="Next case">
            <Link
              to={`/today?case=${encodeURIComponent(otherCaseId)}`}
              className={`another-case-cta another-case-cta--${otherDifficulty}`}
            >
              <span className="another-case-cta__icon" aria-hidden="true">
                <img
                  className="another-case-cta__sprite"
                  src={`/sprites/${otherDifficulty === 'hard' ? 248 : 175}.png`}
                  alt=""
                  loading="lazy"
                />
              </span>
              <span className="another-case-cta__text">
                <strong><span className="another-case-cta__play">Play the </span>{otherDifficultyLabel} case</strong>
                <span className="another-case-cta__meta">
                  {otherDifficulty === 'hard' ? 9 : 6} suspects · {otherDifficulty === 'hard' ? 'More similar lineup' : 'Different lineup'}
                </span>
              </span>
              <span className="another-case-cta__chevron" aria-hidden="true">›</span>
            </Link>
          </section>
        ) : null}

        <section ref={feedbackCardRef} className="case-feedback-card" aria-labelledby="case-feedback-title">
          <div className="case-feedback-heading">
            <h3 id="case-feedback-title">Enjoyed this case?</h3>
          </div>

          <form className="case-feedback-form" onSubmit={handleFeedbackSubmit}>
            {renderStarRating()}

            {enjoymentRating !== null ? (
              <div className="case-feedback-popover" role="dialog" aria-label="Feedback details">
                {feedbackStatus === 'submitted' ? (
                  <p className="case-feedback-thanks">Thanks. Your notes help tune future cases.</p>
                ) : (
                  <>
                    <label className="case-feedback-comment">
                      <span>Optional comment</span>
                      <textarea
                        value={comment}
                        maxLength={1000}
                        rows={2}
                        placeholder="Anything confusing, too easy, too hard, or broken?"
                        onChange={(event) => setComment(event.target.value)}
                      />
                    </label>

                    <div className="case-feedback-actions">
                      <button className="primary-button" type="submit" disabled={!canSubmitFeedback}>
                        {feedbackStatus === 'saving' ? 'Sending...' : 'Send feedback'}
                      </button>
                      {feedbackStatus === 'error' ? (
                        <span className="feedback-error" role="status">Could not send feedback. Try again?</span>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </form>
        </section>
      </div>

      {!authed ? (
        <section className="login-incentive-card login-incentive-card--ending" aria-labelledby="ending-login-title">
          <div className="login-incentive-card__title-row">
            <span className="login-incentive-card__profile-icon" aria-hidden="true">
              <svg viewBox="0 0 44 44" focusable="false">
                <circle cx="22" cy="22" r="21" fill="#f4d35e" />
                <path d="M13.5 16.5 16 9.5h12l2.5 7H13.5Z" fill="#7a5531" />
                <path d="M17 9.5h10l1 3H16l1-3Z" fill="#9b6b3d" />
                <path d="M8.5 17.8c4.8-2 22.2-2 27 0" fill="none" stroke="#51361f" strokeWidth="3.8" strokeLinecap="round" />
                <path d="M14.5 21.5c1.5-2.4 4-3.8 7.5-3.8s6 1.4 7.5 3.8v7.2c0 4.2-3 7.3-7.5 7.3s-7.5-3.1-7.5-7.3v-7.2Z" fill="#f1c08c" />
                <path d="M14.5 21.5h15v3.3c-4.6-.8-10.4-.8-15 0v-3.3Z" fill="#51361f" opacity="0.22" />
                <path d="M11.5 37c1.3-5.1 5.1-8 10.5-8s9.2 2.9 10.5 8H11.5Z" fill="#203250" />
                <path d="M17 37v-6l5 3.3L27 31v6H17Z" fill="#efe2ca" />
                <path d="M14.7 37c.7-3 2.2-5.1 4.5-6.3L22 37h-7.3Z" fill="#8b6138" />
                <path d="M29.3 37c-.7-3-2.2-5.1-4.5-6.3L22 37h7.3Z" fill="#8b6138" />
                <circle cx="18.2" cy="25.5" r="1.1" fill="#203250" />
                <circle cx="25.8" cy="25.5" r="1.1" fill="#203250" />
                <path d="M19.3 31c1.6 1 3.8 1 5.4 0" fill="none" stroke="#8a4f35" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="29.2" cy="26.5" r="3.6" fill="none" stroke="#203250" strokeWidth="1.8" />
                <path d="m31.7 29.2 3.3 3.3" stroke="#203250" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <h2 id="ending-login-title">Sign in to keep this result</h2>
          </div>
          <div className="login-incentive-card__copy">
            <p>Save your case history, protect your streak, and build your Pokédex as new cases arrive.</p>
          </div>
          <button type="button" className="primary-button login-incentive-card__button" onClick={onLogin}>
            <span className="login-incentive-card__button-label">Sign in</span>
          </button>
        </section>
      ) : null}

      <section className="case-result-stats" aria-label="Case summary">
        <section className="case-result-stat-group" aria-labelledby="community-results-label">
          <p id="community-results-label" className="case-result-stat-group-label">Community results</p>
          <div className="case-result-stat-items">
            <div className="case-result-stat case-result-stat--progress">
              <span>Correct guess rate</span>
              <div
                className="case-result-progress"
                role="progressbar"
                aria-label="Correct guess rate"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={correctGuessRatePercent ?? 0}
              >
                <span className="case-result-progress__fill" style={{ width: `${correctGuessRatePercent ?? 0}%` }}></span>
              </div>
              <small>{formatCorrectGuessRate(displayCaseStats)}</small>
            </div>
          </div>
        </section>

        <section className="case-result-stat-group case-result-stat-group--personal" aria-labelledby="your-progress-label">
          <p id="your-progress-label" className="case-result-stat-group-label">Your progress</p>
          <div className="case-result-stat-items">
            <div className="case-result-stat">
              <span>Current streak</span>
              <strong>{caseStreak > 0 ? <span aria-hidden="true">🔥 </span> : null}{caseStreak}</strong>
            </div>
            <div className="case-result-stat next-case-timer" title="Daily at 00:00 UTC" aria-label="Next case refreshes daily at 00:00 UTC">
              <span>Next case</span>
              <strong className="next-case-timer__time" aria-live="polite">
                {timeUntilNextCase > 0 ? formatCountdown(timeUntilNextCase) : 'Available now'}
              </strong>
            </div>
          </div>
        </section>
      </section>

      <section className="case-explanation-section" aria-labelledby="case-explanation-title">
        <h3 id="case-explanation-title">How the case worked</h3>
        <div className="ending-details-grid">
          <section className="compact-result-panel evidence-used-panel">
            <strong>Case clues</strong>
            <div className="case-clue-list">
              {sortedSolutionClueBadgeGroups.map((group) => {
                const discovered = group.evidenceId ? discoveredEvidenceIds.has(group.evidenceId) : false

                return (
                <div key={group.evidenceId ?? group.hintType} className={`solution-clue-badge-group ${discovered ? 'is-discovered' : 'is-undiscovered'}`}>
                  <span className="solution-clue-badge-group__label">
                    <span className="solution-clue-badge-group__status" aria-hidden="true">{discovered ? '✓' : '×'}</span>
                    {group.hintType}
                  </span>
                  <EvidenceBadgeList badges={group.badges} />
                </div>
                )
              })}
            </div>
          </section>

          <section className="compact-result-panel suspects-ruled-out-panel">
            <strong>Suspects ruled out</strong>
            <div className="cleared-suspect-list">
              {nonCulpritSuspects.map(renderSuspectRow)}
            </div>
          </section>
        </div>
      </section>
    </section>
  )
}
