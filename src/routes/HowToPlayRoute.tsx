const playSteps = [
  {
    title: 'Read the case file',
    body: 'Start with the scene report and the suspect lineup. The culprit is one of the listed Pokemon, and the story sets up where to begin investigating.',
  },
  {
    title: 'Follow leads',
    body: 'Open the investigation board, choose a location, then pick one lead. Each lead spends one investigation and reveals a clue or witness note. Leads for clues already in your case file are greyed out.',
  },
  {
    title: 'Compare suspect files',
    body: 'Match evidence badges against each suspect file. Check appearance, Pokedex records, and stats, then mark Pokemon as suspect or cleared as your theory changes.',
  },
  {
    title: 'Make an accusation',
    body: 'When the evidence points to one Pokemon, accuse them from their suspect file. You have three attempts, so use your notes before committing.',
  },
]

const detectiveTips = [
  'Evidence usually clears more suspects than it condemns. Look for Pokemon that do not fit the clue profile.',
  'Residue, trace, entry, and witness clues narrow the culprit to a small group. Cross-check that group against Pokedex records.',
  'Do not chase duplicate clue types. Greyed-out leads point to something your case file already covers.',
  'Use cleared markers aggressively. The game never marks suspects automatically.',
  'Login to keep Pokedex progress across cases. Failed cases mark Pokemon as seen; solved cases unlock full records.',
]

export function HowToPlayRoute() {
  return (
    <div className="main-layout-single">
      <section className="notebook-card how-to-play-page">
        <div className="how-to-play-hero">
          <div>
            <p className="eyebrow">Field manual</p>
            <h2>How to play</h2>
            <p className="subtle-text">
              PokéMystery is a daily deduction case. Search the scene, cross-check clues, and identify the culprit before your accusation attempts run out.
            </p>
          </div>

          <div className="how-to-play-case-note" aria-label="Case limits">
            <span className="how-to-play-case-note__label">Remember</span>
            <strong>Investigations are limited.</strong>
            <span>Every lead matters. Gather enough matching profiles before you accuse.</span>
          </div>
        </div>

        <div className="how-to-play-steps" aria-label="How to play steps">
          {playSteps.map((step, index) => (
            <article key={step.title} className="how-to-play-step">
              <span className="how-to-play-step__number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="how-to-play-tips">
          <div>
            <p className="eyebrow">Detective habits</p>
            <h3>How to solve more cases</h3>
          </div>
          <ul>
            {detectiveTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
