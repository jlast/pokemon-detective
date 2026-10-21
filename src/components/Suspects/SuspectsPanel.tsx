import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { EvidenceBadgeList } from '../Evidence/EvidenceBadge'
import { getDiscoveredEvidence, type Case, type SuspectNoteStatus } from '../../game/caseModel'
import { TODAY_INVESTIGATION_PATH } from '../../paths'
import { SuspectCard } from './SuspectCard'

interface SuspectsProps {
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  setSuspectNoteStatus: (suspectId: number, status: SuspectNoteStatus) => void
}

export function SuspectsPanel({
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  setSuspectNoteStatus,
}: SuspectsProps) {
  const routeLocation = useLocation()
  const discoveredEvidence = getDiscoveredEvidence(currentCase)

  const isCleared = (id: number, status: string) => status === 'ruled-out' || wrongAccusationIds.includes(id)
  const remaining = currentCase.suspects.filter(suspect => !isCleared(suspect.pokemonId, suspect.noteStatus)).length
  const focusSuspectId = (routeLocation.state as { focusSuspectId?: number } | null)?.focusSuspectId
  useEffect(() => {
    if (!focusSuspectId) return
    const frame = requestAnimationFrame(() => document.getElementById(`lineup-suspect-${focusSuspectId}`)?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [focusSuspectId])


  return (
    <section className="notebook-card evidence-board mobile-section is-active suspects-lineup">
      <div className="lineup-desk-notes">
        <section className="lineup-clues" aria-label="Collected evidence">
          <h2 className="lineup-clues__label">Your clues{discoveredEvidence.length ? <span>{discoveredEvidence.length}</span> : null}</h2>
          {discoveredEvidence.length ? <div className="lineup-clues__badges">
            {discoveredEvidence.map((evidence, index) => <div key={evidence.id} className="lineup-clues__group" role="group" aria-label={`Clue ${index + 1}`}>
              <EvidenceBadgeList badges={evidence.badges} fallback={evidence.clueText} clueType={evidence.rule.axis} />
            </div>)}
          </div> : <Link to={`${TODAY_INVESTIGATION_PATH}${routeLocation.search}`} className="lineup-clues__empty">
            <img src="/clue-sprites/wide-lens.png" alt="" width="40" height="40" />
            <span>Find your first clue <span aria-hidden="true">↗</span></span>
          </Link>}
        </section>
        <div className="lineup-heading__count" role="status"><strong>{remaining}</strong><span>still in play</span></div>
      </div>
      <div className="suspect-grid suspect-grid-lineup corkboard-surface">
        {currentCase.suspects.map((suspect, suspectIndex) => <SuspectCard key={suspect.pokemonId} suspect={suspect}
          suspectIndex={suspectIndex}
          inspectSuspect={inspectSuspect} setSuspectNoteStatus={setSuspectNoteStatus}
          isSelected={false} hasWrongAccusation={wrongAccusationIds.includes(suspect.pokemonId)}
          disabled={currentCase.status !== 'active'} />)}
      </div>

    </section>
  )
}
