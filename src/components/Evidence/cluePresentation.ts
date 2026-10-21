import type { LocationAction } from '../../game/caseModel'

interface CluePresentation {
  sprite: string
  flavor: string
}

// One game-item sprite style, paired with the method of investigation rather
// than the hidden answer. These descriptions never depend on the culprit.
const cluePresentations: Record<string, CluePresentation> = {
  'Height clue': { sprite: 'escape-rope', flavor: 'Uncoil the measuring cord. Those marks could put a height to our mystery visitor.' },
  'Weight clue': { sprite: 'iron-ball', flavor: 'Bring a reference weight. The pressure marks might tell us who passed through.' },
  'Type clue:Residue': { sprite: 'wide-lens', flavor: 'Lens out. A closer look at the residue could uncover the visitor’s type.' },
  'Type clue:Ground marks': { sprite: 'soft-sand', flavor: 'Bag a sample of the disturbed ground. Even a careful visitor leaves a trace.' },
  'Type clue:Entry marks': { sprite: 'sticky-barb', flavor: 'Inspect the snags and scrapes at the entry. How did our visitor get through?' },
  'Type clue:Witness report': { sprite: 'journal', flavor: 'Open your notebook. Take a witness statement before the little details fade.' },
  'Stat clue': { sprite: 'muscle-band', flavor: 'Reconstruct the visitor’s movements. Which of their abilities left its signature?' },
  'Reaction clue': { sprite: 'x-defense', flavor: 'Prepare a field test. The trace’s reaction could narrow the suspect list.' },
  'Region clue': { sprite: 'town-map', flavor: 'Unfold the map. Compare the traces with records from each region.' },
  'Color clue': { sprite: 'fashion-case', flavor: 'Open the swatch case. Compare the visual evidence before the light changes.' },
  'Capture clue': { sprite: 'poke-ball', flavor: 'A spare Poké Ball, just in case. Work out how elusive this visitor could be.' },
  'Evolution clue': { sprite: 'dubious-disc', flavor: 'Load the evolution records. Find the family pattern hiding in the evidence.' },
}

export function getCluePresentation(action: Pick<LocationAction, 'cluePreview' | 'clueRule'>): CluePresentation {
  const { label, subtitle } = action.cluePreview
  const key = subtitle ? `${label}:${subtitle}` : label
  const presentation = cluePresentations[key]
  if (!presentation) throw new Error(`Missing clue card presentation: ${key}`)
  if (label === 'Stat clue' && action.clueRule?.axis === 'lowestStat') {
    return { sprite: 'focus-band', flavor: 'Look for the faltering step. A visitor’s weakest ability can be their strongest tell.' }
  }
  return presentation
}
