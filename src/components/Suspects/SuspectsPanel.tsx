import { useEffect, useId, useRef, useState } from 'react'
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
  const clueNote = useRef<HTMLElement>(null)
  const dockToggle = useRef<HTMLButtonElement>(null)
  const dockContentId = useId()
  const [isDocked, setIsDocked] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const note = clueNote.current
    if (!note) return
    let frame = 0
    const updatePosition = () => {
      frame = 0
      // Keep the dock visible while only the final 20px of the note remains.
      const pastNote = note.getBoundingClientRect().bottom <= 20
      setIsDocked(pastNote)
      if (!pastNote) setIsExpanded(false)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updatePosition)
    }
    // Capture scrolls from the page and any containing scroll area.
    window.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true })
    window.addEventListener('resize', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(note)
    scheduleUpdate()
    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [currentCase.id, discoveredEvidence.length])

  const isCleared = (id: number, status: string) => status === 'ruled-out' || wrongAccusationIds.includes(id)
  const remaining = currentCase.suspects.filter(suspect => !isCleared(suspect.pokemonId, suspect.noteStatus)).length
  const focusSuspectId = (routeLocation.state as { focusSuspectId?: number } | null)?.focusSuspectId
  useEffect(() => {
    if (!focusSuspectId) return
    const frame = requestAnimationFrame(() => document.getElementById(`lineup-suspect-${focusSuspectId}`)?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [focusSuspectId])


  const clueContent = discoveredEvidence.length ? <div className="lineup-clues__badges">
    {discoveredEvidence.map((evidence, index) => <div key={evidence.id} className="lineup-clues__group" role="group" aria-label={`Clue ${index + 1}`}>
      <EvidenceBadgeList badges={evidence.badges} fallback={evidence.clueText} clueType={evidence.rule.axis} />
    </div>)}
  </div> : <Link to={`${TODAY_INVESTIGATION_PATH}${routeLocation.search}`} className="lineup-clues__empty">
    <img src="/clue-sprites/wide-lens.png" alt="" width="40" height="40" />
    <span>Find your first clue <span aria-hidden="true">↗</span></span>
  </Link>

  return (
    <section className="notebook-card evidence-board mobile-section is-active suspects-lineup">
      <div className="suspects-pinboard corkboard-surface">
        <div className="lineup-desk-notes">
          <section ref={clueNote} className="lineup-clues" aria-label="Collected evidence">
            <h2 className="lineup-clues__label">Your clues{discoveredEvidence.length ? <span>{discoveredEvidence.length}</span> : null}</h2>
            {clueContent}
          </section>
          <div className="lineup-heading__count" role="status"><strong>{remaining}</strong><span>still in play</span></div>
        </div>
        <div className="lineup-clue-dock" hidden={!isDocked}
          onKeyDown={event => {
            if (event.key === 'Escape' && isExpanded) {
              event.preventDefault()
              event.stopPropagation()
              setIsExpanded(false)
              dockToggle.current?.focus({ preventScroll: true })
            }
          }}>
          <section className="lineup-clue-dock__paper" aria-label="Pinned clues reference">
            <button ref={dockToggle} type="button" className="lineup-clue-dock__toggle"
              aria-expanded={isExpanded} aria-controls={dockContentId}
              onClick={() => setIsExpanded(expanded => !expanded)}>
              <span className="lineup-clue-dock__title">Your clues <span>{discoveredEvidence.length}</span></span>
              <span className="lineup-clue-dock__action">{isExpanded ? 'Hide' : 'Show'}
                <svg className="lineup-clue-dock__chevron" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </button>
            <div id={dockContentId} className="lineup-clue-dock__content" hidden={!isExpanded}>
              {clueContent}
            </div>
          </section>
        </div>
        <div className="suspect-grid suspect-grid-lineup">
        {currentCase.suspects.map((suspect, suspectIndex) => <SuspectCard key={suspect.pokemonId} suspect={suspect}
          suspectIndex={suspectIndex}
          inspectSuspect={inspectSuspect} setSuspectNoteStatus={setSuspectNoteStatus}
          isSelected={false} hasWrongAccusation={wrongAccusationIds.includes(suspect.pokemonId)}
          disabled={currentCase.status !== 'active'} />)}
        </div>
      </div>
    </section>
  )
}
