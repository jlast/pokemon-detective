import { useEffect, useState, type FormEvent } from 'react'
import { submitCaseFeedback, type CaseStatsResponse } from '../api'
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

interface EndingScreenProps {
  currentCase: Case
  caseId: string
  culpritSuspect: Suspect | null
  caseStats: CaseStatsResponse | null
  caseStreak: number
  playerGuessCount?: number
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

const formatSolveRate = (caseStats: CaseStatsResponse) => (
  `${Math.round((caseStats.solveRate ?? 0) * 100)}%`
)

const formatAverageGuesses = (caseStats: CaseStatsResponse) => {
  if (caseStats.averageGuesses == null) return '--'
  return caseStats.averageGuesses.toFixed(1).replace(/\.0$/, '')
}

const getSolveRatePercent = (caseStats: CaseStatsResponse) => (
  Math.round((caseStats.solveRate ?? 0) * 100)
)

export function EndingScreen({
  currentCase,
  caseId,
  culpritSuspect,
  caseStats,
  caseStreak,
  playerGuessCount,
}: EndingScreenProps) {
  const [timeUntilNextCase, setTimeUntilNextCase] = useState(getMsUntilNextUtcDay)
  const [enjoymentRating, setEnjoymentRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'saving' | 'submitted' | 'error'>('idle')
  const isSolved = currentCase.status === 'solved'
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
  const solveRatePercent = getSolveRatePercent(displayCaseStats)
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

      <section className="case-result-stats" aria-label="Case summary">
        <section className="case-result-stat-group" aria-labelledby="community-results-label">
          <p id="community-results-label" className="case-result-stat-group-label">Community results</p>
          <div className="case-result-stat-items">
            <div className="case-result-stat case-result-stat--progress">
              <span>Players solved</span>
              <div
                className="case-result-progress"
                role="progressbar"
                aria-label="Players solved"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={solveRatePercent}
              >
                <span className="case-result-progress__fill" style={{ width: `${solveRatePercent}%` }}></span>
              </div>
              <small>{formatSolveRate(displayCaseStats)}</small>
            </div>
            <div className="case-result-stat">
              <span>Average guesses</span>
              <strong>{formatAverageGuesses(displayCaseStats)}</strong>
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

      <section className="case-feedback-card" aria-labelledby="case-feedback-title">
        <div className="case-feedback-heading">
          <div>
            <p className="eyebrow">Quick feedback</p>
            <h3 id="case-feedback-title">Enjoyed this case?</h3>
          </div>
          {feedbackStatus === 'submitted' ? <span className="feedback-submitted-pill">Submitted</span> : null}
        </div>

        {feedbackStatus === 'submitted' ? (
          <p className="case-feedback-thanks">Thanks. Your notes help tune future cases.</p>
        ) : (
          <form className="case-feedback-form" onSubmit={handleFeedbackSubmit}>
            {renderStarRating()}

            {enjoymentRating !== null ? (
              <label className="case-feedback-comment">
                <span>Optional comment</span>
                <textarea
                  value={comment}
                  maxLength={1000}
                  rows={3}
                  placeholder="Anything confusing, too easy, too hard, or broken?"
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>
            ) : null}

            <div className="case-feedback-actions">
              <button className="primary-button" type="submit" disabled={!canSubmitFeedback}>
                {feedbackStatus === 'saving' ? 'Sending...' : 'Send feedback'}
              </button>
              {feedbackStatus === 'error' ? (
                <span className="feedback-error" role="status">Could not send feedback. Try again?</span>
              ) : null}
            </div>
          </form>
        )}
      </section>

      <div className="ending-details-grid">
        <section className="inspect-item compact-result-panel evidence-used-panel">
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

        <section className="inspect-item compact-result-panel suspects-ruled-out-panel">
          <strong>Suspects ruled out</strong>
          <div className="cleared-suspect-list">
            {nonCulpritSuspects.map(renderSuspectRow)}
          </div>
        </section>
      </div>
    </section>
  )
}
