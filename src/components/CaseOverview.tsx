import { Link, useLocation } from 'react-router-dom'
import { MugShot } from './Suspects/MugShot'
import { getDiscoveredEvidence, type Case } from '../game/caseModel'
import { LocationArtwork } from './Evidence/LocationArtwork'
import { chooseLocationScene } from './Evidence/locationArtworkSelection'
import { TODAY_SUSPECTS_PATH } from '../paths'

interface CaseOverviewProps {
  gameCase: Case
  attemptsLeft: number
  startInvestigation?: () => void
  onSelectSuspect?: (suspectId: number) => void
}

export function CaseOverview({
  gameCase: selectedCase,
  attemptsLeft,
  startInvestigation,
  onSelectSuspect,
}: CaseOverviewProps) {
  const routeLocation = useLocation()
  const evidence = getDiscoveredEvidence(selectedCase)
  const investigatedCount = selectedCase.locations.filter(location => location.investigated).length
  const scene = chooseLocationScene(selectedCase.locations[0]?.name ?? selectedCase.title, selectedCase.id)
  const started = investigatedCount > 0
  const actionLabel = selectedCase.status !== 'active' ? 'Review investigation'
    : started ? 'Continue investigation' : 'Begin investigation'

  return (
    <section className="case-landing corkboard-surface" aria-labelledby="case-brief-title">
      <article className="case-brief">
        <div className="case-brief__copy">
          <h1 id="case-brief-title">{selectedCase.title}</h1>
          <p className="case-brief__story">{selectedCase.shortStory}</p>
          <div className="case-brief__action">
            {startInvestigation ? <button type="button" className="primary-button" onClick={startInvestigation}>
              {actionLabel} <span aria-hidden="true">→</span>
            </button> : null}
            {started ? <p className="case-brief__progress" role="status">
              {investigatedCount} / {selectedCase.locations.length} locations searched · {evidence.length} {evidence.length === 1 ? 'clue' : 'clues'} collected
              <span>{attemptsLeft} {attemptsLeft === 1 ? 'accusation' : 'accusations'} left</span>
            </p> : null}
          </div>
        </div>
        <figure className="case-brief__photo">
          <LocationArtwork name={selectedCase.title} context={selectedCase.id} scene={scene} framing="wide" />
          <figcaption>Scene of the mystery</figcaption>
        </figure>
      </article>
      <section className="case-landing__suspects" aria-label="Suspect preview">
        <div className="case-landing__photos">
          {selectedCase.suspects.slice(0, 3).map(suspect => (
            <button key={suspect.pokemonId} type="button" className="case-landing__snapshot"
              aria-label={`Open ${suspect.name}’s case file`} disabled={!onSelectSuspect}
              onClick={() => onSelectSuspect?.(suspect.pokemonId)}>
              <div className="case-landing__portrait"><MugShot suspect={suspect} /></div>
              <span>{suspect.name}</span>
            </button>
          ))}
        </div>
        <Link to={`${TODAY_SUSPECTS_PATH}${routeLocation.search}`} className="case-landing__lineup-link">
          View all {selectedCase.suspects.length} suspects <span aria-hidden="true">→</span>
        </Link>
      </section>
    </section>
  )
}
