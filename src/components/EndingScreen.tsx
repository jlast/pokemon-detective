import { getDiscoveredEvidence, type Case, type Suspect } from '../game/caseModel'
import { MugShot } from './Suspects/MugShot'

interface EndingScreenProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
  startNewCase: () => void
}

const getResultLabel = (status: Case['status']) => {
  if (status === 'solved') {
    return 'Solved'
  }

  if (status === 'gave-up') {
    return 'Gave up'
  }

  return 'Failed'
}

const getStarRating = (status: Case['status'], wrongAccusationCount: number, attemptsLeft: number) => {
  if (status !== 'solved') {
    return 1
  }

  if (wrongAccusationCount === 0) {
    return 5
  }

  if (wrongAccusationCount === 1) {
    return 4
  }

  if (wrongAccusationCount === 2) {
    return 3
  }

  if (attemptsLeft <= 1) {
    return 2
  }

  return 3
}

export function EndingScreen({
  currentCase,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
  startNewCase,
}: EndingScreenProps) {
  const isSolved = currentCase.status === 'solved'
  const evidenceCollectedCount = getDiscoveredEvidence(currentCase).length
  const locationsInvestigatedCount = currentCase.locations.filter((location) => location.investigated).length
  const solution = currentCase.solution
  const starRating = getStarRating(currentCase.status, wrongAccusationCount, attemptsLeft)
  const culpritRevealText =
    solution?.culpritRevealText ?? `${culpritSuspect?.name ?? 'The culprit'} was behind the case.`
  const detectiveConclusion =
    solution?.detectiveConclusion ??
    'The collected clues narrowed the suspect list until the culprit was the only one who still fit.'
  const evidenceExplanations = solution?.evidenceExplanation ?? []
  const clearedSuspects = solution?.clearedSuspects ?? []
  const nonCulpritSuspects = currentCase.suspects.filter(
    (suspect) => suspect.pokemonId !== currentCase.culpritPokemonId,
  )

  return (
    <section className={`notebook-card ending-screen solved-case-screen ${isSolved ? 'victory-screen' : 'failed-case-screen'}`}>
      <section className="case-closed-hero culprit-reveal-card">
        <div className="ending-hero-copy">
          <p className="eyebrow">{isSolved ? 'Case closed' : 'The culprit got away'}</p>
          <h2>{isSolved ? 'Culprit identified' : 'Investigation failed'}</h2>
          <p className="ending-case-title">{currentCase.title}</p>
          <div className="ending-status-row">
            <span className={`status-stamp ${isSolved ? 'is-cleared' : 'is-false-lead'}`}>
              {isSolved ? 'Solved' : 'Failed'}
            </span>
          </div>
          <p>{isSolved ? `${culpritSuspect?.name ?? 'The culprit'} was the culprit!` : culpritRevealText}</p>
        </div>

        <div className="ending-culprit-visuals">
          {culpritSuspect ? (
            <div className="ending-mugshot-frame mugshot-frame">
              <MugShot suspect={culpritSuspect} />
              <span className="mugshot-label">{culpritSuspect.name}</span>
            </div>
          ) : null}
        </div>
      </section>

      <div className="ending-layout-grid">
        <section className="ending-main-column">
          <section className="inspect-item detective-conclusion">
            <strong>Detective conclusion</strong>
            <p>{detectiveConclusion}</p>
          </section>

          <section className="inspect-item">
            <strong>How the case was solved</strong>
            <div className="ending-evidence-grid">
              {evidenceExplanations.map((item) => {
                const location = currentCase.locations.find((entry) => entry.id === item.locationId)

                return (
                  <article key={`${item.locationId}-${item.evidenceTitle}`} className="evidence-explanation-card">
                    <p className="eyebrow">{location?.name ?? 'Location'}</p>
                    <strong>Evidence: {item.evidenceTitle}</strong>
                    <p>Clue: {item.clueText}</p>
                    <p>Deduction: {item.deductionText}</p>
                  </article>
                )
              })}
            </div>
          </section>
        </section>

        <section className="ending-side-column">
          <section className="inspect-item case-summary-card">
            <strong>Case summary</strong>
            <div className="case-summary-list">
              <span>Evidence collected: {evidenceCollectedCount}</span>
              <span>Locations investigated: {locationsInvestigatedCount} / {currentCase.locations.length}</span>
              <span>Wrong accusations: {wrongAccusationCount}</span>
              <span>Attempts remaining: {attemptsLeft}</span>
              <span>Result: {getResultLabel(currentCase.status)}</span>
              <span>Rating: {'★'.repeat(starRating)}{'☆'.repeat(5 - starRating)}</span>
            </div>
          </section>

          <section className="inspect-item">
            <strong>Why the others were cleared</strong>
            <div className="cleared-suspect-grid">
              {nonCulpritSuspects.map((suspect) => {
                const explanation = clearedSuspects.find((item) => item.pokemonId === suspect.pokemonId)

                return (
                  <article key={suspect.pokemonId} className="cleared-suspect-card">
                    <MugShot suspect={suspect} />
                    <div>
                      <strong>{suspect.name}</strong>
                      <p>{explanation?.reason ?? 'The evidence did not support this suspect strongly enough.'}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </section>
      </div>

      <div className="ending-actions overlay-actions">
        <button type="button" className="primary-button" onClick={startNewCase}>
          New case
        </button>
        <button type="button" className="secondary-button" onClick={startNewCase}>
          Play again
        </button>
      </div>
    </section>
  )
}
