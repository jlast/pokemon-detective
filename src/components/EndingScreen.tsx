import { useEffect, useState } from 'react'
import { getDiscoveredEvidence, type Case, type Suspect } from '../game/caseModel'
import { getEvidenceIcon } from '../game/evidenceMeta'
import { MugShot } from './Suspects/MugShot'

const maxAccusations = 3

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

interface EndingScreenProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
}

export function EndingScreen({
  currentCase,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
}: EndingScreenProps) {
  const [timeUntilNextCase, setTimeUntilNextCase] = useState(getMsUntilNextUtcDay)
  const isSolved = currentCase.status === 'solved'
  const isFailed = currentCase.status === 'failed'
  const solution = currentCase.solution
  const culpritName = culpritSuspect?.name ?? 'The culprit'
  const solutionEvidenceItems = solution?.evidenceExplanation ?? []
  const clearedSuspects = solution?.clearedSuspects ?? []
  const discoveredEvidenceCount = getDiscoveredEvidence(currentCase).length
  const displayedAttemptsLeft = isFailed ? 0 : attemptsLeft ?? Math.max(maxAccusations - wrongAccusationCount, 0)
  const displayedWrongGuesses = isFailed
    ? Math.max(wrongAccusationCount, maxAccusations - displayedAttemptsLeft)
    : wrongAccusationCount
  const nonCulpritSuspects = currentCase.suspects.filter(
    (suspect) => suspect.pokemonId !== currentCase.culpritPokemonId,
  )

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
        <span className="case-result-stat"><strong>Evidence found</strong> <span>{discoveredEvidenceCount}/{currentCase.locations.length}</span></span>
        <span className="case-result-stat"><strong>Wrong guesses</strong> <span>{displayedWrongGuesses}</span></span>
        <span className="case-result-stat"><strong>Attempts left</strong> <span>{displayedAttemptsLeft}</span></span>
        <span className="case-result-stat next-case-timer" title="Daily at 00:00 UTC" aria-label="Next case refreshes daily at 00:00 UTC">
          <strong>Next case</strong>
          <span className="next-case-timer__time" aria-live="polite">
            {timeUntilNextCase > 0 ? formatCountdown(timeUntilNextCase) : 'Available now'}
          </span>
          <span className="next-case-timer__hint">Daily at 00:00 UTC</span>
        </span>
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
