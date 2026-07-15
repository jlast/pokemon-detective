import { getDiscoveredEvidence, getUniqueSolutionEvidence, type Case, type Suspect } from '../game/caseModel'
import { getClearedSuspectEvidenceLabel, getEvidenceIcon } from '../game/evidenceMeta'
import { MugShot } from './Suspects/MugShot'

const maxAccusations = 3

interface EndingScreenProps {
  currentCase: Case
  culpritSuspect: Suspect | null
  attemptsLeft: number
  wrongAccusationCount: number
  startNewCase: () => void
}

export function EndingScreen({
  currentCase,
  culpritSuspect,
  attemptsLeft,
  wrongAccusationCount,
  startNewCase,
}: EndingScreenProps) {
  const isSolved = currentCase.status === 'solved'
  const isFailed = currentCase.status === 'failed'
  const solution = currentCase.solution
  const culpritName = culpritSuspect?.name ?? 'The culprit'
  const uniqueEvidenceItems = getUniqueSolutionEvidence(currentCase)
  const clearedSuspects = solution?.clearedSuspects ?? []
  const discoveredEvidenceCount = getDiscoveredEvidence(currentCase).length
  const evidenceCollectedCount = currentCase.status === 'active'
    ? discoveredEvidenceCount
    : Math.max(discoveredEvidenceCount, uniqueEvidenceItems.length)
  const displayedAttemptsLeft = isFailed ? 0 : attemptsLeft ?? Math.max(maxAccusations - wrongAccusationCount, 0)
  const displayedWrongGuesses = isFailed
    ? Math.max(wrongAccusationCount, maxAccusations - displayedAttemptsLeft)
    : wrongAccusationCount
  const nonCulpritSuspects = currentCase.suspects.filter(
    (suspect) => suspect.pokemonId !== currentCase.culpritPokemonId,
  )

  const renderEvidenceRow = (item: (typeof uniqueEvidenceItems)[number]) => {
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
          <span><span className="cleared-suspect-cross" aria-hidden="true">×</span>{getClearedSuspectEvidenceLabel(explanation?.reason)}</span>
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
        <span><strong>Evidence</strong> {evidenceCollectedCount}/{currentCase.locations.length}</span>
        <span><strong>Wrong guesses</strong> {displayedWrongGuesses}</span>
        <span><strong>Attempts left</strong> {displayedAttemptsLeft}</span>
      </section>

      <div className="ending-details-grid">
        <section className="inspect-item compact-result-panel evidence-used-panel">
          <strong>Evidence used</strong>
          <div className="evidence-result-list">
            {uniqueEvidenceItems.map(renderEvidenceRow)}
          </div>
        </section>

        <section className="inspect-item compact-result-panel suspects-ruled-out-panel">
          <strong>Suspects ruled out</strong>
          <div className="cleared-suspect-list">
            {nonCulpritSuspects.map(renderSuspectRow)}
          </div>
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
