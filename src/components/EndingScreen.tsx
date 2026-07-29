import { useEffect, useState, type FormEvent } from 'react'
import { submitCaseFeedback, type CaseStatsResponse } from '../api'
import type { Case, Suspect } from '../game/caseModel'
import { getEvidenceIcon } from '../game/evidenceMeta'
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
}

const formatSolveRate = (caseStats: CaseStatsResponse | null) => (
  caseStats?.solveRate == null ? '--' : `${Math.round(caseStats.solveRate * 100)}%`
)

const formatAverageGuesses = (caseStats: CaseStatsResponse | null) => {
  if (caseStats?.averageGuesses == null) return '--'
  return caseStats.averageGuesses.toFixed(1).replace(/\.0$/, '')
}

export function EndingScreen({
  currentCase,
  caseId,
  culpritSuspect,
  caseStats,
  caseStreak,
}: EndingScreenProps) {
  const [timeUntilNextCase, setTimeUntilNextCase] = useState(getMsUntilNextUtcDay)
  const [enjoymentRating, setEnjoymentRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'saving' | 'submitted' | 'error'>('idle')
  const isSolved = currentCase.status === 'solved'
  const solution = currentCase.solution
  const culpritName = culpritSuspect?.name ?? 'The culprit'
  const solutionEvidenceItems = solution?.evidenceExplanation ?? []
  const clearedSuspects = solution?.clearedSuspects ?? []
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

  const renderEvidenceRow = (item: (typeof solutionEvidenceItems)[number]) => {
    const location = currentCase.locations.find((entry) => entry.id === item.locationId)
    const evidenceIcon = getEvidenceIcon(location?.evidenceId, item.evidenceTitle)

    return (
      <div key={`${item.locationId}-${item.evidenceTitle}`} className="evidence-result-row">
        <span className="evidence-result-icon" aria-hidden="true">{evidenceIcon}</span>
        <span className="evidence-result-copy">
          <strong>{item.evidenceTitle}</strong>
          <span>{item.clueText}</span>
        </span>
      </div>
    )
  }

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
        <span className="case-result-stat"><strong>Solve rate</strong> <span>{formatSolveRate(caseStats)}</span></span>
        <span className="case-result-stat"><strong>Avg guesses</strong> <span>{formatAverageGuesses(caseStats)}</span></span>
        <span className="case-result-stat">
          <strong>Streak</strong>
          <span>{caseStreak > 1 ? <span aria-hidden="true">🔥 </span> : null}{caseStreak}</span>
        </span>
        <span className="case-result-stat next-case-timer" title="Daily at 00:00 UTC" aria-label="Next case refreshes daily at 00:00 UTC">
          <strong>Next case</strong>
          <span className="next-case-timer__time" aria-live="polite">
            {timeUntilNextCase > 0 ? formatCountdown(timeUntilNextCase) : 'Available now'}
          </span>
          <span className="next-case-timer__hint">Daily at 00:00 UTC</span>
        </span>
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
          <strong>Solution clues</strong>
          <div className="evidence-result-list">
            {solutionEvidenceItems.map(renderEvidenceRow)}
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
