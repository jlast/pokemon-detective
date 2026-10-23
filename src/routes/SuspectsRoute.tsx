import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BoardLocationDialog } from '../components/Evidence/BoardLocationDialog'
import { MugShot } from '../components/Suspects/MugShot'
import { SuspectsPanel } from '../components/Suspects/SuspectsPanel'
import type { Case, SuspectNoteStatus } from '../game/caseModel'
import { InvestigationRouteFrame } from './InvestigationRouteFrame'

interface SuspectsRouteProps {
  attemptsLeft: number
  currentCase: Case
  wrongAccusationIds: number[]
  inspectSuspect: (suspectId: number) => void
  setSuspectNoteStatus: (suspectId: number, status: SuspectNoteStatus) => void
  children?: ReactNode
}

export function SuspectsRoute({
  attemptsLeft,
  currentCase,
  wrongAccusationIds,
  inspectSuspect,
  setSuspectNoteStatus,
  children,
}: SuspectsRouteProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const wrongAccusationId: unknown = location.state?.wrongAccusationId
  const clearedSuspect = currentCase.status === 'active' && attemptsLeft > 0
    && typeof wrongAccusationId === 'number' && wrongAccusationIds.includes(wrongAccusationId)
    ? currentCase.suspects.find(suspect => suspect.pokemonId === wrongAccusationId) : undefined
  const dismissFeedback = () => navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: { focusSuspectId: clearedSuspect?.pokemonId } })
  return (
    <InvestigationRouteFrame
      layout="none"
      currentCase={currentCase}
    >
      <SuspectsPanel
        currentCase={currentCase}
        wrongAccusationIds={wrongAccusationIds}
        inspectSuspect={inspectSuspect}
        setSuspectNoteStatus={setSuspectNoteStatus}
      />
      {clearedSuspect ? (
        <BoardLocationDialog title={`${clearedSuspect.name} is innocent`} className="accusation-confirmation wrong-accusation"
          onClose={dismissFeedback} closeLabel="Close accusation result"
          footer={<div className="accusation-confirmation__actions wrong-accusation__actions">
            <button type="button" className="primary-button" onClick={dismissFeedback}>Back to the lineup</button>
          </div>}>
          <div className="accusation-confirmation__content">
            <div className="accusation-confirmation__portrait lineup-file__portrait"><MugShot suspect={clearedSuspect} /></div>
            <div className="accusation-confirmation__copy">
              <p>Wrong lead. {clearedSuspect.name} wasn’t the culprit and has been crossed off your lineup.</p>
              <p className="accusation-confirmation__warning"><strong>{attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.</strong> Check your clues before your next accusation.</p>
            </div>
          </div>
        </BoardLocationDialog>
      ) : null}
      {children}
    </InvestigationRouteFrame>
  )
}
